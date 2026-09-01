import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Image as ImageIcon, CheckCircle, ExternalLink } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { HeroConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';

interface AdminHeroProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminHero: React.FC<AdminHeroProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [hero, setHero] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchHero = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/hero');
      if (res.ok) {
        const data = await res.json();
        setHero(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;

    try {
      setIsSaving(true);
      const res = await authFetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      });

      if (res.ok) {
        showToast('success', 'Hero banner settings updated successfully');
        await refreshData();
      } else {
        showToast('error', 'Failed to save hero banner');
      }
    } catch (err) {
      showToast('error', 'Error saving hero settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !hero) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading Hero Config...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Hero Banner & Main Visuals
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Configure the main homepage headline, subheading, call to action buttons, and hero showcase image.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-hero-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Publishing...' : 'Publish Hero Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Headings & Copy */}
        <div className="lg:col-span-7 space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Top Small Badge Text
            </label>
            <input
              type="text"
              value={hero.badgeText}
              onChange={(e) => setHero({ ...hero, badgeText: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                Primary Headline
              </label>
              <input
                type="text"
                value={hero.headline}
                onChange={(e) => setHero({ ...hero, headline: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                Highlighted Headline Word (Gold/Orange)
              </label>
              <input
                type="text"
                value={hero.highlightWord}
                onChange={(e) => setHero({ ...hero, highlightWord: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold text-[#E8590C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Subheading Paragraph
            </label>
            <textarea
              rows={4}
              value={hero.subheading}
              onChange={(e) => setHero({ ...hero, subheading: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
            />
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 border-t border-[#E8F2EA] space-y-4">
            <h4 className="font-cinzel text-sm font-bold text-[#11311D]">Action Buttons</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#0D5B29] mb-1">
                  Primary Button 1 Label
                </label>
                <input
                  type="text"
                  value={hero.primaryCtaText}
                  onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#0D5B29] mb-1">
                  Primary Button Link Target
                </label>
                <input
                  type="text"
                  value={hero.primaryCtaLink}
                  onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#0D5B29] mb-1">
                Secondary WhatsApp Button Label
              </label>
              <input
                type="text"
                value={hero.whatsappCtaText}
                onChange={(e) => setHero({ ...hero, whatsappCtaText: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Hero Visual & Badges */}
        <div className="lg:col-span-5 space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm flex flex-col justify-between">
          
          <div className="space-y-4">
            <h4 className="font-cinzel text-sm font-bold text-[#11311D]">Hero Image & Media</h4>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                Showcase Image URL
              </label>
              <input
                type="text"
                value={hero.heroImage}
                onChange={(e) => setHero({ ...hero, heroImage: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#D5E8DA] aspect-video">
              <img
                src={hero.heroImage}
                alt="Hero banner preview"
                className="w-full h-full object-cover"
                onError={(e: any) => {
                  e.target.src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800';
                }}
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] text-white font-bold">
                Live Preview
              </div>
            </div>

            {/* Trust highlights */}
            <div className="space-y-2 pt-3 border-t border-[#E8F2EA]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29]">
                Trust Badges
              </label>
              <input
                type="text"
                value={hero.purityBadge}
                onChange={(e) => setHero({ ...hero, purityBadge: e.target.value })}
                placeholder="e.g. 100% Pure Desi Ghee"
                className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
              <input
                type="text"
                value={hero.experienceBadge}
                onChange={(e) => setHero({ ...hero, experienceBadge: e.target.value })}
                placeholder="e.g. Authentic Homemade Taste"
                className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-[#0D5B29] hover:bg-[#083E1B] text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            {isSaving ? 'Saving...' : 'Update Hero Banner'}
          </button>

        </div>

      </form>

    </div>
  );
};
