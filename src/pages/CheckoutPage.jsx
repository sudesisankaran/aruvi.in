import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const { cart, getCartSubtotal, discountPercent, createOrder, user } = useStore();
  const navigate = useNavigate();

  const subtotal = getCartSubtotal();
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: '#0e2920' }}>Your Shopping Bag is Empty</h2>
        <p style={{ color: '#667770', margin: '12px 0 24px' }}>Please add some items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !city || !pincode) {
      alert('Please fill in all shipping details.');
      return;
    }

    setIsSubmitting(true);

    const shippingDetails = {
      name,
      phone,
      email: email || user?.email || 'guest@aruvi.in',
      address,
      city,
      state,
      pincode
    };

    const newOrder = createOrder(shippingDetails, paymentMethod);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/account');
    }, 600);
  };

  return (
    <div className="checkout-page-view" style={{ padding: '40px 0 80px' }}>
      <div className="container">

        {/* Steps indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0e2920', fontWeight: 600 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
            <span>Shopping Bag</span>
          </div>
          <div style={{ width: '40px', height: '2px', background: 'var(--color-gold)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0e2920', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-gold)', color: '#0e2920', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
            <span>Shipping & Payment</span>
          </div>
          <div style={{ width: '40px', height: '2px', background: '#d4c8b8' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#889990' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0d8cc', color: '#667770', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Checkout Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
          
          {/* Checkout Form */}
          <form onSubmit={handleSubmitOrder} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '30px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#0e2920', marginBottom: '20px' }}>
              Delivery Address
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Full Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Priyadarshini Sundaram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Phone Number *</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="For order tracking updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Street Address / Landmark *</label>
              <textarea 
                required 
                rows="2"
                placeholder="House / Flat No., Apartment Name, Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>City *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>State</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Pincode *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="6-digit PIN"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#0e2920', marginBottom: '16px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
              Select Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: paymentMethod === 'upi' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
                  background: paymentMethod === 'upi' ? '#f4fbf7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="upi" 
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0e2920' }}>⚡ Instant UPI / QR Code (GPay, PhonePe, Paytm)</strong>
                  <span style={{ fontSize: '0.8rem', color: '#667770' }}>Zero extra charges. Instant order confirmation.</span>
                </div>
              </label>

              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: paymentMethod === 'card' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
                  background: paymentMethod === 'card' ? '#f4fbf7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="card" 
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0e2920' }}>💳 Credit / Debit Card (Visa, MasterCard, RuPay)</strong>
                  <span style={{ fontSize: '0.8rem', color: '#667770' }}>Secured by 256-bit bank-grade encryption.</span>
                </div>
              </label>

              <label 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: paymentMethod === 'cod' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
                  background: paymentMethod === 'cod' ? '#f4fbf7' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod" 
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div>
                  <strong style={{ display: 'block', color: '#0e2920' }}>💵 Cash on Delivery (COD)</strong>
                  <span style={{ fontSize: '0.8rem', color: '#667770' }}>Pay cash or UPI upon courier arrival at your doorstep.</span>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary hover-shimmer"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', fontWeight: 700 }}
            >
              {isSubmitting ? 'Placing Order...' : `Confirm & Place Order (₹${finalTotal.toLocaleString('en-IN')})`}
            </button>
          </form>

          {/* Mini Bag Summary */}
          <div style={{ background: '#fbf9f6', borderRadius: '16px', border: '1px solid rgba(200,157,56,0.25)', padding: '24px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#0e2920', marginBottom: '16px' }}>
              Your Items ({cart.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img 
                    src={item.image || 'assets/images/kanjivaram_green.jpg'} 
                    alt={item.title} 
                    style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0e2920' }}>{item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#667770' }}>Qty: {item.quantity} | Size: {item.selectedSize}</div>
                  </div>
                  <strong style={{ fontSize: '0.9rem', color: '#0e2920' }}>
                    ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>

            {/* Price lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #e0d8cc', paddingTop: '16px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#55665f' }}>Subtotal</span>
                <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f5132' }}>
                  <span>Discount</span>
                  <strong>-₹{discountAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#55665f' }}>Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#0f5132' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0d8cc', paddingTop: '12px', fontSize: '1.15rem' }}>
                <span style={{ fontWeight: 600, color: '#0e2920' }}>Total</span>
                <strong style={{ color: '#0e2920', fontFamily: 'var(--font-serif)' }}>₹{finalTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
