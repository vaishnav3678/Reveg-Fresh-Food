import React, { useState } from 'react';
import { KeyRound, User, Lock, Save, ShieldCheck, AlertCircle, RotateCcw, Database, CheckCircle2, Copy, FileCode2, Globe, ServerOff, UploadCloud } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSiteData } from '../../context/SiteContext';
import { resetStoredSiteData } from '../../utils/localStore';
import { supabaseResetToDefault } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminProfileProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- RevEg Fresh Foods - Complete Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor: Dashboard -> SQL Editor -> New Query
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.reveg_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  secondary_categories JSONB DEFAULT '[]'::jsonb,
  description TEXT DEFAULT '',
  detailed_description TEXT DEFAULT '',
  package_sizes JSONB DEFAULT '["250g", "500g", "1kg"]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_festive_special BOOLEAN DEFAULT false,
  taste_profile TEXT DEFAULT '',
  ingredients_highlight JSONB DEFAULT '[]'::jsonb,
  texture TEXT DEFAULT '',
  image TEXT DEFAULT '',
  price_guide TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reveg_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  icon_name TEXT DEFAULT '',
  items JSONB DEFAULT '[]'::jsonb,
  sample_products JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reveg_gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT '',
  image TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_enabled BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reveg_testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT DEFAULT '',
  location TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  event TEXT DEFAULT '',
  is_approved BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reveg_media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT DEFAULT '',
  url TEXT NOT NULL,
  size INTEGER DEFAULT 0,
  mime_type TEXT DEFAULT 'image/jpeg',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reveg_site_configs (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.reveg_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reveg_site_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access products" ON public.reveg_products;
CREATE POLICY "Public full access products" ON public.reveg_products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access categories" ON public.reveg_categories;
CREATE POLICY "Public full access categories" ON public.reveg_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access gallery" ON public.reveg_gallery;
CREATE POLICY "Public full access gallery" ON public.reveg_gallery FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access testimonials" ON public.reveg_testimonials;
CREATE POLICY "Public full access testimonials" ON public.reveg_testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access media" ON public.reveg_media;
CREATE POLICY "Public full access media" ON public.reveg_media FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access site configs" ON public.reveg_site_configs;
CREATE POLICY "Public full access site configs" ON public.reveg_site_configs FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_products; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_categories; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_gallery; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_testimonials; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_media; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reveg_site_configs; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;`;

export const AdminProfile: React.FC<AdminProfileProps> = ({ showToast }) => {
  const { user, authFetch } = useAdminAuth();
  const { refreshData, isSupabaseActive } = useSiteData();

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || 'Administrator');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'admin@reveg.com');
  const [profileUsername, setProfileUsername] = useState(user?.username || 'admin');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Reset Demo
  const [isResetting, setIsResetting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    showToast('success', 'Supabase SQL schema copied to clipboard');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      const updatedUser = {
        id: user?.id || 'usr_admin',
        name: profileName,
        email: profileEmail,
        username: profileUsername,
        role: user?.role || ('admin' as const),
      };
      localStorage.setItem('reveg_admin_profile', JSON.stringify(updatedUser));
      showToast('success', 'Profile details updated');

      try {
        await authFetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: profileName,
            email: profileEmail,
            username: profileUsername,
          }),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 5) {
      showToast('error', 'Password must be at least 5 characters');
      return;
    }

    try {
      setIsSavingPassword(true);
      localStorage.setItem('reveg_admin_custom_pwd', newPassword);
      showToast('success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      try {
        await authFetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error changing password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleResetDemoData = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset the database to the default authentic RevEg demo state in Supabase?'
      )
    )
      return;

    try {
      setIsResetting(true);
      resetStoredSiteData();
      await supabaseResetToDefault();
      showToast('success', 'Database reset to default RevEg demo state in Supabase');
      await refreshData();

      try {
        await authFetch('/api/reset-demo', { method: 'POST' });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error resetting demo');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
          Admin Account & Security Settings
        </h2>
        <p className="text-xs text-[#557060] mt-0.5">
          Manage your administrator profile, credentials, and master database reset tool.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Info Card */}
        <form onSubmit={handleUpdateProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8F2EA] pb-3 text-[#0D5B29]">
              <User className="w-5 h-5" />
              <h3 className="font-cinzel text-base font-bold text-[#11311D]">Admin Profile</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Username</label>
              <input
                type="text"
                required
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full py-3 bg-[#0D5B29] hover:bg-[#083E1B] text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            {isSavingProfile ? 'Saving...' : 'Update Profile Info'}
          </button>
        </form>

        {/* Change Password Card */}
        <form onSubmit={handleChangePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8F2EA] pb-3 text-[#0D5B29]">
              <Lock className="w-5 h-5" />
              <h3 className="font-cinzel text-base font-bold text-[#11311D]">Change Password</h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 5 characters"
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSavingPassword}
            className="w-full py-3 bg-[#E8590C] hover:bg-[#CC4B04] text-white rounded-xl text-xs font-bold transition-all shadow"
          >
            {isSavingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>

      </div>

      {/* Supabase Cloud Database Info & SQL Schema */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8F2EA] pb-4">
          <div className="flex items-center gap-3 text-[#0D5B29]">
            <Database className="w-6 h-6 text-[#E8590C]" />
            <div>
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#11311D]">
                Supabase PostgreSQL Cloud Database
              </h3>
              <p className="text-[11px] text-[#557060]">
                Single permanent source of truth for all products, prices, categories, and website settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isSupabaseConfigured()
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isSupabaseConfigured() ? 'Supabase Active & Live Syncing' : 'Standby / Demo Data Active'}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E3EDE6]">
            <span className="text-[10px] uppercase font-bold text-[#557060] block mb-1">Architecture</span>
            <p className="text-xs font-bold text-[#0D5B29]">Direct Supabase Client</p>
            <p className="text-[11px] text-[#557060] mt-1">
              Zero dependency on Node/Express server in production. Static Vite build on Hostinger talks directly to Supabase.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E3EDE6]">
            <span className="text-[10px] uppercase font-bold text-[#557060] block mb-1">Real-Time Sync</span>
            <p className="text-xs font-bold text-[#E8590C]">Realtime Channel + 5s Poll</p>
            <p className="text-[11px] text-[#557060] mt-1">
              Changes published in Admin instantly push to all active mobile & desktop browsers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#E3EDE6]">
            <span className="text-[10px] uppercase font-bold text-[#557060] block mb-1">Target Hosting</span>
            <p className="text-xs font-bold text-[#11311D]">Hostinger /public_html/site2</p>
            <p className="text-[11px] text-[#557060] mt-1">
              Fully configured with Apache <code className="text-[#0D5B29]">.htaccess</code> for clean SPA routing at <code className="text-[#0D5B29]">site2.appwik.com</code>.
            </p>
          </div>
        </div>

        {/* SQL Schema Copier */}
        <div className="p-4 rounded-2xl bg-[#083E1B] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-6 h-6 text-[#F5A800] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Supabase PostgreSQL SQL Schema</p>
              <p className="text-[11px] text-[#C8DED0]">
                Copy & paste this script into your Supabase Dashboard SQL Editor to initialize all tables & realtime replication.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E8590C] hover:bg-[#CC4B04] text-white text-xs font-bold transition-all shrink-0"
          >
            {copiedSql ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
          </button>
        </div>
      </div>

      {/* Hostinger FileZilla Deployment Guide */}
      <div className="bg-[#FAF8F2] p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-[#0D5B29]">
          <UploadCloud className="w-5 h-5 text-[#E8590C]" />
          <h3 className="font-cinzel text-base font-bold text-[#11311D]">
            Hostinger FileZilla Deployment Instructions
          </h3>
        </div>

        <p className="text-xs text-[#557060] leading-relaxed">
          Follow these 3 quick steps to deploy this application to your Hostinger server at <strong className="text-[#11311D]">https://site2.appwik.com/</strong>:
        </p>

        <div className="space-y-2.5 text-xs text-[#11311D]">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E3EDE6]">
            <span className="w-5 h-5 rounded-full bg-[#0D5B29] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
            <div>
              <p className="font-bold text-[#0D5B29]">Run Build Command</p>
              <p className="text-[11px] text-[#557060]">Execute <code className="bg-[#FAF8F2] px-1.5 py-0.5 rounded text-[#E8590C]">npm run build</code> in the project directory. This compiles the static assets into the <code className="text-[#0D5B29]">dist/</code> directory and copies <code className="text-[#0D5B29]">.htaccess</code> automatically.</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E3EDE6]">
            <span className="w-5 h-5 rounded-full bg-[#0D5B29] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
            <div>
              <p className="font-bold text-[#0D5B29]">Upload via FileZilla</p>
              <p className="text-[11px] text-[#557060]">Open FileZilla, connect to Hostinger FTP/SFTP, navigate to <code className="bg-[#FAF8F2] px-1.5 py-0.5 rounded text-[#E8590C]">/public_html/site2</code>, and upload ONLY the contents inside the <code className="text-[#0D5B29]">dist/</code> folder (including <code className="text-[#0D5B29]">.htaccess</code>).</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E3EDE6]">
            <span className="w-5 h-5 rounded-full bg-[#0D5B29] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
            <div>
              <p className="font-bold text-[#0D5B29]">Zero Server Maintenance</p>
              <p className="text-[11px] text-[#557060]">Your website at <strong className="text-[#11311D]">https://site2.appwik.com/</strong> and Admin Panel at <strong className="text-[#11311D]">https://site2.appwik.com/admin</strong> are now 100% database-driven. Any edits made in Admin are instantly saved to Supabase and show up on the public website without uploading files again!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Reset Option */}
      <div className="bg-red-50/70 p-6 sm:p-8 rounded-3xl border border-red-200 space-y-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="font-cinzel text-base font-bold">Reset Database to Default State</h3>
        </div>
        <p className="text-xs text-red-800 leading-relaxed">
          If you ever need to restore all original products, Diwali faral items, photo gallery, testimonials, and brand configuration to the pristine default state in Supabase, click the button below.
        </p>

        <button
          type="button"
          onClick={handleResetDemoData}
          disabled={isResetting}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow transition-all disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isResetting ? 'Resetting Data...' : 'Reset to Default RevEg Database'}</span>
        </button>
      </div>

    </div>
  );
};
