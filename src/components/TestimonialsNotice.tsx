import React from 'react';
import { MessageSquareHeart, Star, Sparkles, MessageCircle, Quote } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

export const TestimonialsNotice: React.FC = () => {
  const { data: siteData } = useSiteData();
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  const activeTestimonials = (siteData?.testimonials || []).filter((t) => t.status === 'active');

  return (
    <section className="py-16 bg-[#FAF8F2] border-t border-[#D5E8DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {activeTestimonials.length > 0 ? (
          <div>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
                <Sparkles className="w-3.5 h-3.5 text-[#F5A800]" />
                <span>Customer Experiences</span>
              </div>
              <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#11311D] tracking-tight">
                Loved by Families & Celebrations
              </h2>
              <p className="text-[#4A6354] text-base mt-2">
                Hear what our cherished customers have to say about the freshness, authentic taste, and traditional flavours of RevEg Fresh Foods.
              </p>
              <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 text-left">
              {activeTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-6 border border-[#D5E8DA] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-[#F5A800]">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#F5A800]" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-[#0D5B29]/20" />
                    </div>
                    <p className="text-sm text-[#3A5243] leading-relaxed italic mb-4">
                      "{t.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8F2EA] flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#11311D]">{t.name}</h4>
                      {t.location && (
                        <span className="text-xs text-[#6E8A79]">{t.location}</span>
                      )}
                    </div>
                    {t.productName && (
                      <span className="text-[10px] font-bold text-[#0D5B29] bg-[#EBF5EE] px-2.5 py-1 rounded-full border border-[#BCE5C8]">
                        {t.productName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="inline-flex flex-col sm:flex-row items-center gap-3">
              <a
                id="testimonial-whatsapp-share-btn"
                href={getWhatsAppUrl("Hello RevEg Fresh Foods, I recently tasted your sweets/namkeen and would love to share my feedback!", whatsappNum)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-6 py-3 rounded-full text-xs font-bold shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/30"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Share Your Experience on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D5E8DA] shadow-md relative overflow-hidden max-w-4xl mx-auto">
            {/* Subtle Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#EBF5EE] rounded-full blur-2xl pointer-events-none opacity-80" />

            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center mx-auto shadow-sm border border-[#BCE5C8]">
                <MessageSquareHeart className="w-7 h-7" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F2] text-[#0D5B29] text-xs font-bold uppercase tracking-wider border border-[#D5E8DA]">
                <Sparkles className="w-3.5 h-3.5 text-[#F5A800]" />
                <span>Customer Reviews Coming Soon</span>
              </div>

              <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#11311D]">
                Your Sweet Moments, Our Greatest Delight
              </h3>

              <p className="text-sm sm:text-base text-[#4A6354] max-w-xl mx-auto leading-relaxed">
                We cherish every smile shared over our traditional sweets, festive faral, and crunchy namkeen. As we prepare fresh batches for this season, real customer experiences and stories will be showcased right here.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  id="testimonial-whatsapp-share-btn"
                  href={getWhatsAppUrl("Hello RevEg Fresh Foods, I recently tasted your sweets/namkeen and would love to share my feedback!", whatsappNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-6 py-3 rounded-full text-xs font-bold shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/30"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Share Your Experience on WhatsApp ({whatsappDisplay})</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
