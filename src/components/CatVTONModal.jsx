import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function CatVTONModal({ isOpen, onClose, garment, onSelectOtherGarment }) {
  // Mode: 'input' | 'camera' | 'processing' | 'result'
  const [viewMode, setViewMode] = useState('input');
  const [customerPhotoFile, setCustomerPhotoFile] = useState(null);
  const [customerPhotoPreview, setCustomerPhotoPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('overall'); // 'overall' | 'upper' | 'lower'
  
  // Job & result state
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('idle'); // 'queued' | 'processing' | 'completed' | 'failed'
  const [jobProgress, setJobProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hardwareInfo, setHardwareInfo] = useState(null);

  // Before/After comparison slider state (0 to 100%)
  const [sliderPos, setSliderPos] = useState(50);
  const sliderContainerRef = useRef(null);

  // Camera capture refs & state
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('user'); // 'user' | 'environment'

  // Reset state when opening or garment changes
  useEffect(() => {
    if (isOpen) {
      setViewMode('input');
      setJobStatus('idle');
      setJobProgress(0);
      setErrorMessage('');
      setResultImageUrl(null);
    } else {
      stopCamera();
    }
  }, [isOpen, garment]);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Poll job status until completed or failed
  useEffect(() => {
    let timer = null;
    if (jobId && (jobStatus === 'queued' || jobStatus === 'processing')) {
      timer = setInterval(async () => {
        try {
          const resp = await axios.get(`/api/tryon/status/${jobId}/`);
          const data = resp.data;
          setJobStatus(data.status);
          setJobProgress(data.progress || 50);
          setStatusMessage(data.message || 'Processing AI neural synthesis...');
          if (data.hardware) {
            setHardwareInfo(data.hardware);
          }

          if (data.status === 'completed') {
            setResultImageUrl(`/api/tryon/result/${jobId}/?t=${Date.now()}`);
            setViewMode('result');
            clearInterval(timer);
          } else if (data.status === 'failed') {
            setErrorMessage(data.error || 'CatVTON AI synthesis failed. Please try with another photograph.');
            setViewMode('input');
            clearInterval(timer);
          }
        } catch (err) {
          console.error('[CatVTON] Polling error:', err);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [jobId, jobStatus]);

  // Camera Management
  const startCamera = async (facing = 'user') => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      setViewMode('camera');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('[CatVTON] Camera access denied:', err);
      alert('Camera access could not be granted. Please check browser permissions or upload a photograph.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 768;
    canvas.height = video.videoHeight || 1024;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setCustomerPhotoFile(file);
        setCustomerPhotoPreview(URL.createObjectURL(blob));
        stopCamera();
        setViewMode('input');
      }
    }, 'image/jpeg', 0.95);
  };

  // File Upload Handling
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photograph size must be under 10MB.');
        return;
      }
      setCustomerPhotoFile(file);
      setCustomerPhotoPreview(URL.createObjectURL(file));
      setViewMode('input');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photograph size must be under 10MB.');
        return;
      }
      setCustomerPhotoFile(file);
      setCustomerPhotoPreview(URL.createObjectURL(file));
      setViewMode('input');
    }
  };

  // Trigger CatVTON Inference
  const handleGenerateLook = async () => {
    if (!customerPhotoFile) {
      alert('Please upload or capture your photograph first.');
      return;
    }

    setViewMode('processing');
    setJobStatus('queued');
    setJobProgress(15);
    setStatusMessage('Transferring photograph to CatVTON ephemeral memory buffer...');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('photo', customerPhotoFile);
    if (garment?.id) {
      formData.append('product_id', garment.id);
    }
    if (garment?.image) {
      formData.append('garment_image_url', garment.image);
    }
    formData.append('garment_title', garment?.title || garment?.name || 'Selected Garment');
    formData.append('category', selectedCategory);

    try {
      const resp = await axios.post('/api/tryon/generate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = resp.data;
      setJobId(data.job_id);
      setJobStatus('queued');
      setJobProgress(25);
      setStatusMessage('CatVTON pipeline initialized. Running neural spatial parsing...');
      if (data.hardware) {
        setHardwareInfo(data.hardware);
      }
    } catch (err) {
      console.error('[CatVTON] Launch error:', err);
      const detail = err.response?.data?.error || 'Unable to connect to AI Inference Service. Please try again.';
      setErrorMessage(detail);
      setViewMode('input');
      setJobStatus('failed');
    }
  };

  // Interactive Slider Touch/Mouse Movement
  const handleSliderMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, rawPos));
    setSliderPos(clamped);
  };

  const handleTouchMove = (e) => {
    if (e.touches?.[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleSliderMove(e.clientX);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="catvton-modal-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(10, 24, 18, 0.78)',
          backdropFilter: 'blur(8px)',
          padding: '16px',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && viewMode !== 'processing') {
            stopCamera();
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="catvton-modal-card"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '920px',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(200, 157, 56, 0.3)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 28px',
              borderBottom: '1px solid #f0ebe2',
              background: 'linear-gradient(135deg, #0e2920 0%, #15382c 100%)',
              color: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #c89d38 0%, #dfb85e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0e2920',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(200, 157, 56, 0.4)',
                }}
              >
                ✨
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>
                  CatVTON AI Virtual Try-On
                </h2>
                <span style={{ fontSize: '0.78rem', color: '#c89d38', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Open-Source Diffusion Neural Engine
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              aria-label="Close Try-On Modal"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: 'none',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
            >
              ✕
            </button>
          </div>

          {/* Privacy Banner */}
          <div
            style={{
              padding: '10px 24px',
              background: '#f9f6ef',
              borderBottom: '1px solid #eee5d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#55665e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0e2920', fontWeight: 700 }}>🔒 100% In-Memory Privacy Guarantee:</span>
              <span>Your photo is never saved to database or cloud storage. Discarded immediately after inference.</span>
            </div>
            {hardwareInfo && (
              <span style={{ color: '#c89d38', fontWeight: 600, background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ebd9b4' }}>
                {hardwareInfo.cuda_available ? `⚡ GPU: ${hardwareInfo.device_name}` : '⚙️ CPU Acceleration Active'}
              </span>
            )}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ margin: '16px 28px 0', padding: '12px 16px', background: '#fdf2f2', border: '1px solid #f8b4b4', borderRadius: '12px', color: '#9b1c1c', fontSize: '0.86rem' }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Modal Body */}
          <div style={{ padding: '24px 28px', flex: 1 }}>
            {/* VIEW 1: INPUT MODE (Upload / Camera Selector & Preview) */}
            {viewMode === 'input' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
                {/* Left: Garment To Try On */}
                <div style={{ background: '#faf8f5', borderRadius: '18px', padding: '18px', border: '1px solid #eee6d8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c89d38', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Selected Boutique Dress
                    </span>
                    {onSelectOtherGarment && (
                      <button
                        onClick={onSelectOtherGarment}
                        style={{ fontSize: '0.78rem', color: '#0e2920', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Try Another Dress ↗
                      </button>
                    )}
                  </div>

                  <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '320px', background: '#fff', border: '1px solid #eae2d3' }}>
                    <img
                      src={garment?.image || 'assets/images/kanjivaram_green.jpg'}
                      alt={garment?.title || 'Garment preview'}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.src = 'assets/images/kanjivaram_green.jpg'; }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, insetInline: 0, padding: '12px 16px', background: 'linear-gradient(to top, rgba(14,41,32,0.92) 0%, transparent 100%)', color: '#fff' }}>
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700 }}>
                        {garment?.title || garment?.name || 'Handcrafted Heritage Drape'}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: '#dfb85e', marginTop: '2px' }}>
                        ₹{Number(garment?.price || 8999).toLocaleString('en-IN')} • {garment?.fabric || 'Artisanal Silk'}
                      </div>
                    </div>
                  </div>

                  {/* Garment Category Selector */}
                  <div style={{ marginTop: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4a5d55', marginBottom: '6px' }}>
                      Fitting Category Alignment:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {[
                        { id: 'overall', label: 'Overall / Saree' },
                        { id: 'upper', label: 'Upper / Top' },
                        { id: 'lower', label: 'Lower / Skirt' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: selectedCategory === cat.id ? '2px solid #0e2920' : '1px solid #dcd3c4',
                            background: selectedCategory === cat.id ? '#0e2920' : '#ffffff',
                            color: selectedCategory === cat.id ? '#ffffff' : '#0e2920',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Customer Photo Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.18rem', color: '#0e2920', margin: '0 0 6px' }}>
                      Upload Your Photograph
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#667770', margin: '0 0 16px' }}>
                      For master tailoring results, upload a clear front-facing full-body or half-body portrait.
                    </p>

                    {/* Preview or Dropzone */}
                    {customerPhotoPreview ? (
                      <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '290px', border: '2px solid #c89d38', background: '#0e2920' }}>
                        <img
                          src={customerPhotoPreview}
                          alt="Customer photograph"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomerPhotoFile(null);
                              setCustomerPhotoPreview(null);
                            }}
                            style={{
                              background: 'rgba(0,0,0,0.65)',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '99px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              backdropFilter: 'blur(4px)',
                            }}
                          >
                            🔄 Change Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        style={{
                          borderRadius: '16px',
                          border: '2px dashed #c89d38',
                          padding: '32px 20px',
                          textAlign: 'center',
                          background: 'rgba(200, 157, 56, 0.04)',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '2.4rem', marginBottom: '8px' }}>📸</div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '0.98rem', color: '#0e2920' }}>
                          Drag & drop photograph here
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#889990', margin: '0 0 18px' }}>
                          Supports JPG, PNG, WebP up to 10MB
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#0e2920',
                              color: '#ffffff',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(14,41,32,0.2)',
                            }}
                          >
                            📁 Select from Device
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              style={{ display: 'none' }}
                              onChange={handlePhotoUpload}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => startCamera('user')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#ffffff',
                              color: '#0e2920',
                              border: '1.5px solid #0e2920',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            📷 Open Camera
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Generate CTA Button */}
                  <div style={{ marginTop: '20px' }}>
                    <button
                      type="button"
                      disabled={!customerPhotoFile}
                      onClick={handleGenerateLook}
                      style={{
                        width: '100%',
                        padding: '15px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: customerPhotoFile
                          ? 'linear-gradient(135deg, #c89d38 0%, #e0bc66 50%, #b58925 100%)'
                          : '#e0d8cc',
                        color: customerPhotoFile ? '#0e2920' : '#8c8070',
                        fontSize: '1rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        cursor: customerPhotoFile ? 'pointer' : 'not-allowed',
                        boxShadow: customerPhotoFile
                          ? '0 6px 20px rgba(200, 157, 56, 0.4)'
                          : 'none',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      ✨ Generate My Look
                    </button>
                    <span style={{ display: 'block', textAlign: 'center', fontSize: '0.74rem', color: '#889990', marginTop: '8px' }}>
                      Powered by official CatVTON Open-Source Model
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: LIVE CAMERA CAPTURE MODE */}
            {viewMode === 'camera' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#0e2920', marginBottom: '8px' }}>
                  Live Camera Pose Alignment
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#667770', marginBottom: '16px' }}>
                  Stand 4-6 feet back for optimal garment alignment. Ensure even ambient boutique lighting.
                </p>

                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '480px',
                    height: '460px',
                    margin: '0 auto',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '3px solid #c89d38',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Anatomical alignment overlay guidelines */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      border: '1px dashed rgba(200,157,56,0.4)',
                      margin: '20px',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: '#dfb85e', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                      Head & Face in Top Area
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#dfb85e', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                      Torso & Draping Zone
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
                      setCameraFacing(nextFacing);
                      startCamera(nextFacing);
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: '1px solid #dcd3c4',
                      background: '#ffffff',
                      color: '#0e2920',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Switch Camera
                  </button>

                  <button
                    type="button"
                    onClick={capturePhoto}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #c89d38 0%, #e0bc66 100%)',
                      color: '#0e2920',
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(200,157,56,0.4)',
                    }}
                  >
                    📸 Capture Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setViewMode('input');
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#f2ece2',
                      color: '#667770',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 3: PROCESSING STATE (Framer Motion Animation) */}
            {viewMode === 'processing' && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                {/* Neural Pulse Sphere */}
                <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 28px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.8, 0.35] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(200, 157, 56, 0.4) 0%, transparent 70%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: '18px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0e2920 0%, #1e4a3c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2.4rem',
                      boxShadow: '0 8px 24px rgba(14, 41, 32, 0.35)',
                      border: '2px solid #c89d38',
                    }}
                  >
                    ✨
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', color: '#0e2920', margin: '0 0 8px' }}>
                  Synthesizing Handcrafted Drape Look
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#667770', maxWidth: '480px', margin: '0 auto 24px' }}>
                  {statusMessage || 'CatVTON is extracting garment textures, generating clothing masks, and synthesizing lighting folds...'}
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', maxWidth: '420px', height: '8px', background: '#ece6da', borderRadius: '99px', margin: '0 auto 16px', overflow: 'hidden' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #0e2920 0%, #c89d38 100%)', borderRadius: '99px' }}
                    initial={{ width: '10%' }}
                    animate={{ width: `${jobProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: '#c89d38', fontWeight: 600 }}>
                  Progress: {jobProgress}%
                </div>

                {/* Privacy Reminder */}
                <div style={{ marginTop: '28px', fontSize: '0.76rem', color: '#889990' }}>
                  🔒 Zero-Retention Active • Original photograph is not stored on disk
                </div>
              </div>
            )}

            {/* VIEW 4: GENERATED RESULT (Interactive Comparison Slider) */}
            {viewMode === 'result' && resultImageUrl && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: '#0e2920', margin: 0 }}>
                      Your AI Virtual Drape Result
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#667770' }}>
                      Slide left/right to compare your original photo with the CatVTON drape
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href={`/api/tryon/result/${jobId}/?download=true`}
                      download={`aruvi_tryon_${jobId}.webp`}
                      style={{
                        padding: '9px 16px',
                        background: '#0e2920',
                        color: '#ffffff',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(14,41,32,0.2)',
                      }}
                    >
                      📥 Download Look
                    </a>

                    {onSelectOtherGarment && (
                      <button
                        type="button"
                        onClick={onSelectOtherGarment}
                        style={{
                          padding: '9px 16px',
                          background: '#ffffff',
                          color: '#0e2920',
                          border: '1.5px solid #0e2920',
                          borderRadius: '10px',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Try Another Dress
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Before & After Comparison Slider */}
                <div
                  ref={sliderContainerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '520px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    userSelect: 'none',
                    cursor: 'ew-resize',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                    border: '1px solid rgba(200, 157, 56, 0.4)',
                    background: '#0e2920',
                  }}
                >
                  {/* Layer 1: Generated Result (Background) */}
                  <img
                    src={resultImageUrl}
                    alt="AI Virtual Try-On Result"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: '#15382c',
                    }}
                  />

                  {/* Layer 2: Original Customer Photo (Clipped overlay) */}
                  {customerPhotoPreview && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${sliderPos}%`,
                        overflow: 'hidden',
                        borderRight: '3px solid #ffffff',
                        boxShadow: '4px 0 16px rgba(0,0,0,0.3)',
                      }}
                    >
                      <img
                        src={customerPhotoPreview}
                        alt="Original Customer Photograph"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%',
                          height: '100%',
                          objectFit: 'contain',
                          background: '#0e2920',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          background: 'rgba(0,0,0,0.65)',
                          color: '#ffffff',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          letterSpacing: '0.8px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Original
                      </span>
                    </div>
                  )}

                  {/* Label for AI result */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(200, 157, 56, 0.9)',
                      color: '#0e2920',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    ✨ CatVTON Look
                  </span>

                  {/* Draggable Divider Handle */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${sliderPos}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      border: '3px solid #c89d38',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0e2920',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      pointerEvents: 'none',
                    }}
                  >
                    ↔
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('input');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0e2920',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ← Try with another photo
                  </button>

                  <div style={{ fontSize: '0.76rem', color: '#889990' }}>
                    * AI preview visualizes drape styling and color compatibility. Handcrafted fit may vary.
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
