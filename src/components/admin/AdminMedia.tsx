import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, ExternalLink, Plus } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { MediaItem } from '../../server/db';

interface AdminMediaProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminMedia: React.FC<AdminMediaProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('name', file.name);

      const res = await authFetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        showToast('success', `"${file.name}" uploaded successfully`);
        await fetchMedia();
      } else {
        showToast('error', 'Failed to upload image file');
      }
    } catch (err) {
      showToast('error', 'Error during upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('info', 'Image URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const res = await authFetch(`/api/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Media deleted');
        setMediaList((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      showToast('error', 'Failed to delete media');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Upload */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Media & Image Asset Manager
          </h2>
          <p className="text-xs text-[#557060] mt-0.5">
            Upload and manage product photos, festive banners, and gallery pictures.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            id="admin-upload-media-btn"
            className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-transform hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading Image...' : 'Upload New Photo'}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-[#BCE5C8] rounded-3xl bg-[#FAF8F2] hover:bg-[#EBF5EE] transition-colors cursor-pointer text-center space-y-2 group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#D5E8DA] text-[#0D5B29] flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-[#11311D]">Click to select or upload food photography</p>
        <p className="text-[10px] text-[#557060]">PNG, JPG, WEBP, or SVG up to 10MB</p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-xs text-[#557060]">Loading media...</div>
        ) : (
          mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#D5E8DA] overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-all"
            >
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-2.5 space-y-1">
                <span className="text-[11px] font-bold text-[#11311D] block truncate" title={item.name}>
                  {item.name}
                </span>
                <span className="text-[9px] text-[#557060] block font-mono">
                  {item.size ? `${Math.round(item.size / 1024)} KB` : 'Asset'}
                </span>
              </div>

              <div className="p-2 bg-[#FAF8F2] border-t border-[#E8F2EA] flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(item.url, item.id)}
                  title="Copy URL"
                  className="p-1 text-[#0D5B29] hover:bg-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Copy</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  title="Delete"
                  className="p-1 text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
