import React, { useState } from 'react';
import { X, MessageCircle, Sparkles, Check, Package, Scale, Heart, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import { Product, CustomerInquiry } from '../types';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';
import { submitDualChannelInquiry } from '../services/inquirySubmissionService';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { data: siteData } = useSiteData();
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  if (!product) return null;

  const [selectedPack, setSelectedPack] = useState<string>(product.packSizes[0] || '500g');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<CustomerInquiry | null>(null);

  const handleWhatsAppEnquire = async () => {
    setIsSubmitting(true);
    try {
      const name = customerName.trim() || 'Food Connoisseur';
      const phone = customerPhone.trim() || whatsappNum;
      const note = customNote.trim();
      const message = note
        ? `Inquiry for ${product.name} (${selectedPack}). Note: ${note}`
        : `Inquiry for fresh batch of ${product.name} (${selectedPack}). Please share current pricing and delivery timeframe.`;

      const result = await submitDualChannelInquiry(
        {
          customerName: name,
          phone: phone,
          product: `${product.name} (${selectedPack})`,
          quantity: selectedPack,
          message,
          source: 'Product Details Modal',
        },
        whatsappNum
      );

      setSubmittedInquiry(result.inquiry);
    } catch (err) {
      console.error('Product inquiry submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div 
        id="product-detail-modal"
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10 my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-product-modal-btn"
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-[#11311D] p-2 rounded-full shadow-lg transition-transform hover:scale-110"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Big Product Image */}
          <div className="relative h-64 md:h-full min-h-[300px] bg-[#F0F7F2] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#083E1B]/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              {product.tasteProfile && (
                <span className="text-xs font-extrabold text-[#F5A800] uppercase tracking-wider">
                  Taste Profile: {product.tasteProfile}
                </span>
              )}
              <span className="text-xs text-white/90">
                Freshly prepared for authentic flavour
              </span>
            </div>

            {product.isFestiveSpecial && (
              <div className="absolute top-4 left-4 bg-[#0D5B29] text-[#F5A800] text-xs font-extrabold px-3 py-1 rounded-full shadow-md border border-[#F5A800]/40">
                Diwali & Festive Special
              </div>
            )}
          </div>

          {/* Right Column: Details & Inquiry Flow */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Category tag */}
              <span className="text-xs uppercase font-bold tracking-wider text-[#E8590C] bg-[#FFF4EB] px-3 py-1 rounded-full border border-[#FCDDC2]">
                {product.category === 'diwali' ? 'Diwali Faral' : product.category === 'sweets' ? 'Traditional Sweet' : 'Crunchy Namkeen'}
              </span>

              {/* Title */}
              <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#11311D] mt-2">
                {product.name}
              </h2>

              {/* Short & Detailed Description */}
              <p className="text-sm text-[#4A6354] mt-3 leading-relaxed">
                {product.detailedDescription || product.description}
              </p>

              {/* Texture & Ingredients Highlights */}
              {product.ingredientsHighlight && product.ingredientsHighlight.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E8F2EA]">
                  <span className="text-xs font-bold text-[#0D5B29] block mb-1.5">
                    Ingredients & Preparation Highlights:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredientsHighlight.map((item, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-[#F0F7F2] text-[#0D5B29] px-2.5 py-1 rounded-md border border-[#D5E8DA]"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Quantity / Pack Size */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-2 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#E8590C]" />
                  <span>Select Desired Pack Size:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.packSizes.map((size) => (
                    <button
                      key={size}
                      id={`pack-size-btn-${size}`}
                      onClick={() => setSelectedPack(size)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedPack === size
                          ? 'bg-[#0D5B29] text-white shadow-md ring-2 ring-[#F5A800]'
                          : 'bg-[#FAF8F2] text-[#23382B] hover:bg-[#F0F7F2] border border-[#D5E8DA]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#0D5B29] uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Patil"
                    className="w-full text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-1 focus:ring-[#0D5B29]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#0D5B29] uppercase mb-1">WhatsApp No.</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-1 focus:ring-[#0D5B29]"
                  />
                </div>
              </div>

              {/* Optional Custom Note */}
              <div className="mt-3">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#557060] mb-1">
                  Custom instructions / occasion (optional):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Festival gifting, less sweet, urgent delivery"
                  className="w-full text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-1 focus:ring-[#0D5B29]"
                />
              </div>

              {/* Pricing Notice */}
              <div className="mt-3 p-3 rounded-2xl bg-[#FEF9EC] border border-[#FDE5A3] flex items-center justify-between">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6E8A79]">Pricing</span>
                  <span className="text-xs sm:text-sm font-bold text-[#E8590C]">
                    Price on Enquiry
                  </span>
                </div>
                <span className="text-[11px] text-[#557060] text-right font-medium">
                  Contact {whatsappDisplay} <br /> for daily batch rates
                </span>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-2">
              {submittedInquiry ? (
                <div className="p-4 rounded-2xl bg-[#EBF5EE] border border-[#A3D9B1] space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Inquiry Registered in Central Database!</span>
                  </div>
                  <div className="text-[11px] text-gray-700">
                    Reference ID: <strong className="font-mono text-emerald-800">{submittedInquiry.inquiryId}</strong>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    Saved to Supabase database & Admin Panel. WhatsApp chat initiated.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={getWhatsAppUrl(
                        WhatsAppMessages.productInquiry(product.name, selectedPack),
                        whatsappNum
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-2.5 px-3 rounded-xl font-bold text-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Re-open WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmittedInquiry(null)}
                      className="p-2.5 rounded-xl bg-white border border-[#D5E8DA] text-gray-700 text-xs hover:bg-[#FAF8F2]"
                      title="Enquire again"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  id="modal-whatsapp-enquire-btn"
                  disabled={isSubmitting}
                  onClick={handleWhatsAppEnquire}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 transform hover:scale-[1.02] border border-[#F5A800]/40 disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>
                    {isSubmitting
                      ? 'Saving to Database & WhatsApp...'
                      : `Enquire about ${product.name} (${selectedPack})`}
                  </span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
