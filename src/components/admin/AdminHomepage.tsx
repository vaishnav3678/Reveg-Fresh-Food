import React, { useState, useEffect } from 'react';
import { Home, ArrowUp, ArrowDown, Eye, EyeOff, Save, CheckCircle, Sparkles, Layers } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SectionConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { getStoredSiteData, saveStoredSiteData } from '../../utils/localStore';

interface AdminHomepageProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminHomepage: React.FC<AdminHomepageProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [sections, setSections] = useState<SectionConfig[]>(() => {
    const raw = getStoredSiteData().sections || [];
    return [...raw].sort((a, b) => a.sortOrder - b.sortOrder);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSections = async () => {
    const local = getStoredSiteData().sections || [];
    setSections([...local].sort((a, b) => a.sortOrder - b.sortOrder));

    try {
      const res = await authFetch('/api/sections');
      if (res.ok) {
        const data: SectionConfig[] = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
          setSections(sorted);
          saveStoredSiteData({ sections: sorted });
        }
      }
    } catch {
      // Static mode
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    // Recalculate sortOrders
    newSections.forEach((sec, idx) => {
      sec.sortOrder = idx + 1;
    });

    setSections(newSections);
  };

  const toggleSection = (id: string) => {
    setSections(
      sections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec))
    );
  };

  const updateSectionField = (id: string, field: 'name' | 'title' | 'subtitle', value: string) => {
    setSections(
      sections.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec))
    );
  };

  const handleSaveSections = async () => {
    try {
      setIsSaving(true);
      saveStoredSiteData({ sections });
      showToast('success', 'Homepage sections and order updated successfully');
      await refreshData();

      try {
        await authFetch('/api/sections', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sections),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving sections');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Homepage Sections & Layout Order
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Enable or disable sections, reorder homepage modules, and customize heading texts.
          </p>
        </div>

        <button
          onClick={handleSaveSections}
          disabled={isSaving}
          id="admin-save-sections-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Publishing...' : 'Save & Publish Order'}</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading sections...</div>
        ) : (
          sections.map((sec, idx) => (
            <div
              key={sec.id}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                sec.enabled
                  ? 'border-[#D5E8DA] shadow-sm hover:border-[#0D5B29]'
                  : 'border-gray-200 bg-gray-50/70 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Left: Index, Drag/Move, Name */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EBF5EE] text-[#0D5B29] disabled:opacity-30 disabled:pointer-events-none"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded-lg bg-[#FAF8F2] hover:bg-[#EBF5EE] text-[#0D5B29] disabled:opacity-30 disabled:pointer-events-none"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#0D5B29] font-bold text-xs flex items-center justify-center border border-[#BCE5C8]">
                    {idx + 1}
                  </div>

                  <div>
                    <span className="font-cinzel text-sm sm:text-base font-bold text-[#11311D] block">
                      {sec.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#557060]">ID: #{sec.id}</span>
                  </div>
                </div>

                {/* Center: Title / Subtitle inputs */}
                <div className="flex-1 max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#0D5B29] mb-1">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={sec.title || ''}
                      onChange={(e) => updateSectionField(sec.id, 'title', e.target.value)}
                      placeholder="Section main heading"
                      className="w-full text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#0D5B29] mb-1">
                      Display Subtitle
                    </label>
                    <input
                      type="text"
                      value={sec.subtitle || ''}
                      onChange={(e) => updateSectionField(sec.id, 'subtitle', e.target.value)}
                      placeholder="Short subheading text"
                      className="w-full text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D]"
                    />
                  </div>
                </div>

                {/* Right: Enable / Disable Toggle */}
                <div className="flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sec.enabled
                        ? 'bg-[#EBF5EE] text-[#0D5B29] border border-[#BCE5C8]'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {sec.enabled ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#0D5B29]" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
