-- ==============================================================================
-- RevEg Fresh Foods - Complete Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.reveg_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  secondary_categories JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  detailed_description TEXT DEFAULT '',
  package_sizes JSONB DEFAULT '["250g", "500g", "1kg"]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_festive_special BOOLEAN DEFAULT false,
  taste_profile TEXT DEFAULT '',
  ingredients_highlight JSONB DEFAULT '[]'::jsonb,
  texture TEXT DEFAULT '',
  image TEXT DEFAULT '',
  price_guide TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.reveg_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  icon_name TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  sample_products JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Photo Gallery Table
CREATE TABLE IF NOT EXISTS public.reveg_gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  image TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Customer Reviews / Testimonials Table
CREATE TABLE IF NOT EXISTS public.reveg_testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT DEFAULT '',
  location TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  event TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Media Library Table
CREATE TABLE IF NOT EXISTS public.reveg_media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT DEFAULT '',
  url TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Dynamic Site Configs Table (Hero, About, Settings, Theme, Navigation, Footer, SEO, Sections)
CREATE TABLE IF NOT EXISTS public.reveg_site_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Customer Inquiries Table (CRM System)
-- Note: We create both `reveg_inquiries` and `inquiries` to support standard or prefixed naming
CREATE TABLE IF NOT EXISTS public.reveg_inquiries (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  product TEXT DEFAULT '',
  quantity TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'pending', 'completed', 'cancelled'
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT DEFAULT '',
  product TEXT DEFAULT '',
  quantity TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full replica identity ensures old record is transmitted on Realtime UPDATE and DELETE
ALTER TABLE public.reveg_inquiries REPLICA IDENTITY FULL;
ALTER TABLE public.inquiries REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_reveg_inquiries_status ON public.reveg_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_reveg_inquiries_created_at ON public.reveg_inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_reveg_inquiries_phone ON public.reveg_inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_reveg_inquiries_inquiry_id ON public.reveg_inquiries(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON public.inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_inquiry_id ON public.inquiries(inquiry_id);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_reveg_products_category ON public.reveg_products(category);
CREATE INDEX IF NOT EXISTS idx_reveg_products_status ON public.reveg_products(status);
CREATE INDEX IF NOT EXISTS idx_reveg_products_sort_order ON public.reveg_products(sort_order);
CREATE INDEX IF NOT EXISTS idx_reveg_categories_sort_order ON public.reveg_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_reveg_gallery_sort_order ON public.reveg_gallery(sort_order);
CREATE INDEX IF NOT EXISTS idx_reveg_testimonials_sort_order ON public.reveg_testimonials(sort_order);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable public read and write access using the Anon Key
-- ==============================================================================
ALTER TABLE public.reveg_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_site_configs ENABLE ROW LEVEL SECURITY;

-- Products Policies
DROP POLICY IF EXISTS "Public full access products" ON public.reveg_products;
CREATE POLICY "Public full access products" ON public.reveg_products FOR ALL USING (true) WITH CHECK (true);

-- Categories Policies
DROP POLICY IF EXISTS "Public full access categories" ON public.reveg_categories;
CREATE POLICY "Public full access categories" ON public.reveg_categories FOR ALL USING (true) WITH CHECK (true);

-- Gallery Policies
DROP POLICY IF EXISTS "Public full access gallery" ON public.reveg_gallery;
CREATE POLICY "Public full access gallery" ON public.reveg_gallery FOR ALL USING (true) WITH CHECK (true);

-- Testimonials Policies
DROP POLICY IF EXISTS "Public full access testimonials" ON public.reveg_testimonials;
CREATE POLICY "Public full access testimonials" ON public.reveg_testimonials FOR ALL USING (true) WITH CHECK (true);

-- Media Policies
DROP POLICY IF EXISTS "Public full access media" ON public.reveg_media;
CREATE POLICY "Public full access media" ON public.reveg_media FOR ALL USING (true) WITH CHECK (true);

-- Site Configs Policies
DROP POLICY IF EXISTS "Public full access site configs" ON public.reveg_site_configs;
CREATE POLICY "Public full access site configs" ON public.reveg_site_configs FOR ALL USING (true) WITH CHECK (true);

-- Inquiries Policies
ALTER TABLE public.reveg_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access reveg_inquiries" ON public.reveg_inquiries;
CREATE POLICY "Public full access reveg_inquiries" ON public.reveg_inquiries FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public full access inquiries" ON public.inquiries;
CREATE POLICY "Public full access inquiries" ON public.inquiries FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SUPABASE REALTIME ENABLEMENT
-- Enables instant live updates to all connected devices on changes
-- ==============================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_categories;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_gallery;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_testimonials;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_media;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_site_configs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_inquiries;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
