import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Search,
  Filter,
  RefreshCw,
  Download,
  Printer,
  FileSpreadsheet,
  MessageCircle,
  Phone,
  Eye,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Check,
  User,
  Package
} from 'lucide-react';
import { CustomerInquiry, InquiryStatus, InquiryStats } from '../../types';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useSiteData } from '../../context/SiteContext';
import { useInquiryRealtime } from '../../context/InquiryRealtimeContext';
import { adminReplyToCustomer, getWhatsAppUrl } from '../../utils/whatsapp';
import {
  exportInquiriesToCsv,
  generateInquiriesReportPdf,
  generateInquirySlipPdf,
  printSingleInquirySlip,
  formatStatusLabel,
} from '../../utils/reportGenerator';
import { InquiryDetailModal } from './InquiryDetailModal';

interface AdminInquiriesProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({ showToast }) => {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  const {
    inquiries,
    stats,
    isLoading,
    realtimeStatus,
    lastSyncedAt,
    refreshInquiries,
    updateInquiryStatus,
    deleteInquiry,
  } = useInquiryRealtime();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [activeInquiry, setActiveInquiry] = useState<CustomerInquiry | null>(null);

  const whatsappNum = settings?.whatsappNumber || '919403358033';

  // Keep activeInquiry in sync if its status is updated in real-time
  useEffect(() => {
    if (activeInquiry) {
      const match = inquiries.find(
        (i) => i.id === activeInquiry.id || i.inquiryId === activeInquiry.inquiryId
      );
      if (match && (match.status !== activeInquiry.status || match.updatedAt !== activeInquiry.updatedAt)) {
        setActiveInquiry(match);
      }
    }
  }, [inquiries, activeInquiry]);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    let list = [...inquiries];

    // Status Filter
    if (selectedStatus !== 'all') {
      list = list.filter((i) => i.status === selectedStatus);
    }

    // Date Range Filter
    const now = new Date();
    if (dateRange === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      list = list.filter((i) => new Date(i.createdAt).getTime() >= todayStart);
    } else if (dateRange === 'week') {
      const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((i) => new Date(i.createdAt).getTime() >= weekAgo);
    } else if (dateRange === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      list = list.filter((i) => new Date(i.createdAt).getTime() >= monthStart);
    }

    // Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.customerName.toLowerCase().includes(q) ||
          i.phone.toLowerCase().includes(q) ||
          (i.email && i.email.toLowerCase().includes(q)) ||
          i.inquiryId.toLowerCase().includes(q) ||
          (i.product && i.product.toLowerCase().includes(q)) ||
          i.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [inquiries, selectedStatus, dateRange, searchQuery]);

  // Status Change Handler with optimistic real-time broadcast
  const handleUpdateStatus = async (id: string, newStatus: InquiryStatus) => {
    const success = await updateInquiryStatus(id, newStatus);
    if (success) {
      showToast('success', `Inquiry status updated to ${formatStatusLabel(newStatus)}`);
    } else {
      showToast('error', 'Failed to update inquiry status');
    }
  };

  // Delete Handler with real-time broadcast
  const handleDeleteInquiry = async (id: string) => {
    const success = await deleteInquiry(id);
    if (success) {
      showToast('info', 'Inquiry deleted');
      if (activeInquiry && (activeInquiry.id === id || activeInquiry.inquiryId === id)) {
        setActiveInquiry(null);
      }
    } else {
      showToast('error', 'Failed to delete inquiry');
    }
  };

  // One-click WhatsApp Direct Chat from Table
  const handleDirectWhatsApp = (inq: CustomerInquiry, e: React.MouseEvent) => {
    e.stopPropagation();
    const formattedMsg = adminReplyToCustomer({
      inquiryId: inq.inquiryId,
      customerName: inq.customerName,
      product: inq.product,
      quantity: inq.quantity,
    });
    const cleanCustomerPhone = (inq.phone || '').replace(/[^0-9]/g, '');
    const targetPhone = cleanCustomerPhone.length >= 10 ? cleanCustomerPhone : whatsappNum;
    window.open(getWhatsAppUrl(formattedMsg, targetPhone), '_blank');
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'new':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'contacted':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EBF5EE] text-[#0D5B29]">
              <Inbox className="w-5 h-5" />
            </span>
            <h1 className="font-cinzel text-2xl font-bold text-[#11311D]">
              Customer Inquiries CRM
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#557060] mt-1">
            Real-time customer order inquiries stored in Supabase cloud database & connected with WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshInquiries}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#F0F7F2] hover:bg-[#E3EDE5] text-[#0D5B29] text-xs font-bold border border-[#D5E8DA] transition-colors disabled:opacity-50"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => exportInquiriesToCsv(filteredInquiries)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F2] text-[#11311D] text-xs font-bold border border-[#D5E8DA] shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => generateInquiriesReportPdf(filteredInquiries, `Status: ${selectedStatus.toUpperCase()}`, settings)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0D5B29] hover:bg-[#083E1B] text-white text-xs font-bold shadow-md transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#F5A800]" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* CRM Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'all'
              ? 'bg-[#083E1B] text-white border-[#083E1B] shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-[#0D5B29] text-[#11311D]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'all' ? 'text-[#A3D9B1]' : 'text-[#557060]'}`}>
            Total Inquiries
          </span>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'all' ? 'text-white/80' : 'text-[#557060]'}`}>
            Today: {stats.todayCount}
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('new')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'new'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-red-400 text-[#11311D]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedStatus === 'new' ? 'text-red-100' : 'text-red-600'}`}>
              New Unhandled
            </span>
            {stats.newCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </div>
          <div className="text-2xl font-bold mt-1 text-red-600 group-hover:text-red-700">
            <span className={selectedStatus === 'new' ? 'text-white' : 'text-red-600'}>
              {stats.newCount}
            </span>
          </div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'new' ? 'text-white/80' : 'text-[#557060]'}`}>
            Requires reply
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('contacted')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'contacted'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-blue-400 text-[#11311D]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'contacted' ? 'text-blue-100' : 'text-blue-600'}`}>
            Contacted
          </span>
          <div className="text-2xl font-bold mt-1">
            <span className={selectedStatus === 'contacted' ? 'text-white' : 'text-blue-600'}>
              {stats.contactedCount}
            </span>
          </div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'contacted' ? 'text-white/80' : 'text-[#557060]'}`}>
            WhatsApp replied
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'pending'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-amber-400 text-[#11311D]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'pending' ? 'text-amber-100' : 'text-amber-600'}`}>
            Pending Decision
          </span>
          <div className="text-2xl font-bold mt-1">
            <span className={selectedStatus === 'pending' ? 'text-white' : 'text-amber-600'}>
              {stats.pendingCount}
            </span>
          </div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'pending' ? 'text-white/80' : 'text-[#557060]'}`}>
            Batch quotation
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('completed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-emerald-400 text-[#11311D]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'completed' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Completed Orders
          </span>
          <div className="text-2xl font-bold mt-1">
            <span className={selectedStatus === 'completed' ? 'text-white' : 'text-emerald-700'}>
              {stats.completedCount}
            </span>
          </div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'completed' ? 'text-white/80' : 'text-[#557060]'}`}>
            Order fulfilled
          </span>
        </div>

        <div
          onClick={() => setSelectedStatus('cancelled')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === 'cancelled'
              ? 'bg-gray-700 text-white border-gray-700 shadow-md'
              : 'bg-white border-[#D5E8DA] hover:border-gray-400 text-[#11311D]'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${selectedStatus === 'cancelled' ? 'text-gray-200' : 'text-gray-500'}`}>
            Cancelled
          </span>
          <div className="text-2xl font-bold mt-1">
            <span className={selectedStatus === 'cancelled' ? 'text-white' : 'text-gray-600'}>
              {stats.cancelledCount}
            </span>
          </div>
          <span className={`text-[11px] block mt-0.5 ${selectedStatus === 'cancelled' ? 'text-white/80' : 'text-[#557060]'}`}>
            Closed inquiries
          </span>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#D5E8DA] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#557060] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, email, inquiry ID, or product..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29]"
            />
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F2] border border-[#D5E8DA] p-1 rounded-xl shrink-0">
            {(['all', 'today', 'week', 'month'] as const).map((rng) => (
              <button
                key={rng}
                type="button"
                onClick={() => setDateRange(rng)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  dateRange === rng
                    ? 'bg-[#0D5B29] text-white shadow-sm'
                    : 'text-[#557060] hover:text-[#11311D]'
                }`}
              >
                {rng === 'all' ? 'All Time' : rng === 'week' ? 'Past 7 Days' : rng === 'month' ? 'This Month' : 'Today'}
              </button>
            ))}
          </div>

        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E8F2EA]">
          <span className="text-xs font-bold text-[#557060] mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>

          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                selectedStatus === tab.id
                  ? 'bg-[#0D5B29] text-white border-[#0D5B29]'
                  : 'bg-white text-[#23382B] border-[#D5E8DA] hover:bg-[#F0F7F2]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {(selectedStatus !== 'all' || dateRange !== 'all' || searchQuery.trim()) && (
            <button
              type="button"
              onClick={() => {
                setSelectedStatus('all');
                setDateRange('all');
                setSearchQuery('');
              }}
              className="text-xs text-[#E8590C] hover:underline font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Inquiries List */}
      <div className="bg-white rounded-3xl border border-[#D5E8DA] shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-12 text-center text-[#557060] space-y-3">
            <div className="w-8 h-8 border-3 border-[#0D5B29] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-semibold">Synchronizing inquiries from database...</p>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F2] border border-[#D5E8DA] flex items-center justify-center mx-auto text-[#557060]">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel text-lg font-bold text-[#11311D]">No Inquiries Found</h3>
            <p className="text-xs text-[#557060] max-w-sm mx-auto">
              No inquiries match your selected filter criteria. When customers submit requests from the website, they will immediately appear here.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs text-[#11311D]">
                <thead className="bg-[#FAF8F2] border-b border-[#D5E8DA] text-[11px] uppercase tracking-wider text-[#557060]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Inquiry ID</th>
                    <th className="py-3.5 px-4 font-bold">Received</th>
                    <th className="py-3.5 px-4 font-bold">Customer Name</th>
                    <th className="py-3.5 px-4 font-bold">Mobile Phone</th>
                    <th className="py-3.5 px-4 font-bold">Food / Item</th>
                    <th className="py-3.5 px-4 font-bold">Pack Size</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F2EA]">
                  {filteredInquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      onClick={() => setActiveInquiry(inq)}
                      className="hover:bg-[#F9FCFA] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-[#0D5B29] group-hover:underline">
                          {inq.inquiryId}
                        </span>
                        <span className="block text-[10px] text-[#557060]">{inq.source || 'Website'}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[#557060]">
                        <div>{new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px]">{new Date(inq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#11311D]">
                        {inq.customerName}
                        {inq.email && (
                          <span className="block text-[10px] font-normal text-[#557060] truncate max-w-[150px]">
                            {inq.email}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        {inq.phone}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#11311D] truncate max-w-[160px]">{inq.product || 'Festive Faral'}</div>
                        <div className="text-[10px] text-[#557060] italic truncate max-w-[160px]">
                          "{inq.message || 'No custom note'}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-[#0D5B29]">
                        {inq.quantity || '1 kg'}
                      </td>

                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq.id, e.target.value as InquiryStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D5B29] ${getStatusBadge(
                            inq.status
                          )}`}
                        >
                          <option value="new">NEW</option>
                          <option value="contacted">CONTACTED</option>
                          <option value="pending">PENDING</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleDirectWhatsApp(inq, e)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Direct WhatsApp Chat"
                          >
                            <MessageCircle className="w-4 h-4 fill-emerald-600" />
                          </button>

                          <button
                            type="button"
                            onClick={() => printSingleInquirySlip(inq, settings)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Print Slip"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveInquiry(inq)}
                            className="p-1.5 rounded-lg bg-[#EBF5EE] text-[#0D5B29] hover:bg-[#D5E8DA] transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-[#E8F2EA]">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setActiveInquiry(inq)}
                  className="p-4 sm:p-5 space-y-3 hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#0D5B29]">
                        {inq.inquiryId}
                      </span>
                      <span className="block text-[11px] text-[#557060]">
                        {new Date(inq.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(inq.status)}`}>
                      {formatStatusLabel(inq.status)}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-[#11311D] text-sm">{inq.customerName}</div>
                    <div className="text-xs text-[#557060] font-mono">{inq.phone}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-xs">
                    <div className="font-semibold text-[#0D5B29]">{inq.product || 'Festive Faral'} ({inq.quantity || '1 kg'})</div>
                    <div className="text-[#557060] text-[11px] italic mt-0.5 line-clamp-2">
                      "{inq.message || 'No custom requirement entered'}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={inq.status}
                      onChange={(e) => handleUpdateStatus(inq.id, e.target.value as InquiryStatus)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusBadge(inq.status)}`}
                    >
                      <option value="new">NEW</option>
                      <option value="contacted">CONTACTED</option>
                      <option value="pending">PENDING</option>
                      <option value="completed">COMPLETED</option>
                      <option value="cancelled">CANCELLED</option>
                    </select>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDirectWhatsApp(inq, e)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8590C] text-white text-xs font-bold"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveInquiry(inq)}
                        className="p-1.5 rounded-lg bg-[#EBF5EE] text-[#0D5B29]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* List Footer Count */}
            <div className="p-4 bg-[#FAF8F2] border-t border-[#D5E8DA] flex items-center justify-between text-xs text-[#557060]">
              <span>Showing {filteredInquiries.length} of {inquiries.length} total customer inquiries</span>
              <span className="font-semibold text-[#0D5B29]">Supabase Database & Realtime Sync Active</span>
            </div>
          </div>
        )}

      </div>

      {/* Inquiry Detail Modal */}
      {activeInquiry && (
        <InquiryDetailModal
          inquiry={activeInquiry}
          settings={settings}
          onClose={() => setActiveInquiry(null)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteInquiry={handleDeleteInquiry}
          showToast={showToast}
        />
      )}

    </div>
  );
};
