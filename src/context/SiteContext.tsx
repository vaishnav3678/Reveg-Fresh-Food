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
import { getStoredSiteData, saveStoredSiteData } from '../utils/localStore';

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
  refreshData: () => Promise<void>;
  updateSiteData: (updated: Partial<PublicSiteData>) => void;
  getWhatsAppUrl: (message: string) => string;
  isSectionEnabled: (sectionId: string) => boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PublicSiteData | null>(() => getStoredSiteData());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchSiteData = useCallback(async () => {
    // 1. First load from localStorage to guarantee immediate zero-delay display
    const local = getStoredSiteData();
    setData(local);
    applyDomSettings(local);

    // 2. If server API is available, optionally sync
    try {
      const res = await fetch('/api/public-content');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const json: PublicSiteData = await res.json();
          setData(json);
          applyDomSettings(json);
          saveStoredSiteData(json);
        }
      }
    } catch {
      // Backend not running (static deployment) -> perfectly fine, already loaded from localStorage
    }
  }, [applyDomSettings]);

  useEffect(() => {
    fetchSiteData();

    // Listen for real-time changes saved across the admin panel in the same browser
    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setData(e.detail);
        applyDomSettings(e.detail);
      } else {
        const updated = getStoredSiteData();
        setData(updated);
        applyDomSettings(updated);
      }
    };

    window.addEventListener('reveg_site_data_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('reveg_site_data_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [fetchSiteData, applyDomSettings]);

  const updateSiteData = useCallback(
    (updated: Partial<PublicSiteData>) => {
      const saved = saveStoredSiteData(updated);
      setData(saved);
      applyDomSettings(saved);
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

