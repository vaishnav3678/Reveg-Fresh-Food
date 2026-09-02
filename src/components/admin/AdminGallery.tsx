import React, { useState, useEffect } from 'react';
import { Camera, Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { GalleryItemRecord } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { getStoredSiteData, saveStoredSiteData } from '../../utils/localStore';

interface AdminGalleryProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminGallery: React.FC<AdminGalleryProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { refreshData } = useSiteData();
  const [gallery, setGallery] = useState<GalleryItemRecord[]>(() => getStoredSiteData().gallery || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItemRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    image: string;
    description: string;
    isEnabled: boolean;
  }>({
    title: '',
    category: 'Sweets',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800',
    description: '',
    isEnabled: true,
  });

  const fetchGallery = async () => {
    const local = getStoredSiteData().gallery || [];
    setGallery(local);

    try {
      const res = await authFetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGallery(data);
          saveStoredSiteData({ gallery: data });
        }
      }
    } catch {
      // Static mode
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'Sweets',
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800',
      description: '',
      isEnabled: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItemRecord) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      image: item.image,
      description: item.description || '',
      isEnabled: item.isEnabled !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('error', 'Title is required');
      return;
    }

    try {
      setIsSaving(true);
      const current = getStoredSiteData().gallery || [];
      let updated: GalleryItemRecord[];

      if (editingItem) {
        updated = current.map((g) =>
          g.id === editingItem.id ? { ...g, ...formData } : g
        );
      } else {
        const newItem: GalleryItemRecord = {
          id: `gal_${Date.now()}`,
          title: formData.title,
          category: formData.category,
          image: formData.image,
          description: formData.description,
          isEnabled: formData.isEnabled,
          sortOrder: current.length + 1,
        };
        updated = [...current, newItem];
      }

      saveStoredSiteData({ gallery: updated });
      setGallery(updated);
      showToast('success', editingItem ? 'Gallery item updated' : 'Photo added to gallery');
      setIsModalOpen(false);
      await refreshData();

      try {
        if (editingItem) {
          await authFetch(`/api/gallery/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        } else {
          await authFetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        }
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving photo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      const current = getStoredSiteData().gallery || [];
      const updated = current.filter((g) => g.id !== id);
      saveStoredSiteData({ gallery: updated });
      setGallery(updated);
      showToast('success', 'Photo removed');
      await refreshData();

      try {
        await authFetch(`/api/gallery/${id}`, { method: 'DELETE' });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Failed to delete photo');
    }
  };

  const filteredGallery = gallery.filter((item) => {
    if (filterCat === 'all') return true;
    return item.category.toLowerCase() === filterCat.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Photo Gallery Management
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Showcase vibrant high-resolution photography of pure sweets, Diwali faral, and gift arrangements.
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="admin-add-gallery-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-[#557060]">Loading gallery...</div>
        ) : (
          filteredGallery.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#D5E8DA] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[10px] font-extrabold uppercase px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg">
                  {item.category}
                </span>
                {!item.isEnabled && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 bg-red-600 text-white rounded-full">
                    Hidden
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <h4 className="font-cinzel text-sm font-bold text-[#11311D] line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-[#557060] line-clamp-2">{item.description}</p>
              </div>

              <div className="px-4 py-3 bg-[#FAF8F2] border-t border-[#E8F2EA] flex items-center justify-between">
                <span className="text-[10px] text-[#557060]">Order: #{item.sortOrder}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-[#0D5B29] hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1 text-red-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
          <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10">
            <div className="p-6 bg-[#0D5B29] text-white flex items-center justify-between">
              <h3 className="font-cinzel text-lg font-bold">
                {editingItem ? 'Edit Gallery Photo' : 'Add Food Photo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Freshly Fried Chakli"
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                >
                  <option value="Sweets">Sweets</option>
                  <option value="Faral">Diwali Faral</option>
                  <option value="Namkeen">Namkeen</option>
                  <option value="Festive Box">Festive Gift Boxes</option>
                  <option value="Kitchen">Kitchen & Making</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Caption for food detail..."
                  className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                />
                <span className="text-xs font-bold text-[#11311D]">Visible in Public Gallery</span>
              </label>

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
                  className="bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  {isSaving ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
