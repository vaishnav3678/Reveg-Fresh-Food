import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Layers,
  Inbox,
  Sparkles,
  Camera,
  MessageSquareQuote,
  TrendingUp,
  Clock,
  ArrowRight,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onViewLiveSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onViewLiveSite }) => {
  const { authFetch } = useAdminAuth();
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = statsData?.metrics || {
    totalProducts: 9,
    activeProducts: 9,
    totalCategories: 4,
    totalGallery: 8,
    totalTestimonials: 3,
    totalEnquiries: 2,
    unreadEnquiries: 1,
    totalMedia: 4,
    activeSections: 9,
  };

  const statCards = [
    {
      title: 'Total Products',
      value: metrics.totalProducts,
      sub: `${metrics.activeProducts} Active on Live Site`,
      icon: ShoppingBag,
      color: 'bg-emerald-500',
      tab: 'products' as AdminTab,
    },
    {
      title: 'Categories',
      value: metrics.totalCategories,
      sub: 'Diwali Faral, Sweets, Namkeen',
      icon: Layers,
      color: 'bg-amber-500',
      tab: 'categories' as AdminTab,
    },
    {
      title: 'Customer Enquiries',
      value: metrics.totalEnquiries,
      sub: `${metrics.unreadEnquiries} Unread inquiries`,
      icon: Inbox,
      color: 'bg-orange-500',
      tab: 'enquiries' as AdminTab,
      highlight: metrics.unreadEnquiries > 0,
    },
    {
      title: 'Gallery Photos',
      value: metrics.totalGallery,
      sub: 'High-res food photographs',
      icon: Camera,
      color: 'bg-teal-500',
      tab: 'gallery' as AdminTab,
    },
    {
      title: 'Customer Reviews',
      value: metrics.totalTestimonials,
      sub: '5-star customer ratings',
      icon: MessageSquareQuote,
      color: 'bg-indigo-500',
      tab: 'testimonials' as AdminTab,
    },
    {
      title: 'Active Sections',
      value: metrics.activeSections,
      sub: 'Of 9 total site modules',
      icon: Sparkles,
      color: 'bg-[#0D5B29]',
      tab: 'homepage' as AdminTab,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#083E1B] via-[#0D5B29] to-[#122117] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-[#D5E8DA]/20">
        
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#F5A800]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#F5A800] text-xs font-bold border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RevEg Dynamic CMS Active</span>
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-white">
              Welcome to RevEg Content Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#C8DED0] leading-relaxed">
              Manage your complete sweets, faral, and namkeen catalogue, customize WhatsApp order parameters, update hero banners, and publish live changes instantly without code editing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('products')}
              id="dash-add-product-quick-btn"
              className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            <button
              onClick={onViewLiveSite}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#F5A800]" />
              <span>View Public Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(card.tab)}
              className={`bg-white rounded-3xl p-6 border transition-all duration-200 cursor-pointer group hover:shadow-xl hover:-translate-y-0.5 ${
                card.highlight
                  ? 'border-orange-300 ring-2 ring-orange-400/20'
                  : 'border-[#D5E8DA] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#557060]">
                  {card.title}
                </span>
                <div className={`w-10 h-10 rounded-2xl ${card.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#11311D]">
                  {isLoading ? '...' : card.value}
                </span>
                <span className="text-xs font-bold text-[#0D5B29] group-hover:text-[#E8590C] inline-flex items-center gap-1 transition-colors">
                  Manage <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <p className="text-xs text-[#557060] mt-1 font-medium">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-4">
        <h3 className="font-cinzel text-lg font-bold text-[#11311D] border-b border-[#E8F2EA] pb-3">
          Quick Management Actions
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Product', icon: ShoppingBag, tab: 'products' as AdminTab, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'WhatsApp Settings', icon: Phone, tab: 'settings' as AdminTab, color: 'text-orange-700 bg-orange-50' },
            { label: 'Hero Banner', icon: Sparkles, tab: 'hero' as AdminTab, color: 'text-amber-700 bg-amber-50' },
            { label: 'Theme Colors', icon: Sparkles, tab: 'theme' as AdminTab, color: 'text-purple-700 bg-purple-50' },
            { label: 'Media Library', icon: Camera, tab: 'media' as AdminTab, color: 'text-blue-700 bg-blue-50' },
            { label: 'Inbox Enquiries', icon: Inbox, tab: 'enquiries' as AdminTab, color: 'text-red-700 bg-red-50' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigateTab(action.tab)}
                className="flex flex-col items-center text-center p-4 rounded-2xl border border-[#D5E8DA] hover:border-[#0D5B29] hover:bg-[#FAF8F2] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#11311D] group-hover:text-[#0D5B29]">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Recent Inquiries & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Enquiries */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
                Recent Customer Enquiries
              </h3>
              <p className="text-xs text-[#557060]">Direct inquiries sent from the public website</p>
            </div>
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-bold text-[#0D5B29] hover:text-[#E8590C] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E8F2EA]">
            {statsData?.recentEnquiries && statsData.recentEnquiries.length > 0 ? (
              statsData.recentEnquiries.map((enq: any) => (
                <div key={enq.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#11311D]">{enq.name}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        enq.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {enq.status}
                      </span>
                      {enq.packSize && (
                        <span className="text-[10px] font-semibold bg-[#EBF5EE] text-[#0D5B29] px-2 py-0.5 rounded-md">
                          {enq.packSize}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4A6354] line-clamp-1">{enq.message || enq.inquiryType}</p>
                    <span className="text-[10px] text-[#557060]">
                      {new Date(enq.createdAt).toLocaleDateString()} at {new Date(enq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateTab('enquiries')}
                    className="shrink-0 text-xs font-bold text-[#0D5B29] hover:underline"
                  >
                    Open
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#557060] py-6 text-center">No enquiries recorded yet.</p>
            )}
          </div>
        </div>

        {/* Live Site Status & Quick Settings */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-5">
          <h3 className="font-cinzel text-lg font-bold text-[#11311D] border-b border-[#E8F2EA] pb-3">
            Live Configuration
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#557060]">
                Active WhatsApp Direct Line
              </span>
              <div className="font-extrabold text-sm text-[#0D5B29] flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#0D5B29]" />
                <span>{statsData?.siteSettings?.whatsappDisplay || '+91 94033 58033'}</span>
              </div>
              <p className="text-[11px] text-[#557060]">
                All live website WhatsApp buttons route here
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#557060]">
                Live Brand Tagline
              </span>
              <div className="font-bold text-xs text-[#11311D]">
                {statsData?.siteSettings?.tagline || 'Traditional Sweets, Faral & Namkeen'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EBF5EE] border border-[#BCE5C8] space-y-1 text-[#0D5B29]">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Real-Time Database
              </span>
              <p className="text-[11px]">
                Changes saved in any section update instantly for visitors.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
