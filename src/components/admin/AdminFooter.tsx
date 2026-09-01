import React, { useState, useEffect } from 'react';
import { PanelBottom, Save, Plus, Trash2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { FooterConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';

interface AdminFooterProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminFooter: React.FC<AdminFooterProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [footer, setFooter] = useState<FooterConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchFooter = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/footer');
      if (res.ok) {
        const data = await res.json();
        setFooter(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footer) return;

    try {
      setIsSaving(true);
      const res = await authFetch('/api/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      });

      if (res.ok) {
        showToast('success', 'Footer settings updated');
        await refreshData();
      } else {
        showToast('error', 'Failed to save footer');
      }
    } catch (err) {
      showToast('error', 'Error saving footer');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !footer) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading Footer...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Footer & Brand Bottom Settings
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Manage the brand bio, delicacy specialty tags, and footer copyright text.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-footer-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Footer'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1.5">
            Footer Brand Narrative / Bio
          </label>
          <textarea
            rows={3}
            value={footer.brandDescription}
            onChange={(e) => setFooter({ ...footer, brandDescription: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1.5">
            Specialties Tag List (Comma separated)
          </label>
          <input
            type="text"
            value={footer.specialties.join(', ')}
            onChange={(e) =>
              setFooter({
                ...footer,
                specialties: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1.5">
            Copyright Line
          </label>
          <input
            type="text"
            value={footer.copyright}
            onChange={(e) => setFooter({ ...footer, copyright: e.target.value })}
            className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
          />
        </div>
      </form>

    </div>
  );
};
