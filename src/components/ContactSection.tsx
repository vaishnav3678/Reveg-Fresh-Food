import React, { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';
import { CustomerInquiry } from '../types';
import { submitDualChannelInquiry } from '../services/inquirySubmissionService';

export const ContactSection: React.FC = () => {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;

  const whatsappNum = settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';
  const phoneDisplay = settings?.phone || '+91 94033 58033';
  const emailDisplay = settings?.email || 'revegfreshfoods@gmail.com';
  const addressDisplay = settings?.address || 'Maharashtra, India';

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Festive Faral & Sweets Order');
  const [userMessage, setUserMessage] = useState('');
  const [selectedPackWeight, setSelectedPackWeight] = useState('1 kg');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedInquiry, setSubmittedInquiry] = useState<CustomerInquiry | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const inquiryOptions = [
    'Festive Faral & Sweets Order',
    'Custom Celebration Gift Box',
    'Bulk / Corporate Order Enquiry',
    'General Price & Availability Check',
    'Wedding & Event Sweets Catering',
  ];

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Client-side Validation
    const trimmedName = senderName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanPhone = senderPhone.trim().replace(/[^0-9+]/g, '');
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (senderEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const trimmedMsg = userMessage.trim();
    if (!trimmedMsg || trimmedMsg.length < 3) {
      setFormError('Please describe your inquiry or food item requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute the mandatory dual-channel workflow:
      // 1. Validate inquiry
      // 2. Save inquiry to Supabase PostgreSQL (primary source of truth) + Server API & Local DB
      // 3. Send/Open inquiry on WhatsApp
      // 4. Supabase Realtime event fires to Admin Panel
      // 5. Admin Panel automatically receives the inquiry and updates KPI stats
      const result = await submitDualChannelInquiry(
        {
          customerName: trimmedName,
          phone: cleanPhone,
          email: senderEmail.trim(),
          product: inquiryType,
          quantity: selectedPackWeight,
          message: trimmedMsg,
          source: 'Website Contact Form',
        },
        whatsappNum
      );

      setSubmittedInquiry(result.inquiry);

      if (!result.whatsappOpened) {
        console.info('WhatsApp window did not open automatically (popup blocked). Action available via confirmation card.');
      }
    } catch (err: any) {
      console.error('Error in dual-channel inquiry submission:', err);
      setFormError(err.message || 'Unable to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInquiryId = () => {
    if (submittedInquiry) {
      navigator.clipboard.writeText(submittedInquiry.inquiryId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetForm = () => {
    setSubmittedInquiry(null);
    setSenderName('');
    setSenderPhone('');
    setSenderEmail('');
    setUserMessage('');
    setFormError(null);
  };

  return (
    <section id="contact" className="py-20 bg-[#FAF8F2] relative border-t border-[#D5E8DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
            <MessageCircle className="w-3.5 h-3.5 text-[#0D5B29]" />
            <span>Connect with RevEg Fresh Foods</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight">
            Get in Touch
          </h2>
          <p className="text-[#4A6354] text-base sm:text-lg mt-3">
            For product enquiries, orders, bulk orders and festive gift boxes, contact RevEg Fresh Foods.
          </p>
          <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Info & Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-6">
              <h3 className="font-cinzel text-xl font-bold text-[#11311D] border-b border-[#E8F2EA] pb-3">
                Business Contact Details
              </h3>

              {/* WhatsApp Card */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center shrink-0 shadow-sm border border-[#BCE5C8]">
                  <MessageCircle className="w-6 h-6 fill-[#0D5B29]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#557060]">
                    Official WhatsApp
                  </span>
                  <div className="text-sm sm:text-base font-extrabold text-[#0D5B29]">
                    {whatsappDisplay}
                  </div>
                  <p className="text-xs text-[#557060] mt-0.5">Quick response for fresh batch pricing & orders</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#FFF4EB] text-[#E8590C] flex items-center justify-center shrink-0 shadow-sm border border-[#FCDDC2]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#557060]">
                    Direct Phone Line
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#11311D]">
                    {phoneDisplay}
                  </div>
                  <p className="text-xs text-[#557060] mt-0.5">Available for calls during business hours</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF9EC] text-[#B47B00] flex items-center justify-center shrink-0 shadow-sm border border-[#FDE5A3]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#557060]">
                    Email Address
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#11311D]">
                    {emailDisplay}
                  </div>
                  <p className="text-xs text-[#557060] mt-0.5">For corporate quotes and detailed inquiries</p>
                </div>
              </div>

              {/* Address Card */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center shrink-0 shadow-sm border border-[#BCE5C8]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#557060]">
                    Kitchen / Dispatch
                  </span>
                  <div className="text-sm sm:text-base font-bold text-[#11311D]">
                    {addressDisplay}
                  </div>
                  <p className="text-xs text-[#557060] mt-0.5">Freshly prepared & dispatched on schedule</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E8F2EA] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  id="contact-whatsapp-us-btn"
                  href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5 border border-[#F5A800]/40"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Us</span>
                </a>

                <a
                  id="contact-call-us-btn"
                  href={`tel:${whatsappNum}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white py-3 px-4 rounded-xl font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Us</span>
                </a>
              </div>

            </div>

            {/* Note for the client */}
            <div className="p-4 rounded-2xl bg-[#EBF5EE] border border-[#BCE5C8] text-xs text-[#2A4433]">
              <span className="font-bold text-[#0D5B29]">✨ Fresh Batch Ordering:</span> Contact us directly on WhatsApp for daily menu, customizable festive faral baskets, and bulk delivery scheduling.
            </div>

          </div>

          {/* Right Column: Interactive WhatsApp Inquiry Composer Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-xl space-y-6">
              
              {submittedInquiry ? (
                /* Success Confirmation State */
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-[#EBF5EE] text-[#0D5B29] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#A3D9B1] shadow-inner">
                      <CheckCircle className="w-8 h-8 text-[#0D5B29]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8590C]/10 text-[#E8590C]">
                      <Sparkles className="w-3.5 h-3.5" /> Inquiry Successfully Registered
                    </span>
                    <h3 className="font-cinzel text-2xl font-bold text-[#11311D] mt-2">
                      Thank You, {submittedInquiry.customerName}!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#557060] mt-1 max-w-md mx-auto">
                      Your inquiry has been safely stored in our central CRM database and dispatched to our kitchen dispatch desk.
                    </p>
                  </div>

                  {/* Inquiry Reference Card */}
                  <div className="bg-[#FAF8F2] border border-[#D5E8DA] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#557060] tracking-wider">Inquiry Reference ID</span>
                        <div className="font-mono text-base sm:text-lg font-bold text-[#0D5B29] tracking-wider">
                          {submittedInquiry.inquiryId}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyInquiryId}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#D5E8DA] text-xs font-semibold text-[#11311D] hover:bg-[#F0F7F2] transition-colors"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#0D5B29]" />
                            <span className="text-[#0D5B29]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#557060]" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-[#557060] block font-medium">Contact Phone:</span>
                        <span className="font-bold text-[#11311D]">{submittedInquiry.phone}</span>
                      </div>
                      {submittedInquiry.email && (
                        <div>
                          <span className="text-[#557060] block font-medium">Email:</span>
                          <span className="font-bold text-[#11311D] truncate block">{submittedInquiry.email}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[#557060] block font-medium">Product / Purpose:</span>
                        <span className="font-bold text-[#11311D]">{submittedInquiry.product}</span>
                      </div>
                      <div>
                        <span className="text-[#557060] block font-medium">Pack / Quantity:</span>
                        <span className="font-bold text-[#11311D]">{submittedInquiry.quantity}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8F2EA] text-xs">
                      <span className="text-[#557060] block font-medium">Requirements:</span>
                      <p className="text-[#11311D] mt-0.5 italic">"{submittedInquiry.message}"</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <a
                      href={getWhatsAppUrl(
                        WhatsAppMessages.customerInquiryMessage({
                          inquiryId: submittedInquiry.inquiryId,
                          customerName: submittedInquiry.customerName,
                          phone: submittedInquiry.phone,
                          email: submittedInquiry.email,
                          product: submittedInquiry.product,
                          quantity: submittedInquiry.quantity,
                          message: submittedInquiry.message,
                          date: new Date(submittedInquiry.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }),
                        }),
                        whatsappNum
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all border border-[#F5A800]/40"
                    >
                      <MessageCircle className="w-5 h-5 fill-white" />
                      <span>Re-open WhatsApp Chat with {whatsappDisplay}</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="w-full flex items-center justify-center gap-2 bg-[#F0F7F2] hover:bg-[#E3EDE5] text-[#11311D] py-3 px-4 rounded-xl font-bold text-xs border border-[#D5E8DA] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-[#0D5B29]" />
                      <span>Submit Another Inquiry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <>
                  <div className="border-b border-[#E8F2EA] pb-4">
                    <span className="text-xs uppercase font-bold text-[#E8590C] tracking-wider">Fast Direct Inquiry</span>
                    <h3 className="font-cinzel text-2xl font-bold text-[#11311D] mt-1">
                      Send Your Enquiry to Kitchen & WhatsApp
                    </h3>
                    <p className="text-xs text-[#557060] mt-1">
                      Your inquiry is instantly registered in our system and opened directly on official WhatsApp for immediate assistance.
                    </p>
                  </div>

                  {formError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendInquiry} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                          Customer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          disabled={isSubmitting}
                          className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          disabled={isSubmitting}
                          className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                        Email Address <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="e.g. rahul.sharma@example.com"
                        disabled={isSubmitting}
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                        Select Inquiry Purpose / Product:
                      </label>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] disabled:opacity-50"
                      >
                        {inquiryOptions.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                        Estimated Quantity / Pack Size:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {['500 g', '1 kg', '2 kg - 5 kg', 'Bulk (10kg+)'].map((wt) => (
                          <button
                            type="button"
                            key={wt}
                            disabled={isSubmitting}
                            onClick={() => setSelectedPackWeight(wt)}
                            className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                              selectedPackWeight === wt
                                ? 'bg-[#0D5B29] text-white border-[#0D5B29]'
                                : 'bg-[#F0F7F2] text-[#23382B] border-[#D5E8DA] hover:bg-[#E3EDE5]'
                            } disabled:opacity-50`}
                          >
                            {wt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                        Specific Items or Requirements <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="e.g. Besan Ladoo, Chakli, Shankarpali for Diwali festival, delivery needed next weekend to Pune."
                        className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] disabled:opacity-50"
                      />
                    </div>

                    <button
                      type="submit"
                      id="submit-whatsapp-inquiry-btn"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all transform hover:scale-[1.01] border border-[#F5A800]/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Registering & Connecting WhatsApp...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5 fill-white" />
                          <span>Submit & Send Enquiry via WhatsApp ({whatsappDisplay})</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-center text-[11px] text-[#557060]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0D5B29]"></span>
                      <span>Securely saved to CRM database & formatted for direct WhatsApp chat.</span>
                    </div>

                  </form>
                </>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
