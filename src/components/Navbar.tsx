import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, Sparkles, ChevronRight, Phone } from 'lucide-react';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeSection, onOpenAdmin }) => {
  const { data: siteData } = useSiteData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';
  const brandName = siteData?.settings?.brandName || 'RevEg Fresh Foods';

  // Dynamic navigation items from CMS
  const navItems = siteData?.navigation?.items?.filter((item) => item.visible) || [
    { id: 'nav_1', label: 'Home', target: '#home' },
    { id: 'nav_2', label: 'Products & Faral', target: '#products' },
    { id: 'nav_3', label: 'Festive Specials', target: '#festive-specials' },
    { id: 'nav_4', label: 'Custom Gift Boxes', target: '#gift-boxes' },
    { id: 'nav_5', label: 'About Us', target: '#about' },
    { id: 'nav_6', label: 'Gallery', target: '#gallery' },
    { id: 'nav_7', label: 'Contact', target: '#contact' },
  ];

  const handleNavClick = (target: string) => {
    setMobileMenuOpen(false);
    const cleanId = target.replace('#', '');
    onNavigate(cleanId);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Top Announcement Bar - Brand Dark Green with Golden Yellow highlights */}
      <div className="bg-[#083E1B] text-[#F3F7F4] text-xs sm:text-sm py-2 px-4 text-center font-medium border-b border-[#0D5B29] flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-[#F5A800] animate-pulse shrink-0" />
        <span className="truncate">Diwali Faral & Festive Bookings Open! Fresh Batches Prepared on Order.</span>
        <a 
          href={getWhatsAppUrl("Hello RevEg Fresh Foods, I would like to book festive sweets and faral in advance. Please share details.", whatsappNum)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold text-[#F5A800] hover:text-[#FFB81C] transition-colors ml-1 inline-flex items-center gap-1 shrink-0"
        >
          <span>Chat on WhatsApp ({whatsappDisplay})</span>
          <ChevronRight className="w-3 h-3" />
        </a>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2.5 border-b border-[#E3EDE5]' 
          : 'bg-[#FAF8F2]/95 backdrop-blur-sm py-3.5 border-b border-[#E3EDE5]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo with Official RevEg Fresh Foods Emblem */}
          <button 
            id="nav-brand-logo-btn"
            onClick={() => handleNavClick('#home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            {/* The exact circular RevEg Fresh Foods logo */}
            <img
              src="/reveg-logo.svg"
              alt="RevEg Fresh Foods Logo"
              className="w-12 h-12 sm:w-13 sm:h-13 object-contain shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1 leading-tight font-jakarta">
                <span className="font-extrabold text-xl sm:text-2xl text-[#0D5B29] tracking-tight">
                  Rev<span className="text-[#E8590C]">eg</span>
                </span>
                <span className="hidden sm:inline-block font-extrabold text-[10px] uppercase tracking-widest bg-[#E8F5EB] text-[#0D5B29] px-2 py-0.5 rounded-full border border-[#BCE5C8]">
                  Fresh Foods
                </span>
              </div>
              <p className="text-[11px] text-[#4A6354] font-medium tracking-wide hidden md:block">
                Traditional Sweets, Faral & Namkeen
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const targetId = item.target.replace('#', '');
              const isActive = activeSection === targetId;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${targetId}`}
                  onClick={() => handleNavClick(item.target)}
                  className={`px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0D5B29] text-white shadow-md'
                      : 'text-[#23382B] hover:text-[#E8590C] hover:bg-[#EBF5EE]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action: Direct WhatsApp CTA button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              id="nav-whatsapp-cta-btn"
              href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-md hover:shadow-orange-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 border border-[#F5A800]/40"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{siteData?.navigation?.ctaText || 'Order on WhatsApp'}</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on WhatsApp"
              className="sm:hidden w-10 h-10 rounded-full bg-[#E8590C] text-white flex items-center justify-center shadow-md"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
            </a>
            
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0D5B29] hover:bg-[#EBF5EE] focus:outline-none transition-colors border border-[#D1E7D7]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E3EDE5] bg-white/98 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const targetId = item.target.replace('#', '');
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${targetId}`}
                    onClick={() => handleNavClick(item.target)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      activeSection === targetId
                        ? 'bg-[#0D5B29] text-white'
                        : 'text-[#23382B] hover:bg-[#EBF5EE] hover:text-[#E8590C]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E3EDE5] flex flex-col gap-2">
              <a
                id="mobile-menu-whatsapp-btn"
                href={getWhatsAppUrl(WhatsAppMessages.generalInquiry(), whatsappNum)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-3 rounded-xl font-bold shadow-md text-sm"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Order on WhatsApp ({whatsappDisplay})</span>
              </a>
              <div className="text-center text-xs text-[#52705E] mt-1 font-medium">
                Fresh Traditional Sweets • Crunchy Namkeen • Fast WhatsApp Replies
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
