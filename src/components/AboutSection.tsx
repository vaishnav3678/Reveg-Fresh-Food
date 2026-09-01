import React from 'react';
import { Heart, Sparkles, ChefHat, Package, CheckCircle2, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

export const AboutSection: React.FC = () => {
  const { data: siteData } = useSiteData();
  const about = siteData?.about;
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  return (
    <section id="about" className="py-20 bg-[#FAF8F2] relative overflow-hidden border-t border-b border-[#D5E8DA]">
      {/* Subtle Background Ambient Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EBF5EE] rounded-full blur-3xl pointer-events-none opacity-70" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFF4EB] rounded-full blur-3xl pointer-events-none opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-4 border border-[#BCE5C8]">
            <ChefHat className="w-3.5 h-3.5 text-[#0D5B29]" />
            <span>{about?.badge || 'About RevEg Fresh Foods'}</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight leading-tight">
            {about?.title || 'Freshness You Can Taste,'} <br className="hidden sm:block" />
            <span className="text-[#E8590C]">{about?.subtitle || 'Tradition You Can Trust'}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0D5B29] via-[#F5A800] to-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        {/* Two Column Story Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Story Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Main Image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src={about?.mainImage || "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"}
                  alt="Authentic Traditional Indian Sweets Preparation by RevEg Fresh Foods"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>

              {/* Overlapping Secondary Image */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-44 sm:w-52 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden xs:block">
                <img
                  src={about?.secondaryImage || "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80"}
                  alt="Crispy Traditional Chakli & Namkeen"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Quality Tag */}
              <div className="absolute -top-4 -left-4 bg-[#0D5B29] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-[#F5A800]/40">
                <Sparkles className="w-4 h-4 text-[#F5A800]" />
                <div className="text-left">
                  <div className="text-xs font-bold text-[#F5A800]">Authentic Recipes</div>
                  <div className="text-[10px] text-white/90">Homestyle Flavour</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Exact Narrative Copy & Core Values */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="prose prose-lg text-[#3A5243] space-y-4">
              <p className="text-lg sm:text-xl font-medium text-[#1B3524] leading-relaxed">
                {about?.leadParagraph || 'At RevEg Fresh Foods, we bring the authentic taste of traditional Indian sweets and snacks to your table.'}
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#4A6354]">
                {about?.bodyParagraph1 || 'From festive favourites to everyday namkeen, our products are prepared with carefully selected ingredients and a focus on freshness, quality and delicious taste.'}
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-[#4A6354]">
                {about?.bodyParagraph2 || "Whether you're celebrating a festival, looking for something special for your family or sending a box of traditional treats to loved ones, RevEg Fresh Foods is here to make every occasion more delicious."}
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {(about?.coreValues || [
                { title: 'Carefully Selected Ingredients', desc: 'Choice pulses, fine semolina, pure ghee, and fragrant whole spices.' },
                { title: 'Freshly Prepared on Order', desc: 'Ensuring maximum freshness, crunch, and authentic homemade aroma.' },
                { title: 'Festivals & Everyday Munching', desc: 'Diwali Faral, pooja offerings, family gatherings, and evening snacks.' },
                { title: 'Custom Celebration Hampers', desc: 'Artisanal boxes crafted for personal gifting and corporate events.' },
              ]).map((val, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-[#D5E8DA] shadow-sm flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-[#0D5B29]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#11311D]">{val.title}</h4>
                    <p className="text-xs text-[#557060] mt-0.5">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Action Link */}
            <div className="pt-2">
              <a
                id="about-whatsapp-inquire-btn"
                href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-6 py-3 rounded-full font-bold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-[#F5A800]/30"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Talk with Us on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
