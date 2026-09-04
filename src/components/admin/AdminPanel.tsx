import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminHomepage } from './AdminHomepage';
import { AdminHero } from './AdminHero';
import { AdminAbout } from './AdminAbout';
import { AdminGallery } from './AdminGallery';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminSettings } from './AdminSettings';
import { AdminTheme } from './AdminTheme';
import { AdminNavigation } from './AdminNavigation';
import { AdminFooter } from './AdminFooter';
import { AdminMedia } from './AdminMedia';
import { AdminSeo } from './AdminSeo';
import { AdminProfile } from './AdminProfile';
import { AdminInquiries } from './AdminInquiries';
import { InquiryRealtimeProvider } from '../../context/InquiryRealtimeContext';

interface AdminPanelProps {
  onBackToPublicSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToPublicSite }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#083E1B] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white border-t-[#E8590C] rounded-full animate-spin" />
          <span className="font-cinzel text-sm font-bold text-[#F5A800]">Loading RevEg CMS Studio...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onBackToSite={onBackToPublicSite} />;
  }

  return (
    <InquiryRealtimeProvider>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onViewLiveSite={onBackToPublicSite}
        toastMessage={toast}
        onClearToast={() => setToast(null)}
      >
        {activeTab === 'dashboard' && (
          <AdminDashboard onNavigateTab={setActiveTab} onViewLiveSite={onBackToPublicSite} />
        )}
        {activeTab === 'inquiries' && <AdminInquiries showToast={showToast} />}
        {activeTab === 'products' && <AdminProducts showToast={showToast} />}
        {activeTab === 'categories' && <AdminCategories showToast={showToast} />}
        {activeTab === 'homepage' && <AdminHomepage showToast={showToast} />}
        {activeTab === 'hero' && <AdminHero showToast={showToast} />}
        {activeTab === 'about' && <AdminAbout showToast={showToast} />}
        {activeTab === 'gallery' && <AdminGallery showToast={showToast} />}
        {activeTab === 'testimonials' && <AdminTestimonials showToast={showToast} />}
        {activeTab === 'settings' && <AdminSettings showToast={showToast} />}
        {activeTab === 'theme' && <AdminTheme showToast={showToast} />}
        {activeTab === 'navigation' && <AdminNavigation showToast={showToast} />}
        {activeTab === 'footer' && <AdminFooter showToast={showToast} />}
        {activeTab === 'media' && <AdminMedia showToast={showToast} />}
        {activeTab === 'seo' && <AdminSeo showToast={showToast} />}
        {activeTab === 'profile' && <AdminProfile showToast={showToast} />}
      </AdminLayout>
    </InquiryRealtimeProvider>
  );
};

