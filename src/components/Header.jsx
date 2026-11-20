import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import CustomerAuthModal from './CustomerAuthModal';

export default function Header() {
  const { cartCount, wishlistCount, customer, isAdmin } = useStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileNavOpen(false);
    }
  };

  const navLinks = [
    { to: '/shop?category=salwar', label: 'Salwar' },
    { to: '/shop?category=sharara', label: 'Sharara' },
    { to: '/shop?category=ethnic-wear', label: 'Ethnic Wear' },
    { to: '/shop?category=maxis', label: "Maxi's" },
    { to: '/shop?category=co-ordsets', label: 'Co-ordsets' },
    { to: '/shop?category=casual-tops', label: 'Casual Tops' },
    { to: '/shop?category=western-wear', label: 'Western Wear' },
    { to: '/shop?category=jeans-pants', label: 'Jeans & Pants' },
    { to: '/shop?category=kids-wear', label: 'Kids Wear', isNew: true },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <header className="announcement-bar">
        <div className="announcement-inner">
          <div className="announcement-promo">
            <span className="announcement-tag">FESTIVE SALE</span>
            <span>✨ Use code <strong>ARUVI20</strong> for Extra 20% Off + Free Shipping on orders above ₹999 ✨</span>
          </div>
          <div className="announcement-right">
            <Link to="/account" className="announcement-link">👤 My Account</Link>
            <Link to="/account" className="announcement-link">Track Shipment</Link>
            <Link to="/account" className="announcement-link">Boutique Concierge</Link>
            {isAdmin && (
              <Link to="/admin" className="announcement-link" style={{ color: '#d4af37', fontWeight: 700 }}>
                👑 Admin Portal
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Navigation Site Header */}
      <nav className="site-header" id="site-header">
        <div className="container header-container">
          
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" aria-label="Aruvi Collections Home">
            <img 
              src="assets/icons/WhatsApp Image 2026-09-21 at 7.49.20 AM (1).jpeg" 
              alt="Aruvi Collections" 
              className="brand-logo-img" 
              style={{ height: '52px', width: 'auto', maxHeight: '52px', objectFit: 'contain', borderRadius: '8px' }} 
            />
          </Link>

          {/* Desktop Main Navigation Menu (9 Services) */}
          <ul className="main-nav">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            {navLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="nav-link">
                  {item.label}
                  {item.isNew && (
                    <span className="badge-tag" style={{ background: 'var(--color-gold)', color: '#0e2920', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '99px', fontWeight: 700, marginLeft: '4px' }}>
                      NEW
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Interactive Search Bar */}
          <div className="header-search">
            <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input" 
                placeholder="Search salwar, sharara, maxis..." 
                aria-label="Search products" 
              />
              <button type="submit" className="search-btn" aria-label="Submit search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>

          {/* Header Action Badges */}
          <div className="header-actions">
            
            {/* Wishlist Button */}
            <Link to="/wishlist" className="action-btn" title="View Wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span className="action-badge">{wishlistCount}</span>
            </Link>

            {/* Shopping Bag Button */}
            <Link to="/cart" className="action-btn" title="View Bag">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="action-badge">{cartCount}</span>
            </Link>

            {/* Account / Login Trigger */}
            <Link 
              to="/account" 
              className="action-btn" 
              title={customer ? `Signed in as ${customer.name || customer.email}` : "My Account"}
              style={customer ? { borderColor: 'var(--color-gold)', background: 'var(--color-primary)', color: '#f4db8e' } : {}}
            >
              {isAdmin ? (
                <span style={{ fontSize: '1.1rem' }}>👑</span>
              ) : customer ? (
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{(customer.name || customer.email)?.charAt(0).toUpperCase()}</span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </Link>

            {/* Mobile Menu Toggle Hamburger */}
            <button 
              className="mobile-menu-toggle" 
              id="mobile-menu-toggle" 
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <span></span><span></span><span></span>
            </button>

          </div>

        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'active' : ''}`} id="mobile-nav-drawer">
        <div className="mobile-nav-header">
          <div className="brand-logo">
            <img 
              src="assets/icons/WhatsApp Image 2026-09-21 at 7.49.20 AM (1).jpeg" 
              alt="Aruvi Collections" 
              className="brand-logo-img" 
              style={{ height: '42px', width: 'auto', maxHeight: '42px', objectFit: 'contain', borderRadius: '6px' }} 
            />
          </div>
          <button 
            className="drawer-close-btn" 
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close Navigation" 
            style={{ color: '#ffffff' }}
          >
            ✕
          </button>
        </div>

        <div className="mobile-nav-body">
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>🏠 Home</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=salwar" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👗 Salwar</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=sharara" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>✨ Sharara</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=ethnic-wear" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>🪡 Ethnic Wear</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=maxis" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>💃 Maxi's</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=co-ordsets" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👚 Co-ordsets</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=casual-tops" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👕 Casual Tops</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=western-wear" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>🧥 Western Wear</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=jeans-pants" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👖 Jeans (Baggy / Straight / Palazzo)</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/shop?category=kids-wear" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👶 Kids Wear</span> <span>›</span>
              </Link>
            </li>
            <li>
              <Link to="/virtual-fitting-room" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>🪞 AI Virtual Fitting Room</span> <span className="badge-tag" style={{ background: 'var(--color-gold)', color: '#0e2920', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '99px', fontWeight: 700 }}>TRY ON</span>
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>❤️ My Saved Wishlist</span> <span className="action-badge">{wishlistCount}</span>
              </Link>
            </li>
            <li>
              <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👜 Shopping Bag</span> <span className="action-badge">{cartCount}</span>
              </Link>
            </li>
            <li>
              <Link to="/account" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                <span>👤 My Account & Orders</span> <span>›</span>
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)} style={{ color: '#d4af37', fontWeight: 700 }}>
                  <span>👑 Boutique Admin Portal</span> <span>›</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="mobile-nav-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>✨ Festive Sale Code: ARUVI20 (20% Off)</div>
          <Link to="/account" onClick={() => setMobileNavOpen(false)} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            Need Help? Contact 24/7 Concierge
          </Link>
        </div>
      </div>

      {mobileNavOpen && (
        <div 
          className="drawer-backdrop active" 
          onClick={() => setMobileNavOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}

      {/* Customer Auth Modal */}
      {authModalOpen && <CustomerAuthModal isOpen={true} onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}
