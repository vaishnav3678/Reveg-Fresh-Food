import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db, ProductItem, CategoryItem, GalleryItemRecord, TestimonialRecord, EnquiryRecord, MediaItem } from './src/server/db.js';

// Setup uploads folder in public/uploads
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are permitted'));
    }
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & URL-Encoded body parser with generous limit for base64 uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads route
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Authentication Middleware helper
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const user = db.validateSession(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
    }

    (req as any).user = user;
    (req as any).token = token;
    next();
  };

  // ==========================================
  // 1. AUTHENTICATION ENDPOINTS
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    const users = db.get('users');
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim() || u.email.toLowerCase() === username.toLowerCase().trim()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    db.set('users', users);

    const token = db.createSession(user.id);
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    const user = (req as any).user;
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
    if (token) {
      db.destroySession(token);
    }
    return res.json({ success: true });
  });

  app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 5) {
      return res.status(400).json({ error: 'New password must be at least 5 characters long' });
    }

    const user = (req as any).user;
    const users = db.get('users');
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, users[userIndex].passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const salt = bcrypt.genSaltSync(10);
    users[userIndex].passwordHash = bcrypt.hashSync(newPassword, salt);
    db.set('users', users);

    return res.json({ success: true, message: 'Password updated successfully' });
  });

  app.post('/api/auth/update-profile', requireAuth, (req, res) => {
    const { name, email, username } = req.body;
    const user = (req as any).user;
    const users = db.get('users');
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) users[userIndex].name = name;
    if (email) users[userIndex].email = email;
    if (username) users[userIndex].username = username;

    db.set('users', users);
    return res.json({ success: true, user: users[userIndex] });
  });

  // ==========================================
  // 2. PUBLIC SITE DATA ENDPOINT
  // ==========================================
  app.get('/api/public-content', (req, res) => {
    const dbAll = db.getAll();
    return res.json({
      settings: dbAll.settings,
      theme: dbAll.theme,
      seo: dbAll.seo,
      sections: dbAll.sections.filter((s) => s.enabled).sort((a, b) => a.sortOrder - b.sortOrder),
      hero: dbAll.hero,
      about: dbAll.about,
      products: dbAll.products.filter((p) => p.status === 'active').sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)),
      categories: dbAll.categories.filter((c) => c.status === 'active').sort((a, b) => a.sortOrder - b.sortOrder),
      gallery: dbAll.gallery.filter((g) => g.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder),
      testimonials: dbAll.testimonials.filter((t) => t.isApproved).sort((a, b) => a.sortOrder - b.sortOrder),
      navigation: dbAll.navigation,
      footer: dbAll.footer,
    });
  });

  // ==========================================
  // 3. STATS & DASHBOARD OVERVIEW
  // ==========================================
  app.get('/api/stats', requireAuth, (req, res) => {
    const all = db.getAll();
    const totalEnquiries = all.enquiries.length;
    const unreadEnquiries = all.enquiries.filter((e) => e.status === 'new').length;
    const activeProducts = all.products.filter((p) => p.status === 'active').length;
    const totalProducts = all.products.length;
    const totalCategories = all.categories.length;
    const totalGallery = all.gallery.length;
    const totalTestimonials = all.testimonials.length;
    const totalMedia = all.media.length;
    const activeSections = all.sections.filter((s) => s.enabled).length;

    return res.json({
      metrics: {
        totalProducts,
        activeProducts,
        totalCategories,
        totalGallery,
        totalTestimonials,
        totalEnquiries,
        unreadEnquiries,
        totalMedia,
        activeSections,
      },
      recentEnquiries: all.enquiries.slice(0, 5),
      recentProducts: all.products.slice(0, 5),
      siteSettings: all.settings,
    });
  });

  // ==========================================
  // 4. GENERAL SETTINGS
  // ==========================================
  app.get('/api/settings', (req, res) => {
    return res.json(db.get('settings'));
  });

  app.put('/api/settings', requireAuth, (req, res) => {
    const current = db.get('settings');
    const updated = { ...current, ...req.body };
    db.set('settings', updated);
    return res.json({ success: true, settings: updated });
  });

  // ==========================================
  // 5. THEME & APPEARANCE
  // ==========================================
  app.get('/api/theme', (req, res) => {
    return res.json(db.get('theme'));
  });

  app.put('/api/theme', requireAuth, (req, res) => {
    const current = db.get('theme');
    const updated = { ...current, ...req.body };
    db.set('theme', updated);
    return res.json({ success: true, theme: updated });
  });

  // ==========================================
  // 6. SEO SETTINGS
  // ==========================================
  app.get('/api/seo', (req, res) => {
    return res.json(db.get('seo'));
  });

  app.put('/api/seo', requireAuth, (req, res) => {
    const current = db.get('seo');
    const updated = { ...current, ...req.body };
    db.set('seo', updated);
    return res.json({ success: true, seo: updated });
  });

  // ==========================================
  // 7. SECTIONS & HOMEPAGE ORDER
  // ==========================================
  app.get('/api/sections', (req, res) => {
    return res.json(db.get('sections'));
  });

  app.put('/api/sections', requireAuth, (req, res) => {
    const sections = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections must be an array' });
    }
    db.set('sections', sections);
    return res.json({ success: true, sections });
  });

  // ==========================================
  // 8. HERO BANNER CONFIG
  // ==========================================
  app.get('/api/hero', (req, res) => {
    return res.json(db.get('hero'));
  });

  app.put('/api/hero', requireAuth, (req, res) => {
    const current = db.get('hero');
    const updated = { ...current, ...req.body };
    db.set('hero', updated);
    return res.json({ success: true, hero: updated });
  });

  // ==========================================
  // 9. ABOUT PAGE CONFIG
  // ==========================================
  app.get('/api/about', (req, res) => {
    return res.json(db.get('about'));
  });

  app.put('/api/about', requireAuth, (req, res) => {
    const current = db.get('about');
    const updated = { ...current, ...req.body };
    db.set('about', updated);
    return res.json({ success: true, about: updated });
  });

  // ==========================================
  // 10. PRODUCT MANAGEMENT
  // ==========================================
  app.get('/api/products', (req, res) => {
    return res.json(db.get('products'));
  });

  app.post('/api/products', requireAuth, (req, res) => {
    const products = db.get('products');
    const newProduct: ProductItem = {
      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: req.body.name || 'New Product',
      category: req.body.category || 'sweets',
      secondaryCategories: req.body.secondaryCategories || [],
      description: req.body.description || '',
      detailedDescription: req.body.detailedDescription || '',
      image: req.body.image || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      isPopular: !!req.body.isPopular,
      isFestiveSpecial: !!req.body.isFestiveSpecial,
      packSizes: req.body.packSizes && req.body.packSizes.length ? req.body.packSizes : ['250g', '500g', '1 kg'],
      tasteProfile: req.body.tasteProfile || '',
      ingredientsHighlight: req.body.ingredientsHighlight || [],
      texture: req.body.texture || '',
      priceGuide: req.body.priceGuide || '',
      status: req.body.status || 'active',
      sortOrder: products.length + 1,
    };
    products.push(newProduct);
    db.set('products', products);
    return res.json({ success: true, product: newProduct });
  });

  app.put('/api/products/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const products = db.get('products');
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body, id };
    db.set('products', products);
    return res.json({ success: true, product: products[index] });
  });

  app.delete('/api/products/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const products = db.get('products').filter((p) => p.id !== id);
    db.set('products', products);
    return res.json({ success: true, message: 'Product deleted' });
  });

  // ==========================================
  // 11. CATEGORY MANAGEMENT
  // ==========================================
  app.get('/api/categories', (req, res) => {
    return res.json(db.get('categories'));
  });

  app.post('/api/categories', requireAuth, (req, res) => {
    const categories = db.get('categories');
    const newCat: CategoryItem = {
      id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: req.body.name || 'New Category',
      slug: req.body.slug || (req.body.name || 'new').toLowerCase().replace(/\s+/g, '-'),
      tagline: req.body.tagline || '',
      description: req.body.description || '',
      badge: req.body.badge || 'Delicacy',
      image: req.body.image || '',
      iconName: req.body.iconName || 'Sparkles',
      items: req.body.items || [],
      sampleProducts: req.body.sampleProducts || [],
      status: req.body.status || 'active',
      sortOrder: categories.length + 1,
    };
    categories.push(newCat);
    db.set('categories', categories);
    return res.json({ success: true, category: newCat });
  });

  app.put('/api/categories/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const categories = db.get('categories');
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[index] = { ...categories[index], ...req.body, id };
    db.set('categories', categories);
    return res.json({ success: true, category: categories[index] });
  });

  app.delete('/api/categories/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const categories = db.get('categories').filter((c) => c.id !== id);
    db.set('categories', categories);
    return res.json({ success: true, message: 'Category deleted' });
  });

  // ==========================================
  // 12. GALLERY MANAGEMENT
  // ==========================================
  app.get('/api/gallery', (req, res) => {
    return res.json(db.get('gallery'));
  });

  app.post('/api/gallery', requireAuth, (req, res) => {
    const gallery = db.get('gallery');
    const newItem: GalleryItemRecord = {
      id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: req.body.title || 'New Food Photo',
      category: req.body.category || 'Sweets',
      image: req.body.image || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      description: req.body.description || '',
      isEnabled: req.body.isEnabled !== false,
      sortOrder: gallery.length + 1,
    };
    gallery.push(newItem);
    db.set('gallery', gallery);
    return res.json({ success: true, item: newItem });
  });

  app.put('/api/gallery/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const gallery = db.get('gallery');
    const index = gallery.findIndex((g) => g.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }
    gallery[index] = { ...gallery[index], ...req.body, id };
    db.set('gallery', gallery);
    return res.json({ success: true, item: gallery[index] });
  });

  app.delete('/api/gallery/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const gallery = db.get('gallery').filter((g) => g.id !== id);
    db.set('gallery', gallery);
    return res.json({ success: true, message: 'Gallery item deleted' });
  });

  // ==========================================
  // 13. TESTIMONIALS MANAGEMENT
  // ==========================================
  app.get('/api/testimonials', (req, res) => {
    return res.json(db.get('testimonials'));
  });

  app.post('/api/testimonials', requireAuth, (req, res) => {
    const testimonials = db.get('testimonials');
    const newTestimonial: TestimonialRecord = {
      id: 'test_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: req.body.name || 'Customer Name',
      designation: req.body.designation || 'Valued Customer',
      location: req.body.location || 'Maharashtra',
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: req.body.rating || 5,
      comment: req.body.comment || '',
      event: req.body.event || 'Festive Sweets Order',
      isApproved: req.body.isApproved !== false,
      sortOrder: testimonials.length + 1,
      createdAt: new Date().toISOString(),
    };
    testimonials.push(newTestimonial);
    db.set('testimonials', testimonials);
    return res.json({ success: true, testimonial: newTestimonial });
  });

  app.put('/api/testimonials/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const testimonials = db.get('testimonials');
    const index = testimonials.findIndex((t) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    testimonials[index] = { ...testimonials[index], ...req.body, id };
    db.set('testimonials', testimonials);
    return res.json({ success: true, testimonial: testimonials[index] });
  });

  app.delete('/api/testimonials/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const testimonials = db.get('testimonials').filter((t) => t.id !== id);
    db.set('testimonials', testimonials);
    return res.json({ success: true, message: 'Testimonial deleted' });
  });

  // ==========================================
  // 14. ENQUIRIES / CONTACT SUBMISSIONS
  // ==========================================
  app.get('/api/enquiries', requireAuth, (req, res) => {
    return res.json(db.get('enquiries'));
  });

  // Public submission endpoint from contact form
  app.post('/api/enquiries', (req, res) => {
    const { name, email, phone, inquiryType, packSize, message } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const enquiries = db.get('enquiries');
    const newEnquiry: EnquiryRecord = {
      id: 'enq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      inquiryType: inquiryType || 'Festive Faral & Sweets Order',
      packSize: packSize || '1 kg',
      message: message ? message.trim() : '',
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    enquiries.unshift(newEnquiry); // newest first
    db.set('enquiries', enquiries);
    return res.json({ success: true, enquiry: newEnquiry });
  });

  app.patch('/api/enquiries/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const enquiries = db.get('enquiries');
    const index = enquiries.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    enquiries[index] = { ...enquiries[index], ...req.body, id };
    db.set('enquiries', enquiries);
    return res.json({ success: true, enquiry: enquiries[index] });
  });

  app.delete('/api/enquiries/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const enquiries = db.get('enquiries').filter((e) => e.id !== id);
    db.set('enquiries', enquiries);
    return res.json({ success: true, message: 'Enquiry deleted' });
  });

  // ==========================================
  // 15. NAVIGATION CONFIG
  // ==========================================
  app.get('/api/navigation', (req, res) => {
    return res.json(db.get('navigation'));
  });

  app.put('/api/navigation', requireAuth, (req, res) => {
    db.set('navigation', req.body);
    return res.json({ success: true, navigation: req.body });
  });

  // ==========================================
  // 16. FOOTER CONFIG
  // ==========================================
  app.get('/api/footer', (req, res) => {
    return res.json(db.get('footer'));
  });

  app.put('/api/footer', requireAuth, (req, res) => {
    db.set('footer', req.body);
    return res.json({ success: true, footer: req.body });
  });

  // ==========================================
  // 17. MEDIA MANAGEMENT & UPLOAD
  // ==========================================
  app.get('/api/media', requireAuth, (req, res) => {
    return res.json(db.get('media'));
  });

  // Multipart file upload
  app.post('/api/media/upload', requireAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaItem: MediaItem = {
      id: 'med_' + Date.now(),
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      url: fileUrl,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };

    const media = db.get('media');
    media.unshift(mediaItem);
    db.set('media', media);

    return res.json({ success: true, media: mediaItem });
  });

  // Base64 upload endpoint for instant image paste / drag & drop
  app.post('/api/media/upload-base64', requireAuth, (req, res) => {
    const { base64Data, filename, name } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'Base64 data required' });
    }

    try {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 image data' });
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const ext = mimeType.split('/')[1] || 'jpg';
      const cleanName = (filename || 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
      const outFilename = `${cleanName}-${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, outFilename);

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${outFilename}`;
      const mediaItem: MediaItem = {
        id: 'med_' + Date.now(),
        name: name || filename || outFilename,
        originalName: filename || outFilename,
        url: fileUrl,
        mimeType,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      };

      const media = db.get('media');
      media.unshift(mediaItem);
      db.set('media', media);

      return res.json({ success: true, media: mediaItem });
    } catch (err: any) {
      console.error('Failed to save base64 image', err);
      return res.status(500).json({ error: 'Failed to process base64 upload' });
    }
  });

  app.delete('/api/media/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const media = db.get('media');
    const target = media.find((m) => m.id === id);

    if (target && target.url.startsWith('/uploads/')) {
      const diskPath = path.join(process.cwd(), 'public', target.url);
      if (fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch (e) {
          console.error('Failed to unlink file:', e);
        }
      }
    }

    const updatedMedia = media.filter((m) => m.id !== id);
    db.set('media', updatedMedia);
    return res.json({ success: true, message: 'Media item removed' });
  });

  // ==========================================
  // 18. RESET / SEED DATA
  // ==========================================
  app.post('/api/reset-demo', requireAuth, (req, res) => {
    const freshDb = db.resetToDefaults();
    return res.json({ success: true, message: 'Database reset to authentic RevEg demo state', db: freshDb });
  });

  // ==========================================
  // 19. VITE MIDDLEWARE (DEV) & STATIC (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RevEg Server] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[RevEg Server] Fatal startup error:', err);
});
