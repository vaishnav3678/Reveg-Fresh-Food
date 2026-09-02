import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ProductItem } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { getStoredSiteData, saveStoredSiteData } from '../../utils/localStore';

interface AdminProductsProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [products, setProducts] = useState<ProductItem[]>(() => {
    return getStoredSiteData().products || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
    priceGuide: '',
    status: 'active',
  });

  const [newPackSize, setNewPackSize] = useState('');
  const [newIngredient, setNewIngredient] = useState('');

  const fetchProducts = async () => {
    const local = getStoredSiteData().products || [];
    setProducts(local);

    try {
      const res = await authFetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          saveStoredSiteData({ products: data });
        }
      }
    } catch {
      // Backend not running (static deployment) -> localStore is authoritative
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      const currentList = getStoredSiteData().products || [];
      let updatedList: ProductItem[];

      if (editingProduct) {
        updatedList = currentList.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...formData,
              }
            : p
        );
      } else {
        const newProd: ProductItem = {
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
          sortOrder: currentList.length + 1,
        };
        updatedList = [newProd, ...currentList];
      }

      // Save immediately to static storage & trigger site sync
      saveStoredSiteData({ products: updatedList });
      setProducts(updatedList);
      showToast('success', editingProduct ? 'Product updated successfully' : 'Product added successfully');
      setIsModalOpen(false);
      await refreshData();

      // Optional backend sync if server exists
      try {
        if (editingProduct) {
          await authFetch(`/api/products/${editingProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        } else {
          await authFetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        }
      } catch {
        // Ignored in static mode
      }
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
      const currentList = getStoredSiteData().products || [];
      const updatedList = currentList.filter((p) => p.id !== id);
      saveStoredSiteData({ products: updatedList });
      setProducts(updatedList);
      showToast('success', `"${name}" removed from catalogue`);
      await refreshData();

      try {
        await authFetch(`/api/products/${id}`, { method: 'DELETE' });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error deleting product');
    }
  };

  const handleToggleStatus = async (product: ProductItem) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const currentList = getStoredSiteData().products || [];
      const updatedList = currentList.map((p) => (p.id === product.id ? { ...p, status: nextStatus as any } : p));
      saveStoredSiteData({ products: updatedList });
      setProducts(updatedList);
      showToast('info', `${product.name} is now ${nextStatus}`);
      await refreshData();

      try {
        await authFetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch {
        // Static mode
      }
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
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#D5E8DA] shrink-0"
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

              {/* Image URL & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1">
                  Product Image URL *
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or /uploads/..."
                    className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] text-[#11311D]"
                  />
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-11 h-11 rounded-xl object-cover border border-[#D5E8DA] shrink-0"
                    onError={(e: any) => {
                      e.target.src = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=100';
                    }}
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
