import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SiteSettings,
  ThemeSettings,
  SeoSettings,
  SectionConfig,
  HeroConfig,
  AboutConfig,
  ProductItem,
  CategoryItem,
  GalleryItemRecord,
  TestimonialRecord,
  NavigationConfig,
  FooterConfig,
  MediaItem,
} from '../server/db';
import { INITIAL_SITE_DATA } from '../data/initialData';
import { fetchAllDataFromSupabase } from '../services/supabaseService';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

export interface PublicSiteData {
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
  navigation: NavigationConfig;
  footer: FooterConfig;
  media?: MediaItem[];
}

interface SiteContextType {
  data: PublicSiteData | null;
  isLoading: boolean;
  error: string | null;
  isSupabaseActive: boolean;
  refreshData: () => Promise<void>;
  updateSiteData: (updated: Partial<PublicSiteData>) => void;
  getWhatsAppUrl: (message: string) => string;
  isSectionEnabled: (sectionId: string) => boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PublicSiteData | null>(INITIAL_SITE_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(isSupabaseConfigured());

  const applyDomSettings = useCallback((siteData: PublicSiteData) => {
    // Apply dynamic SEO title and meta
    if (siteData.seo) {
      if (siteData.seo.title) document.title = siteData.seo.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && siteData.seo.description) {
        metaDesc.setAttribute('content', siteData.seo.description);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && siteData.seo.ogTitle) {
        ogTitle.setAttribute('content', siteData.seo.ogTitle);
      }
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && siteData.seo.ogDescription) {
        ogDesc.setAttribute('content', siteData.seo.ogDescription);
      }
    }

    // Apply dynamic CSS variables for theme customization
    if (siteData.theme) {
      const root = document.documentElement;
      if (siteData.theme.primaryColor) root.style.setProperty('--brand-green', siteData.theme.primaryColor);
      if (siteData.theme.primaryDark) root.style.setProperty('--brand-green-dark', siteData.theme.primaryDark);
      if (siteData.theme.primaryLight) root.style.setProperty('--brand-green-light', siteData.theme.primaryLight);
      if (siteData.theme.orangeColor) root.style.setProperty('--brand-orange', siteData.theme.orangeColor);
      if (siteData.theme.orangeHover) root.style.setProperty('--brand-orange-hover', siteData.theme.orangeHover);
      if (siteData.theme.yellowColor) root.style.setProperty('--brand-yellow', siteData.theme.yellowColor);
      if (siteData.theme.creamBg) root.style.setProperty('--brand-cream', siteData.theme.creamBg);
      if (siteData.theme.cardBg) root.style.setProperty('--brand-card', siteData.theme.cardBg);
      if (siteData.theme.textColor) root.style.setProperty('--brand-dark', siteData.theme.textColor);
    }
  }, []);

  const fetchSiteData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    }
    setError(null);
    try {
      // 1. Primary Source of Truth: Supabase PostgreSQL
      if (isSupabaseConfigured()) {
        setIsSupabaseActive(true);
        const supabaseData = await fetchAllDataFromSupabase();
        setData(supabaseData);
        applyDomSettings(supabaseData);
        return;
      }

      // 2. Secondary: If Express server has database API running (dev fallback)
      try {
        const res = await fetch('/api/public-content');
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const json: PublicSiteData = await res.json();
            setData(json);
            applyDomSettings(json);
            return;
          }
        }
      } catch {
        // Express not answering (expected in static Vite deployment on Hostinger)
      }

      // 3. Fallback to initial structured data
      setData(INITIAL_SITE_DATA);
      applyDomSettings(INITIAL_SITE_DATA);
    } catch (err: any) {
      console.error('Failed to load site data:', err);
      setError(err.message || 'Failed to fetch site data');
      setData(INITIAL_SITE_DATA);
      applyDomSettings(INITIAL_SITE_DATA);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  }, [applyDomSettings]);

  useEffect(() => {
    // Initial fetch
    fetchSiteData(true);

    // 1. Setup Supabase Realtime subscription for instant live events
    const client = getSupabaseClient();
    let channel: any = null;
    if (client) {
      channel = client
        .channel('reveg_realtime_sync')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          fetchSiteData(false);
        })
        .subscribe();
    }

    // 2. Periodic polling: every 5 seconds while page/tab is visible
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchSiteData(false);
      }
    }, 5000);

    // 3. Active tab / Window focus listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSiteData(false);
      }
    };

    const handleFocus = () => {
      fetchSiteData(false);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (client && channel) {
        client.removeChannel(channel);
      }
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSiteData]);

  const updateSiteData = useCallback(
    (updated: Partial<PublicSiteData>) => {
      setData((prev) => {
        if (!prev) return prev;
        const merged: PublicSiteData = {
          ...prev,
          ...updated,
          settings: updated.settings || prev.settings,
          theme: updated.theme || prev.theme,
          seo: updated.seo || prev.seo,
          sections: updated.sections || prev.sections,
          hero: updated.hero || prev.hero,
          about: updated.about || prev.about,
          products: updated.products || prev.products,
          categories: updated.categories || prev.categories,
          gallery: updated.gallery || prev.gallery,
          testimonials: updated.testimonials || prev.testimonials,
          navigation: updated.navigation || prev.navigation,
          footer: updated.footer || prev.footer,
          media: updated.media || prev.media,
        };
        applyDomSettings(merged);
        return merged;
      });
    },
    [applyDomSettings]
  );

  // Helper to generate dynamic WhatsApp URL with configured number
  const getWhatsAppUrl = useCallback(
    (message: string): string => {
      const rawNumber = data?.settings?.whatsappNumber || '919403358033';
      const cleanPhone = rawNumber.replace(/[^0-9]/g, '');
      const encodedText = encodeURIComponent(message.trim());
      return `https://wa.me/${cleanPhone}?text=${encodedText}`;
    },
    [data?.settings?.whatsappNumber]
  );

  const isSectionEnabled = useCallback(
    (sectionId: string): boolean => {
      if (!data?.sections) return true;
      const sec = data.sections.find((s) => s.id === sectionId);
      return sec ? sec.enabled : true;
    },
    [data?.sections]
  );

  return (
    <SiteContext.Provider
      value={{
        data,
        isLoading,
        error,
        isSupabaseActive,
        refreshData: fetchSiteData,
        updateSiteData,
        getWhatsAppUrl,
        isSectionEnabled,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSiteData must be used within a SiteProvider');
  }
  return context;
};
