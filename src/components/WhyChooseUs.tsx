import React from 'react';
import { Sparkles, ShieldCheck, Utensils, PartyPopper, Gift, PackageCheck, MessageCircle, ArrowUpRight } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

export const WhyChooseUs: React.FC = () => {
  const { data: siteData } = useSiteData();
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  const features = [
    {
      id: 'freshly-prepared',
      title: 'Freshly Prepared',
      description: 'Prepared with a focus on freshness and authentic homemade taste.',
      icon: Sparkles,
      color: 'from-[#0D5B29] to-[#083E1B]',
      accentBg: 'bg-[#EBF5EE]',
      accentBorder: 'border-[#BCE5C8]',
      tag: 'Fresh Batches'
    },
    {
      id: 'quality-ingredients',
      title: 'Quality Ingredients',
      description: 'Carefully selected ingredients for delicious traditional flavours.',
      icon: ShieldCheck,
      color: 'from-[#E8590C] to-[#CC4B04]',
      accentBg: 'bg-[#FFF4EB]',
      accentBorder: 'border-[#FCDDC2]',
      tag: 'Pure Ghee & Nuts'
    },
    {
      id: 'traditional-taste',
      title: 'Traditional Taste',
      description: 'Classic Indian recipes inspired by traditional flavours and heritage.',
      icon: Utensils,
      color: 'from-[#F5A800] to-[#B47B00]',
      accentBg: 'bg-[#FEF9EC]',
      accentBorder: 'border-[#FDE5A3]',
      tag: 'Heritage Recipes'
    },
    {
      id: 'perfect-for-celebrations',
      title: 'Perfect for Celebrations',
      description: 'Special sweets and snacks for festivals, family functions and celebrations.',
      icon: PartyPopper,
      color: 'from-[#0D5B29] to-[#E8590C]',
      accentBg: 'bg-[#EBF5EE]',
      accentBorder: 'border-[#BCE5C8]',
      tag: 'Festive Ready'
    },
    {
      id: 'custom-gift-options',
      title: 'Custom Gift Options',
      description: 'Choose attractive combinations for personal and corporate gifting.',
      icon: Gift,
      color: 'from-[#E8590C] to-[#F5A800]',
      accentBg: 'bg-[#FFF4EB]',
      accentBorder: 'border-[#FCDDC2]',
      tag: 'Bespoke Hampers'
    },
    {
      id: 'bulk-orders',
      title: 'Bulk Orders',
      description: 'Suitable enquiry flow for events, celebrations and corporate gifting.',
      icon: PackageCheck,
      color: 'from-[#0D5B29] to-[#10B981]',
      accentBg: 'bg-[#EBF5EE]',
      accentBorder: 'border-[#BCE5C8]',
      tag: 'Events & Catering'
    }
  ];

  return (
    <section className="py-20 bg-[#FAF8F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A800]" />
            <span>The RevEg Promise</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight">
            Why Choose RevEg Fresh Foods
          </h2>
          <p className="text-[#4A6354] text-base sm:text-lg mt-3 max-w-2xl mx-auto">
            We are dedicated to bringing you authentic sweets and savouries made with purity, traditional craftsmanship, and warm hospitality.
          </p>
          <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={`feature-card-${item.id}`}
                className={`rounded-3xl p-6 sm:p-7 bg-white border ${item.accentBorder} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group overflow-hidden flex flex-col justify-between`}
              >
                {/* Subtle Card Background Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full ${item.accentBg} -z-0 group-hover:scale-110 transition-transform duration-300 opacity-70`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D5B29] bg-[#EBF5EE] px-2.5 py-1 rounded-full border border-[#BCE5C8]">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#11311D] mb-2 font-cinzel group-hover:text-[#E8590C] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-[#4A6354] text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="relative z-10 pt-5 mt-4 border-t border-[#E8F2EA] flex items-center justify-between text-xs font-semibold text-[#0D5B29]">
                  <span>Crafted with Care</span>
                  <a
                    href={getWhatsAppUrl(`Hello RevEg Fresh Foods, I am inquiring regarding your ${item.title.toLowerCase()} service.`, whatsappNum)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#E8590C] hover:text-[#CC4B04] transition-colors font-bold"
                  >
                    <span>Enquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bulk & Corporate Callout Strip */}
        <div className="mt-12 rounded-3xl bg-brand-pattern text-white p-6 sm:p-8 shadow-xl border border-[#F5A800]/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[#F5A800] text-xs uppercase tracking-wider font-bold">Festivals, Weddings & Events</span>
            <h3 className="text-xl sm:text-2xl font-bold font-cinzel">Planning a Bulk Order or Corporate Celebration?</h3>
            <p className="text-[#E3EDE6] text-xs sm:text-sm max-w-xl">
              We prepare custom quantities with dedicated festive packaging and prompt delivery coordination for your special occasions.
            </p>
          </div>
          <a
            id="why-choose-bulk-whatsapp-btn"
            href={getWhatsAppUrl(WhatsAppMessages.bulkOrder(), whatsappNum)}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all transform hover:scale-105 border border-[#F5A800]/40"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Bulk Order on WhatsApp ({whatsappDisplay})</span>
          </a>
        </div>

      </div>
    </section>
  );
};
