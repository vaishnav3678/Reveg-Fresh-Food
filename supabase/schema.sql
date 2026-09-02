-- RevEg Fresh Foods Supabase PostgreSQL Database Schema
-- Run this script in the Supabase SQL Editor to initialize all tables and policies.

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.reveg_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  secondary_categories JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  short_description TEXT,
  badge TEXT,
  package_sizes JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  price_guide TEXT,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.reveg_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT,
  tagline TEXT,
  description TEXT,
  badge TEXT,
  icon_name TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  sample_products JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.reveg_gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  image TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.reveg_testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  location TEXT,
  avatar TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  event TEXT,
  is_approved BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEDIA LIBRARY TABLE
CREATE TABLE IF NOT EXISTS public.reveg_media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SITE CONFIGURATIONS TABLE (Key-Value JSONB for hero, about, settings, theme, navigation, footer, seo, sections, etc.)
CREATE TABLE IF NOT EXISTS public.reveg_site_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.reveg_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_site_configs ENABLE ROW LEVEL SECURITY;

-- 9. Create public access policies for anon/authenticated roles
DO $$
BEGIN
  -- Products policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_products' AND policyname = 'Allow public access to reveg_products') THEN
    CREATE POLICY "Allow public access to reveg_products" ON public.reveg_products FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Categories policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_categories' AND policyname = 'Allow public access to reveg_categories') THEN
    CREATE POLICY "Allow public access to reveg_categories" ON public.reveg_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Gallery policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_gallery' AND policyname = 'Allow public access to reveg_gallery') THEN
    CREATE POLICY "Allow public access to reveg_gallery" ON public.reveg_gallery FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Testimonials policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_testimonials' AND policyname = 'Allow public access to reveg_testimonials') THEN
    CREATE POLICY "Allow public access to reveg_testimonials" ON public.reveg_testimonials FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Media policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_media' AND policyname = 'Allow public access to reveg_media') THEN
    CREATE POLICY "Allow public access to reveg_media" ON public.reveg_media FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Site configs policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reveg_site_configs' AND policyname = 'Allow public access to reveg_site_configs') THEN
    CREATE POLICY "Allow public access to reveg_site_configs" ON public.reveg_site_configs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
