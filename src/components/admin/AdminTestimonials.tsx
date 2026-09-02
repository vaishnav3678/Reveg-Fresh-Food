import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Plus, Edit2, Trash2, Save, X, Star, CheckCircle2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TestimonialRecord } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveTestimonial, supabaseDeleteTestimonial } from '../../services/supabaseService';

interface AdminTestimonialsProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminTestimonials: React.FC<AdminTestimonialsProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData } = useSiteData();
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>(() => siteData?.testimonials || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    designation: string;
    location: string;
    avatar: string;
    rating: number;
    comment: string;
    event: string;
    isApproved: boolean;
  }>({
    name: '',
    designation: 'Valued Customer',
    location: 'Pune / Mumbai',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    rating: 5,
    comment: '',
    event: 'Diwali Faral & Sweets Order',
    isApproved: true,
  });

  useEffect(() => {
    if (siteData?.testimonials) {
      setTestimonials(siteData.testimonials);
    }
  }, [siteData?.testimonials]);

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      designation: 'Customer',
      location: 'Maharashtra',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      rating: 5,
      comment: '',
      event: 'Diwali Faral Order',
      isApproved: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: TestimonialRecord) => {
    setEditingTestimonial(t);
    setFormData({
      name: t.name,
      designation: t.designation || 'Customer',
      location: t.location || 'Maharashtra',
      avatar: t.avatar,
      rating: t.rating || 5,
      comment: t.comment,
      event: t.event || 'Festive Order',
      isApproved: t.isApproved !== false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      showToast('error', 'Customer name and review text are required');
      return;
    }

    try {
      setIsSaving(true);
      const itemToSave: TestimonialRecord = editingTestimonial
        ? {
            ...editingTestimonial,
            ...formData,
          }
        : {
            id: `test_${Date.now()}`,
            name: formData.name,
            designation: formData.designation,
            location: formData.location,
            avatar: formData.avatar,
            rating: formData.rating,
            comment: formData.comment,
            event: formData.event,
            isApproved: formData.isApproved,
            sortOrder: testimonials.length + 1,
            createdAt: new Date().toISOString(),
          };

      const res = await supabaseSaveTestimonial(itemToSave);
      if (!res.success) {
        showToast('error', res.error || 'Failed to save testimonial in Supabase');
      } else {
        showToast('success', editingTestimonial ? 'Review updated' : 'Review added');
      }

      setIsModalOpen(false);
      await refreshData();

      try {
        if (editingTestimonial) {
          await authFetch(`/api/testimonials/${editingTestimonial.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        } else {
          await authFetch('/api/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        }
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Error saving review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete review from "${name}"?`)) return;
    try {
      const res = await supabaseDeleteTestimonial(id);
      if (!res.success) {
        showToast('error', res.error || 'Failed to delete review in Supabase');
      } else {
        showToast('success', 'Review deleted');
      }
      await refreshData();

      try {
        await authFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      } catch {
        // Static mode
      }
    } catch (err) {
      showToast('error', 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Customer Testimonials & Reviews
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Manage genuine customer experiences, festive praise, and 5-star ratings displayed on the website.
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="admin-add-testimonial-btn"
          className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-[#557060]">Loading reviews...</div>
        ) : (
          testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 border border-[#D5E8DA] shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#F5A800]">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-[#EBF5EE] text-[#0D5B29] px-2 py-0.5 rounded-full">
                    {t.event || 'Review'}
                  </span>
                </div>

                <p className="text-xs text-[#11311D] italic leading-relaxed">
                  "{t.comment}"
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#D5E8DA]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#11311D] block">{t.name}</span>
                    <span className="text-[10px] text-[#557060]">{t.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8F2EA] flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  t.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {t.isApproved ? 'Approved' : 'Hidden'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1 text-[#0D5B29] hover:bg-[#EBF5EE] rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#D5E8DA] z-10">
            <div className="p-6 bg-[#0D5B29] text-white flex items-center justify-between">
              <h3 className="font-cinzel text-lg font-bold">
                {editingTestimonial ? `Edit Review: ${editingTestimonial.name}` : 'Add Review'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Event / Occasion</label>
                  <input
                    type="text"
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    placeholder="e.g. Diwali Faral Box Order"
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                  >
                    <option value={5}>5 Stars ★★★★★</option>
                    <option value={4}>4 Stars ★★★★☆</option>
                    <option value={3}>3 Stars ★★★☆☆</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[#0D5B29] mb-1">Customer Review Comment *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
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
                  className="bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow"
                >
                  {isSaving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
