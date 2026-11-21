import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';

export default function CartPage() {
  const { cart, updateCartQuantity, removeFromCart, getCartSubtotal, couponCode, discountPercent, applyCoupon, removeCoupon } = useStore();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState('');

  const subtotal = getCartSubtotal();
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    applyCoupon(promoInput);
    setPromoInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛍️</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: '#0e2920', marginBottom: '12px' }}>
          Your Shopping Bag Is Empty
        </h2>
        <p style={{ color: '#667770', maxWidth: '440px', margin: '0 auto 28px', fontSize: '0.95rem' }}>
          Explore our handcrafted sarees, salwar suits, shararas, and ethnic outfits to add timeless elegance to your wardrobe.
        </p>
        <Link to="/shop" className="btn btn-primary hover-shimmer" style={{ padding: '12px 32px' }}>
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page-view" style={{ padding: '40px 0 80px' }}>
      <div className="container">

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#0e2920', marginBottom: '24px' }}>
          Shopping Bag ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)
        </h1>

        {/* Free Shipping Progress Alert */}
        <div style={{ background: '#f8f5f0', border: '1px solid rgba(200,157,56,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 600, color: '#0e2920', marginBottom: '8px' }}>
            <span>
              {remainingForFreeShipping === 0 
                ? '🎉 Congratulations! You unlocked FREE Express Shipping!' 
                : `🚚 Add ₹${remainingForFreeShipping.toLocaleString('en-IN')} more to unlock FREE Express Shipping!`}
            </span>
            <span>{Math.round(freeShippingProgress)}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e0d8cc', borderRadius: '99px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${freeShippingProgress}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-gold), #0e2920)', 
                transition: 'width 0.3s ease' 
              }} 
            />
          </div>
        </div>

        {/* 2-Column Grid: Items & Order Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* Items Column */}
          <div className="cart-items-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item) => {
              const price = Number(item.price) || 0;
              const itemTotal = price * item.quantity;
              return (
                <div 
                  key={`${item.id}-${item.selectedSize}`} 
                  style={{ display: 'flex', gap: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e8e2d8', padding: '16px', alignItems: 'center' }}
                >
                  <img 
                    src={getProductImageUrl(item)} 
                    alt={item.title} 
                    style={{ width: '90px', height: '110px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => handleImageError(e)}
                  />

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                      {item.category?.replace('-', ' ')}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#0e2920', margin: '2px 0 6px' }}>
                      <Link to={`/product/${item.id}`} style={{ color: 'inherit' }}>{item.title}</Link>
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#667770', marginBottom: '8px' }}>
                      Size: <strong style={{ color: '#0e2920' }}>{item.selectedSize || 'M'}</strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      {/* Quantity Selector */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d4c8b8', borderRadius: '6px', background: '#fff' }}>
                        <button 
                          type="button" 
                          onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          style={{ width: '30px', height: '30px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                        >
                          -
                        </button>
                        <span style={{ width: '30px', textAlign: 'center', fontWeight: 600, fontSize: '0.88rem' }}>{item.quantity}</span>
                        <button 
                          type="button" 
                          onClick={() => updateCartQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          style={{ width: '30px', height: '30px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}
                        >
                          +
                        </button>
                      </div>

                      {/* Item Total */}
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '1.1rem', color: '#0e2920' }}>
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </strong>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.id, item.selectedSize)}
                          style={{ display: 'block', background: 'none', border: 'none', color: '#c93b3b', fontSize: '0.78rem', cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Box */}
          <div className="cart-summary-column" style={{ background: '#fbf9f6', borderRadius: '16px', border: '1px solid rgba(200,157,56,0.25)', padding: '24px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '18px' }}>
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="Promo Code (ARUVI20)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8', fontSize: '0.88rem', textTransform: 'uppercase' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.88rem' }}>
                Apply
              </button>
            </form>

            {couponCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(200,157,56,0.15)', padding: '8px 12px', borderRadius: '6px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <span style={{ color: '#0e2920' }}>✨ Code <strong>{couponCode}</strong> applied ({discountPercent}% OFF)</span>
                <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#c93b3b', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
            )}

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e0d8cc', borderBottom: '1px solid #e0d8cc', padding: '16px 0', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#55665f' }}>Items Subtotal</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f5132' }}>
                  <span>Festive Discount</span>
                  <strong>-₹{discountAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#55665f' }}>Insured Express Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#0f5132' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '20px 0 24px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0e2920' }}>Estimated Total:</span>
              <strong style={{ fontSize: '1.8rem', color: '#0e2920', fontFamily: 'var(--font-serif)' }}>
                ₹{finalTotal.toLocaleString('en-IN')}
              </strong>
            </div>

            <button 
              type="button" 
              onClick={() => navigate('/checkout')}
              className="btn btn-primary hover-shimmer" 
              style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 600 }}
            >
              Proceed to Secure Checkout →
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/shop" style={{ fontSize: '0.85rem', color: '#667770', textDecoration: 'underline' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
