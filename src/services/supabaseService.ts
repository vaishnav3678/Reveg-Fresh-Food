import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  ProductItem,
  CategoryItem,
  GalleryItemRecord,
  TestimonialRecord,
  HeroConfig,
  AboutConfig,
  SiteSettings,
  ThemeSettings,
  NavigationConfig,
  FooterConfig,
  SeoSettings,
  SectionConfig,
  MediaItem,
} from '../server/db';
import { INITIAL_SITE_DATA, StaticSiteData } from '../data/initialData';

// Table names in Supabase PostgreSQL
export const TABLES = {
  PRODUCTS: 'reveg_products',
  CATEGORIES: 'reveg_categories',
  GALLERY: 'reveg_gallery',
  TESTIMONIALS: 'reveg_testimonials',
  MEDIA: 'reveg_media',
  SITE_CONFIGS: 'reveg_site_configs',
};

// Data Transformers
export const productFromDB = (row: any): ProductItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  secondaryCategories: row.secondary_categories || [],
  description: row.description || '',
  detailedDescription: row.detailed_description || '',
  packSizes: row.package_sizes || row.pack_sizes || ['250g', '500g', '1kg'],
  isPopular: Boolean(row.is_popular || row.is_featured || row.is_best_seller),
  isFestiveSpecial: Boolean(row.is_festive_special || row.is_new),
  tasteProfile: row.taste_profile || '',
  ingredientsHighlight: row.ingredients_highlight || [],
  texture: row.texture || '',
  image: row.image || '',
  priceGuide: row.price_guide || '',
  status: row.status || 'active',
  sortOrder: Number(row.sort_order) || 0,
});

export const productToDB = (prod: ProductItem): any => ({
  id: prod.id,
  name: prod.name,
  category: prod.category,
  secondary_categories: prod.secondaryCategories || [],
  description: prod.description || '',
  detailed_description: prod.detailedDescription || '',
  package_sizes: prod.packSizes || [],
  is_popular: prod.isPopular || false,
  is_festive_special: prod.isFestiveSpecial || false,
  taste_profile: prod.tasteProfile || '',
  ingredients_highlight: prod.ingredientsHighlight || [],
  texture: prod.texture || '',
  image: prod.image || '',
  price_guide: prod.priceGuide || '',
  status: prod.status || 'active',
  sort_order: prod.sortOrder || 0,
  updated_at: new Date().toISOString(),
});

export const categoryFromDB = (row: any): CategoryItem => ({
  id: row.id,
  name: row.name,
  slug: row.slug || '',
  tagline: row.tagline || '',
  description: row.description || '',
  badge: row.badge || '',
  iconName: row.icon_name || '',
  items: row.items || [],
  sampleProducts: row.sample_products || [],
  status: row.status || 'active',
  sortOrder: Number(row.sort_order) || 0,
});

export const categoryToDB = (cat: CategoryItem): any => ({
  id: cat.id,
  name: cat.name,
  slug: cat.slug || '',
  tagline: cat.tagline || '',
  description: cat.description || '',
  badge: cat.badge || '',
  icon_name: cat.iconName || '',
  items: cat.items || [],
  sample_products: cat.sampleProducts || [],
  status: cat.status || 'active',
  sort_order: cat.sortOrder || 0,
});

export const galleryFromDB = (row: any): GalleryItemRecord => ({
  id: row.id,
  title: row.title,
  category: row.category || '',
  image: row.image,
  description: row.description || '',
  isEnabled: row.is_enabled ?? true,
  sortOrder: Number(row.sort_order) || 0,
});

export const galleryToDB = (item: GalleryItemRecord): any => ({
  id: item.id,
  title: item.title,
  category: item.category || '',
  image: item.image,
  description: item.description || '',
  is_enabled: item.isEnabled ?? true,
  sort_order: item.sortOrder || 0,
});

export const testimonialFromDB = (row: any): TestimonialRecord => ({
  id: row.id,
  name: row.name,
  designation: row.designation || '',
  location: row.location || '',
  avatar: row.avatar || '',
  rating: Number(row.rating) || 5,
  comment: row.comment,
  event: row.event || '',
  isApproved: row.is_approved ?? true,
  sortOrder: Number(row.sort_order) || 0,
  createdAt: row.created_at || new Date().toISOString(),
});

