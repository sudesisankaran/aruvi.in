import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const FEATURED_LOOKS = [
  {
    id: 'look-1',
    tag: 'BRIDAL HERITAGE',
    title: 'Pure Kanjivaram Brocade Drape',
    subtitle: 'Woven with certified gold zari & timeless temple motifs',
    price: '₹8,999',
    origPrice: '₹12,499',
    category: 'ethnic-wear',
    image: 'assets/images/kanjivaram_green.jpg',
    badge: '👑 Master Weaver Silk'
  },
  {
    id: 'look-2',
    tag: 'FESTIVE ANARKALI',
    title: 'Emerald Zari Salwar Suit',
    subtitle: 'Flared tiered silhouette with royal artisanal embroidery',
    price: '₹4,999',
    origPrice: '₹6,999',
    category: 'salwar',
    image: 'assets/images/anarkali_suit.jpg',
    badge: '✨ Festive Launch'
  },
  {
    id: 'look-3',
    tag: 'ROYAL SHARARA',
    title: 'Gilded Mirrorwork Sharara Set',
    subtitle: 'Peplum embroidered kurti paired with voluminous flared pants',
    price: '₹5,499',
    origPrice: '₹7,999',
    category: 'sharara',
    image: 'assets/images/lehenga_set.jpg',
    badge: '💃 Best Seller'
  },
  {
    id: 'look-4',
    tag: 'INDO-WESTERN FUSION',
    title: 'Indigo Modal Silk Co-ord Set',
    subtitle: 'Hand-block motifs with structured modern tailored finish',
    price: '₹3,299',
    origPrice: '₹4,499',
    category: 'co-ordsets',
    image: 'assets/images/western_ethnic.jpg',
    badge: '🌟 Contemporary Chic'
  }
];

