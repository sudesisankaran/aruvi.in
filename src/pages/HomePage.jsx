import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function HomePage() {
  const { categories } = useStore();

  return (
    <div className="home-page-view">
      
      {/* Hero Banner Section */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="container hero-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center', gap: '40px', padding: '60px 20px' }}>
          
          <div className="hero-content" style={{ zIndex: 2 }}>
            <span className="hero-pre-title" style={{ display: 'inline-block', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>
              ✨ Festive Handcrafted Showcase 2026
            </span>
            <h1 className="hero-main-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: '#0e2920', lineHeight: 1.15, marginBottom: '18px' }}>
              Tradition In Every Thread, <br />
              <span style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>Elegance In Every Drape.</span>
            </h1>
            <p className="hero-description" style={{ color: '#4a5d55', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '520px', marginBottom: '28px' }}>
              Explore our boutique selection of authentic Salwars, Shararas, regal Ethnic Wear, Maxis, Co-ordsets, and modern everyday essentials handcrafted with master precision.
            </p>

            <div className="hero-cta-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <Link to="/shop" className="btn btn-primary hover-shimmer" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 600 }}>
                Explore All Collections 🛍️
              </Link>
              <Link to="/fitting-room" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>🪞 AI Virtual Try-On</span>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="hero-stats-row" style={{ display: 'flex', gap: '32px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid rgba(200,157,56,0.2)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.4rem', color: '#0e2920' }}>9+</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770' }}>Boutique Categories</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.4rem', color: '#0e2920' }}>100%</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770' }}>Authentic Pure Silks</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.4rem', color: '#0e2920' }}>4.9 ★</strong>
                <span style={{ fontSize: '0.8rem', color: '#667770' }}>Patron Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="hero-visual" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="hero-card-frame card-3d" style={{ maxWidth: '440px', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 48px rgba(14,41,32,0.18)', border: '2px solid rgba(200,157,56,0.3)', background: '#fff' }}>
              <img 
                src="assets/images/kanjivaram_green.jpg" 
                alt="Aruvi Signature Collection" 
                style={{ width: '100%', height: '420px', objectFit: 'cover' }} 
              />
              <div style={{ padding: '20px', background: 'linear-gradient(to top, rgba(14,41,32,0.95), rgba(14,41,32,0.85))', color: '#fff' }}>
                <span style={{ color: 'var(--color-gold)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Exclusive Drop</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: '4px 0 8px' }}>Bridal Heritage Handloom</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-gold)' }}>Special Festive Price</span>
                  <Link to="/shop?category=ethnic-wear" style={{ color: '#fff', fontSize: '0.85rem', textDecoration: 'underline' }}>Shop Look →</Link>
                </div>
              </div>
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