export const testimonialToDB = (item: TestimonialRecord): any => ({
  id: item.id,
  name: item.name,
  designation: item.designation || '',
  location: item.location || '',
  avatar: item.avatar || '',
  rating: item.rating || 5,
  comment: item.comment,
  event: item.event || '',
  is_approved: item.isApproved ?? true,
  sort_order: item.sortOrder || 0,
});

export const mediaFromDB = (row: any): MediaItem => ({
  id: row.id,
  name: row.name,
  originalName: row.original_name || row.name,
  url: row.url,
  size: Number(row.size) || 0,
  mimeType: row.mime_type || 'image/jpeg',
  uploadedAt: row.uploaded_at || new Date().toISOString(),
});

export const mediaToDB = (item: MediaItem): any => ({
  id: item.id,
  name: item.name,
  original_name: item.originalName,
  url: item.url,
  size: item.size,
  mime_type: item.mimeType,
  uploaded_at: item.uploadedAt,
});

// Seed Initial Data into Supabase PostgreSQL
export const seedSupabaseTables = async (): Promise<boolean> => {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Seed Products
    if (INITIAL_SITE_DATA.products?.length) {
      const rows = INITIAL_SITE_DATA.products.map(productToDB);
      await client.from(TABLES.PRODUCTS).upsert(rows, { onConflict: 'id' });
    }

    // 2. Seed Categories
    if (INITIAL_SITE_DATA.categories?.length) {
      const rows = INITIAL_SITE_DATA.categories.map(categoryToDB);
      await client.from(TABLES.CATEGORIES).upsert(rows, { onConflict: 'id' });
    }

    // 3. Seed Gallery
    if (INITIAL_SITE_DATA.gallery?.length) {
      const rows = INITIAL_SITE_DATA.gallery.map(galleryToDB);
      await client.from(TABLES.GALLERY).upsert(rows, { onConflict: 'id' });
    }

    // 4. Seed Testimonials
    if (INITIAL_SITE_DATA.testimonials?.length) {
      const rows = INITIAL_SITE_DATA.testimonials.map(testimonialToDB);
      await client.from(TABLES.TESTIMONIALS).upsert(rows, { onConflict: 'id' });
    }

    // 5. Seed Media
    if (INITIAL_SITE_DATA.media?.length) {
      const rows = INITIAL_SITE_DATA.media.map(mediaToDB);
      await client.from(TABLES.MEDIA).upsert(rows, { onConflict: 'id' });
    }

    // 6. Seed Site Configs (Hero, About, Settings, Theme, Navigation, Footer, Seo, Sections)
    const configsToSeed = [
      { key: 'hero', value: INITIAL_SITE_DATA.hero },
      { key: 'about', value: INITIAL_SITE_DATA.about },
      { key: 'settings', value: INITIAL_SITE_DATA.settings },
      { key: 'theme', value: INITIAL_SITE_DATA.theme },
      { key: 'navigation', value: INITIAL_SITE_DATA.navigation },
      { key: 'footer', value: INITIAL_SITE_DATA.footer },
      { key: 'seo', value: INITIAL_SITE_DATA.seo },
      { key: 'sections', value: INITIAL_SITE_DATA.sections },
    ];

    await client.from(TABLES.SITE_CONFIGS).upsert(configsToSeed, { onConflict: 'key' });
    return true;
  } catch (err) {
    console.error('Failed to seed Supabase database:', err);
    return false;
  }
};

