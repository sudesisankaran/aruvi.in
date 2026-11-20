import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, categories, banners } = useStore();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Dynamic Featured Looks: Automatically reflects uploaded products from Admin Dashboard
  const featuredLooks = useMemo(() => {
    if (products && products.length > 0) {
      return products.slice(0, 5).map((p, idx) => {
        const currPrice = Number(p.price) || 0;
        const origPrice = Number(p.originalPrice) || Math.round(currPrice * 1.25);
        return {
          id: p.id,
          tag: (p.badge || p.category || 'FEATURED').toUpperCase().replace('-', ' '),
          title: p.title,
          subtitle: p.fabric ? `${p.fabric} • Handcrafted Luxury` : (p.description || 'Artisanal Handloom Silk'),
          price: `₹${currPrice.toLocaleString('en-IN')}`,
          origPrice: origPrice > currPrice ? `₹${origPrice.toLocaleString('en-IN')}` : '',
          category: p.category,
          image: p.image || 'assets/images/kanjivaram_green.jpg',
          badge: p.badge || `👑 Featured ${idx + 1}`,
          productId: p.id
        };
      });
    }
    return [];
  }, [products]);

  // Safe index in case products count changes
  const safeIndex = activeLookIndex < featuredLooks.length ? activeLookIndex : 0;
  const currentLook = featuredLooks[safeIndex] || featuredLooks[0];

  // Auto-rotate featured looks every 5 seconds
  useEffect(() => {
    if (featuredLooks.length <= 1) return;
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % featuredLooks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredLooks.length]);

  // Filtered products for homepage grid
  const displayedProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') {
      return products.slice(0, 8);
    }
    return products
      .filter((p) => (p.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase())
      .slice(0, 8);
  }, [products, selectedCategoryFilter]);

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
                className="btn btn-secondary hover-shimmer" 
                style={{ 
                  padding: '14px 28px', 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  background: '#ffffff',
                  border: '1.5px solid rgba(200,157,56,0.6)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  cursor: 'pointer'
                }}
              >
                <span>✨ AI Virtual Try-On</span>
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

          {/* Right Column: Interactive Featured Look Card or Atelier Welcome */}
          <div className="hero-visual" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {currentLook ? (
              <>
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
                    LATEST DROP
                  </div>

                  {/* Garment Image */}
                  <div style={{ position: 'relative', height: '440px', overflow: 'hidden', background: '#0e2920' }}>
                    <Link to={currentLook.productId ? `/product/${currentLook.productId}` : `/shop?category=${currentLook.category}`}>
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
                    </Link>
                  </div>

                  {/* Card Footer Banner */}
                  <div style={{ padding: '22px', background: 'linear-gradient(135deg, #0e2920 0%, #153b2f 100%)', color: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                        {currentLook.tag}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#e0d8cc' }}>
                        Look {safeIndex + 1} of {featuredLooks.length}
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
                        {currentLook.origPrice && (
                          <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'rgba(255,255,255,0.5)' }}>
                            {currentLook.origPrice}
                          </span>
                        )}
                      </div>

                      <Link 
                        to={currentLook.productId ? `/product/${currentLook.productId}` : `/shop?category=${currentLook.category}`} 
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
                {featuredLooks.length > 1 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {featuredLooks.map((look, idx) => {
                      const isActive = safeIndex === idx;
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
                )}
              </>
            ) : (
              /* Royal Atelier Showcase Card when catalog starts with 0 products */
              <div 
                className="hero-card-frame" 
                style={{ 
                  maxWidth: '440px', 
                  width: '100%', 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 30px 60px rgba(14,41,32,0.18)', 
                  border: '2px solid rgba(200,157,56,0.5)', 
                  background: 'linear-gradient(145deg, #0e2920 0%, #153b2f 60%, #0a1f18 100%)',
                  color: '#fff',
                  padding: '36px 28px',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(200,157,56,0.18)', border: '2px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '1.8rem' }}>
                  👑
                </div>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
                  Aruvi Boutique Atelier
                </span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#fff', margin: '10px 0 12px', lineHeight: 1.3 }}>
                  Artisanal Handloom Elegance
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '24px' }}>
                  Every drape is woven with pure dedication by master artisans. Explore our collections or customize your bridal ensembles directly with our stylists.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/categories"
                    className="btn btn-primary"
                    style={{ background: 'var(--color-gold)', color: '#0e2920', fontWeight: 'bold', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}
                  >
                    ✨ Explore Categories
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* Promotional Banners Showcase (Uploaded from Admin) */}
      {banners && banners.length > 0 && (
        <section className="admin-banners-showcase" style={{ padding: '36px 0', background: '#faf8f5', borderBottom: '1px solid rgba(200,157,56,0.15)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: banners.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {banners.map((b) => (
                <div 
                  key={b.id} 
                  style={{ 
                    position: 'relative', 
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    minHeight: '230px', 
                    boxShadow: '0 12px 30px rgba(14,41,32,0.08)',
                    border: '1.5px solid rgba(200,157,56,0.3)',
                    display: 'flex',
                    alignItems: 'flex-end'
                  }}
                >
                  <img 
                    src={b.image_url} 
                    alt={b.title} 
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'assets/images/festive_promo.jpg'; }}
                  />
                  <div style={{ position: 'relative', zIndex: 2, padding: '26px', background: 'linear-gradient(to top, rgba(14,41,32,0.92) 0%, rgba(14,41,32,0.4) 65%, transparent 100%)', width: '100%', color: '#fff' }}>
                    <span style={{ background: 'var(--color-gold)', color: '#0e2920', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {b.tag || 'EXCLUSIVE DROP'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.55rem', margin: '8px 0 4px', color: '#fff' }}>
                      {b.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 14px' }}>
                      {b.subtitle}
                    </p>
                    <Link to="/shop" className="btn btn-sm btn-primary hover-shimmer" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                      Explore Collection →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9 Boutique Categories Auto-Scroll Showcase */}
      <section 
        className="categories-strip-section" 
        style={{ 
          padding: '48px 0 54px', 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, #fbf9f6 100%)', 
          borderTop: '1px solid rgba(200,157,56,0.18)', 
          borderBottom: '1px solid rgba(200,157,56,0.18)',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.1)', border: '1px solid rgba(200,157,56,0.3)', padding: '4px 14px', borderRadius: '99px', marginBottom: '10px' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
              Curated Services & Collections
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', color: '#0e2920', marginTop: '2px', marginBottom: '6px' }}>
            Explore Handcrafted Services
          </h2>
          <p style={{ color: '#667770', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto' }}>
            Continuous couture runway — tap or hover on any of our 9 boutique services to explore curated drapes.
          </p>
        </div>

        {/* Auto-Scroll Continuous Track (Pauses on Hover) */}
        <div className="services-auto-scroll-container">
          <div className="services-auto-scroll-track">
            {[...categories, ...categories].map((cat, idx) => (
              <Link 
                key={`${cat.id}-${idx}`} 
                to={`/shop?category=${cat.id}`}
                className="category-circle-item hover-scale"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textDecoration: 'none', 
                  color: '#0e2920', 
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  width: '136px',
                  textAlign: 'center',
                  padding: '14px 10px',
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(200,157,56,0.2)',
                  boxShadow: '0 6px 16px rgba(14,41,32,0.04)'
                }}
              >
                <div 
                  style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '2.5px solid var(--color-gold)', 
                    padding: '3px', 
                    background: '#fff', 
                    boxShadow: '0 8px 20px rgba(14,41,32,0.12)', 
                    marginBottom: '10px'
                  }}
                >
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'assets/images/kanjivaram_green.jpg'; }}
                  />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.25, color: '#0e2920' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#c89d38', fontWeight: 600, marginTop: '4px' }}>
                  Explore Collection →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Products Grid: Latest Drops uploaded by Admin */}
      <section className="featured-products-section" style={{ padding: '64px 0 76px', background: '#fdfbf7', borderBottom: '1px solid rgba(200,157,56,0.15)' }}>
        <div className="container">
          
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.12)', border: '1px solid rgba(200,157,56,0.4)', padding: '4px 14px', borderRadius: '99px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                  ✨ Fresh Boutique Creations
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', color: '#0e2920', margin: '4px 0 6px' }}>
                Latest Arrivals In Loom & Store
              </h2>
              <p style={{ color: '#667770', fontSize: '0.95rem', margin: 0, maxWidth: '580px' }}>
                Handcrafted Salwars, royal Shararas, rich Kanchipurams, and contemporary silhouettes curated live for you.
              </p>
            </div>

            <Link 
              to="/shop" 
              className="btn btn-secondary hover-shimmer"
              style={{ padding: '10px 22px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1.5px solid rgba(200,157,56,0.5)' }}
            >
              <span>View All Collection ({products.length})</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '24px' }}>
            {['all', 'salwar', 'sharara', 'ethnic-wear', 'maxis', 'co-ordsets', 'casual-tops', 'western-wear', 'kids-wear'].map((catKey) => {
              const isSelected = selectedCategoryFilter === catKey;
              const catObj = categories.find(c => c.id === catKey);
              const label = catKey === 'all' ? 'All Ensembles' : (catObj ? catObj.name : catKey);
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(catKey)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '99px',
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid #d8cfc4',
                    background: isSelected ? 'var(--color-primary)' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0e2920',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(14,41,32,0.12)' : 'none'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '28px' }}>
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {displayedProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1.5px dashed rgba(200,157,56,0.3)', boxShadow: '0 6px 20px rgba(14,41,32,0.03)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>✨</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920' }}>
                {products.length === 0 ? 'New Collections Arriving Soon' : 'No garments found in this category'}
              </h3>
              <p style={{ color: '#667770', fontSize: '0.92rem', margin: '8px auto 24px', maxWidth: '460px', lineHeight: 1.6 }}>
                {products.length === 0 
                  ? 'Our master artisans are handcrafting exquisite new arrivals. Explore our boutique categories or reach out directly via WhatsApp for custom tailoring & inquiries.'
                  : 'Try selecting another collection or view all ensembles.'}
              </p>
              {products.length === 0 ? (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/categories" className="btn btn-primary hover-shimmer" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                    ✨ Explore Categories
                  </Link>
                  <a 
                    href="https://wa.me/919940881987?text=Hi%20Aruvi%20Collections,%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20boutique%20collections."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary" 
                    style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                  >
                    💬 WhatsApp Concierge
                  </a>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => setSelectedCategoryFilter('all')} 
                  className="btn btn-sm btn-primary"
                >
                  View All Ensembles
                </button>
              )}
            </div>
          )}

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