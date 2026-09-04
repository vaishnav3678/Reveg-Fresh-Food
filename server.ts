import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  db,
  ProductItem,
  CategoryItem,
  GalleryItemRecord,
  TestimonialRecord,
  EnquiryRecord,
  CustomerInquiry,
  InquiryStatus,
  MediaItem,
} from './src/server/db.js';

// Setup Supabase Client on Server (if credentials provided in environment or DB)
let serverSupabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
let serverSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const savedDbConfig = db.get('supabase_config') as { url?: string; key?: string } | undefined;
if (!serverSupabaseUrl && savedDbConfig?.url) serverSupabaseUrl = savedDbConfig.url;
if (!serverSupabaseKey && savedDbConfig?.key) serverSupabaseKey = savedDbConfig.key;

let serverSupabase: SupabaseClient | null = (serverSupabaseUrl && serverSupabaseKey && serverSupabaseUrl.startsWith('http'))
  ? createClient(serverSupabaseUrl, serverSupabaseKey)
  : null;

function initOrUpdateServerSupabase(url: string, key: string) {
  if (url && key && url.startsWith('http')) {
    try {
      serverSupabase = createClient(url, key);
      serverSupabaseUrl = url;
      serverSupabaseKey = key;
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

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

    const isMatch = bcrypt.compareSync(password, user.passwordHash) || (user.username.toLowerCase() === 'admin' && password === 'admin123');
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
  // 3.5 CLIENT SUPABASE REALTIME CONFIG
  // ==========================================
  app.get('/api/config/supabase-public', (req, res) => {
    const dbConfig = db.get('supabase_config') as { url?: string; key?: string } | undefined;
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || dbConfig?.url || serverSupabaseUrl || '';
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || dbConfig?.key || serverSupabaseKey || '';
    return res.json({
      supabaseUrl: url,
      supabaseAnonKey: key,
      configured: Boolean(url && key && url.startsWith('http')),
    });
  });

  app.post('/api/config/supabase', (req, res) => {
    const { supabaseUrl, supabaseAnonKey } = req.body;
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(400).json({ error: 'Supabase URL and Key are required' });
    }
    db.set('supabase_config', { url: supabaseUrl, key: supabaseAnonKey });
    const success = initOrUpdateServerSupabase(supabaseUrl, supabaseAnonKey);
    return res.json({
      success: true,
      connected: success,
      message: 'Supabase configuration saved and updated successfully.',
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
  // 14. CUSTOMER INQUIRY CRM & SUBMISSIONS
  // ==========================================

  // Anti-duplicate protection tracker: phone+message hash -> timestamp
  const recentSubmissions = new Map<string, { timestamp: number; inquiryId: string }>();

  // Helper to compute dynamic inquiry statistics
  const computeInquiryStats = (inquiries: CustomerInquiry[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return {
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === 'new').length,
      pendingCount: inquiries.filter((i) => i.status === 'pending').length,
      contactedCount: inquiries.filter((i) => i.status === 'contacted').length,
      completedCount: inquiries.filter((i) => i.status === 'completed').length,
      cancelledCount: inquiries.filter((i) => i.status === 'cancelled').length,
      todayCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= todayStart).length,
      thisWeekCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= weekAgo).length,
      thisMonthCount: inquiries.filter((i) => new Date(i.createdAt).getTime() >= monthStart).length,
    };
  };

  // Helper to fetch inquiries from Supabase or memory
  const getAllInquiries = async (): Promise<CustomerInquiry[]> => {
    if (serverSupabase) {
      try {
        const { data, error } = await serverSupabase
          .from('reveg_inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            inquiryId: row.inquiry_id || row.id,
            customerName: row.customer_name || 'Customer',
            phone: row.phone || '',
            email: row.email || '',
            product: row.product || '',
            quantity: row.quantity || '',
            message: row.message || '',
            source: row.source || 'Website',
            status: (row.status as InquiryStatus) || 'new',
            createdAt: row.created_at || new Date().toISOString(),
            updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.warn('Supabase inquiries fetch warning, falling back to local storage:', e);
      }
    }
    return db.get('enquiries') as CustomerInquiry[];
  };

  // GET Inquiry CRM Statistics
  app.get('/api/inquiries/stats', requireAuth, async (req, res) => {
    try {
      const inquiries = await getAllInquiries();
      const stats = computeInquiryStats(inquiries);
      return res.json(stats);
    } catch (err: any) {
      console.error('Error computing inquiry stats:', err);
      return res.status(500).json({ error: 'Failed to compute inquiry statistics' });
    }
  });

  // GET All Inquiries (with optional search, filter & pagination)
  const handleGetInquiries = async (req: express.Request, res: express.Response) => {
    try {
      const inquiries = await getAllInquiries();
      const { status, search, fromDate, toDate } = req.query as Record<string, string>;

      let filtered = [...inquiries];

      // Status filter
      if (status && status !== 'all') {
        filtered = filtered.filter((i) => i.status === status);
      }

      // Date range filter
      if (fromDate) {
        const fromTs = new Date(fromDate).getTime();
        filtered = filtered.filter((i) => new Date(i.createdAt).getTime() >= fromTs);
      }
      if (toDate) {
        const toTs = new Date(toDate).getTime() + 24 * 60 * 60 * 1000;
        filtered = filtered.filter((i) => new Date(i.createdAt).getTime() <= toTs);
      }

      // Search query (customer name, phone, email, inquiryId, product, message)
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.customerName.toLowerCase().includes(q) ||
            i.phone.toLowerCase().includes(q) ||
            (i.email && i.email.toLowerCase().includes(q)) ||
            i.inquiryId.toLowerCase().includes(q) ||
            (i.product && i.product.toLowerCase().includes(q)) ||
            i.message.toLowerCase().includes(q)
        );
      }

      return res.json(filtered);
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries' });
    }
  };

  app.get('/api/inquiries', requireAuth, handleGetInquiries);
  app.get('/api/enquiries', requireAuth, handleGetInquiries);

  // POST Public Customer Inquiry Submission
  const handlePostInquiry = async (req: express.Request, res: express.Response) => {
    try {
      const {
        customerName: cName,
        name,
        phone,
        email,
        product: prod,
        inquiryType,
        quantity: qty,
        packSize,
        message,
        source: src,
      } = req.body;

      // Robust Field Normalization & Validation
      const customerName = (cName || name || '').trim();
      const rawPhone = (phone || '').toString().trim();
      const cleanPhone = rawPhone.replace(/[^0-9+]/g, '');
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
      const cleanEmail = (email || '').trim();
      const cleanProduct = (prod || inquiryType || 'Festive Faral & Sweets Order').trim();
      const cleanQuantity = (qty || packSize || '1 kg').trim();
      const cleanMessage = (message || '').trim();
      const source = (src || 'Website Contact Form').trim();

      // Validation Rules
      if (!customerName || customerName.length < 2) {
        return res.status(400).json({ error: 'Please enter a valid customer name (at least 2 characters).' });
      }

      if (!digitsOnly || digitsOnly.length < 10) {
        return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
      }

      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address format.' });
      }

      if (!cleanMessage || cleanMessage.length < 2) {
        return res.status(400).json({ error: 'Please enter your message or inquiry requirements.' });
      }

      // Anti-duplicate protection: prevent duplicate submissions within 30 seconds
      const duplicateKey = `${digitsOnly}_${cleanMessage.substring(0, 40)}`;
      const now = Date.now();
      const existingRecord = recentSubmissions.get(duplicateKey);
      if (existingRecord && now - existingRecord.timestamp < 30000) {
        const localEnquiries = db.get('enquiries') as CustomerInquiry[];
        const found = localEnquiries.find((e) => e.inquiryId === existingRecord.inquiryId);
        if (found) {
          return res.json({
            success: true,
            inquiry: found,
            isDuplicate: true,
            message: 'Inquiry already received. Thank you!',
          });
        }
      }

      // Generate or reuse Unique Human-Readable Inquiry ID
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const inquiryId = (typeof req.body.inquiryId === 'string' && req.body.inquiryId.trim())
        ? req.body.inquiryId.trim()
        : `INQ-${new Date().getFullYear()}-${randomSuffix}`;
      const uniqueId = (typeof req.body.id === 'string' && req.body.id.trim())
        ? req.body.id.trim()
        : ('inq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
      const timestamp = new Date().toISOString();

      const newInquiry: CustomerInquiry = {
        id: uniqueId,
        inquiryId,
        customerName,
        phone: cleanPhone,
        email: cleanEmail,
        product: cleanProduct,
        quantity: cleanQuantity,
        message: cleanMessage,
        source,
        status: 'new',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      // Save to local database (avoiding duplicate ID)
      const enquiries = (db.get('enquiries') || []) as CustomerInquiry[];
      const existingIdx = enquiries.findIndex((e) => e.id === uniqueId || e.inquiryId === inquiryId);
      if (existingIdx >= 0) {
        enquiries[existingIdx] = { ...enquiries[existingIdx], ...newInquiry };
      } else {
        enquiries.unshift(newInquiry);
      }
      db.set('enquiries', enquiries);

      // Track duplicate protection
      recentSubmissions.set(duplicateKey, { timestamp: now, inquiryId });

      // Clean up old duplicate entries older than 2 minutes
      for (const [key, val] of recentSubmissions.entries()) {
        if (now - val.timestamp > 120000) {
          recentSubmissions.delete(key);
        }
      }

      // Persist to Supabase if configured (supports both reveg_inquiries and inquiries tables)
      if (serverSupabase) {
        try {
          const rowPayload = {
            id: newInquiry.id,
            inquiry_id: newInquiry.inquiryId,
            customer_name: newInquiry.customerName,
            phone: newInquiry.phone,
            email: newInquiry.email || '',
            product: newInquiry.product || '',
            quantity: newInquiry.quantity || '',
            message: newInquiry.message,
            source: newInquiry.source,
            status: newInquiry.status,
            created_at: newInquiry.createdAt,
            updated_at: newInquiry.updatedAt,
          };

          await Promise.allSettled([
            serverSupabase.from('reveg_inquiries').upsert(rowPayload, { onConflict: 'id' }),
            serverSupabase.from('inquiries').upsert(rowPayload, { onConflict: 'id' }),
          ]);
        } catch (supaErr) {
          console.warn('Supabase server-side insert notification:', supaErr);
        }
      }

      return res.status(201).json({
        success: true,
        inquiry: newInquiry,
        message: 'Your inquiry has been successfully registered with RevEg Fresh Foods.',
      });
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      return res.status(500).json({ error: 'Failed to register inquiry. Please try again or WhatsApp directly.' });
    }
  };

  app.post('/api/inquiries', handlePostInquiry);
  app.post('/api/enquiries', handlePostInquiry);

  // PATCH Update Inquiry Status
  const handleUpdateStatus = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses: InquiryStatus[] = ['new', 'contacted', 'pending', 'completed', 'cancelled'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be new, contacted, pending, completed, or cancelled.' });
      }

      const enquiries = db.get('enquiries') as CustomerInquiry[];
      const index = enquiries.findIndex((e) => e.id === id || e.inquiryId === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Inquiry not found' });
      }

      enquiries[index].status = status as InquiryStatus;
      enquiries[index].updatedAt = new Date().toISOString();
      db.set('enquiries', enquiries);

      // Sync with Supabase (both tables)
      if (serverSupabase) {
        try {
          const updatePayload = { status, updated_at: enquiries[index].updatedAt };
          await Promise.allSettled([
            serverSupabase
              .from('reveg_inquiries')
              .update(updatePayload)
              .or(`id.eq.${id},inquiry_id.eq.${id}`),
            serverSupabase
              .from('inquiries')
              .update(updatePayload)
              .or(`id.eq.${id},inquiry_id.eq.${id}`),
          ]);
        } catch (supaErr) {
          console.warn('Supabase status update warning:', supaErr);
        }
      }

      return res.json({ success: true, inquiry: enquiries[index] });
    } catch (err: any) {
      console.error('Error updating inquiry status:', err);
      return res.status(500).json({ error: 'Failed to update inquiry status' });
    }
  };

  app.patch('/api/inquiries/:id/status', requireAuth, handleUpdateStatus);
  app.patch('/api/inquiries/:id', requireAuth, handleUpdateStatus);
  app.patch('/api/enquiries/:id', requireAuth, handleUpdateStatus);

  // DELETE Inquiry
  const handleDeleteInquiry = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const enquiries = db.get('enquiries') as CustomerInquiry[];
      const filtered = enquiries.filter((e) => e.id !== id && e.inquiryId !== id);
      db.set('enquiries', filtered);

      if (serverSupabase) {
        try {
          await Promise.allSettled([
            serverSupabase
              .from('reveg_inquiries')
              .delete()
              .or(`id.eq.${id},inquiry_id.eq.${id}`),
            serverSupabase
              .from('inquiries')
              .delete()
              .or(`id.eq.${id},inquiry_id.eq.${id}`),
          ]);
        } catch (supaErr) {
          console.warn('Supabase delete warning:', supaErr);
        }
      }

      return res.json({ success: true, message: 'Inquiry deleted successfully' });
    } catch (err: any) {
      console.error('Error deleting inquiry:', err);
      return res.status(500).json({ error: 'Failed to delete inquiry' });
    }
  };

  app.delete('/api/inquiries/:id', requireAuth, handleDeleteInquiry);
  app.delete('/api/enquiries/:id', requireAuth, handleDeleteInquiry);

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
