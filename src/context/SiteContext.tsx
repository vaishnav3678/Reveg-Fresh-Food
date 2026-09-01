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
  EnquiryRecord,
} from '../server/db';

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
}

interface SiteContextType {
  data: PublicSiteData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  submitEnquiry: (formData: {
    name: string;
    email?: string;
    phone?: string;
    inquiryType: string;
    packSize?: string;
    message: string;
  }) => Promise<{ success: boolean; enquiry?: EnquiryRecord; error?: string }>;
  getWhatsAppUrl: (message: string) => string;
  isSectionEnabled: (sectionId: string) => boolean;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PublicSiteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/public-content');
      if (!res.ok) {
        throw new Error(`Failed to load website content (${res.status})`);
      }
      const json: PublicSiteData = await res.json();
      setData(json);
      setError(null);

      // Apply dynamic SEO title and meta
      if (json.seo) {
        if (json.seo.title) document.title = json.seo.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && json.seo.description) {
          metaDesc.setAttribute('content', json.seo.description);
        }
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && json.seo.ogTitle) {
          ogTitle.setAttribute('content', json.seo.ogTitle);
        }
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && json.seo.ogDescription) {
          ogDesc.setAttribute('content', json.seo.ogDescription);
        }
      }

      // Apply dynamic CSS variables for theme customization
      if (json.theme) {
        const root = document.documentElement;
        if (json.theme.primaryColor) root.style.setProperty('--brand-green', json.theme.primaryColor);
        if (json.theme.primaryDark) root.style.setProperty('--brand-green-dark', json.theme.primaryDark);
        if (json.theme.primaryLight) root.style.setProperty('--brand-green-light', json.theme.primaryLight);
        if (json.theme.orangeColor) root.style.setProperty('--brand-orange', json.theme.orangeColor);
        if (json.theme.orangeHover) root.style.setProperty('--brand-orange-hover', json.theme.orangeHover);
        if (json.theme.yellowColor) root.style.setProperty('--brand-yellow', json.theme.yellowColor);
        if (json.theme.creamBg) root.style.setProperty('--brand-cream', json.theme.creamBg);
        if (json.theme.cardBg) root.style.setProperty('--brand-card', json.theme.cardBg);
        if (json.theme.textColor) root.style.setProperty('--brand-dark', json.theme.textColor);
      }
    } catch (err: any) {
      console.error('[SiteContext] Error fetching site data:', err);
      setError(err.message || 'Failed to load site data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteData();
  }, [fetchSiteData]);

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

  // Submit Enquiry to backend database
  const submitEnquiry = async (formData: {
    name: string;
    email?: string;
    phone?: string;
    inquiryType: string;
    packSize?: string;
    message: string;
  }) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Failed to submit enquiry' };
      }
      return { success: true, enquiry: result.enquiry };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  return (
    <SiteContext.Provider
      value={{
        data,
        isLoading,
        error,
        refreshData: fetchSiteData,
        submitEnquiry,
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
