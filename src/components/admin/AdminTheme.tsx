import React, { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Sparkles, Check } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ThemeSettings } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { getStoredSiteData, saveStoredSiteData } from '../../utils/localStore';

interface AdminThemeProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminTheme: React.FC<AdminThemeProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [theme, setTheme] = useState<ThemeSettings | null>(() => getStoredSiteData().theme);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTheme = async () => {
    const local = getStoredSiteData().theme;
    setTheme(local);

    try {
      const res = await authFetch('/api/theme');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setTheme(data);
          saveStoredSiteData({ theme: data });
        }
      }
    } catch {
      // Static mode
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const handleResetToBrand = () => {
    const defaultTheme: ThemeSettings = {
      primaryColor: '#0D5B29',
      primaryDark: '#083E1B',
      primaryLight: '#13753D',
      orangeColor: '#E8590C',
      orangeHover: '#CC4B04',
      yellowColor: '#F5A800',
      creamBg: '#FAF8F2',
      cardBg: '#FFFFFF',
      textColor: '#11311D',
      fontHeading: 'Cinzel Decorative, serif',
      fontBody: 'Plus Jakarta Sans, sans-serif',
    };
    setTheme(defaultTheme);
    saveStoredSiteData({ theme: defaultTheme });
    refreshData();
    showToast('info', 'Reset palette to official RevEg logo branding');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme) return;

    try {
      setIsSaving(true);
      saveStoredSiteData({ theme });
      showToast('success', 'Theme & appearance palette saved');
      await refreshData();

      try {
        await authFetch('/api/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(theme),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving theme');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !theme) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading Theme...</div>;
  }

  const colorFields: Array<{
    key: keyof ThemeSettings;
    label: string;
    description: string;
  }> = [
    { key: 'primaryColor', label: 'Primary Brand Green', description: 'Used for primary headings, navbars, and borders' },
    { key: 'primaryDark', label: 'Dark Forest Green', description: 'Used for dark hero banners, sidebars, and footer background' },
    { key: 'primaryLight', label: 'Fresh Leaf Green', description: 'Used for subtle badges, hover backgrounds, and highlights' },
    { key: 'orangeColor', label: 'RevEg Vibrant Orange', description: 'Primary action buttons, CTA badges, and accent highlights' },
    { key: 'orangeHover', label: 'Orange Hover State', description: 'Color when hovering over orange buttons' },
    { key: 'yellowColor', label: 'Festive Golden Yellow', description: 'Stars, sparkles, traditional motifs, and celebration borders' },
    { key: 'creamBg', label: 'Warm Cream Canvas', description: 'Background of sections, cards, and modal backdrops' },
    { key: 'textColor', label: 'Primary Text Charcoal', description: 'High contrast text for descriptions and body copy' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Theme & Appearance Customizer
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Dynamically adjust the colors and visual atmosphere of the entire website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetToBrand}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold border border-[#D5E8DA]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to RevEg Logo Colors</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            id="admin-save-theme-btn"
            className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border border-[#F5A800]/40 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Publish Theme'}</span>
          </button>
        </div>
      </div>

      {/* Live Swatch Preview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
        <h3 className="font-cinzel text-base font-bold text-[#11311D]">Active Color Palette Swatches</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {colorFields.map((field) => {
            const val = theme[field.key] as string;
            return (
              <div key={field.key} className="space-y-1.5 text-center">
                <div
                  className="h-14 rounded-2xl border border-black/10 shadow-inner flex items-center justify-center font-mono text-[10px] text-white font-bold drop-shadow"
                  style={{ backgroundColor: val }}
                >
                  {val}
                </div>
                <span className="text-[10px] font-bold text-[#11311D] block line-clamp-1">
                  {field.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Edit Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-6">
        <h3 className="font-cinzel text-base font-bold text-[#11311D]">Custom Color Pickers</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {colorFields.map((field) => {
            const val = theme[field.key] as string;
            return (
              <div
                key={field.key}
                className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5 flex-1">
                  <label className="text-xs font-bold text-[#11311D] block">{field.label}</label>
                  <p className="text-[10px] text-[#557060]">{field.description}</p>
                  <span className="font-mono text-xs text-[#0D5B29] font-bold block mt-1">{val}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="color"
                    value={val}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#D5E8DA] bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setTheme({ ...theme, [field.key]: e.target.value })}
                    className="w-24 text-xs p-2 rounded-xl bg-white border border-[#D5E8DA] font-mono text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </form>

    </div>
  );
};
