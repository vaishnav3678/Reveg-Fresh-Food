import React from 'react';
import { Sparkles, MessageCircle, Phone, Mail, MapPin, Heart, ChevronRight } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { data: siteData } = useSiteData();
  const settings = siteData?.settings;
  const footerConfig = siteData?.footer;

  const whatsappNum = settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = settings?.whatsappDisplay || '+91 94033 58033';
  const phoneDisplay = settings?.phone || '+91 94033 58033';
  const emailDisplay = settings?.email || 'revegfreshfoods@gmail.com';
  const addressDisplay = settings?.address || 'Maharashtra, India';
  const brandDescription = footerConfig?.description || settings?.brandDescription || 'Bringing authentic traditional Indian sweets, festive faral favourites, and crispy everyday namkeen to your home with purity, freshness, and homemade taste.';

  return (
    <footer className="bg-[#083E1B] text-[#E3EDE6] relative overflow-hidden border-t-2 border-[#F5A800]">
      
      {/* Decorative subtle pattern */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-[#0D5B29]">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/reveg-logo.svg"
                alt="RevEg Fresh Foods Logo"
                className="w-12 h-12 object-contain shrink-0"
              />
              <div>
                <span className="font-cinzel text-xl font-extrabold tracking-wide text-white block">
                  Rev<span className="text-[#E8590C]">eg</span> Fresh Foods
                </span>
                <span className="text-xs text-[#F5A800] font-semibold tracking-wide">
                  Traditional Sweets & Snacks
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#C8DED0] leading-relaxed">
              {brandDescription}
            </p>

            <div className="pt-2">
              <a
                id="footer-whatsapp-btn"
                href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp ({whatsappDisplay})</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider text-[#F5A800]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About Brand' },
                { id: 'products', label: 'Product Catalogue' },
                { id: 'festive-specials', label: 'Festive Specials' },
                { id: 'gift-boxes', label: 'Custom Gift Boxes' },
                { id: 'gallery', label: 'Photo Gallery' },
                { id: 'contact', label: 'Contact & Enquire' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-[#C8DED0] hover:text-[#F5A800] transition-colors flex items-center gap-1 font-medium"
                  >
                    <ChevronRight className="w-3 h-3 text-[#E8590C]" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Specialties & Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider text-[#F5A800]">
              Our Delicacies
            </h4>
            <ul className="space-y-2 text-xs text-[#C8DED0]">
              <li>🪔 <strong className="text-white">Diwali Faral:</strong> Besan & Motichoor Ladoo, Chakli, Shankarpali, Karanji</li>
              <li>🍬 <strong className="text-white">Traditional Sweets:</strong> Kaju Katli, Milk Peda, Gulab Jamun, Modak</li>
              <li>🥨 <strong className="text-white">Namkeen:</strong> Poha Chivda, Bhadang, Nylon Sev, Royal Mixture</li>
              <li>🎁 <strong className="text-white">Festive Hampers:</strong> Custom Assorted Sweet & Snack Boxes</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider text-[#F5A800]">
              Quick Connect
            </h4>
            <div className="space-y-2.5 text-xs text-[#C8DED0]">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>WhatsApp: <strong className="text-white">{whatsappDisplay}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#F5A800] shrink-0 mt-0.5" />
                <span>Phone: <strong className="text-white">{phoneDisplay}</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[#F5A800] shrink-0 mt-0.5" />
                <span>Email: {emailDisplay}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F5A800] shrink-0 mt-0.5" />
                <span>Location: {addressDisplay}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#95B59E] gap-4">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} <strong className="text-[#F5A800]">RevEg Fresh Foods</strong>. All Rights Reserved.</span>
            {onOpenAdmin && (
              <>
                <span className="text-[#0D5B29]">•</span>
                <button
                  id="footer-admin-link-btn"
                  onClick={onOpenAdmin}
                  className="text-[#95B59E] hover:text-[#F5A800] transition-colors underline decoration-dotted text-[11px]"
                >
                  Admin CMS Portal
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with traditional care & authentic taste</span>
            <Heart className="w-3 h-3 text-[#E8590C] fill-[#E8590C]" />
          </div>
        </div>

      </div>
    </footer>
  );
};
