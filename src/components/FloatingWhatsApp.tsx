import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Gift, PackageCheck, ShoppingBag, ChevronRight } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';
import { submitDualChannelInquiry } from '../services/inquirySubmissionService';

export const FloatingWhatsApp: React.FC = () => {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;
  const whatsappNum = settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';

  const [isOpen, setIsOpen] = useState(false);

  const quickTemplates = [
    {
      label: 'Order on WhatsApp',
      sublabel: 'Daily fresh batch menu & price list',
      icon: ShoppingBag,
      message: WhatsAppMessages.generalInquiry()
    },
    {
      label: 'Diwali Faral Enquiry',
      sublabel: 'Ladoos, Chakli, Shankarpali & Chivda',
      icon: Sparkles,
      message: "Hello RevEg Fresh Foods, I would like to enquire about your Diwali Faral special items and available pack sizes."
    },
    {
      label: 'Custom Gift Box',
      sublabel: 'Custom combinations of sweets & faral',
      icon: Gift,
      message: WhatsAppMessages.giftBoxInquiry()
    },
    {
      label: 'Bulk / Corporate Order',
      sublabel: 'Festivals, weddings & family functions',
      icon: PackageCheck,
      message: WhatsAppMessages.bulkOrder()
    }
  ];

  const handleSelectQuickInquiry = async (item: typeof quickTemplates[0]) => {
    setIsOpen(false);
    try {
      await submitDualChannelInquiry(
        {
          customerName: 'WhatsApp Visitor',
          phone: whatsappNum,
          product: item.label,
          quantity: 'As requested',
          message: item.message,
          source: 'Floating WhatsApp Widget',
        },
        whatsappNum
      );
    } catch {
      window.open(getWhatsAppUrl(item.message, whatsappNum), '_blank');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-[#D5E8DA] overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#0D5B29] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="/reveg-logo.svg"
                alt="RevEg Logo"
                className="w-9 h-9 object-contain shrink-0 rounded-full bg-white p-0.5"
              />
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">RevEg Fresh Foods</h4>
                <span className="text-[11px] text-[#F5A800] font-medium">{whatsappDisplay}</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick options list */}
          <div className="p-3 space-y-2 bg-[#FAF8F2] max-h-80 overflow-y-auto">
            <p className="text-[11px] text-[#557060] px-2 font-medium">
              Select an inquiry type to chat directly on WhatsApp:
            </p>

            {quickTemplates.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  id={`floating-wa-opt-${index}`}
                  type="button"
                  onClick={() => handleSelectQuickInquiry(item)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-[#EBF5EE] border border-[#D5E8DA] transition-colors group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center shrink-0 group-hover:bg-[#0D5B29] group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-[#11311D] group-hover:text-[#0D5B29]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#557060] line-clamp-1">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A8C7B2] group-hover:text-[#0D5B29] transition-colors shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="bg-[#F0F7F2] px-4 py-2 border-t border-[#D5E8DA] text-center text-[10px] text-[#557060] font-medium">
            Fresh Indian Sweets • Homemade Taste • Hygiene
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        id="floating-whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-4 py-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white"
        aria-label="Open WhatsApp Menu"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-6 h-6 fill-white" />
        <span className="font-bold text-sm hidden sm:inline-block">Order on WhatsApp</span>
      </button>

    </div>
  );
};
