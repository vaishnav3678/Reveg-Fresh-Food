import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Save, X, Sparkles, Check } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { CategoryItem } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveCategory, supabaseDeleteCategory } from '../../services/supabaseService';

interface AdminCategoriesProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData } = useSiteData();
  const [categories, setCategories] = useState<CategoryItem[]>(() => siteData?.categories || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    tagline: string;
    description: string;
    badge: string;
    iconName: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    badge: 'Delicacy',
    iconName: 'Sparkles',
    status: 'active',
  });

  useEffect(() => {
    if (siteData?.categories) {
      setCategories(siteData.categories);
    }
  }, [siteData?.categories]);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      badge: 'Specialty',
      iconName: 'Sparkles',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline || '',
      description: cat.description || '',
      badge: cat.badge || 'Delicacy',
      iconName: cat.iconName || 'Sparkles',
      status: cat.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    try {
      setIsSaving(true);
      const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const catToSave: CategoryItem = editingCategory
        ? {
            ...editingCategory,
            ...formData,
            slug,
          }
        : {
            id: `cat_${Date.now()}`,
            name: formData.name,
            slug,
            tagline: formData.tagline,
            description: formData.description,
            badge: formData.badge,
            iconName: formData.iconName,
            items: [],
            sampleProducts: [],
            status: formData.status,
            sortOrder: categories.length + 1,
          };

      const res = await supabaseSaveCategory(catToSave);
      if (!res.success) {
        showToast('error', res.error || 'Failed to save category in Supabase');
      } else {
        showToast('success', editingCategory ? 'Category updated' : 'Category created');
      }

      setIsModalOpen(false);
      await refreshData();

      try {
        if (editingCategory) {
          await authFetch(`/api/categories/${editingCategory.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, slug }),
          });
        } else {
          await authFetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, slug }),
          });
        }
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await supabaseDeleteCategory(id);
      if (!res.success) {
        showToast('error', res.error || 'Failed to delete category in Supabase');
      } else {
        showToast('success', `Category "${name}" deleted`);
      }
      await refreshData();

      try {
        await authFetch(`/api/categories/${id}`, { method: 'DELETE' });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Categories Management
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Configure primary menu categories, banners, badges, and catalog groupings.
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="admin-add-new-category-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-[#557060]">Loading categories...</div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-3xl p-6 border border-[#D5E8DA] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-[#EBF5EE] text-[#0D5B29] rounded-lg border border-[#BCE5C8]">
                    {cat.badge || 'Category'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cat.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-cinzel text-lg font-bold text-[#11311D]">{cat.name}</h3>
                  <p className="text-xs text-[#E8590C] font-semibold">{cat.tagline}</p>
                </div>

                <p className="text-xs text-[#4A6354] leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8F2EA] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#557060]">slug: /{cat.slug}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 text-[#0D5B29] hover:bg-[#EBF5EE] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10">
            <div className="p-6 bg-[#0D5B29] text-white flex items-center justify-between">
              <h3 className="font-cinzel text-lg font-bold">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Traditional Sweets"
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. traditional-sweets"
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Pure Ghee Indian Delicacies"
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Authentic Faral"
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of delicacies in this group..."
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#557060]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