export default function HomePage() {
  const { categories } = useStore();
  const [activeLookIndex, setActiveLookIndex] = useState(0);

  // Auto-rotate featured looks every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % FEATURED_LOOKS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentLook = FEATURED_LOOKS[activeLookIndex];

  return (
    <div className="home-page-view">
      
      {/* Luxury Hero Showcase Section */}
      <section 
        className="hero-section" 
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(254, 252, 248, 0.98) 0%, rgba(246, 241, 232, 0.95) 50%, rgba(239, 231, 218, 0.9) 100%)',
          borderBottom: '1px solid rgba(200, 157, 56, 0.25)',
          padding: '60px 0 70px'
        }}
      >
        {/* Subtle decorative gold ambient accents */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,157,56,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,41,32,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container hero-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '50px', position: 'relative', zIndex: 2 }}>
          
          {/* Left Column: Branding & CTAs */}
          <div className="hero-content">
            
            {/* Top pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.12)', border: '1px solid rgba(200,157,56,0.4)', padding: '6px 14px', borderRadius: '99px', marginBottom: '18px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', display: 'inline-block' }} />
              <span style={{ color: '#0e2920', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Boutique Couture Showcase 2026
              </span>
            </div>

            <h1 className="hero-main-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)', color: '#0e2920', lineHeight: 1.15, marginBottom: '20px' }}>
              Tradition In Every Thread, <br />
              <span style={{ 
                background: 'linear-gradient(135deg, #c89d38 0%, #dfb85e 50%, #b38622 100%)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic'
              }}>
                Elegance In Every Drape.
              </span>
            </h1>

            <p className="hero-description" style={{ color: '#4a5d55', fontSize: '1.08rem', lineHeight: 1.65, maxWidth: '540px', marginBottom: '32px' }}>
              Discover handcrafted Salwars, royal Shararas, regal Ethnic Wear, flowing Maxis, Co-ordsets, and modern silhouettes curated for distinguished celebrations.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <Link 
                to="/shop" 
                className="btn btn-primary hover-shimmer" 
                style={{ 
                  padding: '15px 34px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  boxShadow: '0 10px 24px rgba(14,41,32,0.22)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Explore 9 Collections</span>
                <span>→</span>
              </Link>

              <Link 
                to="/fitting-room" 
                className="btn btn-secondary" 
                style={{ 
                  padding: '14px 28px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(200,157,56,0.5)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.05)'
                }}
              >
                <span>🪞 Launch Virtual Try-On</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="hero-stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(200,157,56,0.25)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0e2920', fontFamily: 'var(--font-serif)' }}>9+</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Boutique Services</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.5rem', color: '#0e2920', fontFamily: 'var(--font-serif)' }}>100%</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certified Handloom</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.5rem', color: '#c89d38', fontFamily: 'var(--font-serif)' }}>4.9 ★</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patron Reviews</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Featured Look Card */}
          <div className="hero-visual" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* Main Showcase Card with Smooth Transitions */}
            <div 
              className="hero-card-frame card-3d" 
              style={{ 
                maxWidth: '440px', 
                width: '100%', 
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: '0 30px 60px rgba(14,41,32,0.22)', 
                border: '2px solid rgba(200,157,56,0.4)', 
                background: '#fff',
                position: 'relative'
              }}
            >
              {/* Floating Top Badge */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 3, background: 'rgba(14,41,32,0.85)', backdropFilter: 'blur(8px)', color: 'var(--color-gold)', padding: '6px 14px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid rgba(200,157,56,0.4)' }}>
                {currentLook.badge}
              </div>

              {/* Discount Tag */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 3, background: 'rgba(201,59,59,0.9)', color: '#fff', padding: '6px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                FESTIVE DROP
              </div>

              {/* Garment Image */}
              <div style={{ position: 'relative', height: '440px', overflow: 'hidden', background: '#0e2920' }}>
                <img 
                  key={currentLook.id}
                  src={currentLook.image} 
                  alt={currentLook.title} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    animation: 'fadeIn 0.6s ease'
                  }} 
                  onError={(e) => { e.currentTarget.src = 'assets/images/kanjivaram_green.jpg'; }}
                />
              </div>

              {/* Card Footer Banner */}
              <div style={{ padding: '22px', background: 'linear-gradient(135deg, #0e2920 0%, #153b2f 100%)', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                    {currentLook.tag}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#e0d8cc' }}>
                    Look {activeLookIndex + 1} of {FEATURED_LOOKS.length}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', margin: '2px 0 6px', color: '#ffffff' }}>
                  {currentLook.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', margin: '0 0 14px', lineHeight: 1.4 }}>
                  {currentLook.subtitle}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(200,157,56,0.3)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-gold)', fontFamily: 'var(--font-serif)' }}>
                      {currentLook.price}
                    </span>
                    <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.5)' }}>
                      {currentLook.origPrice}
                    </span>
                  </div>

                  <Link 
                    to={`/shop?category=${currentLook.category}`} 
                    className="hover-gold-text"
                    style={{ 
                      color: '#ffffff', 
                      fontSize: '0.88rem', 
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(200,157,56,0.2)',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid rgba(200,157,56,0.4)'
                    }}
                  >
                    <span>Shop Look</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Look Switcher Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {FEATURED_LOOKS.map((look, idx) => {
                const isActive = activeLookIndex === idx;
                return (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => setActiveLookIndex(idx)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      border: isActive ? '1.5px solid var(--color-primary)' : '1px solid #d4c8b8',
                      background: isActive ? 'var(--color-primary)' : '#ffffff',
                      color: isActive ? '#ffffff' : '#0e2920',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(14,41,32,0.15)' : 'none'
                    }}
                  >
                    {idx + 1}. {look.tag}
                  </button>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 9 Boutique Categories Visual Strip */}
      <section className="categories-strip-section" style={{ padding: '40px 0', background: 'rgba(255,255,255,0.7)', borderTop: '1px solid rgba(200,157,56,0.15)', borderBottom: '1px solid rgba(200,157,56,0.15)' }}>
        <div className="container">
          <div className="section-header-row" style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>Curated Services</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#0e2920', marginTop: '4px' }}>Explore By Category</h2>
            <p style={{ color: '#667770', fontSize: '0.92rem' }}>Browse all 9 boutique fashion services handcrafted for every celebration.</p>
          </div>

          <div className="category-circles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '20px', textAlign: 'center' }}>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/shop?category=${cat.id}`}
                className="category-circle-item hover-scale"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#0e2920', transition: 'all 0.3s ease' }}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--color-gold)', padding: '3px', background: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', marginBottom: '10px' }}>
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'assets/images/kanjivaram_green.jpg'; }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>{cat.name}</span>
                <span style={{ fontSize: '0.72rem', color: '#889990', marginTop: '2px' }}>{cat.count || 'Explore'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Try-on Banner */}
      <section className="fitting-room-promo-section" style={{ padding: '60px 0', background: 'radial-gradient(circle at center, #133a2d 0%, #081a14 100%)', color: '#fff', margin: '40px 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '30px' }}>
          <div style={{ maxWidth: '580px' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
              AI Smart Drape Visualizer
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', margin: '12px 0 16px', color: '#fff' }}>
              Virtual Fitting Room
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Experience authentic fit before you buy! Select your model silhouette or upload your photo, pick any salwar, sharara, or ethnic outfit, and preview the drape live with realistic texture simulation.
            </p>
            <Link to="/fitting-room" className="btn btn-primary hover-shimmer" style={{ background: 'var(--color-gold)', color: '#0e2920', fontWeight: 'bold', padding: '12px 28px' }}>
              Launch Virtual Fitting Room 🪞
            </Link>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(200,157,56,0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center', minWidth: '260px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>✨</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-gold)' }}>Live Try-On Models</h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Pooja, Meera, Ananya & Kids</p>
            <span style={{ display: 'inline-block', marginTop: '12px', background: 'rgba(200,157,56,0.2)', color: 'var(--color-gold)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>100% Free Interactive Feature</span>
          </div>
        </div>
      </section>

      {/* Boutique USPs */}
      <section className="boutique-usps-section" style={{ background: '#f6f3ee', padding: '50px 0', borderTop: '1px solid rgba(200,157,56,0.15)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>✨</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#0e2920', marginBottom: '6px' }}>Master Craftsmanship</h4>
            <p style={{ fontSize: '0.85rem', color: '#667770', lineHeight: 1.5 }}>Handcrafted by veteran artisans dedicated to Indian heritage weaves.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🚚</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#0e2920', marginBottom: '6px' }}>Express Shipping</h4>
            <p style={{ fontSize: '0.85rem', color: '#667770', lineHeight: 1.5 }}>Complimentary insured priority delivery on orders above ₹999.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🔒</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#0e2920', marginBottom: '6px' }}>Secure Payments</h4>
            <p style={{ fontSize: '0.85rem', color: '#667770', lineHeight: 1.5 }}>UPI, GPay, Credit/Debit cards & Cash on Delivery accepted.</p>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>💬</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: '#0e2920', marginBottom: '6px' }}>24/7 Concierge</h4>
            <p style={{ fontSize: '0.85rem', color: '#667770', lineHeight: 1.5 }}>Dedicated stylist support for custom measurements & bridal curation.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
