import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface AdminLoginProps {
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToSite }) => {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#083E1B] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0D5B29] rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E8590C] rounded-full blur-3xl opacity-25 pointer-events-none" />

      {/* Back to website button */}
      <button
        onClick={onBackToSite}
        id="back-to-public-site-btn"
        className="absolute top-6 left-6 text-white/80 hover:text-white inline-flex items-center gap-2 text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-full transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Website</span>
      </button>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-[#BCE5C8] z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] shadow-sm mb-4">
            <img
              src="/reveg-logo.svg"
              alt="RevEg Fresh Foods Logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#11311D]">
            Rev<span className="text-[#E8590C]">eg</span> Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#4A6354] mt-1.5 font-medium">
            Complete Content Management & Control Suite
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Admin Username or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#557060]">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-login-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-sm font-medium text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#557060]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-sm font-medium text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#557060] hover:text-[#11311D]"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 border border-[#F5A800]/40"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Log In to Admin Panel</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-8 pt-4 border-t border-[#E8F2EA] text-center text-xs text-[#557060]">
          Protected Session Authentication • RevEg Fresh Foods CMS
        </div>

      </div>
    </div>
  );
};
