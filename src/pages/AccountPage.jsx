import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import CustomerAuthModal from '../components/CustomerAuthModal';

export default function AccountPage() {
  const { user, isAdmin, orders, logout, addToast } = useStore();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'support'

  return (
    <div className="account-page-view" style={{ padding: '40px 0 80px' }}>
      <div className="container">

        {/* Customer Auth Modal */}
        <CustomerAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

        {/* Admin Crown Notification Banner */}
        {isAdmin && (
          <div style={{ background: 'linear-gradient(135deg, #133a2d 0%, #081a14 100%)', border: '2px solid var(--color-gold)', borderRadius: '16px', padding: '24px 28px', color: '#fff', marginBottom: '36px', boxShadow: '0 12px 28px rgba(0,0,0,0.15)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.6rem' }}>👑</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-gold)', margin: 0 }}>
                  Owner Admin Access Active
                </h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem', margin: 0 }}>
                Logged in as <strong>aruvicollections.25@gmail.com</strong>. You have unrestricted owner privileges to upload garments, manage Firebase Storage, process patron orders, and configure the 9 services.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/admin')}
              className="btn btn-secondary hover-shimmer"
              style={{ background: 'var(--color-gold)', color: '#0e2920', fontWeight: 'bold', padding: '12px 24px', fontSize: '0.95rem', border: 'none' }}
            >
              ⚡ Open Admin Dashboard
            </button>
          </div>
        )}

        {/* Header User Card */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '28px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold', border: '2px solid var(--color-gold)' }}>
              {user ? (user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()) : '👤'}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#0e2920', margin: '0 0 4px' }}>
                {user ? (user.name || user.email.split('@')[0]) : 'Patron Guest'}
              </h2>
              <span style={{ color: '#667770', fontSize: '0.88rem' }}>
                {user ? user.email : 'Sign in to sync your wishlist and track your drapes across devices'}
              </span>
            </div>
          </div>

          <div>
            {user ? (
              <button 
                type="button" 
                onClick={() => {
                  logout();
                  addToast('Signed out successfully.', 'info');
                }}
                className="btn btn-outline"
                style={{ color: '#c93b3b', borderColor: '#c93b3b' }}
              >
                Sign Out
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setAuthModalOpen(true)}
                className="btn btn-primary hover-shimmer"
                style={{ padding: '12px 24px' }}
              >
                Sign In / Join Patron Club
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2dad0', marginBottom: '28px' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              fontWeight: 600,
              color: activeTab === 'orders' ? '#0e2920' : '#889990',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📦 My Consignments ({orders.length})
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              fontWeight: 600,
              color: activeTab === 'profile' ? '#0e2920' : '#889990',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            👤 Patron Details
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('support')}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderBottom: activeTab === 'support' ? '3px solid var(--color-primary)' : '3px solid transparent',
              background: 'none',
              fontWeight: 600,
              color: activeTab === 'support' ? '#0e2920' : '#889990',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            💬 Concierge Support
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px dashed #d4c8b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920' }}>No active orders</h3>
                <p style={{ color: '#667770', fontSize: '0.92rem', margin: '8px auto 20px', maxWidth: '400px' }}>
                  You have not placed any orders yet. Discover our latest bridal drops and festival specials.
                </p>
                <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {orders.map((ord) => (
                  <div key={ord.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f0eae2', paddingBottom: '16px', marginBottom: '18px' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                          Order Reference: #{ord.id}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: '#667770', marginTop: '2px' }}>
                          Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'inline-block', background: ord.status === 'Delivered' ? '#d1e7dd' : '#cfe2ff', color: ord.status === 'Delivered' ? '#0f5132' : '#084298', padding: '4px 12px', borderRadius: '99px', fontSize: '0.82rem', fontWeight: 700 }}>
                          ● {ord.status || 'Order Confirmed'}
                        </span>
                        <strong style={{ display: 'block', fontSize: '1.2rem', color: '#0e2920', marginTop: '4px' }}>
                          ₹{(ord.total || 0).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div style={{ margin: '20px 0 24px', padding: '16px', background: '#fcfbf8', borderRadius: '12px', border: '1px solid rgba(200,157,56,0.15)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0e2920', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>✓</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0e2920', marginTop: '6px' }}>Confirmed</span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0e2920', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>✓</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0e2920', marginTop: '6px' }}>Handcrafted</span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-gold)', color: '#0e2920', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>🚚</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0e2920', marginTop: '6px' }}>In Transit</span>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0d8cc', color: '#667770', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>○</span>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: '#889990', marginTop: '6px' }}>Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {ord.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={item.image || 'assets/images/kanjivaram_green.jpg'} alt={item.title} style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0e2920' }}>{item.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#667770' }}>Qty: {item.quantity} | Size: {item.selectedSize}</div>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#0e2920' }}>
                            ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address summary */}
                    {ord.shipping && (
                      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2dad0', fontSize: '0.82rem', color: '#667770' }}>
                        Delivering to: <strong style={{ color: '#0e2920' }}>{ord.shipping.name}</strong>, {ord.shipping.address}, {ord.shipping.city} - {ord.shipping.pincode} (Ph: {ord.shipping.phone})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '30px', maxWidth: '600px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '18px' }}>
              Patron Profile Information
            </h3>

            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                <div>
                  <span style={{ color: '#667770', display: 'block', fontSize: '0.8rem' }}>Email Address</span>
                  <strong style={{ color: '#0e2920' }}>{user.email}</strong>
                </div>
                <div>
                  <span style={{ color: '#667770', display: 'block', fontSize: '0.8rem' }}>Full Name</span>
                  <strong style={{ color: '#0e2920' }}>{user.name || 'Patron Member'}</strong>
                </div>
                <div>
                  <span style={{ color: '#667770', display: 'block', fontSize: '0.8rem' }}>Role Status</span>
                  <strong style={{ color: isAdmin ? 'var(--color-gold)' : '#0e2920' }}>
                    {isAdmin ? '👑 Owner Admin (Unrestricted Access)' : 'Verified Customer Patron'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#667770', display: 'block', fontSize: '0.8rem' }}>Authentication Provider</span>
                  <strong style={{ color: '#0e2920' }}>
                    {user.provider === 'google' ? 'Google Firebase OAuth' : 'Email & Password Session'}
                  </strong>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: '#667770', fontSize: '0.92rem', marginBottom: '16px' }}>
                  You are currently browsing as a guest. Sign in or create an account to save favorite drapes, track consignments, and enjoy personalized boutique perks.
                </p>
                <button 
                  type="button" 
                  onClick={() => setAuthModalOpen(true)}
                  className="btn btn-primary hover-shimmer"
                  style={{ padding: '12px 24px', fontWeight: 600 }}
                >
                  Sign In / Register Now 🔐
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Concierge Support */}
        {activeTab === 'support' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '30px', maxWidth: '640px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '8px' }}>
              Boutique Concierge & Stylist Desk
            </h3>
            <p style={{ color: '#667770', fontSize: '0.92rem', marginBottom: '24px' }}>
              Have questions regarding custom blouse tailoring, bridal orders, or consignment tracking? Reach out directly to our master stylists.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '10px', background: '#f8f5f0' }}>
                <span style={{ fontSize: '1.8rem' }}>💬</span>
                <div>
                  <strong style={{ display: 'block', color: '#0e2920' }}>WhatsApp VIP Concierge</strong>
                  <span style={{ fontSize: '0.82rem', color: '#667770' }}>Direct chat with senior saree draping consultant</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', borderRadius: '10px', background: '#f8f5f0' }}>
                <span style={{ fontSize: '1.8rem' }}>✉️</span>
                <div>
                  <strong style={{ display: 'block', color: '#0e2920' }}>Official Email</strong>
                  <span style={{ fontSize: '0.82rem', color: '#667770' }}>support@aruvi.in | aruvicollections.25@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
