import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
  lastLogin?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  phone: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  address: string;
  kitchenLocation: string;
  businessHours: string;
  googleMapsUrl: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
  copyrightText: string;
  enableFloatingWhatsApp: boolean;
  defaultWhatsAppMessage: string;
  whatsappButtonText: string;
}

export interface ThemeSettings {
  primaryColor: string;      // #0D5B29
  primaryDark: string;       // #083E1B
  primaryLight: string;      // #13753D
  orangeColor: string;       // #E8590C
  orangeHover: string;       // #CC4B04
  yellowColor: string;       // #F5A800
  creamBg: string;           // #FAF8F2
  cardBg: string;            // #FFFFFF
  textColor: string;         // #11311D
  fontHeading: string;       // Cinzel
  fontBody: string;          // Plus Jakarta Sans
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

export interface SectionConfig {
  id: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HeroConfig {
  badge: string;
  heading: string;
  highlightWord: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  heroImage: string;
  experienceYears: string;
  purityGuarantee: string;
}

export interface AboutConfig {
  badge: string;
  heading: string;
  description: string;
  storyP1: string;
  storyP2: string;
  mainImage: string;
  subImage: string;
  mission: string;
  vision: string;
  values: string[];
  stats: Array<{
    id: string;
    value: string;
    label: string;
    subtext: string;
  }>;
}

export interface ProductItem {
  id: string;
  name: string;
  category: 'diwali' | 'sweets' | 'namkeen';
  secondaryCategories?: string[];
  description: string;
  detailedDescription?: string;
  image: string;
  isPopular?: boolean;
  isFestiveSpecial?: boolean;
  packSizes: string[];
  tasteProfile?: string;
  ingredientsHighlight?: string[];
  texture?: string;
  priceGuide?: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  badge: string;
  image?: string;
  iconName: string;
  items: string[];
  sampleProducts: string[];
  status: 'active' | 'inactive';
  sortOrder: number;
}

export interface GalleryItemRecord {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface TestimonialRecord {
  id: string;
  name: string;
  designation: string;
  location: string;
  avatar?: string;
  rating: number;
  comment: string;
  event: string;
  isApproved: boolean;
  sortOrder: number;
  createdAt: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'pending' | 'completed' | 'cancelled';

export interface CustomerInquiry {
  id: string;
  inquiryId: string;
  customerName: string;
  phone: string;
  email?: string;
  product?: string;
  quantity?: string;
  message: string;
  source: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// Backward-compatible alias
export type EnquiryRecord = CustomerInquiry;

export interface NavigationConfig {
  menuItems: Array<{
    id: string;
    label: string;
    target: string;
    isVisible: boolean;
    sortOrder: number;
  }>;
  ctaButton: {
    text: string;
    target: string;
    isVisible: boolean;
  };
}

export interface FooterConfig {
  logoUrl: string;
  brandName: string;
  tagline: string;
  description: string;
  quickLinks: Array<{
    id: string;
    label: string;
    target: string;
  }>;
  specialties: Array<{
    id: string;
    title: string;
    items: string;
  }>;
  copyrightText: string;
}

export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface AppDatabase {
  users: AdminUser[];
  sessions: { [token: string]: { userId: string; expiresAt: number } };
  settings: SiteSettings;
  theme: ThemeSettings;
  seo: SeoSettings;
  sections: SectionConfig[];
  hero: HeroConfig;
  about: AboutConfig;
  products: ProductItem[];
  categories: CategoryItem[];
  gallery: GalleryItemRecord[];
  testimonials: TestimonialRecord[];
  enquiries: EnquiryRecord[];
  navigation: NavigationConfig;
  footer: FooterConfig;
  media: MediaItem[];
  supabase_config?: { url?: string; key?: string };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default seed state
const getDefaultDatabase = (): AppDatabase => {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('admin123', salt);

  return {
    users: [
      {
        id: 'usr_admin',
        username: 'admin',
        email: 'revegfreshfoods@gmail.com',
        passwordHash: defaultPasswordHash,
        name: 'RevEg Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    ],
    sessions: {},
    settings: {
      siteName: 'RevEg Fresh Foods',
      tagline: 'Traditional Sweets, Festive Faral & Namkeen',
      logoUrl: '/reveg-logo.svg',
      faviconUrl: '/reveg-logo.svg',
      phone: '+91 94033 58033',
      whatsappNumber: '919403358033',
      whatsappDisplay: '+91 94033 58033',
      email: 'revegfreshfoods@gmail.com',
      address: 'Maharashtra, India',
      kitchenLocation: 'Freshly Prepared & Dispatched in Maharashtra, India',
      businessHours: 'Monday - Sunday: 8:00 AM - 9:00 PM',
      googleMapsUrl: 'https://maps.google.com/?q=Maharashtra,India',
      socialLinks: {
        facebook: 'https://facebook.com',
        instagram: 'https://instagram.com',
        youtube: 'https://youtube.com',
      },
      copyrightText: '© 2026 RevEg Fresh Foods. All Rights Reserved. Crafted with traditional purity & homemade taste.',
      enableFloatingWhatsApp: true,
      defaultWhatsAppMessage: 'Hello RevEg Fresh Foods, I would like to enquire about your products. Please share the available items, festive specials, and price list.',
      whatsappButtonText: 'Order on WhatsApp',
    },
    theme: {
      primaryColor: '#0D5B29',
      primaryDark: '#083E1B',
      primaryLight: '#13753D',
      orangeColor: '#E8590C',
      orangeHover: '#CC4B04',
      yellowColor: '#F5A800',
      creamBg: '#FAF8F2',
      cardBg: '#FFFFFF',
      textColor: '#11311D',
      fontHeading: 'Cinzel',
      fontBody: 'Plus Jakarta Sans',
    },
    seo: {
      title: 'RevEg Fresh Foods | Traditional Sweets, Faral & Namkeen',
      description: 'Discover delicious traditional Indian sweets, festive faral, Diwali specials, crispy namkeen and custom gift boxes from RevEg Fresh Foods. Enquire and order easily on WhatsApp at +91 94033 58033.',
      keywords: 'RevEg Fresh Foods, Indian Sweets, Diwali Faral, Besan Ladoo, Chakli, Shankarpali, Karanji, Poha Chivda, Kaju Katli, Gulab Jamun, Maharashtra sweets',
      ogTitle: 'RevEg Fresh Foods | Traditional Sweets, Faral & Namkeen',
      ogDescription: 'Authentic traditional Indian sweets, festive faral favourites, and crispy namkeen made fresh with pure ingredients.',
      ogImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1200&auto=format&fit=crop&q=80',
      favicon: '/reveg-logo.svg',
    },
    sections: [
      { id: 'hero', name: 'Hero Banner', badge: 'Authentic Heritage', title: 'Traditional Flavours & Fresh Sweets', subtitle: 'Crafted with purity & homemade care', enabled: true, sortOrder: 1 },
      { id: 'festive-specials', name: 'Festive Faral & Specials', badge: 'Diwali & Festival Season', title: 'Festive Faral & Sweets Collection', subtitle: 'Celebrate every auspicious occasion with handcrafted delicacies', enabled: true, sortOrder: 2 },
      { id: 'products', name: 'Product Catalog', badge: 'Fresh Daily Batches', title: 'Our Authentic Product Catalog', subtitle: 'Explore our wide array of traditional sweets, festive faral and crunchy namkeen', enabled: true, sortOrder: 3 },
      { id: 'gift-boxes', name: 'Custom Gift Box Builder', badge: 'Personalized Gifting', title: 'Build Your Custom Celebration Box', subtitle: 'Handpick assorted sweets and faral for a memorable gift', enabled: true, sortOrder: 4 },
      { id: 'about', name: 'About RevEg Fresh Foods', badge: 'Our Heritage & Passion', title: 'The Story Behind RevEg Fresh Foods', subtitle: 'Preserving golden culinary memories through pure ingredients and authentic techniques', enabled: true, sortOrder: 5 },
      { id: 'why-choose-us', name: 'Why Choose Us', badge: 'Quality Assurance', title: 'Why Families Choose RevEg Fresh Foods', subtitle: 'Six pillars of our commitment to quality, taste and hygiene', enabled: true, sortOrder: 6 },
      { id: 'gallery', name: 'Photo Gallery', badge: 'Visual Feast', title: 'Culinary Traditions in Pictures', subtitle: 'A glimpse of our appetizing sweets, crispy faral, and gift boxes', enabled: true, sortOrder: 7 },
      { id: 'testimonials', name: 'Customer Testimonials', badge: 'Delighted Customers', title: 'Loved by Families Everywhere', subtitle: 'Real experiences from our valued customers', enabled: true, sortOrder: 8 },
      { id: 'contact', name: 'Contact & Inquiries', badge: 'Direct Connect', title: 'Get in Touch with RevEg Fresh Foods', subtitle: 'Instant WhatsApp ordering, custom pack requests, and bulk catering enquiries', enabled: true, sortOrder: 9 },
    ],
    hero: {
      badge: '100% Vegetarian • Pure Desi Ghee & Fresh Ingredients',
      heading: 'Authentic Taste of Tradition, Freshness You Can Trust',
      highlightWord: 'Tradition',
      description: 'Handcrafted traditional Indian sweets, festive faral delicacies, and savory namkeen made with heirloom recipes, pure ingredients, and zero compromise on hygiene.',
      primaryCtaText: 'Order on WhatsApp',
      primaryCtaLink: '#contact',
      secondaryCtaText: 'Diwali Faral Specials',
      secondaryCtaLink: '#festive-specials',
      heroImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&auto=format&fit=crop&q=80',
      experienceYears: 'Heritage Taste',
      purityGuarantee: '100% Pure & Fresh',
    },
    about: {
      badge: 'Rooted in Heritage & Pure Taste',
      heading: 'Crafted with Authentic Passion, Traditional Recipes & Purest Ingredients',
      description: 'At RevEg Fresh Foods, we believe that food is not just nourishment—it is a celebration of family, culture, and timeless festival memories.',
      storyP1: 'Founded with a heartfelt vision to preserve the rich, authentic culinary traditions of India, RevEg Fresh Foods prepares traditional sweets, festive faral, and savory namkeen with the same love, cleanliness, and precision as our mothers and grandmothers did in heritage kitchens.',
      storyP2: 'We strictly source superior grade pulses, cold-pressed oils, rich dry fruits, and pure desi ghee. Every batch is slow-roasted, perfectly seasoned, and freshly packed to guarantee crispness, authentic aroma, and unforgettable flavor in every bite.',
      mainImage: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=900&auto=format&fit=crop&q=80',
      subImage: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      mission: 'To deliver pure, hygienic, and authentically prepared Indian sweets and savories that bring joy and festive nostalgia to every celebration.',
      vision: 'To be the most trusted and cherished household brand for traditional homemade taste, authentic festive faral, and celebratory gifting.',
      values: [
        'Pure & unadulterated raw ingredients',
        'Traditional small-batch slow roasting',
        'Strict hygiene and kitchen sanitization',
        'Eco-conscious and secure gift packaging',
        'Fast and dependable festive dispatch'
      ],
      stats: [
        { id: 'stat_1', value: '100%', label: 'Pure Veg & Fresh', subtext: 'Prepared in hygienic kitchens' },
        { id: 'stat_2', value: '15+', label: 'Traditional Delicacies', subtext: 'Ladoos, faral, namkeen & sweets' },
        { id: 'stat_3', value: '5★', label: 'Festive Trust', subtext: 'Loved for Diwali & family events' },
        { id: 'stat_4', value: 'Direct', label: 'WhatsApp Ordering', subtext: 'Instant batch pricing & delivery' },
      ],
    },
    products: [
      {
        id: 'prod-besan-ladoo',
        name: 'Besan Ladoo',
        category: 'diwali',
        secondaryCategories: ['sweets'],
        description: 'Golden roasted gram flour ladoos blended with pure desi ghee, fragrant green cardamom, and crunchy dry fruits.',
        detailedDescription: 'Our signature festive delicacy prepared by slow-roasting coarse gram flour (besan) in generous pure desi ghee until rich golden brown, flavored with fresh ground cardamom, crunchy almonds, and cashews.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg', '2 kg'],
        tasteProfile: 'Rich, aromatic, melt-in-mouth sweetness',
        ingredientsHighlight: ['Pure Desi Ghee', 'Premium Gram Flour', 'Cardamom', 'Cashews & Almonds'],
        texture: 'Melt-in-mouth roasted texture',
        status: 'active',
        sortOrder: 1,
      },
      {
        id: 'prod-motichoor-ladoo',
        name: 'Motichoor Ladoo',
        category: 'sweets',
        secondaryCategories: ['diwali'],
        description: 'Tiny pearl-like droplets of gram flour fried in pure ghee, steeped in saffron syrup, and studded with melon seeds.',
        detailedDescription: 'Delicate, juicy, and vibrant orange Motichoor Ladoos crafted from micro-fine boondi pearls, soaked in aromatic saffron and rose sugar syrup, garnished with magaz (melon seeds) and silver vark.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg'],
        tasteProfile: 'Juicy, fragrant saffron sweetness',
        ingredientsHighlight: ['Micro Boondi', 'Desi Ghee', 'Kashmir Saffron', 'Melon Seeds'],
        texture: 'Soft, melt-in-mouth juicy pearls',
        status: 'active',
        sortOrder: 2,
      },
      {
        id: 'prod-bhajani-chakli',
        name: 'Bhajani Chakli',
        category: 'diwali',
        secondaryCategories: ['namkeen'],
        description: 'Traditional multi-grain roasted flour spiral snack with sesame seeds and aromatic carom spices. Ultra-crispy.',
        detailedDescription: 'The crown jewel of Diwali Faral. Prepared using multi-grain flour slow-roasted to perfection, seasoned with roasted ajwain, cumin, sesame seeds, and cold-pressed oil for irresistible crunch.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg', '2 kg'],
        tasteProfile: 'Savory, spiced, crispy & aromatic',
        ingredientsHighlight: ['Multi-grain Bhajani Flour', 'White Sesame', 'Ajwain & Jeera', 'Hing'],
        texture: 'Crispy, crunchy, non-oily',
        status: 'active',
        sortOrder: 3,
      },
      {
        id: 'prod-sweet-shankarpali',
        name: 'Sweet Shankarpali',
        category: 'diwali',
        secondaryCategories: ['sweets'],
        description: 'Bite-sized crispy diamond pastry bites delicately sweetened with pure sugar and fragrant cardamom.',
        detailedDescription: 'Classic Maharashtrian festive diamond snack made by kneading fine flour with milk, sugar, and pure ghee, layered and gently fried to achieve a flaky, melt-in-the-mouth crispiness.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg'],
        tasteProfile: 'Mild sweet, flaky, delightful crunch',
        ingredientsHighlight: ['Fine Flour', 'Pure Milk', 'Desi Ghee', 'Cardamom'],
        texture: 'Light, flaky & crisp diamond bites',
        status: 'active',
        sortOrder: 4,
      },
      {
        id: 'prod-poha-chivda',
        name: 'Maharashtrian Poha Chivda',
        category: 'namkeen',
        secondaryCategories: ['diwali'],
        description: 'Crisp roasted thin flattened rice tossed with roasted peanuts, curry leaves, green chilies, and turmeric.',
        detailedDescription: 'A light, guilt-free tea-time snack. Roasted thin poha blended with crisp fried peanuts, roasted chana dal, fresh curry leaves, mustard seeds, and gentle spices.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg'],
        tasteProfile: 'Lightly spiced, crunchy, tangy-sweet note',
        ingredientsHighlight: ['Roasted Thin Poha', 'Crunchy Peanuts', 'Fresh Curry Leaves', 'Dalia & Turmeric'],
        texture: 'Super light, crisp & non-greasy',
        status: 'active',
        sortOrder: 5,
      },
      {
        id: 'prod-kaju-katli',
        name: 'Royal Kaju Katli',
        category: 'sweets',
        secondaryCategories: ['diwali'],
        description: 'Signature diamond fudge made from premium Goan cashew nuts and delicate silver leaf.',
        detailedDescription: 'Silky smooth, melt-in-mouth diamond shaped cashew fudge prepared with 100% premium quality cashews and fine sugar. Zero added flour or artificial fillers.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g', '500g', '1 kg'],
        tasteProfile: 'Silky, rich cashew goodness with gentle sweetness',
        ingredientsHighlight: ['100% Premium Cashew Nuts', 'Refined Sugar', 'Cardamom', 'Pure Silver Leaf'],
        texture: 'Velvety smooth fudge',
        status: 'active',
        sortOrder: 6,
      },
      {
        id: 'prod-karanji',
        name: 'Crispy Karanji / Gujiya',
        category: 'diwali',
        secondaryCategories: ['sweets'],
        description: 'Crescent-shaped crispy pastry stuffed with roasted coconut, dry fruits, poppy seeds, and cardamom.',
        detailedDescription: 'An essential Diwali festive treat. Golden, flaky pastry parcels generously filled with fragrant roasted grated coconut, mawa/khoya, poppy seeds, powdered sugar, and chopped nuts.',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['250g (6 pcs)', '500g (12 pcs)', '1 kg (24 pcs)'],
        tasteProfile: 'Rich aromatic coconut sweetness with flaky exterior',
        ingredientsHighlight: ['Desiccated Coconut', 'Pure Khoya', 'Poppy Seeds', 'Nutmeg & Cardamom'],
        texture: 'Flaky golden crust, juicy nutty filling',
        status: 'active',
        sortOrder: 7,
      },
      {
        id: 'prod-nylon-sev',
        name: 'Nylon Sev & Teekha Gathiya',
        category: 'namkeen',
        secondaryCategories: [],
        description: 'Golden crunchy gram flour sev seasoned with hing and black pepper. Perfect topping for chaat or tea-time.',
        detailedDescription: 'Crispy golden strings made from spiced gram flour batter, pressed through fine brass moulds, and fried in pure groundnut oil for maximum crunch.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
        isPopular: false,
        isFestiveSpecial: false,
        packSizes: ['250g', '500g', '1 kg'],
        tasteProfile: 'Mild savory, delicate crunch',
        ingredientsHighlight: ['Bengal Gram Flour', 'Pure Groundnut Oil', 'Hing', 'Rock Salt'],
        texture: 'Feather-light crispy strands',
        status: 'active',
        sortOrder: 8,
      },
      {
        id: 'prod-gulab-jamun',
        name: 'Mawa Gulab Jamun',
        category: 'sweets',
        secondaryCategories: ['diwali'],
        description: 'Soft, golden-brown mawa dumplings soaked in cardamom and rose infused saffron sugar syrup.',
        detailedDescription: 'Hand-rolled fresh mawa and chenna dumplings fried slowly in pure desi ghee and immersed in warm cardamom-saffron syrup.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        isPopular: true,
        isFestiveSpecial: true,
        packSizes: ['500g (10 pcs)', '1 kg (20 pcs)'],
        tasteProfile: 'Warm, syrupy, aromatic saffron & cardamom sweetness',
        ingredientsHighlight: ['Fresh Khoya / Mawa', 'Desi Ghee', 'Saffron', 'Rose Essence'],
        texture: 'Soft, spongy & melt-in-the-mouth',
        status: 'active',
        sortOrder: 9,
      }
    ],
    categories: [
      {
        id: 'cat-diwali',
        name: 'Diwali Faral Specials',
        slug: 'diwali',
        tagline: 'Auspicious Festive Flavours',
        description: 'Essential Maharashtrian & Indian Diwali delicacies prepared with pure ghee, roasted flours, and festive warmth.',
        badge: 'Festive Season',
        iconName: 'Sparkles',
        items: ['Besan Ladoo', 'Bhajani Chakli', 'Sweet Shankarpali', 'Karanji', 'Poha Chivda'],
        sampleProducts: ['Besan Ladoo', 'Bhajani Chakli', 'Sweet Shankarpali', 'Karanji'],
        status: 'active',
        sortOrder: 1,
      },
      {
        id: 'cat-sweets',
        name: 'Traditional Indian Sweets',
        slug: 'sweets',
        tagline: 'Melt-in-Mouth Sweet Celebrations',
        description: 'Pure Desi Ghee Ladoos, Mawa Peda, Kaju Katli, Gulab Jamun and celebratory mithai crafted with heirloom care.',
        badge: 'Pure Desi Ghee',
        iconName: 'HeartHandshake',
        items: ['Besan Ladoo', 'Motichoor Ladoo', 'Kaju Katli', 'Gulab Jamun', 'Milk Peda'],
        sampleProducts: ['Motichoor Ladoo', 'Kaju Katli', 'Gulab Jamun'],
        status: 'active',
        sortOrder: 2,
      },
      {
        id: 'cat-namkeen',
        name: 'Crunchy Savory Namkeen',
        slug: 'namkeen',
        tagline: 'Crisp & Aromatic Everyday Snacks',
        description: 'Freshly roasted Poha Chivda, Bhadang, Nylon Sev, Spiced Gathiya and crunchy savory snacks.',
        badge: 'Fresh & Non-Oily',
        iconName: 'Flame',
        items: ['Poha Chivda', 'Nylon Sev', 'Bhajani Chakli', 'Spiced Gathiya', 'Diet Mixture'],
        sampleProducts: ['Maharashtrian Poha Chivda', 'Nylon Sev & Teekha Gathiya'],
        status: 'active',
        sortOrder: 3,
      },
      {
        id: 'cat-gifts',
        name: 'Festive Gift Hampers',
        slug: 'gift-boxes',
        tagline: 'Custom Celebration Boxes',
        description: 'Beautifully packed assorted sweet and snack boxes designed for Diwali gifting, family ceremonies, and corporate hampers.',
        badge: 'Custom Gifting',
        iconName: 'Gift',
        items: ['Silver Assortment', 'Royal Faral Box', 'Grand Celebration Hamper'],
        sampleProducts: ['Custom Assorted Gift Box'],
        status: 'active',
        sortOrder: 4,
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Fresh Besan Ladoos with Pure Desi Ghee',
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        description: 'Golden roasted gram flour ladoos with chopped cashews and cardamom.',
        isEnabled: true,
        sortOrder: 1,
      },
      {
        id: 'gal-2',
        title: 'Authentic Crispy Bhajani Chakli',
        category: 'Diwali Special',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        description: 'Traditional multi-grain roasted flour spirals with white sesame seeds.',
        isEnabled: true,
        sortOrder: 2,
      },
      {
        id: 'gal-3',
        title: 'Royal Kaju Katli Diamond Cuts',
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        description: 'Premium cashew fudge sliced into sparkling diamond shapes.',
        isEnabled: true,
        sortOrder: 3,
      },
      {
        id: 'gal-4',
        title: 'Maharashtrian Poha Chivda Bowl',
        category: 'Namkeen',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
        description: 'Crispy roasted flattened rice tossed with peanuts and fresh curry leaves.',
        isEnabled: true,
        sortOrder: 4,
      },
      {
        id: 'gal-5',
        title: 'Festive Diwali Faral Assortment Box',
        category: 'Gift Boxes',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        description: 'Curated combination of sweet ladoos, crispy chakli, and shankarpali.',
        isEnabled: true,
        sortOrder: 5,
      },
      {
        id: 'gal-6',
        title: 'Golden Sweet Shankarpali Bites',
        category: 'Diwali Special',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        description: 'Crispy diamond pastry bites fried to delicate golden perfection.',
        isEnabled: true,
        sortOrder: 6,
      },
      {
        id: 'gal-7',
        title: 'Flaky Coconut & Khoya Karanji',
        category: 'Diwali Special',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
        description: 'Crescent-shaped pastries stuffed with roasted coconut and dry fruits.',
        isEnabled: true,
        sortOrder: 7,
      },
      {
        id: 'gal-8',
        title: 'Fresh Motichoor Ladoo Plate',
        category: 'Sweets',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
        description: 'Juicy saffron boondi pearls garnished with melon seeds and silver leaf.',
        isEnabled: true,
        sortOrder: 8,
      }
    ],
    testimonials: [
      {
        id: 'test-1',
        name: 'Sunita Deshmukh',
        designation: 'Home Maker',
        location: 'Pune, Maharashtra',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'The Besan Ladoos and Bhajani Chakli reminded me of my grandmother’s kitchen! The ghee aroma is authentic and the chakli is wonderfully crispy without being oily.',
        event: 'Diwali Faral Order',
        isApproved: true,
        sortOrder: 1,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'test-2',
        name: 'Rajesh Kulkarni',
        designation: 'Software Architect',
        location: 'Mumbai, Maharashtra',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'We ordered 35 custom gift boxes for our office Diwali celebration. The packaging was royal and every employee appreciated the fresh homemade taste. Ordering on WhatsApp was seamless!',
        event: 'Corporate Festive Gifting',
        isApproved: true,
        sortOrder: 2,
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
      },
      {
        id: 'test-3',
        name: 'Anjali Sharma',
        designation: 'Teacher',
        location: 'Nagpur, Maharashtra',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        rating: 5,
        comment: 'Kaju Katli and Poha Chivda are regular in our home now. Fresh, pure ingredients, prompt WhatsApp confirmation and reliable delivery.',
        event: 'Family Celebration',
        isApproved: true,
        sortOrder: 3,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      }
    ],
    enquiries: [
      {
        id: 'inq-101',
        inquiryId: 'INQ-2026-1048',
        customerName: 'Pooja Patil',
        email: 'pooja.patil@example.com',
        phone: '+91 98220 12345',
        product: 'Festive Faral & Sweets Order',
        quantity: '2 kg - 5 kg',
        message: 'Looking to order 2 kg Besan Ladoo, 1 kg Chakli and 1 kg Sweet Shankarpali for Diwali next week. Please share batch schedule and pricing.',
        source: 'Website Contact Form',
        status: 'new',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'inq-102',
        inquiryId: 'INQ-2026-1042',
        customerName: 'Vikram Joshi',
        email: 'vikram.j@example.com',
        phone: '+91 98811 54321',
        product: 'Custom Celebration Gift Box',
        quantity: '50 Boxes',
        message: 'Enquiring for 50 custom gift hampers for our client appreciation event. Need assorted sweets and namkeen with festive ribbons.',
        source: 'Custom Gift Box Builder',
        status: 'contacted',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'inq-103',
        inquiryId: 'INQ-2026-1035',
        customerName: 'Ananya Deshmukh',
        email: 'ananya.d@gmail.com',
        phone: '+91 94231 78901',
        product: 'Bhajani Chakli & Poha Chivda',
        quantity: '1 kg',
        message: 'Can you deliver by this Friday to Pune? Need fresh crunchy chakli and diet poha chivda.',
        source: 'Product Details Modal',
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'inq-104',
        inquiryId: 'INQ-2026-1021',
        customerName: 'Sanjay Shinde',
        email: 'sanjay.shinde@corp.in',
        phone: '+91 98200 98765',
        product: 'Bulk Corporate Order',
        quantity: '100 Boxes',
        message: 'Corporate festive gifting requirement. Order confirmed and advance payment processed.',
        source: 'Corporate Enquiry',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      }
    ],
    navigation: {
      menuItems: [
        { id: 'nav-home', label: 'Home', target: 'home', isVisible: true, sortOrder: 1 },
        { id: 'nav-festive', label: 'Festive Faral', target: 'festive-specials', isVisible: true, sortOrder: 2 },
        { id: 'nav-products', label: 'Products', target: 'products', isVisible: true, sortOrder: 3 },
        { id: 'nav-gifts', label: 'Gift Boxes', target: 'gift-boxes', isVisible: true, sortOrder: 4 },
        { id: 'nav-about', label: 'About Brand', target: 'about', isVisible: true, sortOrder: 5 },
        { id: 'nav-why-us', label: 'Why RevEg', target: 'why-choose-us', isVisible: true, sortOrder: 6 },
        { id: 'nav-gallery', label: 'Gallery', target: 'gallery', isVisible: true, sortOrder: 7 },
        { id: 'nav-testimonials', label: 'Reviews', target: 'testimonials', isVisible: true, sortOrder: 8 },
        { id: 'nav-contact', label: 'Contact', target: 'contact', isVisible: true, sortOrder: 9 },
      ],
      ctaButton: {
        text: 'Order on WhatsApp',
        target: '#contact',
        isVisible: true,
      }
    },
    footer: {
      logoUrl: '/reveg-logo.svg',
      brandName: 'RevEg Fresh Foods',
      tagline: 'Traditional Sweets & Snacks',
      description: 'Bringing authentic traditional Indian sweets, festive faral favourites, and crispy everyday namkeen to your home with purity, freshness, and homemade taste.',
      quickLinks: [
        { id: 'fl-1', label: 'Home', target: 'home' },
        { id: 'fl-2', label: 'About Brand', target: 'about' },
        { id: 'fl-3', label: 'Product Catalogue', target: 'products' },
        { id: 'fl-4', label: 'Festive Specials', target: 'festive-specials' },
        { id: 'fl-5', label: 'Custom Gift Boxes', target: 'gift-boxes' },
        { id: 'fl-6', label: 'Photo Gallery', target: 'gallery' },
        { id: 'fl-7', label: 'Contact & Enquire', target: 'contact' },
      ],
      specialties: [
        { id: 'spec-1', title: 'Diwali Faral', items: 'Besan & Motichoor Ladoo, Chakli, Shankarpali, Karanji' },
        { id: 'spec-2', title: 'Traditional Sweets', items: 'Kaju Katli, Milk Peda, Gulab Jamun, Modak' },
        { id: 'spec-3', title: 'Namkeen', items: 'Poha Chivda, Bhadang, Nylon Sev, Royal Mixture' },
        { id: 'spec-4', title: 'Festive Hampers', items: 'Custom Assorted Sweet & Snack Boxes' },
      ],
      copyrightText: '© 2026 RevEg Fresh Foods. All Rights Reserved.',
    },
    media: [
      {
        id: 'med-logo',
        name: 'Brand Logo SVG',
        originalName: 'reveg-logo.svg',
        url: '/reveg-logo.svg',
        mimeType: 'image/svg+xml',
        size: 8420,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'med-hero-1',
        name: 'Sweets & Ladoos Assortment',
        originalName: 'sweets-hero.jpg',
        url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=1000&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        size: 154200,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'med-chakli-1',
        name: 'Crispy Bhajani Chakli Plate',
        originalName: 'chakli-fresh.jpg',
        url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1000&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        size: 178500,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: 'med-chivda-1',
        name: 'Maharashtrian Poha Chivda',
        originalName: 'poha-chivda.jpg',
        url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1000&auto=format&fit=crop&q=80',
        mimeType: 'image/jpeg',
        size: 142000,
        uploadedAt: new Date().toISOString(),
      }
    ]
  };
};

class DatabaseManager {
  private db: AppDatabase;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge with defaults in case of missing keys
        const defaults = getDefaultDatabase();
        return {
          ...defaults,
          ...parsed,
          settings: { ...defaults.settings, ...(parsed.settings || {}) },
          theme: { ...defaults.theme, ...(parsed.theme || {}) },
          seo: { ...defaults.seo, ...(parsed.seo || {}) },
          hero: { ...defaults.hero, ...(parsed.hero || {}) },
          about: { ...defaults.about, ...(parsed.about || {}) },
          navigation: { ...defaults.navigation, ...(parsed.navigation || {}) },
          footer: { ...defaults.footer, ...(parsed.footer || {}) },
        };
      }
    } catch (err) {
      console.error('[DB] Failed to parse db.json, generating default db', err);
    }
    const initial = getDefaultDatabase();
    this.saveDatabaseSync(initial);
    return initial;
  }

  private saveDatabaseSync(data: AppDatabase) {
    try {
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error writing to db.json', err);
    }
  }

  public get<K extends keyof AppDatabase>(key: K): AppDatabase[K] {
    return this.db[key];
  }

  public getAll(): AppDatabase {
    return this.db;
  }

  public set<K extends keyof AppDatabase>(key: K, value: AppDatabase[K]) {
    this.db[key] = value;
    this.saveDatabaseSync(this.db);
    return this.db[key];
  }

  public update<K extends keyof AppDatabase>(key: K, updater: (current: AppDatabase[K]) => AppDatabase[K]) {
    this.db[key] = updater(this.db[key]);
    this.saveDatabaseSync(this.db);
    return this.db[key];
  }

  // Session helper
  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    if (!this.db.sessions) {
      this.db.sessions = {};
    }
    this.db.sessions[token] = { userId, expiresAt };
    this.saveDatabaseSync(this.db);
    return token;
  }

  public validateSession(token: string): AdminUser | null {
    if (!token || !this.db.sessions || !this.db.sessions[token]) {
      return null;
    }
    const session = this.db.sessions[token];
    if (Date.now() > session.expiresAt) {
      delete this.db.sessions[token];
      this.saveDatabaseSync(this.db);
      return null;
    }
    const user = this.db.users.find((u) => u.id === session.userId);
    return user || null;
  }

  public destroySession(token: string) {
    if (this.db.sessions && this.db.sessions[token]) {
      delete this.db.sessions[token];
      this.saveDatabaseSync(this.db);
    }
  }

  public resetToDefaults(): AppDatabase {
    this.db = getDefaultDatabase();
    this.saveDatabaseSync(this.db);
    return this.db;
  }
}

export const db = new DatabaseManager();
