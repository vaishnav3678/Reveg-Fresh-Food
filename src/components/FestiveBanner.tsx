import React, { useState } from 'react';
import { Sparkles, Gift, ArrowRight, MessageCircle, Calendar, Check, ChevronRight } from 'lucide-react';
import { FESTIVAL_SPECIALS } from '../data/foodData';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { Product } from '../types';
import { useSiteData } from '../context/SiteContext';

interface FestiveBannerProps {
  onSelectProduct: (product: Product) => void;
}

export const FestiveBanner: React.FC<FestiveBannerProps> = ({ onSelectProduct }) => {
  const { data: siteData } = useSiteData();
  const [activeFestivalId, setActiveFestivalId] = useState<string>('diwali');

  const productsList = siteData?.products || [];
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  const currentFestival = FESTIVAL_SPECIALS.find((f) => f.id === activeFestivalId) || FESTIVAL_SPECIALS[0];

  // Match sample products
  const featuredProducts = productsList.filter((p) => 
    currentFestival.sampleProducts.includes(p.id) || p.isFestiveSpecial
  ).slice(0, 4);

  return (
    <section id="festive-specials" className="py-20 bg-gradient-to-b from-[#FAF8F2] via-[#F3F8F4] to-[#FAF8F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Diwali Hero Banner Showcase - Dark Green & Gold Festive Theme */}
        <div className="relative rounded-3xl overflow-hidden bg-brand-pattern text-white p-8 sm:p-12 lg:p-14 shadow-2xl border-2 border-[#F5A800]/40 mb-16">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-4 left-4 text-[#F5A800]/40 text-2xl font-cinzel select-none">🪔</div>
          <div className="absolute top-4 right-4 text-[#F5A800]/40 text-2xl font-cinzel select-none">✨</div>
          <div className="absolute bottom-4 right-4 text-[#F5A800]/40 text-2xl font-cinzel select-none">🪔</div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#E8590C]/25 border border-[#F5A800]/50 text-[#F5A800] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-[#F5A800]" />
                <span>Diwali Faral & Festive Booking Season</span>
              </div>

              <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FFFDF8] tracking-tight leading-tight">
                Make This Diwali Extra Sweet ✨
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-[#E3EDE6] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Traditional Ladoos • Crispy Chakli • Delicious Shankarpali • Festive Chivda • Special Gift Boxes
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  id="diwali-banner-whatsapp-btn"
                  href={getWhatsAppUrl("Hello RevEg Fresh Foods, I would like to enquire about the Diwali Faral special packages and gift boxes. Please share available options.", whatsappNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-8 py-3.5 rounded-full font-bold text-base shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 border border-[#F5A800]/50"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <div className="text-xs text-[#D1E3D6] text-center sm:text-left">
                  <span>✨ Handcrafted Fresh Batches by RevEg Fresh Foods</span> <br />
                  <span className="text-[#F5A800]">WhatsApp Booking: {whatsappDisplay}</span>
                </div>
              </div>
            </div>

            {/* Right Banner Image Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#F5A800]/60 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=85"
                  alt="Diwali Special Faral and Sweets Hamper"
                  className="w-full h-72 sm:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#083E1B] via-transparent to-transparent flex items-end p-4">
                  <div className="bg-[#083E1B]/90 backdrop-blur-md p-3 rounded-xl border border-[#F5A800]/40 w-full text-center">
                    <span className="text-xs font-bold text-[#F5A800]">Traditional Faral Platter</span>
                    <p className="text-[11px] text-[#E3EDE6] mt-0.5">Ladoos, Chakli, Shankarpali & Chivda in Gift Packaging</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Festival Specials Interactive Tabs (Easily Adaptable by Season) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-2 border border-[#BCE5C8]">
            <Calendar className="w-3.5 h-3.5" />
            <span>Seasonal & Festival Calendar</span>
          </div>
          <h3 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#11311D]">
            Special Treats for Every Indian Celebration
          </h3>
          <p className="text-[#4A6354] text-sm sm:text-base mt-2">
            Explore authentic seasonal delicacies prepared specially for festivals throughout the year.
          </p>
        </div>

        {/* Festival Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {FESTIVAL_SPECIALS.map((fest) => {
            const isActive = activeFestivalId === fest.id;
            return (
              <button
                key={fest.id}
                id={`fest-tab-${fest.id}`}
                onClick={() => setActiveFestivalId(fest.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${
                  isActive
                    ? 'bg-[#0D5B29] text-white ring-2 ring-[#F5A800] shadow-md'
                    : 'bg-white text-[#23382B] hover:bg-[#EBF5EE] border border-[#D5E8DA]'
                }`}
              >
                <span>{fest.name}</span>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-[#F5A800]" />}
              </button>
            );
          })}
        </div>

        {/* Active Festival Details Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-block text-xs font-bold uppercase tracking-wider bg-[#FFF4EB] text-[#E8590C] px-3 py-1 rounded-full border border-[#FCDDC2]">
                {currentFestival.badge}
              </span>
              <h4 className="font-cinzel text-2xl sm:text-3xl font-bold text-[#11311D]">
                {currentFestival.name}
              </h4>
              <p className="text-sm sm:text-base text-[#3A5243] leading-relaxed">
                {currentFestival.description}
              </p>

              {/* Items bullet pills */}
              <div className="pt-2">
                <div className="text-xs font-bold text-[#0D5B29] uppercase tracking-wider mb-2">
                  Featured Festive Specialties:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentFestival.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-semibold bg-[#F0F7F2] text-[#0D5B29] px-3 py-1 rounded-lg border border-[#D5E8DA]"
                    >
                      <Check className="w-3 h-3 text-[#E8590C]" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <a
                  href={getWhatsAppUrl(WhatsAppMessages.festivalInquiry(currentFestival.name), whatsappNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enquire {currentFestival.name} Menu</span>
                </a>
              </div>
            </div>

            {/* Featured Product Mini Cards in this Festival */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  id={`fest-prod-${product.id}`}
                  onClick={() => onSelectProduct(product)}
                  className="bg-[#FAF8F2] rounded-2xl p-3 border border-[#D5E8DA] hover:border-[#0D5B29] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-[#0D5B29]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Festive Special
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-[#11311D] group-hover:text-[#E8590C] transition-colors line-clamp-1">
                      {product.name}
                    </h5>
                    <p className="text-[11px] text-[#557060] mt-1 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#D5E8DA] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#E8590C]">
                      {product.price ? `₹${product.price}` : 'Price on Enquiry'}
                    </span>
                    <span className="text-[11px] font-bold text-[#0D5B29] flex items-center gap-1 group-hover:underline">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
