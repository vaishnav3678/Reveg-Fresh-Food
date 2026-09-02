import React, { useState, useEffect } from 'react';
import { Compass, Plus, Trash2, Save, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { NavigationConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveConfig } from '../../services/supabaseService';

interface AdminNavigationProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData } = useSiteData();
  const [nav, setNav] = useState<NavigationConfig | null>(() => siteData?.navigation || null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (siteData?.navigation) {
      setNav(siteData.navigation);
    }
  }, [siteData?.navigation]);

  const handleSave = async () => {
    if (!nav) return;
    try {
      setIsSaving(true);
      const res = await supabaseSaveConfig('navigation', nav);
      if (!res.success) {
        showToast('error', res.error || 'Failed to save navigation in Supabase');
      } else {
        showToast('success', 'Header navigation saved to Supabase');
      }
      await refreshData();

      try {
        await authFetch('/api/navigation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nav),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving navigation');
    } finally {
      setIsSaving(false);
    }
  };

  const addMenuItem = () => {
    if (!nav) return;
    const newItem = {
      id: 'menu_' + Date.now(),
      label: 'New Link',
      target: '#catalog',
      order: nav.items.length + 1,
      visible: true,
    };
    setNav({ ...nav, items: [...nav.items, newItem] });
  };

  const removeMenuItem = (id: string) => {
    if (!nav) return;
    setNav({ ...nav, items: nav.items.filter((item) => item.id !== id) });
  };

  const updateMenuItem = (id: string, field: 'label' | 'target' | 'visible', value: any) => {
    if (!nav) return;
    setNav({
      ...nav,
      items: nav.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    });
  };

  if (!nav) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading Navigation...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Header Navigation Menu
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Configure navbar menu links, reorder items, and customize the top header CTA button.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-nav-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save & Publish Menu'}</span>
        </button>
      </div>

      {/* Menu Links */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">Menu Items</h3>
          <button
            type="button"
            onClick={addMenuItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF5EE] text-[#0D5B29] rounded-xl text-xs font-bold hover:bg-[#D5E8DA]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Link</span>
          </button>
        </div>

        <div className="space-y-3">
          {nav.items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] flex flex-col sm:flex-row items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="w-6 h-6 rounded-lg bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateMenuItem(item.id, 'label', e.target.value)}
                  placeholder="Link Label"
                  className="text-xs p-2 rounded-xl bg-white border border-[#D5E8DA] font-bold text-[#11311D] w-36"
                />
                <input
                  type="text"
                  value={item.target}
                  onChange={(e) => updateMenuItem(item.id, 'target', e.target.value)}
                  placeholder="#section-target"
                  className="text-xs p-2 rounded-xl bg-white border border-[#D5E8DA] font-mono text-[#557060] flex-1 sm:w-48"
                />
              </div>

              <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => updateMenuItem(item.id, 'visible', !item.visible)}
                  className={`p-2 rounded-xl text-xs font-bold ${
                    item.visible ? 'bg-[#EBF5EE] text-[#0D5B29]' : 'bg-gray-200 text-gray-600'
                  }`}
                  title="Toggle Visibility"
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => removeMenuItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button Config */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
        <h3 className="font-cinzel text-base font-bold text-[#11311D]">Header Action Button (CTA)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Button Label</label>
            <input
              type="text"
              value={nav.ctaText}
              onChange={(e) => setNav({ ...nav, ctaText: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Button Target Link</label>
            <input
              type="text"
              value={nav.ctaLink}
              onChange={(e) => setNav({ ...nav, ctaLink: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
