import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Tag,
  Scale,
  Save,
  AlertCircle,
  Upload,
  Loader2,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ProductItem } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveProduct, supabaseDeleteProduct } from '../../services/supabaseService';
import { resolveMediaUrl, resolveApiUrl } from '../../utils/mediaUrl';
import { triggerSiteSync } from '../../utils/syncEvent';

interface AdminProductsProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData } = useSiteData();
  const [products, setProducts] = useState<ProductItem[]>(() => {
    return siteData?.products || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      showToast('error', 'Only JPG, JPEG, PNG, and WEBP formats are supported');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 10MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);
      uploadFormData.append('type', 'products');

      let res = await fetch(resolveApiUrl('api/upload-product.php'), {
        method: 'POST',
        body: uploadFormData,
      });

      if (!res.ok) {
        res = await fetch(resolveApiUrl('api/upload-hero.php'), {
          method: 'POST',
          body: uploadFormData,
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormData((prev) => ({ ...prev, image: data.url }));
          showToast('success', 'Product image uploaded successfully');
          return;
        }
      }
      showToast('error', 'Upload failed. Please check file format.');
    } catch (err: any) {
      console.error('Image upload error:', err);
      showToast('error', 'Failed to upload image to server');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: 'diwali' | 'sweets' | 'namkeen';
    secondaryCategories: string[];
    description: string;
    detailedDescription: string;
    image: string;
    isPopular: boolean;
    isFestiveSpecial: boolean;
    packSizes: string[];
    tasteProfile: string;
    ingredientsHighlight: string[];
    texture: string;
    price: string;
    discountPrice: string;
    quantity: string;
    priceGuide: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    category: 'sweets',
    secondaryCategories: [],
    description: '',
    detailedDescription: '',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
    isPopular: false,
    isFestiveSpecial: false,
    packSizes: ['250g', '500g', '1 kg'],
    tasteProfile: '',
    ingredientsHighlight: [],
    texture: '',
    price: '',
    discountPrice: '',
    quantity: 'In Stock (Fresh Batches Daily)',
    priceGuide: '',
    status: 'active',
  });

  const [newPackSize, setNewPackSize] = useState('');
  const [newIngredient, setNewIngredient] = useState('');

  const loadProducts = React.useCallback(async () => {
    try {
      let res = await fetch(resolveApiUrl('api/products.php'));
      if (!res.ok) {
        res = await fetch(resolveApiUrl('api/products'));
      }
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
          return;
        }
      }
    } catch {}
    if (siteData?.products) {
      setProducts(siteData.products);
    }
  }, [siteData?.products]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'sweets',
      secondaryCategories: [],
      description: '',
      detailedDescription: '',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      isPopular: false,
      isFestiveSpecial: false,
      packSizes: ['250g', '500g', '1 kg'],
      tasteProfile: '',
      ingredientsHighlight: [],
      texture: '',
      price: '',
      discountPrice: '',
      quantity: 'In Stock (Fresh Batches Daily)',
      priceGuide: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      secondaryCategories: product.secondaryCategories || [],
      description: product.description,
      detailedDescription: product.detailedDescription || '',
      image: product.image,
      isPopular: !!product.isPopular,
      isFestiveSpecial: !!product.isFestiveSpecial,
      packSizes: product.packSizes || ['500g'],
      tasteProfile: product.tasteProfile || '',
      ingredientsHighlight: product.ingredientsHighlight || [],
      texture: product.texture || '',
      price: (product as any).price ? String((product as any).price) : '',
      discountPrice: (product as any).discountPrice ? String((product as any).discountPrice) : '',
      quantity: (product as any).quantity || 'In Stock (Fresh Batches Daily)',
      priceGuide: product.priceGuide || '',
      status: product.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Product name is required');
      return;
    }

    try {
      setIsSaving(true);
      const prodToSave: ProductItem = editingProduct
        ? {
            ...editingProduct,
            ...formData,
          }
        : {
            id: `prod_${Date.now()}`,
            name: formData.name,
            category: formData.category,
            secondaryCategories: formData.secondaryCategories,
            description: formData.description,
            detailedDescription: formData.detailedDescription,
            image: formData.image,
            isPopular: formData.isPopular,
            isFestiveSpecial: formData.isFestiveSpecial,
            packSizes: formData.packSizes,
            tasteProfile: formData.tasteProfile,
            ingredientsHighlight: formData.ingredientsHighlight,
            texture: formData.texture,
            priceGuide: formData.priceGuide,
            status: formData.status,
            sortOrder: products.length + 1,
          };

      // 1. Primary: Save to PHP / Express database
      try {
        if (editingProduct) {
          const res = await authFetch(`/api/products.php?id=${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          if (!res.ok) {
            await authFetch(`/api/products/${editingProduct.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
          }
        } else {
          const res = await authFetch('/api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          if (!res.ok) {
            await authFetch('/api/products', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData),
            });
          }
        }
      } catch (err) {
        console.warn('Backend save notice:', err);
      }

      // 2. Also sync to Supabase if active
      try {
        await supabaseSaveProduct(prodToSave);
      } catch {}

      showToast('success', editingProduct ? 'Product updated successfully' : 'Product added successfully');
      setIsModalOpen(false);

      // 3. Immediately refresh site context and broadcast sync so changes reflect everywhere
      await refreshData();
      await loadProducts();
      triggerSiteSync('product_saved');
    } catch (err) {
      console.error('Error saving product:', err);
      showToast('error', 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      try {
        const res = await authFetch(`/api/products.php?id=${id}&action=delete`, { method: 'POST' });
        if (!res.ok) {
          await authFetch(`/api/products/${id}`, { method: 'DELETE' });
        }
      } catch {}

      try {
        await supabaseDeleteProduct(id);
      } catch {}

      showToast('success', `"${name}" removed from catalogue`);
      await refreshData();
      await loadProducts();
      triggerSiteSync('product_deleted');
    } catch (err) {
      showToast('error', 'Error deleting product');
    }
  };

  const handleToggleStatus = async (product: ProductItem) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = { ...product, status: nextStatus as 'active' | 'inactive' };
      try {
        const res = await authFetch(`/api/products.php?id=${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) {
          await authFetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
          });
        }
      } catch {}

      try {
        await supabaseSaveProduct(updated);
      } catch {}

      showToast('info', `${product.name} is now ${nextStatus}`);
      await refreshData();
      await loadProducts();
      triggerSiteSync('product_status');
    } catch (err) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleAddPackSize = () => {
    if (newPackSize.trim() && !formData.packSizes.includes(newPackSize.trim())) {
      setFormData({
        ...formData,
        packSizes: [...formData.packSizes, newPackSize.trim()],
      });
      setNewPackSize('');
    }
  };

  const handleRemovePackSize = (size: string) => {
    setFormData({
      ...formData,
      packSizes: formData.packSizes.filter((s) => s !== size),
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim() && !formData.ingredientsHighlight.includes(newIngredient.trim())) {
      setFormData({
        ...formData,
        ingredientsHighlight: [...formData.ingredientsHighlight, newIngredient.trim()],
      });
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    setFormData({
      ...formData,
      ingredientsHighlight: formData.ingredientsHighlight.filter((i) => i !== ing),
    });
  };

  // Filtered list
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === 'all' ||
      prod.category === categoryFilter ||
      (prod.secondaryCategories && prod.secondaryCategories.includes(categoryFilter));
    const matchesStatus = statusFilter === 'all' || prod.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Products Catalogue Management
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Add, update, or remove sweets, faral, and namkeen products with custom pack sizes and images.
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="admin-add-new-product-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5E8DA] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#557060] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-xs text-[#11311D] focus:outline-none focus:ring-1 focus:ring-[#0D5B29]"
          />
        </div>

        {/* Categories & Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-[#11311D] font-medium"
          >
            <option value="all">All Categories</option>
            <option value="diwali">Diwali Faral</option>
            <option value="sweets">Traditional Sweets</option>
            <option value="namkeen">Namkeen</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-[#FAF8F2] border border-[#D5E8DA] rounded-xl text-[#11311D] font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

      </div>

      {/* Products Table / Cards */}
      <div className="bg-white rounded-3xl border border-[#D5E8DA] shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#557060]">Loading products catalogue...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-[#557060]">No products match your current filters.</p>
            <button onClick={openAddModal} className="text-xs font-bold text-[#0D5B29] underline">
              Add your first product now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] border-b border-[#E8F2EA] text-[#0D5B29] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price & Stock</th>
                  <th className="py-3.5 px-4">Pack Sizes</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F2EA]">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAF8F2]/60 transition-colors">
                    
                    {/* Product Name & Image */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveMediaUrl(product.image)}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#D5E8DA] shrink-0"
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=100';
                          }}
                        />
                        <div>
                          <span className="font-bold text-sm text-[#11311D] block">
                            {product.name}
                          </span>
                          <span className="text-[11px] text-[#557060] line-clamp-1 max-w-xs">
                            {product.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-semibold text-[#0D5B29] bg-[#EBF5EE] px-2.5 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </td>

                    {/* Price & Stock */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#11311D]">
                        {(product as any).price
                          ? (String((product as any).price).startsWith('₹') ? (product as any).price : `₹${(product as any).price}`)
                          : (product as any).priceGuide || 'On Enquiry'}
                      </div>
                      {(product as any).discountPrice && (
                        <div className="text-[10px] line-through text-gray-400 font-medium">
                          {String((product as any).discountPrice).startsWith('₹') ? (product as any).discountPrice : `₹${(product as any).discountPrice}`}
                        </div>
                      )}
                      <span className="text-[10px] text-[#557060] font-medium block">
                        {(product as any).quantity || 'In Stock'}
                      </span>
                    </td>

                    {/* Pack sizes */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {product.packSizes.map((size) => (
                          <span key={size} className="text-[10px] font-semibold bg-gray-100 px-1.5 py-0.5 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        {product.isFestiveSpecial && (
                          <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full w-max">
                            Festive Faral
                          </span>
                        )}
                        {product.isPopular && (
                          <span className="text-[9px] font-extrabold uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full w-max">
                            Popular Choice
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(product)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          product.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.status === 'active' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg text-[#0D5B29] hover:bg-[#EBF5EE] transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />

          <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10 my-8">
            
            {/* Modal Header */}
            <div className="p-6 bg-[#0D5B29] text-white flex items-center justify-between">
              <div>
                <h3 className="font-cinzel text-xl font-bold">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Delicacy Product'}
                </h3>
                <span className="text-xs text-[#F5A800]">
                  Changes will immediately sync to the live website
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Besan Ladoo"
                    className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:ring-1 focus:ring-[#0D5B29]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Primary Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D] font-medium"
                  >
                    <option value="diwali">Diwali Faral</option>
                    <option value="sweets">Traditional Sweets</option>
                    <option value="namkeen">Crunchy Namkeen</option>
                  </select>
                </div>
              </div>

              {/* Product Pricing & Stock Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F2] p-4 rounded-2xl border border-[#D5E8DA]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 240 or ₹240"
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:border-[#0D5B29]"
                  />
                  <span className="text-[10px] text-[#557060]">Displayed to customers</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Discount / Original Price (₹)
                  </label>
                  <input
                    type="text"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="e.g. 280 (strikethrough)"
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:border-[#0D5B29]"
                  />
                  <span className="text-[10px] text-[#557060]">Optional strikethrough</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Stock / Quantity Status
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. In Stock (Fresh Daily)"
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:border-[#0D5B29]"
                  />
                  <span className="text-[10px] text-[#557060]">Inventory availability</span>
                </div>
              </div>

              {/* Product Image Management: Upload, Replace, Delete, Preview */}
              <div className="space-y-3 bg-[#FAF8F2] p-4 rounded-2xl border border-[#D5E8DA]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29]">
                    Product Image (Dynamic & Managed) *
                  </label>
                  <span className="text-[10px] text-[#557060]">Supports JPG, PNG, WEBP (Max 10MB)</span>
                </div>

                {/* Preview Box & Image Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#D5E8DA] shadow-sm bg-white shrink-0 group">
                    <img
                      src={resolveMediaUrl(formData.image)}
                      alt="Product Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=200';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Preview
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* Action Buttons: Upload, Replace, Delete */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D5B29] text-white text-xs font-semibold hover:bg-[#083E1B] transition-colors disabled:opacity-50 shadow-sm"
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : formData.image && formData.image !== 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80' ? (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Image</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>

                      {formData.image && formData.image !== 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80' && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
                            }));
                            showToast('info', 'Product image reset to default delicacy visual');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>Delete / Reset Image</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-[#557060]">
                      Current Path: <code className="bg-white px-2 py-0.5 rounded border border-[#D5E8DA] text-[#11311D] text-[10px] break-all">{formData.image || '(No image)'}</code>
                    </div>
                  </div>
                </div>

                {/* Direct Path or URL Edit */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A6354] mb-1">
                    Or edit direct path / CDN URL:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="uploads/products/... or https://..."
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#D5E8DA] text-[#11311D] focus:outline-none focus:border-[#0D5B29]"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                  Short Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="One sentence summary for catalog cards..."
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D]"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                  Detailed Description (Modal View)
                </label>
                <textarea
                  rows={3}
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  placeholder="Detailed heritage recipe, texture, and preparation story..."
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D]"
                />
              </div>

              {/* Pack Sizes tag manager */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                  Pack Sizes Available
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.packSizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center gap-1 text-xs bg-[#EBF5EE] text-[#0D5B29] font-bold px-2.5 py-1 rounded-lg border border-[#BCE5C8]"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => handleRemovePackSize(size)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPackSize}
                    onChange={(e) => setNewPackSize(e.target.value)}
                    placeholder="e.g. 500g, 1 kg, Box of 12"
                    className="text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddPackSize}
                    className="px-3 py-2 bg-[#0D5B29] text-white rounded-xl text-xs font-bold"
                  >
                    Add Size
                  </button>
                </div>
              </div>

              {/* Taste profile & Texture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Taste Profile
                  </label>
                  <input
                    type="text"
                    value={formData.tasteProfile}
                    onChange={(e) => setFormData({ ...formData, tasteProfile: e.target.value })}
                    placeholder="e.g. Rich, aromatic, melt-in-mouth"
                    className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                    Texture
                  </label>
                  <input
                    type="text"
                    value={formData.texture}
                    onChange={(e) => setFormData({ ...formData, texture: e.target.value })}
                    placeholder="e.g. Crispy & flaky, non-oily"
                    className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  />
                </div>
              </div>

              {/* Ingredients highlights */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                  Key Ingredients Highlights
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.ingredientsHighlight.map((ing) => (
                    <span
                      key={ing}
                      className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-900 font-semibold px-2.5 py-1 rounded-lg border border-amber-200"
                    >
                      {ing}
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(ing)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="e.g. Pure Desi Ghee, Kashmir Saffron"
                    className="text-xs p-2 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-2 bg-[#0D5B29] text-white rounded-xl text-xs font-bold"
                  >
                    Add Ingredient
                  </button>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#D5E8DA] bg-[#FAF8F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFestiveSpecial}
                    onChange={(e) => setFormData({ ...formData, isFestiveSpecial: e.target.checked })}
                    className="rounded text-[#0D5B29] focus:ring-[#0D5B29]"
                  />
                  <span className="text-xs font-bold text-[#11311D]">Festive Faral Special</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#D5E8DA] bg-[#FAF8F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded text-[#0D5B29] focus:ring-[#0D5B29]"
                  />
                  <span className="text-xs font-bold text-[#11311D]">Popular Choice</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#D5E8DA] bg-[#FAF8F2] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })
                    }
                    className="rounded text-[#0D5B29] focus:ring-[#0D5B29]"
                  />
                  <span className="text-xs font-bold text-[#11311D]">Active on Website</span>
                </label>
              </div>

              {/* Modal Submit */}
              <div className="pt-4 border-t border-[#E8F2EA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#557060] hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md border border-[#F5A800]/40 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
