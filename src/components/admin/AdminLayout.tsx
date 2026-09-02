import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Home,
  Sparkles,
  Info,
  Camera,
  MessageSquareQuote,
  Inbox,
  PhoneCall,
  Palette,
  Compass,
  PanelBottom,
  Image as ImageIcon,
  Search,
  KeyRound,
  LogOut,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSiteData } from '../../context/SiteContext';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'homepage'
  | 'hero'
  | 'about'
  | 'gallery'
  | 'testimonials'
  | 'settings'
  | 'theme'
  | 'navigation'
  | 'footer'
  | 'media'
  | 'seo'
  | 'profile';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onViewLiveSite: () => void;
  children: React.ReactNode;
  toastMessage?: { type: 'success' | 'error' | 'info'; text: string } | null;
  onClearToast?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onViewLiveSite,
  children,
  toastMessage,
  onClearToast,
}) => {
  const { user, logout } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const navItems: Array<{ id: AdminTab; label: string; icon: any; badge?: number; group?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'General' },

    { id: 'products', label: 'Products', icon: ShoppingBag, group: 'Catalog' },
    { id: 'categories', label: 'Categories', icon: Layers, group: 'Catalog' },

    { id: 'homepage', label: 'Sections & Order', icon: Home, group: 'Content' },
    { id: 'hero', label: 'Hero Banner', icon: Sparkles, group: 'Content' },
    { id: 'about', label: 'About Page', icon: Info, group: 'Content' },
    { id: 'gallery', label: 'Photo Gallery', icon: Camera, group: 'Content' },
    { id: 'testimonials', label: 'Customer Reviews', icon: MessageSquareQuote, group: 'Content' },

    { id: 'settings', label: 'WhatsApp & Contact', icon: PhoneCall, group: 'Configuration' },
    { id: 'theme', label: 'Theme & Colors', icon: Palette, group: 'Configuration' },
    { id: 'navigation', label: 'Header Navigation', icon: Compass, group: 'Configuration' },
    { id: 'footer', label: 'Footer Settings', icon: PanelBottom, group: 'Configuration' },
    { id: 'media', label: 'Media Library', icon: ImageIcon, group: 'Configuration' },
    { id: 'seo', label: 'SEO & Meta Tags', icon: Search, group: 'Configuration' },
    { id: 'profile', label: 'Admin Security', icon: KeyRound, group: 'Configuration' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] flex flex-col md:flex-row font-['Plus_Jakarta_Sans',sans-serif] text-[#11311D]">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#083E1B] text-[#E3EDE6] flex-col shrink-0 border-r border-[#0D5B29] sticky top-0 h-screen overflow-y-auto">
        
        {/* Brand Banner */}
        <div className="p-5 border-b border-[#0D5B29] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-white shrink-0">
              <img src="/reveg-logo.svg" alt="RevEg Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="font-cinzel text-base font-extrabold text-white block leading-tight">
                Rev<span className="text-[#E8590C]">eg</span> Admin
              </span>
              <span className="text-[10px] text-[#F5A800] font-semibold tracking-wider uppercase">
                Content Management
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links grouped */}
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {['General', 'Catalog', 'Content', 'Configuration'].map((group) => {
            const itemsInGroup = navItems.filter((item) => item.group === group);
            return (
              <div key={group} className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#89B397] px-3 tracking-wider">
                  {group}
                </span>
                {itemsInGroup.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`admin-nav-${item.id}`}
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#E8590C] text-white shadow-md'
                          : 'text-[#C8DED0] hover:bg-[#0D5B29] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#F5A800]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-[#0D5B29] bg-[#063015] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white">
              <p className="font-bold">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-[#A8C7B2]">{user?.email || 'admin@reveg.com'}</p>
            </div>
            <button
              onClick={() => logout()}
              id="admin-logout-btn"
              title="Logout"
              className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#083E1B] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/reveg-logo.svg" alt="RevEg Logo" className="w-8 h-8 object-contain bg-white rounded-lg p-0.5" />
          <span className="font-cinzel text-base font-bold text-white">
            Rev<span className="text-[#E8590C]">eg</span> Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#0D5B29] text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-[#083E1B] text-white p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#0D5B29]">
                <span className="font-cinzel text-lg font-bold text-white">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? 'bg-[#E8590C] text-white' : 'text-[#C8DED0] hover:bg-[#0D5B29]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#F5A800]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#0D5B29] flex items-center justify-between">
              <span className="text-xs text-[#A8C7B2]">{user?.name}</span>
              <button
                onClick={() => logout()}
                className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#D5E8DA] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-[#11311D] capitalize">
              {navItems.find((n) => n.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-[11px] text-[#557060] hidden sm:block">
              Manage and dynamically publish changes to RevEg Fresh Foods website in real-time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              title="Refresh public site cache"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold border border-[#D5E8DA] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync Site</span>
            </button>

            <button
              onClick={onViewLiveSite}
              id="admin-view-live-site-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D5B29] hover:bg-[#083E1B] text-white text-xs font-bold shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F5A800]" />
              <span>Live Website</span>
            </button>
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            className={`mx-6 mt-4 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-md animate-in slide-in-from-top-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            {onClearToast && (
              <button onClick={onClearToast} className="text-gray-500 hover:text-black p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Module Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
};
