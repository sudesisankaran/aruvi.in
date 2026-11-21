import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

export default function HomePage() {
  const navigate = useNavigate();
  const { products, categories, banners, websiteSettings } = useStore();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const waNumber = (websiteSettings?.whatsappNumber || '918610638978').replace(/[^0-9]/g, '');

  // Filter ONLY Active products for public customer website
  const activeProducts = useMemo(() => {
    return (products || []).filter((p) => (p.status || 'active').toLowerCase() === 'active');
  }, [products]);

  // 1. Featured Products (isFeatured === true or top picks)
  const featuredProducts = useMemo(() => {
    const explicit = activeProducts.filter((p) => p.isFeatured);
    if (explicit.length > 0) return explicit.slice(0, 8);
    return activeProducts.slice(0, 4);
  }, [activeProducts]);

  // 2. Latest Products (sorted by newest created / ID descending)
  const latestProducts = useMemo(() => {
    return [...activeProducts]
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return Number(b.id) - Number(a.id);
      })
      .slice(0, 8);
  }, [activeProducts]);

  // 3. Special Offers (only products with genuine discount price)
  const specialOffers = useMemo(() => {
    return activeProducts
      .filter((p) => {
        const curr = Number(p.price) || 0;
        const orig = Number(p.originalPrice) || curr;
        const hasDiscount = orig > curr;
        const hasOfferBadge = p.badge && (p.badge.toLowerCase().includes('offer') || p.badge.toLowerCase().includes('sale') || p.badge.toLowerCase().includes('deal'));
        return hasDiscount || hasOfferBadge;
      })
      .slice(0, 8);
  }, [activeProducts]);

  // 4. All Products (filter by selected category tab)
  const allFilteredProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') {
      return activeProducts;
    }
    return activeProducts.filter((p) => 
      (p.category || '').toLowerCase() === selectedCategoryFilter.toLowerCase()
    );
  }, [activeProducts, selectedCategoryFilter]);

  // Dynamic Hero Featured Looks
  const featuredLooks = useMemo(() => {
    if (activeProducts.length > 0) {
      return activeProducts.slice(0, 5).map((p, idx) => {
        const currPrice = Number(p.price) || 0;
        const origPrice = Number(p.originalPrice) || currPrice;
        return {
          id: p.id,
          tag: (p.badge || p.category || 'FEATURED').toUpperCase().replace('-', ' '),
          title: p.title,
          subtitle: p.fabric ? `${p.fabric} • Handcrafted Luxury` : (p.description || 'Artisanal Handloom Silk'),
          price: `₹${currPrice.toLocaleString('en-IN')}`,
          origPrice: origPrice > currPrice ? `₹${origPrice.toLocaleString('en-IN')}` : '',
          category: p.category,
          image: getProductImageUrl(p),
          badge: p.badge || `👑 Look ${idx + 1}`,
          productId: p.id
        };
      });
    }
    return [];
  }, [activeProducts]);

  const safeIndex = activeLookIndex < featuredLooks.length ? activeLookIndex : 0;
  const currentLook = featuredLooks[safeIndex] || featuredLooks[0];

  useEffect(() => {
    if (featuredLooks.length <= 1) return;
    const timer = setInterval(() => {
      setActiveLookIndex((prev) => (prev + 1) % featuredLooks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredLooks.length]);

  return (
    <div className="home-page-view">
      
      {/* =========================================================
          HERO SHOWCASE SECTION
          ========================================================= */}
      <section 
        className="hero-section" 
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(254, 252, 248, 0.98) 0%, rgba(246, 241, 232, 0.95) 50%, rgba(239, 231, 218, 0.9) 100%)',
          borderBottom: '1px solid rgba(200, 157, 56, 0.25)',
          padding: '50px 0 65px'
        }}
      >
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,157,56,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,41,32,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container hero-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '48px', position: 'relative', zIndex: 2 }}>
          
          {/* Left Column: Branding & CTAs */}
          <div className="hero-content">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.12)', border: '1px solid rgba(200,157,56,0.4)', padding: '6px 14px', borderRadius: '99px', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)', display: 'inline-block' }} />
              <span style={{ color: '#0e2920', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
                Boutique Couture Showcase 2026
              </span>
            </div>

            <h1 className="hero-main-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.3rem, 5vw, 4rem)', color: '#0e2920', lineHeight: 1.16, marginBottom: '18px' }}>
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

            <p className="hero-subtext" style={{ fontSize: '1rem', color: '#55665f', lineHeight: 1.6, maxWidth: '540px', marginBottom: '26px' }}>
              Welcome to <strong>Aruvi Collections</strong>. Explore authentic Salwars, royal Shararas, pure festive silks, and bespoke handloom ensembles crafted to celebrate your moments.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a 
                href="#all-products-section"
                className="btn btn-primary hover-shimmer"
                style={{ background: 'var(--color-primary)', color: '#fff', padding: '13px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem', boxShadow: '0 8px 24px rgba(14,41,32,0.22)' }}
              >
                Shop All Creations ({activeProducts.length}) ↓
              </a>
              <Link 
                to="/fitting-room"
                className="btn btn-secondary"
                style={{ padding: '13px 24px', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem', background: '#fff', border: '1.5px solid var(--color-gold)', color: '#0e2920', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <span>🪞 AI Fitting Room</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Featured Look Showcase */}
          <div className="hero-showcase-visual" style={{ position: 'relative' }}>
            {currentLook ? (
              <div 
                style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 24px 50px rgba(14,41,32,0.18)', 
                  border: '2px solid rgba(200,157,56,0.5)', 
                  background: '#fff',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
                  <img 
                    src={currentLook.image} 
                    alt={currentLook.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => handleImageError(e, look)}
                  />
                  <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--color-primary)', color: '#fff', padding: '5px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {currentLook.tag}
                  </span>
                </div>

                <div style={{ padding: '20px 24px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: '#0e2920', margin: '0 0 4px' }}>
                      {currentLook.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {currentLook.price}
                      </span>
                      {currentLook.origPrice && (
                        <span style={{ fontSize: '0.92rem', color: '#889990', textDecoration: 'line-through' }}>
                          {currentLook.origPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link 
                    to={`/product/${currentLook.productId}`}
                    className="btn btn-sm btn-primary hover-shimmer"
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ) : (
              <div 
                style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 24px 50px rgba(14,41,32,0.18)', 
                  border: '2px solid rgba(200,157,56,0.5)', 
                  background: 'linear-gradient(145deg, #0e2920 0%, #153b2f 60%, #0a1f18 100%)',
                  color: '#fff',
                  padding: '36px 28px',
                  textAlign: 'center'
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

      {/* Promotional Banners Showcase (if any) */}
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
                  <div style={{ position: 'relative', zIndex: 2, padding: '24px', background: 'linear-gradient(to top, rgba(14,41,32,0.92) 0%, rgba(14,41,32,0.4) 65%, transparent 100%)', width: '100%', color: '#fff' }}>
                    <span style={{ background: 'var(--color-gold)', color: '#0e2920', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {b.tag || 'EXCLUSIVE DROP'}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '8px 0 4px', color: '#fff' }}>
                      {b.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px' }}>
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

      {/* =========================================================
          SECTION 1: SHOP BY CATEGORY (9 Boutique Categories)
          ========================================================= */}
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.1)', border: '1px solid rgba(200,157,56,0.3)', padding: '4px 14px', borderRadius: '99px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
              Curated Services & Collections
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', color: '#0e2920', marginTop: '2px', marginBottom: '6px' }}>
            Shop by Category
          </h2>
          <p style={{ color: '#667770', fontSize: '0.92rem', maxWidth: '540px', margin: '0 auto' }}>
            Tap any of our 9 handcrafted boutique services to explore curated drapes and silhouettes.
          </p>
        </div>

        {/* Categories Auto-Scroll Track */}
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
                  background: 'rgba(255,255,255,0.85)',
                  border: '1px solid rgba(200,157,56,0.25)',
                  boxShadow: '0 6px 16px rgba(14,41,32,0.04)'
                }}
              >
                <div 
                  style={{ 
                    width: '88px', 
                    height: '88px', 
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
                    onError={(e) => handleImageError(e, look)}
                  />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, lineHeight: 1.25, color: '#0e2920' }}>
                  {cat.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#c89d38', fontWeight: 600, marginTop: '4px' }}>
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 2: LATEST PRODUCTS (New Arrivals)
          ========================================================= */}
      {latestProducts.length > 0 && (
        <section className="latest-products-section" style={{ padding: '60px 0', background: '#ffffff', borderBottom: '1px solid rgba(200,157,56,0.15)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(4,120,87,0.1)', border: '1px solid rgba(4,120,87,0.3)', padding: '4px 12px', borderRadius: '99px', marginBottom: '8px' }}>
                  <span style={{ color: '#047857', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 700 }}>
                    ✨ Newly Added Drops
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#0e2920', margin: '2px 0 4px' }}>
                  Latest Products
                </h2>
                <p style={{ color: '#667770', fontSize: '0.94rem', margin: 0 }}>
                  Fresh from our boutique loom and central atelier — live in real-time.
                </p>
              </div>

              <Link 
                to="/shop" 
                className="btn btn-sm btn-secondary hover-shimmer"
                style={{ padding: '9px 20px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px' }}
              >
                View All New ({latestProducts.length}) →
              </Link>
            </div>

            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '26px' }}>
              {latestProducts.map((product) => (
                <ProductCard key={`latest-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 3: FEATURED PRODUCTS
          ========================================================= */}
      {featuredProducts.length > 0 && (
        <section className="featured-products-section" style={{ padding: '60px 0', background: '#fdfbf7', borderBottom: '1px solid rgba(200,157,56,0.15)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.12)', border: '1px solid rgba(200,157,56,0.4)', padding: '4px 12px', borderRadius: '99px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 700 }}>
                    👑 Atelier Signature Picks
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#0e2920', margin: '2px 0 4px' }}>
                  Featured Products
                </h2>
                <p style={{ color: '#667770', fontSize: '0.94rem', margin: 0 }}>
                  Curated bridal ensembles, rich heritage silks, and signature couture designs.
                </p>
              </div>

              <Link 
                to="/shop" 
                className="btn btn-sm btn-secondary hover-shimmer"
                style={{ padding: '9px 20px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px' }}
              >
                Browse Featured →
              </Link>
            </div>

            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '26px' }}>
              {featuredProducts.map((product) => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 4: SPECIAL OFFERS (Only when applicable)
          ========================================================= */}
      {specialOffers.length > 0 && (
        <section className="special-offers-section" style={{ padding: '60px 0', background: 'linear-gradient(180deg, #fefbf4 0%, #fff 100%)', borderBottom: '1px solid rgba(200,157,56,0.18)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(201,59,59,0.1)', border: '1px solid rgba(201,59,59,0.3)', padding: '4px 12px', borderRadius: '99px', marginBottom: '8px' }}>
                  <span style={{ color: '#c93b3b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '1.4px', fontWeight: 700 }}>
                    🏷️ Limited Festive Deals
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#0e2920', margin: '2px 0 4px' }}>
                  Special Offers
                </h2>
                <p style={{ color: '#667770', fontSize: '0.94rem', margin: 0 }}>
                  Exclusive savings on handcrafted drapes — save extra with coupon ARUVI20 at checkout.
                </p>
              </div>

              <Link 
                to="/shop" 
                className="btn btn-sm btn-primary hover-shimmer"
                style={{ padding: '9px 20px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px' }}
              >
                View All Offers ({specialOffers.length}) →
              </Link>
            </div>

            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '26px' }}>
              {specialOffers.map((product) => (
                <ProductCard key={`offer-${product.id}`} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          SECTION 5: ALL PRODUCTS (Interactive Filter Grid)
          ========================================================= */}
      <section 
        id="all-products-section" 
        className="all-products-section" 
        style={{ padding: '64px 0 76px', background: '#faf8f5', borderBottom: '1px solid rgba(200,157,56,0.15)' }}
      >
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(200,157,56,0.12)', border: '1px solid rgba(200,157,56,0.4)', padding: '4px 14px', borderRadius: '99px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
                  🧵 Complete Boutique Catalog
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.3rem', color: '#0e2920', margin: '4px 0 6px' }}>
                All Products
              </h2>
              <p style={{ color: '#667770', fontSize: '0.95rem', margin: 0, maxWidth: '580px' }}>
                Explore all active handcrafted silhouettes, sorted and synchronized live from our atelier database.
              </p>
            </div>

            <Link 
              to="/shop" 
              className="btn btn-secondary hover-shimmer"
              style={{ padding: '10px 22px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1.5px solid rgba(200,157,56,0.5)' }}
            >
              <span>Explore Boutique Shop ({activeProducts.length})</span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '26px' }}>
            {['all', 'salwar', 'sharara', 'ethnic-wear', 'maxis', 'co-ordsets', 'casual-tops', 'western-wear', 'kids-wear'].map((catKey) => {
              const isSelected = selectedCategoryFilter === catKey;
              const catObj = categories.find(c => c.id === catKey);
              const label = catKey === 'all' ? `All Ensembles (${activeProducts.length})` : (catObj ? catObj.name : catKey);
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

          {/* Products Grid or Empty State */}
          {allFilteredProducts.length > 0 ? (
            <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
              {allFilteredProducts.map((product) => (
                <ProductCard key={`all-${product.id}`} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px', border: '1.5px dashed rgba(200,157,56,0.3)', boxShadow: '0 6px 20px rgba(14,41,32,0.03)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>✨</span>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920' }}>
                {activeProducts.length === 0 ? 'New Collections Arriving Soon' : 'No garments found in this category'}
              </h3>
              <p style={{ color: '#667770', fontSize: '0.92rem', margin: '8px auto 24px', maxWidth: '460px', lineHeight: 1.6 }}>
                {activeProducts.length === 0 
                  ? 'Our master artisans are handcrafting exquisite new arrivals. Explore our boutique categories or reach out directly via WhatsApp for custom tailoring & inquiries.'
                  : 'Try selecting another collection or view all ensembles.'}
              </p>
              {activeProducts.length === 0 ? (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/categories" className="btn btn-primary hover-shimmer" style={{ padding: '10px 24px', fontSize: '0.88rem' }}>
                    ✨ Explore Categories
                  </Link>
                  <a 
                    href={`https://wa.me/${waNumber}?text=Hi%20Aruvi%20Collections,%20I%20would%20like%20to%20inquire%20about%20your%20upcoming%20boutique%20collections.`}
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

      {/* =========================================================
          VIRTUAL TRY-ON BANNER
          ========================================================= */}
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

      {/* =========================================================
          BOUTIQUE USPS
          ========================================================= */}
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
