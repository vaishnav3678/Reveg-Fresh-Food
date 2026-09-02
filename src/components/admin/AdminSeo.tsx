import React, { useState, useEffect } from 'react';
import { Search, Save, Globe } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SeoSettings } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { getStoredSiteData, saveStoredSiteData } from '../../utils/localStore';

interface AdminSeoProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminSeo: React.FC<AdminSeoProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [seo, setSeo] = useState<SeoSettings | null>(() => getStoredSiteData().seo);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSeo = async () => {
    const local = getStoredSiteData().seo;
    setSeo(local);

    try {
      const res = await authFetch('/api/seo');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSeo(data);
          saveStoredSiteData({ seo: data });
        }
      }
    } catch {
      // Static mode
    }
  };

  useEffect(() => {
    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    try {
      setIsSaving(true);
      saveStoredSiteData({ seo });
      showToast('success', 'SEO & Meta tags updated successfully');
      await refreshData();

      try {
        await authFetch('/api/seo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(seo),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !seo) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading SEO...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Search Engine Optimization (SEO)
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Optimize page meta tags, OpenGraph previews for WhatsApp/Facebook sharing, and keywords.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-seo-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save SEO Tags'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
            Browser Page Title Tag (&lt;title&gt;)
          </label>
          <input
            type="text"
            value={seo.title}
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
            Search Meta Description
          </label>
          <textarea
            rows={3}
            value={seo.description}
            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
            Keywords (comma separated)
          </label>
          <input
            type="text"
            value={seo.keywords}
            onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
          />
        </div>

        <div className="pt-4 border-t border-[#E8F2EA] space-y-4">
          <h3 className="font-cinzel text-sm font-bold text-[#11311D]">
            Social Media & WhatsApp Share Preview (OpenGraph)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                OpenGraph Title
              </label>
              <input
                type="text"
                value={seo.ogTitle}
                onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="text"
                value={seo.ogImage}
                onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
              OpenGraph Description
            </label>
            <textarea
              rows={2}
              value={seo.ogDescription}
              onChange={(e) => setSeo({ ...seo, ogDescription: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>
        </div>
      </form>

    </div>
  );
};
