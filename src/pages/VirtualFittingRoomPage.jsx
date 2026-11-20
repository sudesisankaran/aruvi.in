import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const MODELS = [
  { id: 'pooja', name: 'Pooja', style: 'Modern Silks & Salwars', height: "5'6\"", image: 'assets/images/kanjivaram_green.jpg' },
  { id: 'meera', name: 'Meera', style: 'Bridal & Traditional Ethnic', height: "5'4\"", image: 'assets/images/kanjivaram_red.jpg' },
  { id: 'ananya', name: 'Ananya', style: 'Contemporary Indo-Western & Maxis', height: "5'7\"", image: 'assets/images/soft_silk_blue.jpg' },
  { id: 'diya-aarav', name: 'Diya & Aarav', style: 'Kids Festive Outfits', height: "4'2\"", image: 'assets/images/organza_pink.jpg' },
];

export default function VirtualFittingRoomPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, addToCart, addToast } = useStore();

  const initialProductId = searchParams.get('productId');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedProduct, setSelectedProduct] = useState(
    products.find(p => String(p.id) === String(initialProductId)) || products[0] || null
  );
  const [customPhoto, setCustomPhoto] = useState(null);
  const [blendOpacity, setBlendOpacity] = useState(90);
  const [lightingPreset, setLightingPreset] = useState('boutique'); // 'boutique', 'daylight', 'evening'
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (initialProductId) {
      const found = products.find(p => String(p.id) === String(initialProductId));
      if (found) setSelectedProduct(found);
    }
  }, [initialProductId, products]);

  const handleCustomPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomPhoto(url);
      addToast('Custom photo loaded for virtual fitting!', 'success');
    }
  };

  const handleApplyTryon = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      addToast('AI Silhouette draped successfully!', 'success');
    }, 600);
  };

  return (
    <div className="fitting-room-page-view" style={{ padding: '30px 0 80px' }}>
      <div className="container">

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
            Smart Dressing Suite
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#0e2920', marginTop: '4px' }}>
            AI Virtual Fitting Room
          </h1>
          <p style={{ color: '#667770', fontSize: '0.95rem', maxWidth: '640px', margin: '6px auto 0' }}>
            Simulate realistic fabric drape, fall, and silhouette matching across your favorite Salwars, Shararas, Sarees, and Kids Wear.
          </p>
        </div>

        {/* 3-Column Studio Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          {/* Column 1: Model Selection */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#0e2920', marginBottom: '14px' }}>
              1. Choose Model Silhouette
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {MODELS.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => { setSelectedModel(m); setCustomPhoto(null); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: selectedModel.id === m.id && !customPhoto ? '2px solid var(--color-primary)' : '1px solid #eee',
                    background: selectedModel.id === m.id && !customPhoto ? '#f4fbf7' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <img src={m.image} alt={m.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0e2920' }}>{m.name} ({m.height})</strong>
                    <span style={{ fontSize: '0.78rem', color: '#667770' }}>{m.style}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload your own */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: '#0e2920', marginBottom: '8px' }}>
                📸 Or Upload Your Full Body Photo
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleCustomPhotoUpload}
                style={{ fontSize: '0.85rem' }} 
              />
              {customPhoto && (
                <span style={{ display: 'block', marginTop: '6px', color: '#0f5132', fontSize: '0.8rem', fontWeight: 600 }}>
                  ✓ Custom photo active
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Live Try-on Visualizer Canvas */}
          <div style={{ background: '#0e2920', borderRadius: '20px', padding: '24px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(14,41,32,0.25)' }}>
            
            <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(200,157,56,0.2)', color: 'var(--color-gold)', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
              AI Silhouette Engine v2.4
            </div>

            {/* Canvas / Image Display */}
            <div style={{ height: '480px', position: 'relative', margin: '40px auto 20px', borderRadius: '12px', overflow: 'hidden', background: '#081a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isProcessing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,41,32,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✨</div>
                  <span style={{ color: 'var(--color-gold)', fontWeight: 600 }}>Synthesizing Drape & Fall...</span>
                </div>
              )}

              {/* Background Model Image */}
              <img 
                src={customPhoto || selectedModel.image} 
                alt="Model" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {/* Overlaid Garment */}
              {selectedProduct && (
                <div 
                  style={{
                    position: 'absolute',
                    inset: '10%',
                    opacity: blendOpacity / 100,
                    mixBlendMode: lightingPreset === 'evening' ? 'screen' : 'normal',
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }} 
                  />
                </div>
              )}
            </div>

            {/* Interactive Canvas Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 16px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Fabric Opacity:</span>
                <input 
                  type="range" 
                  min="40" 
                  max="100" 
                  value={blendOpacity}
                  onChange={(e) => setBlendOpacity(Number(e.target.value))}
                  style={{ accentColor: 'var(--color-gold)', width: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Light:</span>
                <select 
                  value={lightingPreset} 
                  onChange={(e) => setLightingPreset(e.target.value)}
                  style={{ background: '#0e2920', color: '#fff', border: '1px solid var(--color-gold)', borderRadius: '4px', padding: '2px 6px', fontSize: '0.78rem' }}
                >
                  <option value="boutique">Boutique</option>
                  <option value="daylight">Daylight</option>
                  <option value="evening">Evening Gala</option>
                </select>
              </div>
            </div>

            {/* Re-simulate */}
            <button 
              type="button" 
              onClick={handleApplyTryon}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '16px', background: 'var(--color-gold)', color: '#0e2920', fontWeight: 'bold' }}
            >
              🔄 Refresh Drape Simulation
            </button>
          </div>

          {/* Column 3: Garment Picker & Quick Buy */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#0e2920', marginBottom: '14px' }}>
              2. Select Outfit To Try
            </h3>

            {/* Garments scroller */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', marginBottom: '24px' }}>
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => { setSelectedProduct(p); handleApplyTryon(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid #eee',
                      background: isSelected ? '#f4fbf7' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <img src={p.image} alt={p.title} style={{ width: '48px', height: '54px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0e2920' }}>{p.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#667770' }}>₹{(Number(p.price) || 0).toLocaleString('en-IN')} • {p.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Product Action Box */}
            {selectedProduct && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 700 }}>Currently Draped</span>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#0e2920', margin: '4px 0 8px' }}>{selectedProduct.title}</h4>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0e2920', marginBottom: '16px' }}>
                  ₹{(Number(selectedProduct.price) || 0).toLocaleString('en-IN')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      addToCart(selectedProduct, 1, selectedProduct.sizes?.[0] || 'M');
                    }}
                    className="btn btn-primary hover-shimmer"
                    style={{ width: '100%', padding: '12px', fontWeight: 600 }}
                  >
                    👜 Add Draped Outfit to Bag
                  </button>
                  <button 
                    type="button" 
                    onClick={() => navigate(`/product/${selectedProduct.id}`)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                  >
                    View Complete Details
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