// Fetch Full Site Data directly from Supabase
export const fetchAllDataFromSupabase = async (): Promise<StaticSiteData> => {
  const client = getSupabaseClient();
  if (!client) {
    return INITIAL_SITE_DATA;
  }

  try {
    const [
      productsRes,
      categoriesRes,
      galleryRes,
      testimonialsRes,
      mediaRes,
      configsRes,
    ] = await Promise.all([
      client.from(TABLES.PRODUCTS).select('*').order('sort_order', { ascending: true }),
      client.from(TABLES.CATEGORIES).select('*').order('sort_order', { ascending: true }),
      client.from(TABLES.GALLERY).select('*').order('sort_order', { ascending: true }),
      client.from(TABLES.TESTIMONIALS).select('*').order('sort_order', { ascending: true }),
      client.from(TABLES.MEDIA).select('*').order('uploaded_at', { ascending: false }),
      client.from(TABLES.SITE_CONFIGS).select('*'),
    ]);

    // Check if products are empty in Supabase, auto-seed if needed
    if (
      (!productsRes.data || productsRes.data.length === 0) &&
      (!categoriesRes.data || categoriesRes.data.length === 0)
    ) {
      console.info('Supabase tables appear empty, auto-seeding initial RevEg data...');
      await seedSupabaseTables();
      return INITIAL_SITE_DATA;
    }

    const products: ProductItem[] = productsRes.data?.length
      ? productsRes.data.map(productFromDB)
      : INITIAL_SITE_DATA.products;

    const categories: CategoryItem[] = categoriesRes.data?.length
      ? categoriesRes.data.map(categoryFromDB)
      : INITIAL_SITE_DATA.categories;

    const gallery: GalleryItemRecord[] = galleryRes.data?.length
      ? galleryRes.data.map(galleryFromDB)
      : INITIAL_SITE_DATA.gallery;

    const testimonials: TestimonialRecord[] = testimonialsRes.data?.length
      ? testimonialsRes.data.map(testimonialFromDB)
      : INITIAL_SITE_DATA.testimonials;

    const media: MediaItem[] = mediaRes.data?.length
      ? mediaRes.data.map(mediaFromDB)
      : INITIAL_SITE_DATA.media;

    // Parse configs map
    const configsMap: Record<string, any> = {};
    if (configsRes.data) {
      configsRes.data.forEach((row: any) => {
        configsMap[row.key] = row.value;
      });
    }

    return {
      hero: (configsMap.hero as HeroConfig) || INITIAL_SITE_DATA.hero,
      about: (configsMap.about as AboutConfig) || INITIAL_SITE_DATA.about,
      settings: (configsMap.settings as SiteSettings) || INITIAL_SITE_DATA.settings,
      theme: (configsMap.theme as ThemeSettings) || INITIAL_SITE_DATA.theme,
      navigation: (configsMap.navigation as NavigationConfig) || INITIAL_SITE_DATA.navigation,
      footer: (configsMap.footer as FooterConfig) || INITIAL_SITE_DATA.footer,
      seo: (configsMap.seo as SeoSettings) || INITIAL_SITE_DATA.seo,
      sections: (configsMap.sections as SectionConfig[]) || INITIAL_SITE_DATA.sections,
      products,
      categories,
      gallery,
      testimonials,
      media,
    };
  } catch (error) {
    console.error('Error querying Supabase database:', error);
    return INITIAL_SITE_DATA;
  }
};

// CRUD Operations on Supabase
export const supabaseSaveProduct = async (product: ProductItem): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true }; // offline fallback

  try {
    const row = productToDB(product);
    const { error } = await client.from(TABLES.PRODUCTS).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase save product error:', err);
    return { success: false, error: err.message || 'Failed to save product in Supabase' };
  }
};

export const supabaseDeleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(TABLES.PRODUCTS).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase delete product error:', err);
    return { success: false, error: err.message || 'Failed to delete product in Supabase' };
  }
};

export const supabaseSaveCategory = async (category: CategoryItem): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const row = categoryToDB(category);
    const { error } = await client.from(TABLES.CATEGORIES).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase save category error:', err);
    return { success: false, error: err.message || 'Failed to save category in Supabase' };
  }
};

export const supabaseDeleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(TABLES.CATEGORIES).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase delete category error:', err);
    return { success: false, error: err.message || 'Failed to delete category in Supabase' };
  }
};

