import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { addToast, isAdmin } = useStore();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    addToast('Thank you for subscribing to Aruvi Collections!', 'success');
    setEmail('');
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-top-grid">
          
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <img 
                src="assets/icons/WhatsApp Image 2026-09-21 at 7.49.20 AM (1).jpeg" 
                alt="Aruvi Collections" 
                className="footer-logo-img" 
                style={{ height: '56px', width: 'auto', maxHeight: '56px', objectFit: 'contain', borderRadius: '8px' }} 
              />
            </div>
            <span className="footer-tagline-text">Tradition In Every Thread</span>
            <p className="footer-desc">
              Bringing centuries-old South Indian handloom mastery, bridal craftsmanship, and modern silhouettes directly to your doorstep. Each piece carries the legacy of authentic Indian heritage.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Collections</h4>
            <ul className="footer-links-list">
              <li><Link to="/categories" className="footer-link">All Categories</Link></li>
              <li><Link to="/shop?category=salwar" className="footer-link">Salwar</Link></li>
              <li><Link to="/shop?category=sharara" className="footer-link">Sharara</Link></li>
              <li><Link to="/shop?category=ethnic-wear" className="footer-link">Ethnic Wear</Link></li>
              <li><Link to="/shop?category=maxis" className="footer-link">Maxi's</Link></li>
              <li><Link to="/shop?category=co-ordsets" className="footer-link">Co-ordsets</Link></li>
              <li><Link to="/shop?category=casual-tops" className="footer-link">Casual Tops</Link></li>
              <li><Link to="/shop?category=western-wear" className="footer-link">Western Wear</Link></li>
              <li><Link to="/shop?category=kids-wear" className="footer-link">Kids Wear</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="footer-col">
            <h4 className="footer-col-title">Customer Care</h4>
            <ul className="footer-links-list">
              <li><Link to="/about" className="footer-link">About Our Atelier</Link></li>
              <li><Link to="/contact" className="footer-link">Contact & WhatsApp Concierge</Link></li>
              <li><Link to="/account" className="footer-link">Track Your Order</Link></li>
              <li><Link to="/fitting-room" className="footer-link">AI Virtual Fitting Room</Link></li>
              <li><Link to="/wishlist" className="footer-link">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="footer-link">Shopping Bag</Link></li>
              <li><Link to="/account" className="footer-link">My Account</Link></li>
              {isAdmin && (
                <li><Link to="/admin" className="footer-link">Owner Admin Dashboard</Link></li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter-box">
            <h4 className="footer-col-title">Stay In The Circle</h4>
            <p className="newsletter-desc">
              Subscribe to receive exclusive festive unveilings, private designer drops, and 20% off your first boutique order with code <strong>ARUVI20</strong>.
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                className="newsletter-input" 
                placeholder="Enter your email address" 
                required 
                aria-label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-submit-btn">Subscribe</button>
            </form>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-row">
          <span>© 2026 Aruvi Collections. All rights reserved. Handcrafted with passion.</span>
          <div className="payment-badges-row">
            <span className="payment-badge">UPI / GPAY</span>
            <span className="payment-badge">PHONEPE</span>
            <span className="payment-badge">VISA</span>
            <span className="payment-badge">MASTERCARD</span>
            <span className="payment-badge">NET BANKING</span>
            <span className="payment-badge">COD</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
