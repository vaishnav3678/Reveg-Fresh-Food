import React, { useState } from 'react';
import { Camera, Sparkles, X, ChevronLeft, ChevronRight, Eye, MessageCircle } from 'lucide-react';
import { GalleryItem } from '../types';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

export const GallerySection: React.FC = () => {
  const { data: siteData } = useSiteData();
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  const galleryItems = siteData?.gallery || [];
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';

  // Dynamic categories from gallery items
  const uniqueCategories: string[] = ['All', ...Array.from(new Set(galleryItems.map((item) => item.category).filter(Boolean))) as string[]];

  const filteredItems = activeFilter === 'All'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeFilter);

  return (
    <section id="gallery" className="py-20 bg-[#FAF8F2] relative border-t border-[#D5E8DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
            <Camera className="w-3.5 h-3.5 text-[#E8590C]" />
            <span>Visual Feast</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight">
            Culinary Traditions in Pictures
          </h2>
          <p className="text-[#4A6354] text-base sm:text-lg mt-3">
            A glimpse of our appetizing sweets, crispy faral, and festive gift boxes prepared fresh with authentic care by RevEg Fresh Foods.
          </p>
          <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              id={`gallery-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeFilter === cat
                  ? 'bg-[#0D5B29] text-white shadow-md'
                  : 'bg-white text-[#23382B] hover:bg-[#EBF5EE] border border-[#D5E8DA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              id={`gallery-item-${item.id}`}
              onClick={() => setSelectedGalleryItem(item)}
              className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-white border border-[#D5E8DA] aspect-square"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />

              {/* Overlay with Title and Category */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#083E1B]/90 via-[#083E1B]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F5A800]">
                  {item.category}
                </span>
                <h4 className="font-cinzel text-base font-bold text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#E3EDE6] mt-1 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#F5A800] font-bold">
                  <span>Click to expand</span>
                  <Eye className="w-4 h-4" />
                </div>
              </div>

              {/* Static Badge on bottom for mobile touch */}
              <div className="lg:hidden absolute bottom-2 left-2 bg-[#0D5B29]/95 text-[#F5A800] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#F5A800]/40">
                {item.title}
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedGalleryItem && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={() => setSelectedGalleryItem(null)} />
            
            <div className="relative bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 border border-[#D5E8DA]">
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg"
                aria-label="Close image"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-80 sm:h-[450px] bg-black">
                <img
                  src={selectedGalleryItem.image}
                  alt={selectedGalleryItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 bg-[#FAF8F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[#E8590C]">
                    {selectedGalleryItem.category}
                  </span>
                  <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D] mt-0.5">
                    {selectedGalleryItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A6354] mt-1">
                    {selectedGalleryItem.description}
                  </p>
                </div>

                <a
                  href={getWhatsAppUrl(`Hello RevEg Fresh Foods, I saw the photo of ${selectedGalleryItem.title} in your gallery and would like to order it.`, whatsappNum)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md border border-[#F5A800]/40"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