export const supabaseSaveGalleryItem = async (item: GalleryItemRecord): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const row = galleryToDB(item);
    const { error } = await client.from(TABLES.GALLERY).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase save gallery error:', err);
    return { success: false, error: err.message || 'Failed to save gallery item in Supabase' };
  }
};

export const supabaseDeleteGalleryItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(TABLES.GALLERY).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase delete gallery error:', err);
    return { success: false, error: err.message || 'Failed to delete gallery item in Supabase' };
  }
};

export const supabaseSaveTestimonial = async (item: TestimonialRecord): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const row = testimonialToDB(item);
    const { error } = await client.from(TABLES.TESTIMONIALS).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase save testimonial error:', err);
    return { success: false, error: err.message || 'Failed to save testimonial in Supabase' };
  }
};

export const supabaseDeleteTestimonial = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(TABLES.TESTIMONIALS).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase delete testimonial error:', err);
    return { success: false, error: err.message || 'Failed to delete testimonial in Supabase' };
  }
};

export const supabaseSaveMedia = async (item: MediaItem): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const row = mediaToDB(item);
    const { error } = await client.from(TABLES.MEDIA).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase save media error:', err);
    return { success: false, error: err.message || 'Failed to save media in Supabase' };
  }
};

export const supabaseSaveMediaItem = supabaseSaveMedia;

export const supabaseDeleteMedia = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client.from(TABLES.MEDIA).delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase delete media error:', err);
    return { success: false, error: err.message || 'Failed to delete media in Supabase' };
  }
};

export const supabaseDeleteMediaItem = supabaseDeleteMedia;

export const supabaseSaveConfig = async (
  key: string,
  value: any
): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    const { error } = await client
      .from(TABLES.SITE_CONFIGS)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Supabase save config for ${key} error:`, err);
    return { success: false, error: err.message || `Failed to save ${key} in Supabase` };
  }
};

export const supabaseResetToDefault = async (): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) return { success: true };

  try {
    // Upsert all initial products
    if (INITIAL_SITE_DATA.products && INITIAL_SITE_DATA.products.length > 0) {
      const prodRows = INITIAL_SITE_DATA.products.map(productToDB);
      await client.from(TABLES.PRODUCTS).upsert(prodRows, { onConflict: 'id' });
    }

    // Upsert all initial categories
    if (INITIAL_SITE_DATA.categories && INITIAL_SITE_DATA.categories.length > 0) {
      const catRows = INITIAL_SITE_DATA.categories.map(categoryToDB);
      await client.from(TABLES.CATEGORIES).upsert(catRows, { onConflict: 'id' });
    }

    // Upsert gallery
    if (INITIAL_SITE_DATA.gallery && INITIAL_SITE_DATA.gallery.length > 0) {
      const galRows = INITIAL_SITE_DATA.gallery.map(galleryToDB);
      await client.from(TABLES.GALLERY).upsert(galRows, { onConflict: 'id' });
    }

    // Upsert testimonials
    if (INITIAL_SITE_DATA.testimonials && INITIAL_SITE_DATA.testimonials.length > 0) {
      const testRows = INITIAL_SITE_DATA.testimonials.map(testimonialToDB);
      await client.from(TABLES.TESTIMONIALS).upsert(testRows, { onConflict: 'id' });
    }

    // Upsert configs
    const configsToSeed = [
      { key: 'hero', value: INITIAL_SITE_DATA.hero },
      { key: 'about', value: INITIAL_SITE_DATA.about },
      { key: 'settings', value: INITIAL_SITE_DATA.settings },
      { key: 'theme', value: INITIAL_SITE_DATA.theme },
      { key: 'navigation', value: INITIAL_SITE_DATA.navigation },
      { key: 'footer', value: INITIAL_SITE_DATA.footer },
      { key: 'seo', value: INITIAL_SITE_DATA.seo },
      { key: 'sections', value: INITIAL_SITE_DATA.sections },
    ];

    for (const item of configsToSeed) {
      await client.from(TABLES.SITE_CONFIGS).upsert(item as any, { onConflict: 'key' });
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase reset error:', err);
    return { success: false, error: err.message || 'Failed to reset Supabase data' };
  }
};
