import React, { useState, useRef } from 'react';
import { validateImageFile, uploadFileToFirebase } from '../services/firebase';

export default function ImageUploadDropzone({
  folder = 'products',
  label = 'Upload Image',
  helperText = 'Supports WebP, PNG, JPEG up to 10MB',
  maxSizeMB = 10,
  autoUpload = true,
  onFileSelect,
  onUploadSuccess,
  onError,
  initialPreview = null,
  aspectRatio = 'aspect-[3/4]',
  className = '',
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(initialPreview);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile) => {
    setErrorMsg(null);
    if (!selectedFile) return;

    // Validate
    const validation = validateImageFile(selectedFile, maxSizeMB);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      if (onError) onError(validation.error);
      return;
    }

    setFile(selectedFile);
    if (onFileSelect) onFileSelect(selectedFile);

    // Create local object URL for instant preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Auto upload to Firebase Cloud Storage if enabled
    if (autoUpload) {
      setIsUploading(true);
      setProgress(5);
      try {
        const uploadResult = await uploadFileToFirebase(
          selectedFile,
          folder,
          (pct) => setProgress(pct)
        );
        setIsUploading(false);
        setProgress(100);
        if (onUploadSuccess) onUploadSuccess(uploadResult);
      } catch (err) {
        setIsUploading(false);
        const msg = err.message || 'Upload to Firebase Storage failed.';
        setErrorMsg(msg);
        if (onError) onError(msg);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
    setProgress(0);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-primary-dark/80 mb-2">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center ${
          dragActive
            ? 'border-gold bg-gold/5 scale-[1.01]'
            : 'border-emerald-900/20 bg-ivory/60 hover:border-gold/60 hover:bg-white'
        } ${preview ? aspectRatio : 'min-h-[220px]'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl shadow-md"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-primary-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-4 text-white">
              <span className="text-xs font-medium tracking-wider uppercase bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                Click to Replace
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="mt-2 text-xs bg-red-600/90 hover:bg-red-700 text-white px-3 py-1.5 rounded-full font-semibold transition"
              >
                Remove Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-dark">
                Drag & drop your photograph here, or <span className="text-gold underline">browse</span>
              </p>
              <p className="text-xs text-text-muted mt-1">{helperText}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-emerald-900/60 uppercase">
              <span className="px-2 py-0.5 rounded bg-emerald-100/60">WebP</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/60">PNG</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/60">JPEG</span>
              <span className="px-2 py-0.5 rounded bg-gold/20 text-gold-dark">Max 10MB</span>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="absolute inset-x-0 bottom-0 bg-primary-dark/90 p-3 text-white backdrop-blur-sm flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gold animate-ping" />
                Uploading to Firebase Storage...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gold h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
