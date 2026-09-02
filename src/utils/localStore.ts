import { StaticSiteData, INITIAL_SITE_DATA } from '../data/initialData';

const STORAGE_KEY = 'reveg_site_data_v1';

export const getStoredSiteData = (): StaticSiteData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SITE_DATA));
      return INITIAL_SITE_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...INITIAL_SITE_DATA,
      ...parsed,
      settings: { ...INITIAL_SITE_DATA.settings, ...(parsed.settings || {}) },
      theme: { ...INITIAL_SITE_DATA.theme, ...(parsed.theme || {}) },
      seo: { ...INITIAL_SITE_DATA.seo, ...(parsed.seo || {}) },
      hero: { ...INITIAL_SITE_DATA.hero, ...(parsed.hero || {}) },
      about: { ...INITIAL_SITE_DATA.about, ...(parsed.about || {}) },
      navigation: { ...INITIAL_SITE_DATA.navigation, ...(parsed.navigation || {}) },
      footer: { ...INITIAL_SITE_DATA.footer, ...(parsed.footer || {}) },
      products: Array.isArray(parsed.products) ? parsed.products : INITIAL_SITE_DATA.products,
      categories: Array.isArray(parsed.categories) ? parsed.categories : INITIAL_SITE_DATA.categories,
      gallery: Array.isArray(parsed.gallery) ? parsed.gallery : INITIAL_SITE_DATA.gallery,
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : INITIAL_SITE_DATA.testimonials,
      sections: Array.isArray(parsed.sections) ? parsed.sections : INITIAL_SITE_DATA.sections,
      media: Array.isArray(parsed.media) ? parsed.media : INITIAL_SITE_DATA.media,
    };
  } catch (err) {
    console.error('Error reading localStorage site data:', err);
    return INITIAL_SITE_DATA;
  }
};

export const saveStoredSiteData = (data: Partial<StaticSiteData>): StaticSiteData => {
  try {
    const current = getStoredSiteData();
    const updated: StaticSiteData = {
      ...current,
      ...data,
      settings: data.settings ? { ...current.settings, ...data.settings } : current.settings,
      theme: data.theme ? { ...current.theme, ...data.theme } : current.theme,
      seo: data.seo ? { ...current.seo, ...data.seo } : current.seo,
      hero: data.hero ? { ...current.hero, ...data.hero } : current.hero,
      about: data.about ? { ...current.about, ...data.about } : current.about,
      navigation: data.navigation ? { ...current.navigation, ...data.navigation } : current.navigation,
      footer: data.footer ? { ...current.footer, ...data.footer } : current.footer,
      products: data.products !== undefined ? data.products : current.products,
      categories: data.categories !== undefined ? data.categories : current.categories,
      gallery: data.gallery !== undefined ? data.gallery : current.gallery,
      testimonials: data.testimonials !== undefined ? data.testimonials : current.testimonials,
      sections: data.sections !== undefined ? data.sections : current.sections,
      media: data.media !== undefined ? data.media : current.media,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom window event so all components in the same tab / tabs sync instantly
    window.dispatchEvent(new CustomEvent('reveg_site_data_updated', { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Error saving localStorage site data:', err);
    return getStoredSiteData();
  }
};

export const resetStoredSiteData = (): StaticSiteData => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SITE_DATA));
    window.dispatchEvent(new CustomEvent('reveg_site_data_updated', { detail: INITIAL_SITE_DATA }));
    return INITIAL_SITE_DATA;
  } catch (err) {
    console.error('Error resetting localStorage site data:', err);
    return INITIAL_SITE_DATA;
  }
};
