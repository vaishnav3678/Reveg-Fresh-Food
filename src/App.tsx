import React, { useState, useEffect } from 'react';
import { SiteProvider, useSiteData } from './context/SiteContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminPanel } from './components/admin/AdminPanel';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FestiveBanner } from './components/FestiveBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomGiftBoxBuilder } from './components/CustomGiftBoxBuilder';
import { GallerySection } from './components/GallerySection';
import { TestimonialsNotice } from './components/TestimonialsNotice';
import { ContactSection } from './components/ContactSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Product } from './types';

// Public Storefront View
function PublicWebsite({ onOpenAdmin }: { onOpenAdmin: () => void }) {
  const { isSectionEnabled, isLoading } = useSiteData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<string>('home');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-[#11311D]">
      {/* Fixed Navigation Header */}
      <Navbar
        onNavigate={scrollToSection}
        activeSection={activeSection}
        onOpenAdmin={onOpenAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        {isSectionEnabled('hero') && (
          <Hero
            onExploreProducts={() => scrollToSection('products')}
            onOpenDiwaliBanner={() => scrollToSection('festive-specials')}
          />
        )}

        {/* 2. Festive Banner & Seasonal Faral Specials */}
        {isSectionEnabled('festive-specials') && (
          <FestiveBanner onSelectProduct={(prod) => setSelectedProduct(prod)} />
        )}

        {/* 3. Product Catalog with Categories & Search */}
        {isSectionEnabled('products') && (
          <ProductCatalog onSelectProduct={(prod) => setSelectedProduct(prod)} />
        )}

        {/* 4. Custom Gift Box Builder */}
        {isSectionEnabled('gift-boxes') && <CustomGiftBoxBuilder />}

        {/* 5. About RevEg Fresh Foods */}
        {isSectionEnabled('about') && <AboutSection />}

        {/* 6. Why Choose Us (Feature Highlights) */}
        {isSectionEnabled('why-choose-us') && <WhyChooseUs />}

        {/* 7. Gallery Section */}
        {isSectionEnabled('gallery') && <GallerySection />}

        {/* 8. Customer Reviews & Experience */}
        {isSectionEnabled('testimonials') && <TestimonialsNotice />}

        {/* 9. Contact & Custom Order Enquiry Section */}
        {isSectionEnabled('contact') && <ContactSection />}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Persistent Floating WhatsApp Quick-Action */}
      <FloatingWhatsApp />

      {/* Footer */}
      <Footer onNavigate={scrollToSection} onOpenAdmin={onOpenAdmin} />
    </div>
  );
}

// Main App with Global State Providers
export default function App() {
  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin'
      );
    }
    return false;
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setIsAdminView(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  const openAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  const closeAdmin = () => {
    window.location.hash = '';
    setIsAdminView(false);
  };

  return (
    <AdminAuthProvider>
      <SiteProvider>
        {isAdminView ? (
          <AdminPanel onBackToPublicSite={closeAdmin} />
        ) : (
          <PublicWebsite onOpenAdmin={openAdmin} />
        )}
      </SiteProvider>
    </AdminAuthProvider>
  );
}
