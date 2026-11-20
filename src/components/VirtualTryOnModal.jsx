import React, { useState, useEffect } from 'react';

/**
 * Standalone, plug-and-play AI Virtual Try-On Modal Component.
 * Self-contained inline styling guarantees zero conflicts with existing global CSS.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - garmentImageUrl: string
 *  - garmentName: string
 */
export default function VirtualTryOnModal({ isOpen, onClose, garmentImageUrl, garmentName }) {
  const [personFile, setPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);
  const [category, setCategory] = useState('upper_body'); // 'upper_body' | 'lower_body' | 'dresses'
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Reset state when opened or garment changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
    } else {
      setPersonFile(null);
      setPersonPreview(null);
      setResultImage(null);
      setIsLoading(false);
      setErrorMessage('');
    }
  }, [isOpen, garmentImageUrl]);

  if (!isOpen) return null;

  // File selection validation (5MB max, jpg/png/webp)
  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`Selected image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 5MB.`);
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setErrorMessage('Please upload a valid JPG, PNG, or WebP photograph.');
      return;
    }

    setErrorMessage('');
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Submit inference request to isolated backend endpoint
  const handleGenerateTryOn = async () => {
    if (!personFile) {
      setErrorMessage('Please upload a clear photograph of yourself first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('person_image', personFile);
      formData.append('garment_image_url', garmentImageUrl || '');
      formData.append('category', category);

      const response = await fetch('/api/try-on/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setResultImage(data.result_image);
    } catch (err) {
      console.error('[VirtualTryOn] Error:', err);
      setErrorMessage(err.message || 'Virtual Try-On service temporarily busy. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPersonFile(null);
    setPersonPreview(null);
    setResultImage(null);
    setErrorMessage('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(10, 24, 18, 0.78)',
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
          maxWidth: '880px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(200, 157, 56, 0.35)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* Modal Header */}
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
                AI Virtual Try-On
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#c89d38', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                Open-Source Neural Drape Engine
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

        {/* Error Notification Banner */}
        {errorMessage && (
          <div
            style={{
              margin: '16px 24px 0',
              padding: '10px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #f87171',
              borderRadius: '10px',
              color: '#991b1b',
              fontSize: '0.84rem',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Modal Main Content */}
        <div style={{ padding: '24px', flex: 1 }}>
          {resultImage ? (
            /* VIEW: AI GENERATED RESULT */
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.3rem' }}>🎉</span>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0e2920', fontWeight: 700 }}>
                  Your Virtual Try-On Look is Ready!
                </h4>
              </div>
              <p style={{ margin: '0 0 18px', fontSize: '0.85rem', color: '#667770' }}>
                Wearing: <strong>{garmentName || 'Selected Garment'}</strong>
              </p>

              <div
                style={{
                  position: 'relative',
                  maxWidth: '440px',
                  height: '480px',
                  margin: '0 auto 20px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
                  border: '2px solid #c89d38',
                  backgroundColor: '#0e2920',
                }}
              >
                <img
                  src={resultImage}
                  alt="AI Virtual Try-On Result"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={resultImage}
                  download={`aruvi_tryon_${Date.now()}.png`}
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
                  📥 Download Photo
                </a>
                <button
                  type="button"
                  onClick={handleReset}
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
            /* VIEW: LOADING SPINNER & SKELETON */
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
                Synthesizing Garment Drape...
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#667770' }}>
                Generating your virtual try-on, takes ~10-15s...
              </p>

              <div
                style={{
                  maxWidth: '360px',
                  height: '6px',
                  backgroundColor: '#f2ece2',
                  borderRadius: '99px',
                  margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '65%',
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
              {/* Left Column: Selected Garment Preview */}
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
                    alt={garmentName || 'Clothing Item'}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = 'assets/images/kanjivaram_green.jpg';
                    }}
                  />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0e2920', fontWeight: 700 }}>
                  {garmentName || 'Artisanal Ensemble'}
                </h4>

                {/* Category Selector */}
                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#55665f', marginBottom: '6px' }}>
                    Garment Placement Category:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'upper_body', label: 'Upper Body' },
                      { id: 'lower_body', label: 'Lower Body' },
                      { id: 'dresses', label: 'Full Dress' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          padding: '7px 4px',
                          borderRadius: '8px',
                          border: category === cat.id ? '2px solid #0e2920' : '1px solid #d4c8b8',
                          backgroundColor: category === cat.id ? '#0e2920' : '#ffffff',
                          color: category === cat.id ? '#ffffff' : '#0e2920',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: User Photo Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0e2920', fontWeight: 700 }}>
                    Upload Your Photograph
                  </h4>
                  <p style={{ margin: '0 0 14px', fontSize: '0.8rem', color: '#667770' }}>
                    Upload a clear, front-facing portrait or full-body picture (Max: 5MB).
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
                        alt="Your uploaded photo"
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
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
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
                      <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>👤</div>
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
                        📁 Choose File
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={handleFileInput}
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <div style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    disabled={!personFile}
                    onClick={handleGenerateTryOn}
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
                    ✨ Generate Try-On Look
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
