import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, Upload, Sparkles, X, Check, Download, Bookmark, 
  ShoppingBag, RefreshCw, AlertCircle, ArrowRight, ShieldCheck, 
  Maximize2, Eye, Sliders, ChevronLeft
} from 'lucide-react';
import { tryonApi } from '../services/api';
import { useStore } from '../context/StoreContext';
import { getProductImageUrl } from '../utils/imageUtils';
import '../styles/fitting-room.css';

export default function VirtualTryOnModal({
  isOpen,
  onClose,
  product,
  selectedSize = 'M'
}) {
  const { addToCart, addToast, user } = useStore();

  // Modal Step State: 'upload' | 'confirm' | 'processing' | 'result'
  const [step, setStep] = useState('upload');

  // Customer Photo
  const [customerPhoto, setCustomerPhoto] = useState(null); // base64 or object URL
  const [customerPhotoFile, setCustomerPhotoFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);

  // Configuration
  const [garmentCategory, setGarmentCategory] = useState('auto');
  const [tryonMode, setTryonMode] = useState('balanced'); // 'balanced' | 'quality' | 'performance'
  const [coverFeet, setCoverFeet] = useState(false);

  // Processing & Polling State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Preparing your photo...');
  const [predictionId, setPredictionId] = useState(null);
  const [pollError, setPollError] = useState(null);

  // Result State
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'result' | 'split' | 'side-by-side'
  const [sliderPosition, setSliderPosition] = useState(50);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollTimerRef = useRef(null);

  // Reset or initialize when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setStep('upload');
      setCustomerPhoto(null);
      setCustomerPhotoFile(null);
      setResultImageUrl(null);
      setIsProcessing(false);
      setPollError(null);
      setIsSaved(false);
    } else if (product) {
      // Auto-detect garment category based on product category slug
      const cat = (product.category_slug || product.category || '').toLowerCase();
      if (cat.includes('top') || cat.includes('shirt')) {
        setGarmentCategory('tops');
      } else if (cat.includes('jean') || cat.includes('pant') || cat.includes('trouser')) {
        setGarmentCategory('bottoms');
      } else if (cat.includes('salwar') || cat.includes('sharara') || cat.includes('maxi') || cat.includes('ethnic') || cat.includes('co-ord')) {
        setGarmentCategory('one-pieces');
      } else {
        setGarmentCategory('auto');
      }
    }
  }, [isOpen, product]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // Start mobile / desktop camera
  const startCamera = async () => {
    try {
      stopCamera();
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1920 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      addToast('Camera access denied or unavailable. Please use file upload instead.', 'error');
      setIsCameraOpen(false);
    }
  };

  // Capture still photo from camera
  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCustomerPhoto(dataUrl);
    stopCamera();
    setStep('confirm');
    addToast('Camera portrait captured successfully!', 'success');
  };

  // File upload handler
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast('Please upload a valid image file (JPG, JPEG, PNG, or WebP).', 'error');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      addToast('Image is too large. Please choose a photo under 15MB.', 'error');
      return;
    }

    setCustomerPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setCustomerPhoto(loadEvent.target.result);
      setStep('confirm');
      addToast('Full-body photo loaded! Confirm your outfit to generate.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Clear customer photo
  const handleRemovePhoto = () => {
    setCustomerPhoto(null);
    setCustomerPhotoFile(null);
    setStep('upload');
  };

  // -------------------------------------------------------------
  // TRIGGER FASHN AI VIRTUAL TRY-ON (Exclusively Model: tryon-v1.6)
  // -------------------------------------------------------------
  const handleGenerateTryOn = async () => {
    if (!consentGiven) {
      addToast('Please check the consent box to process your photo with FASHN AI.', 'error');
      return;
    }
    if (!customerPhoto) {
      addToast('Please upload or capture your photo first.', 'error');
      return;
    }
    if (!product) {
      addToast('No garment selected.', 'error');
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setProcessingStatus('Connecting to FASHN AI...');
    setPollError(null);

    try {
      const payload = {
        product_id: product.id,
        garment_image: getProductImageUrl(product),
        model_image: customerPhoto,
        category: garmentCategory,
        mode: tryonMode,
        consent_given: true,
        cover_feet: coverFeet,
        adjust_hands: true
      };

      const startRes = await tryonApi.generateTryOn(payload);
      if (!startRes || !startRes.prediction_id) {
        throw new Error('FASHN AI did not return a valid prediction ID.');
      }

      const pId = startRes.prediction_id;
      setPredictionId(pId);
      setProcessingStatus('Analyzing your selected outfit...');

      // Start polling the official FASHN AI status endpoint
      pollFashnStatus(pId);
    } catch (err) {
      console.error('Try-On Generation failed:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to start FASHN AI virtual try-on.';
      setPollError(msg);
      setIsProcessing(false);
      setStep('confirm');
      addToast(msg, 'error');
    }
  };

  // Poll FASHN status endpoint
  const pollFashnStatus = (pId) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 * 2.5s = 150 seconds timeout

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    pollTimerRef.current = setInterval(async () => {
      attempts++;

      // Dynamic message updates based on elapsed time & actual state
      if (attempts === 2) setProcessingStatus('Analyzing body contours & outfit drape...');
      if (attempts === 5) setProcessingStatus('Generating your virtual outfit with FASHN tryon-v1.6...');
      if (attempts === 10) setProcessingStatus('Refining fabric texture, folds, and natural lighting...');
      if (attempts === 16) setProcessingStatus('Finalizing high-resolution silhouette...');

      try {
        const res = await tryonApi.getTryOnStatus(pId);
        
        if (res.status === 'completed' && Array.isArray(res.output) && res.output.length > 0) {
          clearInterval(pollTimerRef.current);
          setIsProcessing(false);
          setResultImageUrl(res.output[0]);
          setStep('result');
          addToast('✨ Real AI Virtual Try-On completed successfully!', 'success');
        } else if (res.status === 'failed') {
          clearInterval(pollTimerRef.current);
          setIsProcessing(false);
          const errText = res.error || 'FASHN AI reported an issue generating this try-on.';
          setPollError(errText);
          setStep('confirm');
          addToast(`Virtual Try-On error: ${errText}`, 'error');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollTimerRef.current);
          setIsProcessing(false);
          const timeoutMsg = 'FASHN AI prediction took longer than expected. Please try again with a clearer photo.';
          setPollError(timeoutMsg);
          setStep('confirm');
          addToast(timeoutMsg, 'error');
        }
      } catch (pollErr) {
        // If single poll fails due to brief network flutter, keep polling until max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollTimerRef.current);
          setIsProcessing(false);
          setPollError('Network connection to FASHN AI was interrupted.');
          setStep('confirm');
        }
      }
    }, 2500);
  };

  // Cancel in-flight generation
  const handleCancelGeneration = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setIsProcessing(false);
    setStep('confirm');
    addToast('Generation cancelled.', 'info');
  };

  // Save generated look to user account
  const handleSaveLook = async () => {
    if (!predictionId) return;
    setIsSaving(true);
    try {
      await tryonApi.saveTryOn(predictionId);
      setIsSaved(true);
      addToast('✨ Try-on look saved permanently to your profile!', 'success');
    } catch (err) {
      addToast('Could not save look. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Download high-resolution result
  const handleDownloadResult = async () => {
    if (!resultImageUrl) return;
    try {
      const resp = await fetch(resultImageUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Aruvi_TryOn_${(product?.title || 'Garment').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Downloaded high-resolution virtual try-on portrait!', 'success');
    } catch (e) {
      window.open(resultImageUrl, '_blank');
    }
  };

  // Add original product to shopping cart
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1, selectedSize);
    addToast(`Added "${product.title}" (${selectedSize}) to your bag!`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  const garmentImageUrl = getProductImageUrl(product);
  const currPrice = Number(product?.price) || 0;

  return (
    <div className="ai-fitting-overlay active" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}>
      <div className="ai-fitting-container max-w-5xl" style={{ maxHeight: '94vh' }}>
        
        {/* Luxury Header */}
        <div className="ai-fitting-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="ai-badge-chip">
                FASHN AI • MODEL: tryon-v1.6
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Official Production AI
              </span>
            </div>
            <h2 className="ai-fitting-title text-xl sm:text-2xl font-serif">
              Aruvi Virtual Try-On Atelier
            </h2>
            <p className="ai-fitting-subtitle text-xs sm:text-sm text-emerald-100/80">
              Preview how this authentic handcrafted boutique ensemble drapes on your silhouette using neural computer vision.
            </p>
          </div>
          <button 
            type="button"
            className="ai-fitting-close"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close Virtual Try-On"
          >
            ✕
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="ai-fitting-stepper flex flex-wrap justify-between sm:justify-center border-b border-slate-200 bg-slate-50/80 px-4 py-2.5">
          <div className={`ai-step-item ${step === 'upload' ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-label text-xs sm:text-sm">Your Photograph</span>
          </div>
          <div className="ai-step-divider hidden sm:block"></div>
          <div className={`ai-step-item ${step === 'confirm' ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-label text-xs sm:text-sm">Confirm Garment</span>
          </div>
          <div className="ai-step-divider hidden sm:block"></div>
          <div className={`ai-step-item ${step === 'processing' ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-label text-xs sm:text-sm">FASHN AI Synthesis</span>
          </div>
          <div className="ai-step-divider hidden sm:block"></div>
          <div className={`ai-step-item ${step === 'result' ? 'active' : ''}`}>
            <span className="step-num">4</span>
            <span className="step-label text-xs sm:text-sm">Try-On Result</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-ivory/20">
          
          {/* -------------------------------------------------------------
              STEP 1: CUSTOMER PHOTO UPLOAD & CAMERA
              ------------------------------------------------------------- */}
          {step === 'upload' && (
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Mandatory Instruction Banner */}
              <div className="bg-emerald-50 border border-emerald-700/20 rounded-2xl p-4 text-emerald-950 flex items-start gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Portrait Quality Guidelines
                  </h4>
                  <p className="text-xs sm:text-sm font-medium text-emerald-900 mt-1 leading-relaxed">
                    "Upload a clear, front-facing full-body photo with good lighting. Keep your complete body visible for the best virtual try-on results."
                  </p>
                </div>
              </div>

              {/* Camera Live Stream or Dual Action Cards */}
              {isCameraOpen ? (
                <div className="bg-slate-900 rounded-3xl p-4 text-white text-center space-y-4">
                  <div className="relative aspect-[3/4] max-h-[460px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-gold/50 shadow-inner">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-4 z-10">
                      <button
                        type="button"
                        onClick={captureCameraPhoto}
                        className="bg-gold text-primary-dark font-bold px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Take Snapshot</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="bg-white/20 backdrop-blur text-white px-4 py-2.5 rounded-full hover:bg-white/30 transition text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300">
                    Align your full body in the viewfinder with arms relaxed at your sides.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Option A: Upload Photo */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-900/20 hover:border-gold bg-white hover:bg-gold/5 rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] shadow-sm group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-gold/20 text-emerald-900 group-hover:text-gold-dark flex items-center justify-center mb-3 transition">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-primary-dark mb-1">
                      Upload Full-Body Photo
                    </h3>
                    <p className="text-xs text-text-muted mb-3">
                      JPG, PNG, or WebP from your device (Up to 15MB)
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-full">
                      Browse Files
                    </span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      className="hidden" 
                      onChange={handlePhotoSelect}
                    />
                  </div>

                  {/* Option B: Mobile / Webcam Camera */}
                  <div 
                    onClick={startCamera}
                    className="border-2 border-dashed border-emerald-900/20 hover:border-gold bg-white hover:bg-gold/5 rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] shadow-sm group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:bg-gold/20 text-emerald-900 group-hover:text-gold-dark flex items-center justify-center mb-3 transition">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif font-bold text-base text-primary-dark mb-1">
                      Take Photo with Camera
                    </h3>
                    <p className="text-xs text-text-muted mb-3">
                      Use your phone camera or webcam in natural lighting
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-dark bg-gold/15 px-3 py-1 rounded-full">
                      Launch Camera
                    </span>
                  </div>
                </div>
              )}

              {/* Selected Outfit Preview Card */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm flex items-center gap-4">
                <img 
                  src={garmentImageUrl} 
                  alt={product?.title} 
                  className="w-16 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                    Selected Boutique Ensemble
                  </span>
                  <h4 className="font-serif font-bold text-sm text-primary-dark truncate">
                    {product?.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs mt-0.5">
                    <span className="font-bold text-emerald-900">₹{currPrice.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">Size: {selectedSize}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 2: CONFIRMATION & CONSENT
              ------------------------------------------------------------- */}
          {step === 'confirm' && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Error banner if previous run failed */}
              {pollError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-xs sm:text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">FASHN AI Notice:</span>
                    <span>{pollError}</span>
                  </div>
                </div>
              )}

              {/* 2-Column Comparison Layout: Customer Photo + Garment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                
                {/* Customer Photo Column */}
                <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Your Photograph
                    </span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                    >
                      Change Photo
                    </button>
                  </div>
                  <div className="relative aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={customerPhoto} 
                      alt="Your portrait" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Garment Column */}
                <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                    Authentic Aruvi Garment
                  </span>
                  <div className="relative aspect-[3/4] max-h-[380px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img 
                      src={garmentImageUrl} 
                      alt={product?.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/40 to-transparent p-4 text-white">
                      <h4 className="font-serif font-bold text-sm leading-tight text-white mb-0.5">
                        {product?.title}
                      </h4>
                      <p className="text-xs text-gold">
                        ₹{currPrice.toLocaleString('en-IN')} • {product?.fabric || 'Artisanal Silk'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FASHN AI Configuration Controls */}
              <div className="bg-white rounded-3xl p-5 border border-emerald-900/10 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Garment Category
                    </label>
                    <select
                      value={garmentCategory}
                      onChange={(e) => setGarmentCategory(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-gold bg-slate-50"
                    >
                      <option value="auto">Auto-Detect from Ensemble</option>
                      <option value="one-pieces">One-Pieces (Sarees, Salwars, Shararas, Maxis)</option>
                      <option value="tops">Tops & Blouses</option>
                      <option value="bottoms">Bottoms & Pants</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      AI Synthesis Mode
                    </label>
                    <select
                      value={tryonMode}
                      onChange={(e) => setTryonMode(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-gold bg-slate-50"
                    >
                      <option value="balanced">Balanced (Recommended • Optimal Quality)</option>
                      <option value="quality">Quality (Deep Texture Synthesis)</option>
                      <option value="performance">Performance (Fast Generation)</option>
                    </select>
                  </div>
                </div>

                {/* Explicit Consent Checkbox (Mandatory requirement) */}
                <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-900/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-emerald-800 rounded focus:ring-gold"
                  />
                  <span className="text-xs text-emerald-950 font-medium leading-relaxed">
                    I consent to processing my photograph using FASHN AI (tryon-v1.6) for virtual try-on simulation. Photographs are encrypted, processed strictly for this fitting, and never shared publicly.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerateTryOn}
                  disabled={!consentGiven}
                  className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-lg ${
                    consentGiven 
                      ? 'bg-gradient-to-r from-gold via-amber-400 to-gold text-primary-dark hover:brightness-105 hover:scale-[1.02]' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-primary-dark" />
                  <span>Generate AI Try-On</span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 3: REAL FASHN AI PROCESSING EXPERIENCE (PHASE 8)
              ------------------------------------------------------------- */}
          {step === 'processing' && (
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              
              {/* Luxury Spinner */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-gold/20 animate-ping"></div>
                <div className="w-24 h-24 rounded-full border-4 border-emerald-900/20 border-t-gold animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gold-dark animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-primary-dark">
                  Creating Your Virtual Look
                </h3>
                <p className="text-sm font-semibold text-gold-dark">
                  {processingStatus}
                </p>
                <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">
                  Communicating directly with the official FASHN AI neural drape pipeline (Model: tryon-v1.6). Please hold on.
                </p>
              </div>

              {/* Progress Steps Checklist */}
              <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 text-left text-xs space-y-2.5 max-w-sm mx-auto shadow-sm">
                <div className="flex items-center gap-2.5 text-emerald-800 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Preparing customer portrait</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-800 font-semibold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Loading genuine garment image</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-800 font-semibold">
                  <RefreshCw className="w-4 h-4 text-gold animate-spin" />
                  <span>FASHN AI neural silhouette drape</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <span className="w-4 h-4 rounded-full border border-slate-300 inline-block"></span>
                  <span>Finalizing high-res render</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelGeneration}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Cancel Generation
              </button>
            </div>
          )}

          {/* -------------------------------------------------------------
              STEP 4: GENERATED IMAGE RESULT (PHASE 9)
              ------------------------------------------------------------- */}
          {step === 'result' && resultImageUrl && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Success Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Real FASHN AI Drape Generated
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Ensemble: {product?.title} (Model: tryon-v1.6)
                    </p>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-3 py-1 rounded-lg transition ${viewMode === 'side-by-side' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-lg transition ${viewMode === 'split' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Split Slider
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('result')}
                    className={`px-3 py-1 rounded-lg transition ${viewMode === 'result' ? 'bg-primary text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Try-On Only
                  </button>
                </div>
              </div>

              {/* Visual Result Display */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-emerald-900/10 shadow-lg">
                
                {/* Mode A: Side by Side */}
                {viewMode === 'side-by-side' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Original Portrait
                      </span>
                      <div className="aspect-[3/4] max-h-[460px] mx-auto rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img 
                          src={customerPhoto} 
                          alt="Original Portrait" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-center">
                      <span className="text-[11px] font-bold text-gold-dark uppercase tracking-wider flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                        FASHN AI Generated Try-On
                      </span>
                      <div className="aspect-[3/4] max-h-[460px] mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-gold shadow-md">
                        <img 
                          src={resultImageUrl} 
                          alt="FASHN AI Result" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mode B: Interactive Split Slider */}
                {viewMode === 'split' && (
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="relative aspect-[3/4] max-h-[500px] rounded-2xl overflow-hidden border border-slate-300 shadow-inner select-none">
                      {/* Under layer: Result Image */}
                      <img 
                        src={resultImageUrl} 
                        alt="FASHN AI Virtual Try-On" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Over layer: Original Customer Photo clipped by slider */}
                      <div 
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img 
                          src={customerPhoto} 
                          alt="Original Portrait" 
                          className="absolute inset-0 w-full h-full object-cover max-w-none"
                          style={{ width: '100%', height: '100%' }}
                        />
                      </div>
                      {/* Divider line */}
                      <div 
                        className="absolute inset-y-0 w-0.5 bg-gold shadow-lg"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gold text-primary-dark font-bold text-xs flex items-center justify-center shadow-md">
                          ↔
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-2">
                      <span className="text-[10px] font-bold text-slate-600">Original</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="w-full accent-gold cursor-pointer"
                      />
                      <span className="text-[10px] font-bold text-gold-dark">AI Try-On</span>
                    </div>
                  </div>
                )}

                {/* Mode C: Result Only */}
                {viewMode === 'result' && (
                  <div className="max-w-md mx-auto text-center space-y-2">
                    <div className="aspect-[3/4] max-h-[520px] mx-auto rounded-2xl overflow-hidden bg-slate-900 border-2 border-gold shadow-xl">
                      <img 
                        src={resultImageUrl} 
                        alt="FASHN AI Result" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-emerald-900/10 shadow-sm">
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('confirm')}
                    className="px-4 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again / Change Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveLook}
                    disabled={isSaved || isSaving}
                    className={`px-4 py-2.5 rounded-full border text-xs font-bold transition flex items-center gap-1.5 ${
                      isSaved 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Look Saved' : isSaving ? 'Saving...' : 'Save Look'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadResult}
                    className="px-4 py-2.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Portrait</span>
                  </button>
                </div>

                {/* Add to Cart with Original Product Details */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-md hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4 text-gold" />
                  <span>Add Outfit to Cart (₹{currPrice.toLocaleString('en-IN')})</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
