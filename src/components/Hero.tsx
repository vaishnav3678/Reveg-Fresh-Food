import React from 'react';
import { ArrowRight, MessageCircle, Sparkles, Heart, ShieldCheck, Clock, Award, Leaf } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

interface HeroProps {
  onExploreProducts: () => void;
  onOpenDiwaliBanner: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreProducts, onOpenDiwaliBanner }) => {
  const { data: siteData } = useSiteData();
  const hero = siteData?.hero;
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  return (
    <section id="home" className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#F0F7F2] via-[#FAF8F2] to-[#F5FAF6]">
      {/* Decorative Brand Ambient Glows (Dark Green & Warm Golden Sunburst) */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[520px] bg-gradient-to-tr from-[#0D5B29]/10 via-[#F5A800]/12 to-[#E8590C]/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-10 -right-20 w-96 h-96 bg-[#F5A800]/12 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0D5B29]/8 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Identity, Value Proposition & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EBF5EE] border border-[#BCE5C8] text-[#0D5B29] text-xs sm:text-sm font-bold shadow-sm">
              <Leaf className="w-4 h-4 text-[#0D5B29]" />
              <span>{hero?.badge || 'RevEg Fresh Foods • Authentic Taste & Small-Batch Purity'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#11311D] tracking-tight leading-[1.15]">
              {hero?.headline || 'Taste the Tradition,'} <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#0D5B29] via-[#E8590C] to-[#F5A800] bg-clip-text text-transparent">
                {hero?.headlineHighlight || 'Freshly Made for You'}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-[#3A5243] text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {hero?.subheading ||
                'Delicious traditional Indian sweets, festive faral, and crispy namkeen crafted by RevEg Fresh Foods with wholesome ingredients, pure ghee, and authentic homemade taste.'}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {/* Explore Products Button */}
              <button
                id="hero-explore-products-btn"
                onClick={onExploreProducts}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-7 py-3.5 rounded-full font-bold text-base shadow-lg hover:shadow-green-900/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>{hero?.primaryCtaText || 'Explore Our Products'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Order on WhatsApp Button with Live Number */}
              <a
                id="hero-whatsapp-order-btn"
                href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-7 py-3.5 rounded-full font-bold text-base shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:-translate-y-0.5 border border-[#F5A800]/50"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>{hero?.secondaryCtaText || 'Order on WhatsApp'}</span>
              </a>
            </div>

            {/* WhatsApp Direct Line Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-white/80 border border-[#D5E8DA] text-xs text-[#2A4433] font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Direct WhatsApp Line: <strong className="text-[#0D5B29]">{whatsappDisplay}</strong></span>
            </div>

            {/* Trust Indicators / Badges */}
            <div className="pt-6 border-t border-[#D9EADB] grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-[#0D5B29] font-bold text-xs sm:text-sm">
                  <Heart className="w-4 h-4 text-[#E8590C]" />
                  <span>Homemade Taste</span>
                </div>
                <span className="text-[11px] text-[#557060] mt-0.5">Authentic recipe heritage</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-[#0D5B29] font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#0D5B29]" />
                  <span>Pure & Hygienic</span>
                </div>
                <span className="text-[11px] text-[#557060] mt-0.5">Selected fresh ingredients</span>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex items-center gap-1.5 text-[#0D5B29] font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-[#F5A800]" />
                  <span>Festive Faral</span>
                </div>
                <span className="text-[11px] text-[#557060] mt-0.5">Custom gift boxes ready</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Indian Food Showcase Card */}
          <div className="lg:col-span-5 relative">
            
            {/* Outer Decorative Ring */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Floating Promo Pill: Diwali Special */}
              <button 
                onClick={onOpenDiwaliBanner}
                className="absolute -top-4 right-4 z-20 bg-gradient-to-r from-[#E8590C] to-[#F5A800] text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold border-2 border-white hover:scale-105 transition-transform"
              >
                <Sparkles className="w-4 h-4 fill-white" />
                <span>Diwali Faral Specials ✨</span>
              </button>

              {/* Main Visual Image Card */}
              <div className="rounded-3xl overflow-hidden bg-white p-3 shadow-2xl border-4 border-[#E2EFE5] relative">
                <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden group">
                  <img
                    src={hero?.imageUrl || "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85"}
                    alt="Authentic Traditional Indian Sweets & Faral by RevEg Fresh Foods"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#083E1B]/90 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                    <span className="text-[#F5A800] text-xs uppercase tracking-wider font-extrabold">Signature Collection</span>
                    <h3 className="font-cinzel text-xl font-bold">Ladoos, Chakli & Faral Delights</h3>
                    <p className="text-xs text-[#E3EDE6] mt-1 line-clamp-1">Freshly roasted in pure desi ghee with select dry fruits</p>
                  </div>
                </div>

                {/* Sub-strip of Quick Specialties */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
                  <div className="bg-[#F0F7F2] rounded-xl p-2 text-center border border-[#D5E8DA]">
                    <span className="block text-xs font-bold text-[#0D5B29]">Ladoos</span>
                    <span className="text-[10px] text-[#557060]">Motichoor & Besan</span>
                  </div>
                  <div className="bg-[#FFF6ED] rounded-xl p-2 text-center border border-[#FCDDC2]">
                    <span className="block text-xs font-bold text-[#E8590C]">Crunchy Chakli</span>
                    <span className="text-[10px] text-[#557060]">Traditional Bhajani</span>
                  </div>
                  <div className="bg-[#FEF9EC] rounded-xl p-2 text-center border border-[#FDE5A3]">
                    <span className="block text-xs font-bold text-[#B47B00]">Gift Hampers</span>
                    <span className="text-[10px] text-[#557060]">Custom Boxes</span>
                  </div>
                </div>
              </div>

              {/* Floating WhatsApp Action Badge */}
              <div className="absolute -bottom-6 -left-4 sm:left-4 z-20 bg-white/98 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-xl border border-[#D5E8DA] max-w-[220px] sm:max-w-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EBF5EE] flex items-center justify-center text-[#0D5B29] shrink-0 font-bold">
                  <MessageCircle className="w-5 h-5 fill-[#0D5B29]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0D5B29]">WhatsApp Booking</div>
                  <div className="text-[10px] text-[#557060] font-medium">{whatsappDisplay} • Fast Reply</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
