import React, { useState } from 'react';
import { deleteFileFromFirebase, validateImageFile } from '../services/firebase';
import { uploadProductImage, handleImageError } from '../utils/imageUtils';

export default function AdminProductGalleryManager({
  images = [],
  productId = null,
  onImagesChange,
  showNotification,
}) {
  const [gallery, setGallery] = useState(images);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync when prop changes
  React.useEffect(() => {
    setGallery(images);
  }, [images]);

  const notify = (msg, type = 'success') => {
    if (showNotification) {
      showNotification(msg, type);
    } else {
      console.log(`[GalleryManager] [${type}] ${msg}`);
    }
  };

  const handleMultipleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    setUploadProgress(10);
    const updated = [...gallery];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        notify(`Skipped "${file.name}": ${validation.error}`, 'error');
        continue;
      }

      try {
        notify(`Uploading "${file.name}" to storage...`, 'info');
        const uploadResult = await uploadProductImage(file, productId, (pct) => {
          const overall = Math.round(((i + pct / 100) / files.length) * 100);
          setUploadProgress(overall);
        });

        if (!uploadResult || !uploadResult.url) {
          throw new Error('Storage service did not return a valid public image URL.');
        }

        const isFirst = updated.length === 0;
        const newImgObj = {
          id: `img_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 4)}`,
          image_url: uploadResult.url,
          storage_path: uploadResult.fallbackDataUrl || uploadResult.path || '',
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          is_primary: isFirst,
          display_order: updated.length,
          size_bytes: file.size,
          storage_provider: uploadResult.storage || 'cloud'
        };

        updated.push(newImgObj);
        successCount++;
        setGallery([...updated]);
        if (onImagesChange) onImagesChange([...updated]);
      } catch (err) {
        notify(`Failed to upload "${file.name}": ${err.message}`, 'error');
      }
    }

    setIsUploading(false);
    setUploadProgress(100);
    setGallery(updated);
    if (onImagesChange) onImagesChange(updated);
    if (successCount > 0) {
      notify(`Successfully optimized & attached ${successCount} image(s) to product gallery.`, 'success');
    }
  };

  const setPrimary = (index) => {
    const updated = gallery.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setGallery(updated);
    if (onImagesChange) onImagesChange(updated);
    notify('Primary cover image updated.', 'success');
  };

  const moveImage = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= gallery.length) return;

    const updated = [...gallery];
    const item = updated.splice(index, 1)[0];
    updated.splice(targetIdx, 0, item);

    // Update display_order
    const reordered = updated.map((img, i) => ({ ...img, display_order: i }));
    setGallery(reordered);
    if (onImagesChange) onImagesChange(reordered);
  };

  const handleDelete = async (index) => {
    const target = gallery[index];
    if (!target) return;

    if (!window.confirm('Are you sure you want to delete this image from storage and the gallery?')) {
      return;
    }

    if (target.storage_path) {
      await deleteFileFromFirebase(target.storage_path);
    }

    const updated = gallery.filter((_, i) => i !== index);
    if (target.is_primary && updated.length > 0) {
      updated[0].is_primary = true;
    }

    const reordered = updated.map((img, i) => ({ ...img, display_order: i }));
    setGallery(reordered);
    if (onImagesChange) onImagesChange(reordered);
    notify('Image removed from gallery.', 'success');
  };

  const handleReplace = async (index, file) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      notify(validation.error, 'error');
      return;
    }

    const old = gallery[index];
    try {
      notify('Uploading replacement image to storage...', 'info');
      const uploadResult = await uploadProductImage(file, productId);

      if (old.storage_path && old.storage_path !== uploadResult.path) {
        await deleteFileFromFirebase(old.storage_path);
      }

      const updated = [...gallery];
      updated[index] = {
        ...old,
        image_url: uploadResult.url,
        storage_path: uploadResult.fallbackDataUrl || uploadResult.path,
        size_bytes: file.size,
      };

      setGallery(updated);
      if (onImagesChange) onImagesChange(updated);
      notify('Image replaced successfully.', 'success');
    } catch (err) {
      notify(`Replace failed: ${err.message}`, 'error');
    }
  };

  return (
    <div className="w-full space-y-4 bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-900/10 pb-4">
        <div>
          <h4 className="text-sm font-bold text-primary-dark tracking-wide uppercase">
            Product Gallery & Firebase Storage ({gallery.length} Images)
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Images are securely stored in Firebase Cloud Storage. Drag, reorder, or set primary cover.
          </p>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-semibold shadow-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Images (WebP/PNG/JPG)</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleMultipleFilesSelected}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Uploading progress bar */}
      {isUploading && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
          <div className="flex justify-between font-semibold mb-1">
            <span>Optimizing & attaching product photo...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-emerald-900/20 rounded-xl bg-ivory/40">
          <p className="text-xs text-text-muted">No gallery images yet. Click "Upload Images" to add high-resolution photos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {gallery.map((img, idx) => (
            <div
              key={img.id || idx}
              className={`group relative rounded-xl overflow-hidden border-2 transition-all ${
                img.is_primary ? 'border-gold shadow-md' : 'border-emerald-900/15 hover:border-emerald-900/40'
              }`}
            >
              <div className="aspect-[3/4] relative bg-neutral-100">
                <img
                  src={img.image_url}
                  alt={img.alt_text || `Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e)}
                />

                {/* Primary Badge */}
                {img.is_primary && (
                  <span className="absolute top-2 left-2 bg-gold text-primary-dark font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    Primary Cover
                  </span>
                )}

                {/* Storage path badge */}
                <span className="absolute bottom-2 left-2 right-2 truncate bg-black/60 text-white/90 text-[8px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs">
                  {img.storage_path ? img.storage_path.split('/').pop() : 'firebase://storage'}
                </span>

                {/* Action controls overlay */}
                <div className="absolute inset-0 bg-primary-dark/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      title="Delete from Firebase Storage"
                      className="p-1 rounded bg-red-600 hover:bg-red-700 text-white transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {!img.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimary(idx)}
                        className="w-full py-1 text-[10px] font-bold bg-gold hover:bg-gold-light text-primary-dark rounded transition"
                      >
                        Set as Primary
                      </button>
                    )}

                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveImage(idx, -1)}
                        className="flex-1 py-1 text-[10px] bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 disabled:pointer-events-none"
                      >
                        ← Move Left
                      </button>
                      <button
                        type="button"
                        disabled={idx === gallery.length - 1}
                        onClick={() => moveImage(idx, 1)}
                        className="flex-1 py-1 text-[10px] bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Move Right →
                      </button>
                    </div>

                    <label className="block text-center w-full py-1 text-[10px] font-semibold bg-emerald-700 hover:bg-emerald-600 rounded cursor-pointer transition">
                      Replace
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleReplace(idx, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
