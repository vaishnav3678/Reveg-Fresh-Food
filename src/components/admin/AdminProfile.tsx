import React, { useState } from 'react';
import { KeyRound, User, Lock, Save, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSiteData } from '../../context/SiteContext';
import { resetStoredSiteData } from '../../utils/localStore';

interface AdminProfileProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ showToast }) => {
  const { user, authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();

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
        'Are you sure you want to reset the entire database to the default authentic RevEg demo state?'
      )
    )
      return;

    try {
      setIsResetting(true);
      resetStoredSiteData();
      showToast('success', 'Database reset to default RevEg demo state');
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

      {/* Database Reset Option */}
      <div className="bg-red-50/70 p-6 sm:p-8 rounded-3xl border border-red-200 space-y-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="font-cinzel text-base font-bold">Reset Database to Default State</h3>
        </div>
        <p className="text-xs text-red-800 leading-relaxed">
          If you ever need to restore all original products, Diwali faral items, photo gallery, testimonials, and brand configuration to the pristine default state, click the button below.
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
