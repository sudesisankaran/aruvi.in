import React, { useState, useEffect } from 'react';

/**
 * Standalone Real AI Virtual Try-On Modal Component
 * 
 * ANTI-FAKE COMPLIANCE:
 * - Never uses CSS absolute layering, HTML5 canvas overlay, or image compositing to fake try-on.
 * - Renders ONLY the genuine single AI-generated diffusion image returned by the backend.
 * - Handles real backend HTTP 502/500 errors without falling back to fake/overlaid images.
 * - Standalone inline styling prevents any conflict with existing site CSS.
 */
export default function VirtualTryOnModal({ isOpen, onClose, garmentImageUrl, garmentName }) {
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [category, setCategory] = useState('dresses'); // 'upper_body' | 'lower_body' | 'dresses'
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showSideBySide, setShowSideBySide] = useState(false);

  // Set default category based on garment name
  useEffect(() => {
    if (garmentName) {
      const lower = garmentName.toLowerCase();
      if (lower.includes('top') || lower.includes('kurti') || lower.includes('shirt')) {
        setCategory('upper_body');
      } else if (lower.includes('pant') || lower.includes('jeans') || lower.includes('skirt')) {
        setCategory('lower_body');
      } else {
        setCategory('dresses');
      }
    }
  }, [garmentName]);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setPersonFile(null);
      setPersonPreview(null);
      setResultImage(null);
      setIsLoading(false);
      setErrorMessage('');
      setShowSideBySide(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validate photograph format and size (max 5MB)
  const handleSelectFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`Photo is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 5MB.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported format. Please upload a clear JPG, PNG, or WebP photograph.');
      return;
    }

    setErrorMessage('');
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleSelectFile(file);
  };

  // Submit to Django REST API
  const handleTryOnWithAI = async () => {
    if (!personFile) {
      setErrorMessage('Please upload a clear front-facing photograph first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('person_image', personFile);
    formData.append('garment_image_url', garmentImageUrl || '');
    formData.append('garment_description', garmentName || 'Handcrafted Boutique Drape');
    formData.append('category', category);

    try {
      const response = await fetch('/api/try-on/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server returned HTTP ${response.status}`);
      }

      // Valid real AI-generated image returned
      setResultImage(data.result_image);
    } catch (err) {
      console.error('[VirtualTryOn] Error:', err);
      // Strictly surface real error to user without fake fallbacks
      setErrorMessage(err.message || 'AI Virtual Try-On service temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setResultImage(null);
    setErrorMessage('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(10, 24, 18, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(200, 157, 56, 0.35)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            backgroundColor: '#0e2920',
            color: '#ffffff',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>✨</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.4px' }}>
                Open-Source AI Virtual Try-On
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#c89d38', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Diffusion Neural Drape (IDM-VTON / CatVTON)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              fontSize: '1rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Real Error Message Alert */}
        {errorMessage && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #f87171',
              borderRadius: '10px',
              color: '#991b1b',
              fontSize: '0.85rem',
              lineHeight: 1.4,
            }}
          >
            <strong>⚠️ AI Processing Notice:</strong> {errorMessage}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {resultImage ? (
            /* VIEW: REAL SINGLE AI-GENERATED RESULT (No CSS layering / No fake overlays) */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🎉</span>
                <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#0e2920', fontWeight: 700 }}>
                  AI Virtual Try-On Complete
                </h4>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#667770' }}>
                Garment fitted: <strong>{garmentName || 'Handcrafted Ensemble'}</strong>
              </p>

              {/* Side-by-Side Toggle */}
              <div style={{ marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowSideBySide(!showSideBySide)}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: showSideBySide ? '#0e2920' : '#f4ede1',
                    color: showSideBySide ? '#ffffff' : '#0e2920',
                    border: '1px solid #dcd3c4',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {showSideBySide ? '🔍 View Single AI Result' : '↔ Compare Side-by-Side with Original'}
                </button>
              </div>

              {/* Pure Render: Single genuine AI image or side-by-side (never layered) */}
              {showSideBySide ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '720px', margin: '0 auto 20px' }}>
                  <div style={{ border: '1px solid #e2dad0', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#fdfbf9' }}>
                    <div style={{ padding: '8px', fontSize: '0.76rem', fontWeight: 700, color: '#55665f', borderBottom: '1px solid #eee' }}>
                      YOUR ORIGINAL PHOTO
                    </div>
                    <img
                      src={personPreview}
                      alt="Original User Portrait"
                      style={{ width: '100%', height: '360px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                  <div style={{ border: '2px solid #c89d38', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#0e2920' }}>
                    <div style={{ padding: '8px', fontSize: '0.76rem', fontWeight: 700, color: '#dfb85e', borderBottom: '1px solid rgba(200,157,56,0.3)', backgroundColor: '#0e2920' }}>
                      ✨ REAL AI TRY-ON RESULT
                    </div>
                    <img
                      src={resultImage}
                      alt="Real AI Virtual Try-On Result"
                      style={{ width: '100%', height: '360px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '460px',
                    height: '490px',
                    margin: '0 auto 20px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
                    border: '2px solid #c89d38',
                    backgroundColor: '#0e2920',
                  }}
                >
                  <img
                    src={resultImage}
                    alt="Real AI Virtual Try-On Result"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(14, 41, 32, 0.85)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                    }}
                  >
                    ✨ Generated via Open-Source Diffusion Neural Masking
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={resultImage}
                  download={`tryon_${Date.now()}.png`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 24px',
                    backgroundColor: '#0e2920',
                    color: '#ffffff',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(14,41,32,0.25)',
                  }}
                >
                  📥 Download Try-On Photo
                </a>
                <button
                  type="button"
                  onClick={handleRetry}
                  style={{
                    padding: '12px 22px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #0e2920',
                    color: '#0e2920',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Try Another Photo
                </button>
              </div>
            </div>
          ) : isLoading ? (
            /* VIEW: LOADING SPINNER */
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  border: '4px solid #f0e6d2',
                  borderTopColor: '#c89d38',
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  animation: 'vton-spin 1s linear infinite',
                }}
              />
              <style>{`
                @keyframes vton-spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>

              <h4 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#0e2920', fontWeight: 700 }}>
                AI is fitting the outfit on you... ~15-30s
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.86rem', color: '#667770', maxWidth: '440px', marginInline: 'auto' }}>
                Open-source diffusion model is segmenting the garment, calculating realistic cloth physics, and lighting folds onto your silhouette.
              </p>

              <div
                style={{
                  maxWidth: '380px',
                  height: '6px',
                  backgroundColor: '#f2ece2',
                  borderRadius: '99px',
                  margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '70%',
                    height: '100%',
                    backgroundColor: '#c89d38',
                    borderRadius: '99px',
                  }}
                />
              </div>
            </div>
          ) : (
            /* VIEW: 2-COLUMN INPUT MODE */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
                gap: '24px',
              }}
            >
              {/* Left Column: Garment Preview + Category Dropdown */}
              <div
                style={{
                  backgroundColor: '#fbf9f6',
                  borderRadius: '16px',
                  padding: '18px',
                  border: '1px solid #efe7da',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#c89d38', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
                  Selected Clothing Item
                </span>
                <div
                  style={{
                    height: '280px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ebd9b4',
                    marginBottom: '12px',
                  }}
                >
                  <img
                    src={garmentImageUrl || 'assets/images/kanjivaram_green.jpg'}
                    alt={garmentName || 'Garment preview'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = 'assets/images/kanjivaram_green.jpg';
                    }}
                  />
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0e2920', fontWeight: 700 }}>
                  {garmentName || 'Artisanal Ensemble'}
                </h4>

                {/* Category Dropdown */}
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5d55', marginBottom: '6px' }}>
                    Clothing Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #d4c8b8',
                      backgroundColor: '#ffffff',
                      color: '#0e2920',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="dresses">Full Dress / Saree / Gown / Set</option>
                    <option value="upper_body">Upper Body (Kurti / Top / Shirt)</option>
                    <option value="lower_body">Lower Body (Pants / Skirt)</option>
                  </select>
                </div>
              </div>

              {/* Right Column: User Photo Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0e2920', fontWeight: 700 }}>
                    Upload Your Photograph
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#667770' }}>
                    We recommend a clear, front-facing portrait or full-body photo for accurate drape fitting (Max: 5MB).
                  </p>

                  {personPreview ? (
                    <div
                      style={{
                        position: 'relative',
                        height: '280px',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        backgroundColor: '#0e2920',
                        border: '2px solid #c89d38',
                      }}
                    >
                      <img
                        src={personPreview}
                        alt="Your uploaded portrait"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPersonFile(null);
                          setPersonPreview(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Change Photo
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      style={{
                        height: '280px',
                        borderRadius: '14px',
                        border: isDragging ? '2px dashed #0e2920' : '2px dashed #c89d38',
                        backgroundColor: isDragging ? 'rgba(200,157,56,0.1)' : 'rgba(200,157,56,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>📸</div>
                      <span style={{ fontSize: '0.92rem', color: '#0e2920', fontWeight: 600, marginBottom: '4px' }}>
                        Drag & drop your photograph here
                      </span>
                      <span style={{ fontSize: '0.76rem', color: '#889990', marginBottom: '16px' }}>
                        Supports JPG, PNG, or WebP (up to 5MB)
                      </span>

                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 20px',
                          backgroundColor: '#0e2920',
                          color: '#ffffff',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        📁 Choose Photo
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={(e) => handleSelectFile(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Try On with AI Button */}
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    disabled={!personFile}
                    onClick={handleTryOnWithAI}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: personFile ? '#c89d38' : '#e5dec3',
                      color: personFile ? '#0e2920' : '#887d60',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: personFile ? 'pointer' : 'not-allowed',
                      boxShadow: personFile ? '0 4px 16px rgba(200, 157, 56, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✨ Try On with AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
