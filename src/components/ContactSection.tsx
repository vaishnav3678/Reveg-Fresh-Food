import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Sparkles, Send, Clock, CheckCircle } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

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
  const [inquiryType, setInquiryType] = useState('Festive Faral & Sweets Order');
  const [userMessage, setUserMessage] = useState('');
  const [selectedPackWeight, setSelectedPackWeight] = useState('1 kg');
  const [submitted, setSubmitted] = useState(false);

  const inquiryOptions = [
    'Festive Faral & Sweets Order',
    'Custom Celebration Gift Box',
    'Bulk / Corporate Order Enquiry',
    'General Price & Availability Check',
    'Wedding & Event Sweets Catering'
  ];

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log enquiry to backend
    try {
      await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: senderName,
          phone: senderPhone || whatsappNum,
          message: `${inquiryType} (Pack: ${selectedPackWeight}) - ${userMessage}`,
          inquiryType: inquiryType,
          quantity: selectedPackWeight,
          source: 'Website Contact Form'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error logging enquiry:', err);
    }

    const formattedMsg = WhatsAppMessages.customMessage(
      senderName,
      `${inquiryType} (Pref: ${selectedPackWeight})`,
      userMessage
    );
    window.open(getWhatsAppUrl(formattedMsg, whatsappNum), '_blank');
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
              
              <div className="border-b border-[#E8F2EA] pb-4">
                <span className="text-xs uppercase font-bold text-[#E8590C] tracking-wider">Fast Direct Inquiry</span>
                <h3 className="font-cinzel text-2xl font-bold text-[#11311D] mt-1">
                  Send Your Enquiry on WhatsApp
                </h3>
                <p className="text-xs text-[#557060] mt-1">
                  Fill in your details below to generate a pre-formatted WhatsApp message for instant inquiry with RevEg Fresh Foods.
                </p>
              </div>

              <form onSubmit={handleSendInquiry} className="space-y-4">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                    Your Phone / WhatsApp Number:
                  </label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                    Select Inquiry Purpose:
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29]"
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
                        onClick={() => setSelectedPackWeight(wt)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                          selectedPackWeight === wt
                            ? 'bg-[#0D5B29] text-white border-[#0D5B29]'
                            : 'bg-[#F0F7F2] text-[#23382B] border-[#D5E8DA] hover:bg-[#E3EDE5]'
                        }`}
                      >
                        {wt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
                    Specific Items or Requirements:
                  </label>
                  <textarea
                    rows={3}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="e.g. Besan Ladoo, Chakli, Shankarpali for Diwali, delivery needed next weekend."
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-2 focus:ring-[#0D5B29]"
                  />
                </div>

                <button
                  type="submit"
                  id="submit-whatsapp-inquiry-btn"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all transform hover:scale-[1.01] border border-[#F5A800]/40"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Send Enquiry via WhatsApp ({whatsappDisplay})</span>
                </button>

                <div className="text-center text-[11px] text-[#557060]">
                  Opens official WhatsApp chat with your pre-filled inquiry directly.
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
