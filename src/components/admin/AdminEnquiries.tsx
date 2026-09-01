import React, { useState, useEffect } from 'react';
import { Inbox, Search, MessageCircle, Phone, Mail, Trash2, CheckCircle2, Eye, X, Clock, Send } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { EnquiryRecord } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';

interface AdminEnquiriesProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onRefreshUnreadCount?: () => void;
}

export const AdminEnquiries: React.FC<AdminEnquiriesProps> = ({ showToast, onRefreshUnreadCount }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData } = useSiteData();
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      const res = await authFetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status });
        }
        showToast('info', `Marked as ${status}`);
        if (onRefreshUnreadCount) onRefreshUnreadCount();
      }
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete enquiry from "${name}"?`)) return;
    try {
      const res = await authFetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(null);
        }
        showToast('success', 'Enquiry deleted');
        if (onRefreshUnreadCount) onRefreshUnreadCount();
      }
    } catch (err) {
      showToast('error', 'Failed to delete');
    }
  };

  const openWhatsAppReply = (enq: EnquiryRecord) => {
    let cleanPhone = enq.phone ? enq.phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const brandName = siteData?.settings?.brandName || 'RevEg Fresh Foods';
    const text = encodeURIComponent(
      `Hello ${enq.name}, thank you for contacting ${brandName} regarding "${enq.inquiryType}". We are happy to assist you with fresh homemade sweets & festive faral packages!`
    );

    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      // If customer didn't enter a phone, open business chat to compose
      const defaultBiz = siteData?.settings?.whatsappNumber || '919403358033';
      window.open(`https://wa.me/${defaultBiz}?text=${text}`, '_blank');
    }

    // Auto mark as replied
    handleUpdateStatus(enq.id, 'replied');
  };

  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.phone && enq.phone.includes(searchQuery)) ||
      (enq.email && enq.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (enq.message && enq.message.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Customer Inquiries & Order Requests
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Inbox for all inquiries submitted through the website's contact & order forms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnquiries}
            className="px-3.5 py-2 bg-[#FAF8F2] hover:bg-[#EBF5EE] text-[#0D5B29] rounded-xl text-xs font-bold border border-[#D5E8DA]"
          >
            Refresh Inbox
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5E8DA] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#557060] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-xs text-[#11311D] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {(['all', 'new', 'read', 'replied'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#0D5B29] text-white shadow-sm'
                  : 'bg-[#FAF8F2] text-[#557060] hover:text-[#11311D]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-3xl border border-[#D5E8DA] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#557060]">Loading enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#557060]">No inquiries found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] border-b border-[#E8F2EA] text-[#0D5B29] uppercase font-bold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Customer</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Inquiry / Pack</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F2EA]">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                    
                    {/* Customer */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="font-bold text-[#11311D] block">{enq.name}</span>
                      <p className="text-[11px] text-[#557060] line-clamp-1 max-w-xs">{enq.message}</p>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {enq.phone && (
                          <span className="text-[#0D5B29] font-medium flex items-center gap-1 text-[11px]">
                            <Phone className="w-3 h-3" /> {enq.phone}
                          </span>
                        )}
                        {enq.email && (
                          <span className="text-[#557060] flex items-center gap-1 text-[11px]">
                            <Mail className="w-3 h-3" /> {enq.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Inquiry Type */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#11311D] block">{enq.inquiryType}</span>
                      {enq.packSize && (
                        <span className="text-[10px] bg-[#EBF5EE] text-[#0D5B29] font-bold px-2 py-0.5 rounded">
                          Pack: {enq.packSize}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[#557060] text-[11px]">
                      {new Date(enq.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                          enq.status === 'new'
                            ? 'bg-red-100 text-red-700'
                            : enq.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openWhatsAppReply(enq)}
                          title="Reply on WhatsApp"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/20 text-[#128C7E] hover:bg-[#25D366] hover:text-white font-bold text-[11px] transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => setSelectedEnquiry(enq)}
                          title="View Details"
                          className="p-1.5 text-[#0D5B29] hover:bg-[#EBF5EE] rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(enq.id, enq.name)}
                          title="Delete"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedEnquiry(null)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10">
            <div className="p-6 bg-[#0D5B29] text-white flex items-center justify-between">
              <div>
                <h3 className="font-cinzel text-lg font-bold">Enquiry from {selectedEnquiry.name}</h3>
                <span className="text-xs text-[#F5A800]">
                  Received on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedEnquiry(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF8F2] rounded-xl border border-[#D5E8DA]">
                <div>
                  <span className="text-[10px] font-bold text-[#557060] uppercase block">Phone</span>
                  <span className="font-bold text-[#11311D]">{selectedEnquiry.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#557060] uppercase block">Email</span>
                  <span className="font-bold text-[#11311D]">{selectedEnquiry.email || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#557060] uppercase block">Inquiry Type</span>
                  <span className="font-bold text-[#0D5B29]">{selectedEnquiry.inquiryType}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#557060] uppercase block">Pack Quantity</span>
                  <span className="font-bold text-[#11311D]">{selectedEnquiry.packSize || 'Standard'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#557060] uppercase block mb-1">Message</span>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-[#11311D] leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message || 'No additional message.'}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E8F2EA]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#557060]">Status:</span>
                  {(['new', 'read', 'replied'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize ${
                        selectedEnquiry.status === st
                          ? 'bg-[#0D5B29] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => openWhatsAppReply(selectedEnquiry)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366] text-white font-bold text-xs shadow hover:bg-[#1EBE5D]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
