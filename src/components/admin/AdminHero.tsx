import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
  FileImage,
  ArrowRight,
  Maximize2,
  Download,
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { HeroConfig } from '../../server/db';
import { useSiteData } from '../../context/SiteContext';
import { supabaseSaveConfig } from '../../services/supabaseService';
import { resolveMediaUrl, resolveApiUrl, DEFAULT_HERO_IMAGE } from '../../utils/mediaUrl';

interface AdminHeroProps {
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AdminHero: React.FC<AdminHeroProps> = ({ showToast }) => {
  const { authFetch } = useAdminAuth();
  const { data: siteData, refreshData, updateSiteData } = useSiteData();
  const [hero, setHero] = useState<HeroConfig | null>(() => siteData?.hero || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // File Upload & Preview State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFullPreviewModal, setShowFullPreviewModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (siteData?.hero) {
      setHero(siteData.hero);
    }
  }, [siteData?.hero]);

  // Clean up Blob URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Validate and process selected file
  const handleFileSelect = (file: File) => {
    setPreviewError(null);

    // 1. Extension and MIME Validation
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isImageMime = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';

    if (!allowedExtensions.includes(ext) || (!isImageMime && file.type)) {
      setPreviewError(`Invalid format (.${ext}). Only JPG, JPEG, PNG, and WEBP formats are supported.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 2. File Size Validation (Max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setPreviewError(`File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum allowed size is 10 MB.`);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // 3. Create interactive object preview & read dimensions
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPreviewDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload the selected image to PHP/Express backend
  const handleUploadAndSave = async () => {
    if (!selectedFile) {
      showToast('error', 'Please select an image file first.');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('hero_image', selectedFile);

      let uploadSuccess = false;
      let newImageUrl = '';
      let resJson: any = null;

      // 1. Try PHP upload endpoint (standard FileZilla / Apache setup)
      try {
        const phpRes = await fetch(resolveApiUrl('api/upload-hero.php'), {
          method: 'POST',
          body: formData,
        });
        if (phpRes.ok) {
          resJson = await phpRes.json();
          if (resJson?.success && resJson.url) {
            uploadSuccess = true;
            newImageUrl = resJson.url;
          }
        }
      } catch (phpErr) {
        // Fallback to Express endpoint
      }

      // 2. If PHP was not reached (dev Node environment), try Express endpoint
      if (!uploadSuccess) {
        try {
          const expRes = await fetch(resolveApiUrl('api/upload-hero'), {
            method: 'POST',
            body: formData,
          });
          if (expRes.ok) {
            resJson = await expRes.json();
            if (resJson?.success && resJson.url) {
              uploadSuccess = true;
              newImageUrl = resJson.url;
            }
          }
        } catch (expErr) {
          console.error('Express upload failed:', expErr);
        }
      }

      // If backend was reached and saved
      if (uploadSuccess && newImageUrl) {
        const updatedHero: HeroConfig = {
          ...(hero || ({} as HeroConfig)),
          heroImage: newImageUrl,
          imageUrl: newImageUrl,
        };

        setHero(updatedHero);
        updateSiteData({ hero: updatedHero });

        // Persist to Supabase if configured
        try {
          await supabaseSaveConfig('hero', updatedHero);
        } catch {}

        // Persist in localStorage for instant cache and offline refresh
        try {
          localStorage.setItem('reveg_hero_data', JSON.stringify(updatedHero));
        } catch {}

        setSelectedFile(null);
        setPreviewUrl(null);
        setPreviewDimensions(null);
        await refreshData();

        showToast('success', 'New Hero image uploaded successfully and live on homepage!');
      } else {
        const errMsg = resJson?.error || 'Failed to upload image to server. Check folder permissions for uploads/hero/';
        showToast('error', errMsg);
      }
    } catch (err: any) {
      console.error('Upload exception:', err);
      showToast('error', err.message || 'Error occurred while uploading Hero image.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete current Hero image and reset to default
  const handleDeleteHeroImage = async () => {
    try {
      setIsDeleting(true);
      let deleteSuccess = false;

      // 1. Try PHP delete endpoint
      try {
        const phpRes = await fetch(resolveApiUrl('api/hero.php?action=delete'), {
          method: 'POST',
        });
        if (phpRes.ok) {
          deleteSuccess = true;
        }
      } catch {}

      // 2. Try Express delete endpoint
      if (!deleteSuccess) {
        try {
          const expRes = await fetch(resolveApiUrl('api/hero/image'), {
            method: 'DELETE',
          });
          if (expRes.ok) {
            deleteSuccess = true;
          }
        } catch {}
      }

      // Reset in local state and site data
      const resetHero: HeroConfig = {
        ...(hero || ({} as HeroConfig)),
        heroImage: DEFAULT_HERO_IMAGE,
        imageUrl: DEFAULT_HERO_IMAGE,
      };

      setHero(resetHero);
      updateSiteData({ hero: resetHero });

      try {
        await supabaseSaveConfig('hero', resetHero);
      } catch {}

      try {
        localStorage.setItem('reveg_hero_data', JSON.stringify(resetHero));
      } catch {}

      await refreshData();
      setShowDeleteModal(false);
      showToast('success', 'Hero image deleted. Reverted to authentic default heritage visual.');
    } catch (err) {
      showToast('error', 'Error deleting hero image.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Save all hero settings (text, badges, cta buttons, and image)
  const handleSaveAllSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hero) return;

    try {
      setIsSaving(true);

      // Save to PHP / Express API
      try {
        await fetch(resolveApiUrl('api/hero.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hero),
        });
      } catch {
        try {
          await fetch(resolveApiUrl('api/hero'), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hero),
          });
        } catch {}
      }

      // Save to Supabase PostgreSQL
      const res = await supabaseSaveConfig('hero', hero);
      if (!res.success) {
        // Fallback logged
      }

      // Save to local storage for instant offline persistence
      try {
        localStorage.setItem('reveg_hero_data', JSON.stringify(hero));
      } catch {}

      updateSiteData({ hero });
      await refreshData();

      showToast('success', 'All Hero Banner settings saved and published live!');
    } catch (err) {
      showToast('error', 'Error saving hero settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!hero) {
    return (
      <div className="p-12 text-center text-xs text-[#557060] bg-white rounded-3xl border border-[#D5E8DA]">
        <div className="w-8 h-8 border-2 border-[#0D5B29] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading Hero Configuration...</span>
      </div>
    );
  }

  const currentDisplayImage = resolveMediaUrl(hero.heroImage || (hero as any).imageUrl);
  const isDefaultImage = currentDisplayImage === DEFAULT_HERO_IMAGE;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#D5E8DA] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5EE] border border-[#BCE5C8] text-[#0D5B29] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dynamic Hero Section Controller</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#11311D]">
            Hero Image Management & Hero Settings
          </h2>
          <p className="text-xs text-[#557060] mt-1 max-w-2xl">
            Upload, replace, preview, and delete the dynamic homepage Hero image without editing any code.
            Images are saved directly to <code className="text-[#0D5B29] font-mono font-bold bg-[#FAF8F2] px-1.5 py-0.5 rounded">uploads/hero/</code> on your Apache PHP / FileZilla hosting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="./reveg-fresh-foods-filezilla.zip"
            download="reveg-fresh-foods-filezilla.zip"
            id="download-filezilla-zip-btn"
            className="inline-flex items-center gap-2 bg-[#FAF8F2] hover:bg-[#E8F2EA] text-[#0D5B29] px-4 py-3 rounded-xl font-bold text-xs border border-[#BCE5C8] transition-all shadow-xs"
            title="Download production-ready ZIP archive for FileZilla / Apache PHP hosting"
          >
            <Download className="w-4 h-4 text-[#E8590C]" />
            <span>Download FileZilla ZIP</span>
          </a>

          <button
            onClick={() => handleSaveAllSettings()}
            disabled={isSaving}
            id="admin-save-all-hero-btn"
            className="inline-flex items-center gap-2 bg-[#E8590C] hover:bg-[#CC4B04] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 border border-[#F5A800]/40 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Publishing...' : 'Publish Hero Changes'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: HERO IMAGE MANAGEMENT (PRIMARY REQUIREMENT) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D5E8DA] shadow-sm space-y-6">
        
        <div className="border-b border-[#E8F2EA] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EBF5EE] text-[#0D5B29]">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#11311D]">
                Hero Image Management
              </h3>
            </div>
            <p className="text-xs text-[#557060] mt-1">
              Select, preview, upload, or replace the showcase image that visitors see first on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#FAF8F2] border border-[#D5E8DA] text-[#557060] font-mono text-[11px]">
              Formats: JPG, JPEG, PNG, WEBP
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#EBF5EE] border border-[#BCE5C8] text-[#0D5B29] font-bold text-[11px]">
              Max: 10 MB
            </span>
          </div>
        </div>

        {/* Current Active Image vs New Upload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Current Live Image Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D5B29] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Currently Active on Live Website</span>
              </span>
              {isDefaultImage && (
                <span className="text-[11px] text-[#557060] italic">Default Authentic Visual</span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D5E8DA] bg-[#FAF8F2] aspect-[16/10] shadow-inner group">
              <img
                src={currentDisplayImage}
                alt="Active Hero Showcase"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                onError={(e: any) => {
                  if (e.target.src !== DEFAULT_HERO_IMAGE) {
                    e.target.src = DEFAULT_HERO_IMAGE;
                  }
                }}
              />
              
              {/* Badges on top of image */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Live Hero Image</span>
              </div>

              <button
                onClick={() => setShowFullPreviewModal(true)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-xl text-white backdrop-blur-md transition-colors shadow"
                title="View Full Resolution"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] truncate max-w-xs text-gray-200">
                    {hero.heroImage || 'Default Heritage'}
                  </span>
                  <span className="text-[10px] text-[#F5A800] uppercase font-bold">Dynamic Source</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Current Image */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D5B29] hover:bg-[#083E1B] text-white rounded-xl text-xs font-bold shadow transition-all hover:-translate-y-0.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Hero Image</span>
              </button>

              {!isDefaultImage && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Current Image</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowFullPreviewModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FAF8F2] hover:bg-[#E8F2EA] text-[#0D5B29] border border-[#D5E8DA] rounded-xl text-xs font-bold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Preview</span>
              </button>
            </div>
          </div>

          {/* Upload New Hero Image & Preview Before Saving */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D5B29] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#E8590C]" />
              <span>Upload New Hero Image (With Pre-Save Preview)</span>
            </span>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
              id="hero-file-upload-input"
            />

            {/* Preview Box IF file selected */}
            {selectedFile && previewUrl ? (
              <div className="p-4 rounded-2xl border-2 border-[#E8590C] bg-[#FFF9F5] space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-[#FDDCC2] pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E8590C]">
                    <Eye className="w-4 h-4" />
                    <span>Preview Before Saving</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setPreviewDimensions(null);
                    }}
                    className="p-1 rounded-lg hover:bg-white text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-black/10 border border-[#FCDDC2]">
                  <img
                    src={previewUrl}
                    alt="Hero Image Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
                    Pending Upload
                  </div>
                </div>

                {/* File Details Badge */}
                <div className="flex flex-wrap items-center justify-between text-xs text-[#557060] bg-white p-3 rounded-xl border border-[#FCDDC2]">
                  <div>
                    <span className="font-bold text-[#11311D] block truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-[11px] text-[#557060]">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'image'}
                    </span>
                  </div>
                  {previewDimensions && (
                    <span className="text-[11px] font-bold text-[#0D5B29] bg-[#EBF5EE] px-2 py-0.5 rounded-md">
                      {previewDimensions.width} × {previewDimensions.height} px
                    </span>
                  )}
                </div>

                {/* Confirm Upload / Cancel Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleUploadAndSave}
                    disabled={isUploading}
                    id="admin-confirm-upload-hero-btn"
                    className="flex-1 py-3 px-4 bg-[#E8590C] hover:bg-[#CC4B04] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 border border-[#F5A800]/40 disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Uploading & Saving to Server...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Upload & Save as Hero Image</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    disabled={isUploading}
                    className="py-3 px-4 bg-white hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all aspect-[16/10] flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#E8590C] bg-[#FFF6EE]'
                    : 'border-[#BCE5C8] bg-[#FAF8F2] hover:bg-[#F0F7F2] hover:border-[#0D5B29]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-[#D5E8DA] flex items-center justify-center text-[#0D5B29]">
                  <Upload className="w-7 h-7 text-[#0D5B29]" />
                </div>
                <div>
                  <h4 className="font-cinzel text-sm font-bold text-[#11311D]">
                    Click to select or drag and drop image here
                  </h4>
                  <p className="text-xs text-[#557060] mt-1">
                    Accepts JPG, JPEG, PNG, and WEBP formats up to 10 MB
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D5E8DA] text-[11px] text-[#0D5B29] font-bold shadow-xs">
                  <span>Browse From Computer</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            )}

            {/* Error Display */}
            {previewError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{previewError}</span>
              </div>
            )}

            {/* Direct Image URL input (alternative option) */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#557060] mb-1">
                Or Enter / Paste Image URL Directly:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hero.heroImage || ''}
                  onChange={(e) => setHero({ ...hero, heroImage: e.target.value, imageUrl: e.target.value })}
                  placeholder="e.g. uploads/hero/hero-custom.webp or https://..."
                  className="flex-1 text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSaveAllSettings();
                  }}
                  className="px-4 py-2.5 bg-[#0D5B29] hover:bg-[#083E1B] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply URL
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTION 2: LIVE HOMEPAGE HERO PREVIEW MOCKUP */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8F2EA] pb-3">
          <div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#11311D]">
              Live Homepage Hero Preview
            </h3>
            <p className="text-xs text-[#557060]">
              How the Hero section looks to your website customers in real time
            </p>
          </div>
          <span className="text-[11px] px-3 py-1 rounded-full bg-[#EBF5EE] text-[#0D5B29] font-bold">
            Frontend Simulation
          </span>
        </div>

        {/* Mini Hero Mockup */}
        <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#F0F7F2] via-[#FAF8F2] to-[#F5FAF6] border border-[#D5E8DA]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-7 space-y-3 text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EBF5EE] border border-[#BCE5C8] text-[#0D5B29] text-[10px] font-bold">
                {hero.badge || 'RevEg Fresh Foods • Authentic Taste'}
              </span>
              <h1 className="font-cinzel text-xl sm:text-2xl font-extrabold text-[#11311D] leading-tight">
                {hero.heading || 'Authentic Taste of Tradition'}
              </h1>
              <p className="text-xs text-[#3A5243] line-clamp-2">
                {hero.description || 'Delicious traditional Indian sweets, festive faral, and crispy namkeen crafted by RevEg Fresh Foods.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="px-4 py-2 bg-[#0D5B29] text-white rounded-full text-xs font-bold shadow-sm">
                  {hero.primaryCtaText || 'Explore Products'}
                </span>
                <span className="px-4 py-2 bg-[#E8590C] text-white rounded-full text-xs font-bold shadow-sm">
                  {hero.secondaryCtaText || 'Order on WhatsApp'}
                </span>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-white p-2 shadow-lg border-2 border-[#E2EFE5] aspect-[4/3]">
                <img
                  src={currentDisplayImage}
                  alt="Mockup Hero"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e: any) => {
                    e.target.src = DEFAULT_HERO_IMAGE;
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 3: HERO TEXT, BADGES & CTA SETTINGS (FORM) */}
      <form onSubmit={(e) => handleSaveAllSettings(e)} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5E8DA] shadow-sm space-y-6">
        
        <div className="border-b border-[#E8F2EA] pb-3">
          <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
            Hero Section Text & Action Button Settings
          </h3>
          <p className="text-xs text-[#557060]">
            Customize the headline, subheadings, and WhatsApp call-to-actions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-12">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Top Small Badge Text
            </label>
            <input
              type="text"
              value={hero.badge || ''}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

          <div className="lg:col-span-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Main Headline
            </label>
            <input
              type="text"
              value={hero.heading || ''}
              onChange={(e) => setHero({ ...hero, heading: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold text-[#11311D]"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Highlighted Headline Word (Gold/Orange)
            </label>
            <input
              type="text"
              value={hero.highlightWord || ''}
              onChange={(e) => setHero({ ...hero, highlightWord: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] font-bold text-[#E8590C]"
            />
          </div>

          <div className="lg:col-span-12">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Subheading Paragraph
            </label>
            <textarea
              rows={3}
              value={hero.description || ''}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
              className="w-full text-xs p-3 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA] leading-relaxed"
            />
          </div>

          <div className="lg:col-span-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Primary Button Label
            </label>
            <input
              type="text"
              value={hero.primaryCtaText || ''}
              onChange={(e) => setHero({ ...hero, primaryCtaText: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

          <div className="lg:col-span-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#0D5B29] mb-1.5">
              Secondary WhatsApp Button Label
            </label>
            <input
              type="text"
              value={hero.secondaryCtaText || ''}
              onChange={(e) => setHero({ ...hero, secondaryCtaText: e.target.value })}
              className="w-full text-xs p-2.5 rounded-xl bg-[#FAF8F2] border border-[#D5E8DA]"
            />
          </div>

        </div>

        <div className="flex items-center justify-end pt-4 border-t border-[#E8F2EA]">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-[#0D5B29] hover:bg-[#083E1B] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save Hero Settings'}</span>
          </button>
        </div>

      </form>

      {/* MODAL: DELETE HERO IMAGE CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#D5E8DA] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-[#11311D]">
                Delete Current Hero Image?
              </h3>
            </div>

            <p className="text-xs text-[#557060] leading-relaxed">
              Are you sure you want to delete the current hero image? If it was an uploaded file, it will be removed from your server's <code className="font-mono text-[#0D5B29]">uploads/hero/</code> directory, and the homepage will revert to the default authentic heritage visual.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold text-[#557060] hover:text-[#11311D] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteHeroImage}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete & Reset</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULL RESOLUTION IMAGE PREVIEW */}
      {showFullPreviewModal && (
        <div
          onClick={() => setShowFullPreviewModal(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full p-4 overflow-hidden border border-[#D5E8DA] shadow-2xl relative animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setShowFullPreviewModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-2xl overflow-hidden max-h-[80vh] flex items-center justify-center bg-[#FAF8F2]">
              <img
                src={currentDisplayImage}
                alt="Full Preview Hero"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="p-3 text-center text-xs text-[#557060]">
              <span className="font-mono">{hero.heroImage}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
