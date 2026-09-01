import React, { useState, useMemo } from 'react';
import { Search, Filter, MessageCircle, Sparkles, Eye, ArrowUpDown, Tag } from 'lucide-react';
import { Product } from '../types';
import { getWhatsAppUrl, WhatsAppMessages } from '../utils/whatsapp';
import { useSiteData } from '../context/SiteContext';

interface ProductCatalogProps {
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ onSelectProduct }) => {
  const { data: siteData } = useSiteData();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const productsList = siteData?.products || [];
  const categoriesList = siteData?.categories || [];
  const whatsappNum = siteData?.settings?.whatsappNumber || '919403358033';
  const whatsappDisplay = siteData?.settings?.whatsappDisplay || '+91 94033 58033';

  const categoryTabs = useMemo(() => {
    const tabs = [
      { id: 'all', label: 'All Delicacies', count: productsList.length },
    ];

    categoriesList.forEach((cat) => {
      const count = productsList.filter(
        (p) =>
          p.category === cat.slug ||
          p.category === cat.id ||
          p.secondaryCategories?.includes(cat.slug) ||
          p.secondaryCategories?.includes(cat.id)
      ).length;
      tabs.push({
        id: cat.slug || cat.id,
        label: `${cat.icon || '✨'} ${cat.name}`,
        count,
      });
    });

    return tabs;
  }, [productsList, categoriesList]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Category filter
      if (activeCategory !== 'all') {
        const matchesCat =
          product.category === activeCategory ||
          product.secondaryCategories?.includes(activeCategory);
        if (!matchesCat) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTaste = product.tasteProfile?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTaste) return false;
      }

      return true;
    });
  }, [productsList, activeCategory, searchQuery]);

  return (
    <section id="products" className="py-20 bg-[#FAF8F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] text-[#0D5B29] text-xs font-bold uppercase tracking-wider mb-3 border border-[#BCE5C8]">
            <Sparkles className="w-3.5 h-3.5 text-[#F5A800]" />
            <span>Handcrafted Indian Catalogue</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#11311D] tracking-tight">
            Our Traditional Delicacies
          </h2>
          <p className="text-[#4A6354] text-base sm:text-lg mt-3">
            Browse our fresh selection of festive faral, authentic sweets, and crunchy namkeen made with wholesome ingredients by RevEg Fresh Foods.
          </p>
          <div className="w-20 h-1 bg-[#E8590C] mx-auto mt-4 rounded-full" />
        </div>

        {/* Filter and Search Bar Controls */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#D5E8DA] shadow-sm mb-10 space-y-4">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {categoryTabs.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`cat-btn-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#0D5B29] text-white shadow-md'
                        : 'bg-[#F0F7F2] text-[#23382B] hover:bg-[#E3EDE5] border border-[#D5E8DA]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-[#D1E7D7] text-[#0D5B29]'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#557060] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="product-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ladoo, chakli, kaju katli..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF8F2] border border-[#D5E8DA] text-sm text-[#11311D] placeholder-[#6E8A79] focus:outline-none focus:ring-2 focus:ring-[#0D5B29] focus:bg-white transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#557060] hover:text-[#11311D] font-bold"
                >
                  Clear
                </button>
              )}
            </div>

          </div>

          {/* Pricing Disclaimer Banner */}
          <div className="pt-3 border-t border-[#E8F2EA] flex flex-col sm:flex-row items-center justify-between text-xs text-[#4A6354] gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <strong>Fresh Batch Guarantee:</strong> Prepared on order with pure ghee & hygienic standards.
            </span>
            <span className="text-[#E8590C] font-bold bg-[#FFF4EB] px-3 py-1 rounded-full border border-[#FCDDC2]">
              Price on Enquiry • WhatsApp {whatsappDisplay} for daily batch rates
            </span>
          </div>

        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#D5E8DA] p-8">
            <div className="w-16 h-16 rounded-full bg-[#EBF5EE] text-[#0D5B29] flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              🔍
            </div>
            <h3 className="font-cinzel text-xl font-bold text-[#11311D]">No matching delicacies found</h3>
            <p className="text-sm text-[#557060] mt-1">Try searching for different items like Ladoo, Chakli, or Kaju Katli.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-4 px-5 py-2 bg-[#0D5B29] text-white text-xs font-bold rounded-full"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const defaultPack = product.packSizes?.[0] || '250g';
              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-3xl overflow-hidden border border-[#D5E8DA] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image Area */}
                    <div 
                      onClick={() => onSelectProduct(product)}
                      className="relative h-52 sm:h-56 overflow-hidden cursor-pointer bg-[#F0F7F2]"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.isFestiveSpecial && (
                          <span className="bg-[#0D5B29]/95 text-[#F5A800] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow backdrop-blur-sm border border-[#F5A800]/40">
                            Diwali Special
                          </span>
                        )}
                        {product.isPopular && (
                          <span className="bg-[#E8590C]/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow backdrop-blur-sm">
                            Bestseller
                          </span>
                        )}
                      </div>

                      {/* Quick View Hover Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(product);
                        }}
                        className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-[#0D5B29] p-2.5 rounded-full shadow-md transition-transform transform translate-y-12 group-hover:translate-y-0 duration-200"
                        aria-label="View Product Details"
                      >
                        <Eye className="w-4 h-4 text-[#0D5B29]" />
                      </button>
                    </div>

                    {/* Product Content Details */}
                    <div className="p-5">
                      
                      {/* Category & Taste Profile Tag */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#557060] mb-1.5">
                        <span className="uppercase tracking-wider text-[#0D5B29]">
                          {product.category === 'diwali' ? 'Diwali Faral' : product.category === 'sweets' ? 'Traditional Sweet' : 'Crunchy Namkeen'}
                        </span>
                        {product.tasteProfile && (
                          <span className="text-[#E8590C] font-semibold truncate max-w-[140px]">
                            {product.tasteProfile}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="font-cinzel text-lg font-bold text-[#11311D] group-hover:text-[#E8590C] transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#4A6354] mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Pack Size Pills */}
                      <div className="mt-3 pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-[#557060]">Sizes:</span>
                        {product.packSizes?.map((size, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold bg-[#F0F7F2] text-[#0D5B29] px-2 py-0.5 rounded border border-[#D5E8DA]"
                          >
                            {size}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Card Bottom CTA & Pricing */}
                  <div className="px-5 pb-5 pt-2 border-t border-[#E8F2EA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-[#6E8A79]">Price</span>
                        <span className="text-xs font-bold text-[#E8590C]">
                          {product.price ? `₹${product.price}` : 'Price on Enquiry'}
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectProduct(product)}
                        className="text-xs font-bold text-[#0D5B29] hover:text-[#E8590C] underline"
                      >
                        View Details
                      </button>
                    </div>

                    {/* WhatsApp Inquiry Button for this Specific Product */}
                    <a
                      id={`product-whatsapp-btn-${product.id}`}
                      href={getWhatsAppUrl(WhatsAppMessages.productInquiry(product.name, defaultPack), whatsappNum)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all duration-200 transform hover:scale-[1.02] border border-[#F5A800]/40"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Enquire on WhatsApp</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
