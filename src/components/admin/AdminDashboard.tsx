import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Layers,
  Sparkles,
  Camera,
  MessageSquareQuote,
  Palette,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Plus,
  ArrowRight,
  Search,
  Globe,
  Inbox,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminTab } from './AdminLayout';
import { useSiteData } from '../../context/SiteContext';
import { CustomerInquiry, InquiryStats } from '../../types';
import { useInquiryRealtime } from '../../context/InquiryRealtimeContext';
import { adminReplyToCustomer, getWhatsAppUrl } from '../../utils/whatsapp';

interface AdminDashboardProps {
  onNavigateTab: (tab: AdminTab) => void;
  onViewLiveSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, onViewLiveSite }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData } = useSiteData();
  const { inquiries, stats: inquiryStats } = useInquiryRealtime();
  const [statsData, setStatsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const recentInquiries = inquiries.slice(0, 5);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalProducts = siteData?.products?.length || 9;
  const activeProducts = siteData?.products?.filter((p) => p.status === 'active')?.length || totalProducts;
  const totalCategories = siteData?.categories?.length || 4;
  const totalGallery = siteData?.gallery?.length || 8;
  const totalTestimonials = siteData?.testimonials?.length || 3;
  const activeSections = siteData?.sections?.filter((s) => s.enabled)?.length || 9;

  const statCards = [
    {
      title: 'Customer Inquiries',
      value: inquiryStats.total,
      sub: `${inquiryStats.newCount} New (${inquiryStats.todayCount} Today)`,
      icon: Inbox,
      color: inquiryStats.newCount > 0 ? 'bg-red-500' : 'bg-[#0D5B29]',
      tab: 'inquiries' as AdminTab,
    },
    {
      title: 'Total Products',
      value: totalProducts,
      sub: `${activeProducts} Active on Live Site`,
      icon: ShoppingBag,
      color: 'bg-emerald-500',
      tab: 'products' as AdminTab,
    },
    {
      title: 'Categories',
      value: totalCategories,
      sub: 'Diwali Faral, Sweets, Namkeen',
      icon: Layers,
      color: 'bg-amber-500',
      tab: 'categories' as AdminTab,
    },
    {
      title: 'Gallery Photos',
      value: totalGallery,
      sub: 'High-res food photographs',
      icon: Camera,
      color: 'bg-teal-500',
      tab: 'gallery' as AdminTab,
    },
    {
      title: 'Customer Reviews',
      value: totalTestimonials,
      sub: '5-star customer ratings',
      icon: MessageSquareQuote,
      color: 'bg-indigo-500',
      tab: 'testimonials' as AdminTab,
    },
    {
      title: 'Theme & Styling',
      value: 'Dynamic',
      sub: 'Live brand color palettes',
      icon: Palette,
      color: 'bg-purple-500',
      tab: 'theme' as AdminTab,
    },
    {
      title: 'Active Sections',
      value: activeSections,
      sub: `Of ${siteData?.sections?.length || 9} total site modules`,
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

      {/* Customer Inquiries CRM Statistics Hub */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8F2EA] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#EBF5EE] text-[#0D5B29]">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#11311D]">
                  Customer Inquiries CRM Hub
                </h3>
                {inquiryStats.newCount > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                    {inquiryStats.newCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-[#557060]">
                Live customer orders and requests synchronized with Supabase database & WhatsApp desk
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inquiries')}
            className="inline-flex items-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all self-start sm:self-auto"
          >
            <span>Open Inquiries CRM</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F5A800]" />
          </button>
        </div>

        {/* Dynamic CRM Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] hover:border-[#0D5B29] transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#557060] block">
              Total Inquiries
            </span>
            <span className="text-2xl font-bold text-[#11311D] block mt-0.5">{inquiryStats.total}</span>
            <span className="text-[10px] text-[#557060] block">All-time entries</span>
          </div>

          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200 hover:border-red-400 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block">
              New Unhandled
            </span>
            <span className="text-2xl font-bold text-red-600 block mt-0.5">{inquiryStats.newCount}</span>
            <span className="text-[10px] text-red-600/80 block">Requires response</span>
          </div>

          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
              Contacted
            </span>
            <span className="text-2xl font-bold text-blue-600 block mt-0.5">{inquiryStats.contactedCount}</span>
            <span className="text-[10px] text-blue-600/80 block">WhatsApp replied</span>
          </div>

          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Pending
            </span>
            <span className="text-2xl font-bold text-amber-600 block mt-0.5">{inquiryStats.pendingCount}</span>
            <span className="text-[10px] text-amber-600/80 block">Rate quoted</span>
          </div>

          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-400 transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Completed
            </span>
            <span className="text-2xl font-bold text-emerald-700 block mt-0.5">{inquiryStats.completedCount}</span>
            <span className="text-[10px] text-emerald-700/80 block">Order dispatched</span>
          </div>

          <div
            onClick={() => onNavigateTab('inquiries')}
            className="p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] hover:border-[#0D5B29] transition-colors cursor-pointer"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#557060] block">
              Today / Week
            </span>
            <span className="text-2xl font-bold text-[#11311D] block mt-0.5">{inquiryStats.todayCount}</span>
            <span className="text-[10px] text-[#557060] block">{inquiryStats.thisWeekCount} past 7 days</span>
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
              className="bg-white rounded-3xl p-6 border border-[#D5E8DA] shadow-sm transition-all duration-200 cursor-pointer group hover:shadow-xl hover:-translate-y-0.5"
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
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Inquiries CRM', icon: Inbox, tab: 'inquiries' as AdminTab, color: 'text-rose-700 bg-rose-50' },
            { label: 'Add Product', icon: ShoppingBag, tab: 'products' as AdminTab, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'WhatsApp Settings', icon: Phone, tab: 'settings' as AdminTab, color: 'text-orange-700 bg-orange-50' },
            { label: 'Hero Banner', icon: Sparkles, tab: 'hero' as AdminTab, color: 'text-amber-700 bg-amber-50' },
            { label: 'Theme Colors', icon: Palette, tab: 'theme' as AdminTab, color: 'text-purple-700 bg-purple-50' },
            { label: 'Media Library', icon: Camera, tab: 'media' as AdminTab, color: 'text-blue-700 bg-blue-50' },
            { label: 'SEO & Meta', icon: Search, tab: 'seo' as AdminTab, color: 'text-teal-700 bg-teal-50' },
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

      {/* Recent Customer Inquiries Desk */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
                Recent Customer Inquiries
              </h3>
              {inquiryStats.newCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {inquiryStats.newCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-[#557060]">
              Latest customer orders & product inquiries awaiting review or WhatsApp quote
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('inquiries')}
            className="text-xs font-bold text-[#0D5B29] hover:text-[#E8590C] flex items-center gap-1"
          >
            <span>View All CRM ({inquiryStats.total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="py-8 text-center text-[#557060] text-xs">
            No customer inquiries logged yet. When visitors submit inquiries on the website or WhatsApp catalog, they will appear here live.
          </div>
        ) : (
          <div className="divide-y divide-[#E8F2EA]">
            {recentInquiries.map((inq) => (
              <div
                key={inq.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F2] -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#0D5B29]">{inq.inquiryId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        inq.status === 'new'
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : inq.status === 'contacted'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : inq.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {inq.status}
                    </span>
                    <span className="text-[11px] text-[#557060]">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-bold text-[#11311D]">{inq.customerName}</span>
                    <span className="text-[#557060] font-mono">({inq.phone})</span>
                    <span className="text-[#0D5B29] font-medium">&bull; {inq.product || 'Festive Faral'} ({inq.quantity || '1 kg'})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      const msg = adminReplyToCustomer({
                        inquiryId: inq.inquiryId,
                        customerName: inq.customerName,
                        product: inq.product,
                        quantity: inq.quantity,
                      });
                      const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
                      window.open(getWhatsAppUrl(msg, cleanPhone || siteData?.settings?.whatsappNumber || '919403358033'), '_blank');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('inquiries')}
                    className="px-3 py-1.5 bg-[#F0F7F2] hover:bg-[#E3EDE5] text-[#0D5B29] text-xs font-bold rounded-xl border border-[#D5E8DA] transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Grid: Product Highlights & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Product Highlights */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
            <div>
              <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
                Catalog Highlights
              </h3>
              <p className="text-xs text-[#557060]">Current active sweets, faral & namkeen on the live site</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-[#0D5B29] hover:text-[#E8590C] flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E8F2EA]">
            {siteData?.products && siteData.products.length > 0 ? (
              siteData.products.slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#D5E8DA]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#11311D]">{prod.name}</span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#0D5B29]">
                          {prod.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A6354] line-clamp-1">{prod.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('products')}
                    className="shrink-0 text-xs font-bold text-[#0D5B29] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#557060] py-6 text-center">No products configured yet.</p>
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
                <span>{siteData?.settings?.whatsappDisplay || '+91 94033 58033'}</span>
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
                {siteData?.settings?.tagline || 'Traditional Sweets, Faral & Namkeen'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#EBF5EE] border border-[#BCE5C8] space-y-1 text-[#0D5B29]">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Zero-Backend Static Store</span>
              </span>
              <p className="text-[11px]">
                Changes saved in the Admin Panel persist in your browser and instantly update the Public Website.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
