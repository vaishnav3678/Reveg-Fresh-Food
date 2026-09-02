import React, { useState, useEffect } from 'react';
import { Info, Save, Plus, X, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AboutConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveConfig } from '../../services/supabaseService';

interface AdminAboutProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminAbout: React.FC<AdminAboutProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData } = useSiteData();
  const [about, setAbout] = useState<AboutConfig | null>(() => siteData?.about || null);
  const [isSaving, setIsSaving] = useState(false);
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    if (siteData?.about) {
      setAbout(siteData.about);
    }
  }, [siteData?.about]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;

    try {
      setIsSaving(true);
      const res = await supabaseSaveConfig('about', about);
      if (!res.success) {
        showToast('error', res.error || 'Failed to save about section in Supabase');
      } else {
        showToast('success', 'About & Heritage content saved to Supabase and live');
      }
      await refreshData();

      try {
        await authFetch('/api/about', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(about),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving about details');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddValue = () => {
    if (newValue.trim() && about) {
      setAbout({
        ...about,
        coreValues: [...about.coreValues, newValue.trim()],
      });
      setNewValue('');
    }
  };

  const handleRemoveValue = (idx: number) => {
    if (about) {
      setAbout({
        ...about,
        coreValues: about.coreValues.filter((_, i) => i !== idx),
      });
    }
  };

  const handleUpdateStat = (idx: number, field: 'value' | 'label' | 'subtext', text: string) => {
    if (about) {
      const updated = [...about.stats];
      updated[idx] = { ...updated[idx], [field]: text };
      setAbout({ ...about, stats: updated });
    }
  };

  if (!about) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading About Data...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Heritage Story & Brand About Section
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Manage your authentic brand narrative, core values, mission, and live milestone stats.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-about-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save & Publish About'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Story Section */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Brand Headline & Story Paragraphs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={about.title}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Section Subtitle / Tagline
              </label>
              <input
                type="text"
                value={about.subtitle}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
              Story Paragraph 1 (Heritage & Beginnings)
            </label>
            <textarea
              rows={3}
              value={about.storyParagraph1}
              onChange={(e) => setAbout({ ...about, storyParagraph1: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
              Story Paragraph 2 (Commitment to Hygiene & Purity)
            </label>
            <textarea
              rows={3}
              value={about.storyParagraph2}
              onChange={(e) => setAbout({ ...about, storyParagraph2: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Mission Statement
              </label>
              <textarea
                rows={2}
                value={about.mission}
                onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Vision Statement
              </label>
              <textarea
                rows={2}
                value={about.vision}
                onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>
        </div>

        {/* Core Values Checklist */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Core Values & Quality Commitments
          </h3>

          <div className="flex flex-wrap gap-2 mb-2">
            {about.coreValues.map((val, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs bg-[#EBF5EE] text-[#0D5B29] font-bold px-3 py-1.5 rounded-xl border border-[#BCE5C8]"
              >
                <span>{val}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveValue(idx)}
                  className="hover:text-red-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="e.g. Traditional Hand-Pounded Spices"
              className="text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] flex-1"
            />
            <button
              type="button"
              onClick={handleAddValue}
              className="px-4 py-2.5 bg-[#0D5B29] text-white rounded-xl text-xs font-bold hover:bg-[#083E1B]"
            >
              Add Value
            </button>
          </div>
        </div>

        {/* Milestone Stats Counters */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Milestones & Key Statistics Counters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {about.stats.map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] space-y-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#0D5B29]">Number / Stat</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleUpdateStat(idx, 'value', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5E8DA] font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#0D5B29]">Label</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(idx, 'label', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5E8DA]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#0D5B29]">Subtext</label>
                  <input
                    type="text"
                    value={stat.subtext}
                    onChange={(e) => handleUpdateStat(idx, 'subtext', e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5E8DA]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">About Section Photography</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Primary Showcase Image URL
              </label>
              <input
                type="text"
                value={about.mainImage}
                onChange={(e) => setAbout({ ...about, mainImage: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Secondary Image URL
              </label>
              <input
                type="text"
                value={about.subImage}
                onChange={(e) => setAbout({ ...about, subImage: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
