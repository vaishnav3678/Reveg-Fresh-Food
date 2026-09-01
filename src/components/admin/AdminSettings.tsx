import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageCircle, Save, Globe, Clock, MapPin, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { SiteSettings } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';

interface AdminSettingsProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setIsSaving(true);
      const res = await authFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast('success', 'Contact & WhatsApp settings updated across the entire website');
        await refreshData();
      } else {
        showToast('error', 'Failed to save settings');
      }
    } catch (err) {
      showToast('error', 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-xs text-[#557060] bg-white rounded-3xl">Loading Settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Save */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            WhatsApp & Contact Settings
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Configure the central WhatsApp order line, official telephone, email, and kitchen hours.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          id="admin-save-settings-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* WhatsApp Central Configuration (HIGHLIGHTED) */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 sm:p-8 rounded-3xl border-2 border-[#25D366]/40 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-[#25D366]/20 pb-3">
            <div className="p-2.5 rounded-2xl bg-[#25D366] text-white shadow-sm">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-[#11311D]">
                Central WhatsApp Direct Line Configuration
              </h3>
              <p className="text-xs text-[#2b633b]">
                Every WhatsApp button and CTA across the entire website connects to this exact number.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                WhatsApp Phone Number (with Country Code) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="e.g. 919403358033"
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#25D366]/50 font-mono text-[#11311D] focus:ring-2 focus:ring-[#25D366]"
              />
              <span className="text-[10px] text-[#557060] mt-1 block">
                Standard format for wa.me API (digits only, e.g. 919403358033)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                Display Phone String on UI
              </label>
              <input
                type="text"
                required
                value={settings.whatsappDisplay}
                onChange={(e) => setSettings({ ...settings, whatsappDisplay: e.target.value })}
                placeholder="e.g. +91 94033 58033"
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#25D366]/50 font-bold text-[#11311D]"
              />
              <span className="text-[10px] text-[#557060] mt-1 block">
                Human-readable phone format displayed in headers, footers & badges
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                Floating Button Label Text
              </label>
              <input
                type="text"
                value={settings.floatingWhatsAppText}
                onChange={(e) => setSettings({ ...settings, floatingWhatsAppText: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-white border border-[#D5E8DA]"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#25D366]/40 cursor-pointer w-full">
                <input
                  type="checkbox"
                  checked={settings.floatingWhatsAppEnabled}
                  onChange={(e) => setSettings({ ...settings, floatingWhatsAppEnabled: e.target.checked })}
                  className="rounded text-[#25D366] focus:ring-[#25D366] w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-[#11311D] block">Enable Floating WhatsApp Widget</span>
                  <span className="text-[10px] text-[#557060]">Shows bottom-right floating direct chat button</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Default Pre-Filled WhatsApp Greeting
            </label>
            <textarea
              rows={2}
              value={settings.defaultWhatsAppMessage}
              onChange={(e) => setSettings({ ...settings, defaultWhatsAppMessage: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-white border border-[#D5E8DA]"
            />
          </div>
        </div>

        {/* General Business & Contact Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Official Contact & Kitchen Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Official Voice Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Physical / Delivery Address
              </label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
                Kitchen Facility Location
              </label>
              <input
                type="text"
                value={settings.kitchenLocation}
                onChange={(e) => setSettings({ ...settings, kitchenLocation: e.target.value })}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
              Business & Kitchen Hours
            </label>
            <input
              type="text"
              value={settings.businessHours}
              onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">
              Copyright Footer Notice
            </label>
            <input
              type="text"
              value={settings.copyrightText}
              onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Social Media & Web Presence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Instagram URL</label>
              <input
                type="text"
                value={settings.socialLinks?.instagram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                  })
                }
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Facebook URL</label>
              <input
                type="text"
                value={settings.socialLinks?.facebook || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
