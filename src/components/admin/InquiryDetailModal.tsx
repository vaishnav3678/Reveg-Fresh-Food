import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  Printer,
  Download,
  Calendar,
  Clock,
  User,
  Package,
  Scale,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { CustomerInquiry, InquiryStatus } from '../../types';
import { SiteSettings } from '../../server/db';
import { adminReplyToCustomer, getWhatsAppUrl } from '../../utils/whatsapp';
import { generateInquirySlipPdf, printSingleInquirySlip, formatStatusLabel } from '../../utils/reportGenerator';

interface InquiryDetailModalProps {
  inquiry: CustomerInquiry;
  settings?: SiteSettings;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InquiryStatus) => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const InquiryDetailModal: React.FC<InquiryDetailModalProps> = ({
  inquiry,
  settings,
  onClose,
  onUpdateStatus,
  onDeleteInquiry,
  showToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const whatsappNum = settings?.whatsappNumber || '919403358033';

  const handleCopyId = () => {
    navigator.clipboard.writeText(inquiry.inquiryId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', `Copied ${inquiry.inquiryId} to clipboard`);
  };

  const handleStatusChange = async (newStatus: InquiryStatus) => {
    if (newStatus === inquiry.status) return;
    try {
      setIsUpdatingStatus(true);
      await onUpdateStatus(inquiry.id, newStatus);
      showToast('success', `Inquiry status changed to ${formatStatusLabel(newStatus)}`);
    } catch (err) {
      showToast('error', 'Failed to update inquiry status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteInquiry(inquiry.id);
      showToast('info', `Inquiry ${inquiry.inquiryId} removed`);
      onClose();
    } catch (err) {
      showToast('error', 'Failed to delete inquiry');
      setIsDeleting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const formattedMsg = adminReplyToCustomer({
      inquiryId: inquiry.inquiryId,
      customerName: inquiry.customerName,
      product: inquiry.product,
      quantity: inquiry.quantity,
    });
    // Format customer phone clean
    const cleanCustomerPhone = (inquiry.phone || '').replace(/[^0-9]/g, '');
    const targetPhone = cleanCustomerPhone.length >= 10 ? cleanCustomerPhone : whatsappNum;
    window.open(getWhatsAppUrl(formattedMsg, targetPhone), '_blank');
  };

  const getStatusBadgeClass = (status: InquiryStatus) => {
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

  const statuses: InquiryStatus[] = ['new', 'contacted', 'pending', 'completed', 'cancelled'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10 my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#083E1B] text-white flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg sm:text-xl font-bold text-[#F5A800] tracking-wide">
                {inquiry.inquiryId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Copy Inquiry ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A3D9B1] mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(inquiry.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Status Bar */}
          <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#D5E8DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#557060] tracking-wider block">
                Inquiry Processing Status
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadgeClass(inquiry.status)}`}>
                  {formatStatusLabel(inquiry.status)}
                </span>
                <span className="text-xs text-[#557060]">
                  Last touched: {new Date(inquiry.updatedAt || inquiry.createdAt).toLocaleTimeString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {statuses.map((st) => (
                <button
                  key={st}
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    inquiry.status === st
                      ? 'bg-[#0D5B29] text-white border-[#0D5B29] shadow-sm ring-2 ring-[#0D5B29]/30'
                      : 'bg-white text-[#23382B] border-[#D5E8DA] hover:bg-[#F0F7F2]'
                  } disabled:opacity-50`}
                >
                  {formatStatusLabel(st)}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Information Card */}
          <div className="border border-[#D5E8DA] rounded-2xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
              <span className="text-xs uppercase font-bold text-[#0D5B29] tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#E8590C]" /> Customer Details
              </span>
              <span className="text-xs text-[#557060] bg-[#F0F7F2] px-2.5 py-0.5 rounded-full border border-[#D5E8DA]">
                Source: {inquiry.source || 'Website'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] text-[#557060] font-medium block">Full Name:</span>
                <span className="font-bold text-[#11311D] text-base">{inquiry.customerName}</span>
              </div>

              <div>
                <span className="text-[11px] text-[#557060] font-medium block">Mobile Phone:</span>
                <span className="font-mono font-bold text-[#11311D] text-base">{inquiry.phone}</span>
              </div>

              {inquiry.email && (
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-[#557060] font-medium block">Email Address:</span>
                  <a href={`mailto:${inquiry.email}`} className="font-medium text-[#0D5B29] hover:underline">
                    {inquiry.email}
                  </a>
                </div>
              )}
            </div>

            {/* Instant Contact Action Strip */}
            <div className="pt-3 border-t border-[#E8F2EA] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors border border-[#F5A800]/40"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp Customer</span>
              </button>

              <a
                href={`tel:${inquiry.phone}`}
                className="inline-flex items-center gap-1.5 bg-[#F0F7F2] hover:bg-[#E3EDE5] text-[#0D5B29] px-3.5 py-2.5 rounded-xl font-bold text-xs border border-[#D5E8DA] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call ({inquiry.phone})</span>
              </a>

              {inquiry.email && (
                <a
                  href={`mailto:${inquiry.email}?subject=Regarding Your RevEg Food Inquiry ${inquiry.inquiryId}`}
                  className="inline-flex items-center gap-1.5 bg-[#F0F7F2] hover:bg-[#E3EDE5] text-[#23382B] px-3.5 py-2.5 rounded-xl font-bold text-xs border border-[#D5E8DA] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Requirements Card */}
          <div className="border border-[#D5E8DA] rounded-2xl p-5 bg-white shadow-sm space-y-4">
            <span className="text-xs uppercase font-bold text-[#0D5B29] tracking-wider flex items-center gap-1.5 border-b border-[#E8F2EA] pb-3">
              <Package className="w-4 h-4 text-[#E8590C]" /> Order & Requirements
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] text-[#557060] font-medium block">Food Item / Purpose:</span>
                <span className="font-bold text-[#11311D]">{inquiry.product || 'Festive Faral'}</span>
              </div>

              <div>
                <span className="text-[11px] text-[#557060] font-medium block">Pack Weight / Quantity:</span>
                <span className="font-bold text-[#11311D]">{inquiry.quantity || '1 kg'}</span>
              </div>
            </div>

            <div className="bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl p-3.5">
              <span className="text-[11px] text-[#557060] font-bold uppercase tracking-wider block mb-1">
                Customer Message:
              </span>
              <p className="text-sm text-[#11311D] leading-relaxed whitespace-pre-wrap">
                {inquiry.message || 'No specific requirements message entered.'}
              </p>
            </div>
          </div>

          {/* Delete Confirmation Alert if triggered */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-sm">Are you sure you want to delete this inquiry?</span>
              </div>
              <p className="text-xs text-red-700">
                This will permanently remove reference {inquiry.inquiryId} from the database.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#FAF8F2] border-t border-[#D5E8DA] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printSingleInquirySlip(inquiry, settings)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5E8DA] hover:bg-[#F0F7F2] text-xs font-bold text-[#11311D] shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#0D5B29]" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={() => generateInquirySlipPdf(inquiry, settings)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#D5E8DA] hover:bg-[#F0F7F2] text-xs font-bold text-[#11311D] shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#E8590C]" />
              <span>Download PDF Slip</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Inquiry"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0D5B29] hover:bg-[#083E1B] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
