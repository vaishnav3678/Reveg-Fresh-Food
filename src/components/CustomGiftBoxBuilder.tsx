import React, { useState } from 'react';
import { Gift, Sparkles, Check, Plus, MessageCircle, Package, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { GIFT_BOX_TIERS } from '../data/foodData';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';
import { submitDualChannelInquiry } from '../services/inquirySubmissionService';
import { CustomerInquiry } from '../types';

export const CustomGiftBoxBuilder: React.FC = () => {
  const { data: siteData } = useSiteData();
  const productsList = siteData?.products || [];
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  const [selectedTierId, setSelectedTierId] = useState<string>('royal-6');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([
    'besan-ladoo',
    'chakli',
    'shankarpali',
    'kaju-katli',
    'chivda',
    'karanji'
  ]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<CustomerInquiry | null>(null);

  const currentTier = GIFT_BOX_TIERS.find((t) => t.id === selectedTierId) || GIFT_BOX_TIERS[1];

  const handleToggleItem = (productId: string) => {
    if (selectedItemIds.includes(productId)) {
      setSelectedItemIds(selectedItemIds.filter((id) => id !== productId));
    } else {
      if (selectedItemIds.length < currentTier.capacity) {
        setSelectedItemIds([...selectedItemIds, productId]);
      }
    }
  };

  const handleTierChange = (tierId: string) => {
    setSelectedTierId(tierId);
    const newTier = GIFT_BOX_TIERS.find((t) => t.id === tierId);
    if (newTier && selectedItemIds.length > newTier.capacity) {
      setSelectedItemIds(selectedItemIds.slice(0, newTier.capacity));
    }
  };

  const selectedProductNames = productsList.filter((p) => selectedItemIds.includes(p.id)).map((p) => p.name);

  const handleGiftBoxInquiry = async () => {
    setIsSubmitting(true);
    try {
      const name = customerName.trim() || 'Festive Gifting Customer';
      const phone = customerPhone.trim() || whatsappNum;
      const itemsText = selectedProductNames.length > 0 
        ? selectedProductNames.join(', ') 
        : 'Chef Selection of Traditional Sweets & Faral';

      const result = await submitDualChannelInquiry(
        {
          customerName: name,
          phone: phone,
          product: `Custom Gift Box: ${currentTier.name}`,
          quantity: `1 Box (${currentTier.capacity} Items)`,
          message: `Custom Festive Gift Box (${currentTier.name}). Selected items: ${itemsText}`,
          source: 'Custom Gift Box Builder',
        },
        whatsappNum
      );

      setSubmittedInquiry(result.inquiry);
    } catch (err) {
      console.error('Gift box inquiry error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="gift-boxes" className="py-20 bg-[#F4F9F5] relative border-t border-[#D5E8DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
            <Gift className="w-3.5 h-3.5 text-[#E8590C]" />
            <span>Festive & Corporate Gifting</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight">
            Make Every Celebration Sweeter
          </h2>
          <p className="text-[#4A6354] text-base sm:text-lg mt-3">
            Offer customizable festive and corporate gift boxes containing authentic combinations of sweets and faral tailored for your loved ones and colleagues by RevEg Fresh Foods.
          </p>
          <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        {/* Gift Box Tier Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {GIFT_BOX_TIERS.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <div
                key={tier.id}
                id={`tier-card-${tier.id}`}
                onClick={() => handleTierChange(tier.id)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 transition-all duration-300 relative border flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-2 border-[#0D5B29] shadow-xl ring-2 ring-[#0D5B29]/20 transform -translate-y-1'
                    : 'bg-[#FAF8F2] border-[#D5E8DA] hover:bg-white hover:border-[#0D5B29]/40 shadow-sm'
                }`}
              >
                {isSelected && (
                  <div className="absolute -top-3 right-6 bg-[#0D5B29] text-[#F5A800] text-[10px] uppercase font-extrabold tracking-wider px-3.5 py-0.5 rounded-full shadow border border-[#F5A800]/40">
                    Selected Size
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8590C] bg-[#FFF4EB] px-2.5 py-1 rounded-full border border-[#FCDDC2]">
                    {tier.badge}
                  </span>

                  <h3 className="font-cinzel text-xl font-bold text-[#11311D] mt-3">
                    {tier.name}
                  </h3>

                  <p className="text-xs text-[#3A5243] mt-2 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#E8F2EA] text-xs text-[#4A6354]">
                    <strong className="text-[#0D5B29]">Recommended for:</strong> {tier.recommendedFor}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E8F2EA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E8590C]">
                    Holds {tier.capacity} items
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-[#0D5B29] text-white' : 'bg-[#D5E8DA] text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Custom Mix Builder & Live WhatsApp Output */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5E8DA] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Item Picker */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-cinzel text-xl font-bold text-[#11311D]">
                    Pick Items for {currentTier.name}
                  </h4>
                  <p className="text-xs text-[#557060]">
                    Select any {currentTier.capacity} items from our freshly prepared collection:
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  selectedItemIds.length === currentTier.capacity
                    ? 'bg-[#EBF5EE] text-[#0D5B29] border border-[#BCE5C8]'
                    : 'bg-[#FFF4EB] text-[#E8590C] border border-[#FCDDC2]'
                }`}>
                  {selectedItemIds.length} / {currentTier.capacity} Selected
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {productsList.slice(0, 18).map((prod) => {
                  const isChecked = selectedItemIds.includes(prod.id);
                  const isMaxReached = selectedItemIds.length >= currentTier.capacity && !isChecked;

                  return (
                    <button
                      key={prod.id}
                      id={`gift-item-${prod.id}`}
                      onClick={() => handleToggleItem(prod.id)}
                      disabled={isMaxReached}
                      className={`text-left p-2.5 rounded-2xl border text-xs transition-all flex items-start justify-between gap-2 ${
                        isChecked
                          ? 'bg-[#EBF5EE] border-[#0D5B29] text-[#0D5B29] font-bold shadow-sm'
                          : isMaxReached
                          ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                          : 'bg-[#FAF8F2] border-[#D5E8DA] text-[#23382B] hover:bg-[#F0F7F2]'
                      }`}
                    >
                      <span className="line-clamp-2 leading-tight">{prod.name}</span>
                      <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                        isChecked ? 'bg-[#0D5B29] text-white' : 'border border-[#A8C7B2]'
                      }`}>
                        {isChecked ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5 text-[#A8C7B2]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-[#557060] italic">
                * You can also specify custom dietary choices or pack ratios during WhatsApp conversation.
              </div>
            </div>

            {/* Right: Live Box Preview & WhatsApp CTA */}
            <div className="lg:col-span-5 bg-[#F0F7F2] rounded-2xl p-6 border border-[#D5E8DA] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0D5B29] text-[#F5A800] flex items-center justify-center shadow-md border border-[#F5A800]/30">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-cinzel text-lg font-bold text-[#11311D]">
                    Your Custom Gift Box
                  </h5>
                  <span className="text-xs text-[#557060]">
                    {currentTier.name} ({selectedItemIds.length} items)
                  </span>
                </div>
              </div>

              {/* Selected Items List */}
              <div className="space-y-1.5 min-h-[120px] bg-white p-3.5 rounded-xl border border-[#D5E8DA]">
                {selectedProductNames.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Select items from the left to build your customized box.
                  </p>
                ) : (
                  selectedProductNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-[#11311D] font-semibold">
                      <span className="w-4 h-4 rounded-full bg-[#EBF5EE] text-[#0D5B29] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{name}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="text-xs text-[#4A6354] space-y-1">
                <div className="flex justify-between">
                  <span>Price / Box:</span>
                  <strong className="text-[#E8590C]">Price on Enquiry</strong>
                </div>
                <div className="flex justify-between">
                  <span>Packaging:</span>
                  <span className="font-semibold text-[#0D5B29]">Festive gift box with gold ribbons</span>
                </div>
              </div>

              {submittedInquiry ? (
                <div className="bg-white p-4 rounded-xl border border-[#A3D9B1] space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inquiry Registered in Central Database!</span>
                  </div>
                  <div className="text-[11px] text-gray-600">
                    Reference: <strong className="font-mono text-emerald-700">{submittedInquiry.inquiryId}</strong>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Your gift box selection has been saved to the Admin Panel and initiated on WhatsApp.
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getWhatsAppUrl(
                        WhatsAppMessages.giftBoxInquiry(selectedProductNames, currentTier.name),
                        whatsappNum
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-2 px-3 rounded-lg font-bold text-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Re-open WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmittedInquiry(null)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs flex items-center justify-center"
                      title="Build Another Box"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-[#0D5B29] uppercase mb-1">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Anjali"
                        className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5E8DA] focus:ring-1 focus:ring-[#0D5B29]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#0D5B29] uppercase mb-1">WhatsApp No.</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs p-2 rounded-lg bg-white border border-[#D5E8DA] focus:ring-1 focus:ring-[#0D5B29]"
                      />
                    </div>
                  </div>

                  {/* Create Your Gift Box CTA Button */}
                  <button
                    id="create-gift-box-btn"
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGiftBoxInquiry}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3.5 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 transform hover:scale-[1.02] border border-[#F5A800]/40 cursor-pointer disabled:opacity-50"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>{isSubmitting ? 'Saving to Database & WhatsApp...' : 'Enquire & Send to WhatsApp'}</span>
                  </button>

                  <div className="text-center text-[11px] text-[#557060]">
                    Inquiry is stored in our central CRM & opened directly on WhatsApp!
                  </div>
                </>
              )}

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
