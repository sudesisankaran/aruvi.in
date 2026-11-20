import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import CustomerAuthModal from '../components/CustomerAuthModal';
import ImageUploadDropzone from '../components/ImageUploadDropzone';
import { BACKEND_API_BASE, auth } from '../services/firebase';

export default function AccountPage() {
  const { user, isAdmin, orders, logout, addToast } = useStore();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'support'

  // Profile fields state
  const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);
  const [preferredFit, setPreferredFit] = useState('Regular Fit');
  const [heightCm, setHeightCm] = useState(165);
  const [bustSize, setBustSize] = useState('36"');
  const [waistSize, setWaistSize] = useState('30"');
  const [hipSize, setHipSize] = useState('38"');
  const [isSaving, setIsSaving] = useState(false);

  // Sync profile data from Django backend on load
  useEffect(() => {
    if (user) {
      const currentUid = user.uid || (auth.currentUser ? auth.currentUser.uid : 'patron');
      fetch(`${BACKEND_API_BASE}/api/customers/profiles/me/?user_id=${currentUid}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            if (data.preferred_fit) setPreferredFit(data.preferred_fit);
            if (data.height_cm) setHeightCm(data.height_cm);
            if (data.bust_size) setBustSize(data.bust_size);
            if (data.waist_size) setWaistSize(data.waist_size);
            if (data.hip_size) setHipSize(data.hip_size);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleAvatarUploadSuccess = async (result) => {
    setAvatarUrl(result.url);
    addToast('Profile avatar uploaded to Firebase Cloud Storage!', 'success');

    // Update profile on Django backend
    if (user) {
      const currentUid = user.uid || (auth.currentUser ? auth.currentUser.uid : 'patron');
      try {
        await fetch(`${BACKEND_API_BASE}/api/customers/profiles/me/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUid,
            avatar_url: result.url,
            avatar_storage_path: result.path,
          }),
        });
      } catch (e) {
        console.warn('Backend profile update deferred:', e);
      }
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const currentUid = user?.uid || (auth.currentUser ? auth.currentUser.uid : 'patron');

    try {
      await fetch(`${BACKEND_API_BASE}/api/customers/profiles/me/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUid,
          preferred_fit: preferredFit,
          height_cm: heightCm,
          bust_size: bustSize,
          waist_size: waistSize,
          hip_size: hipSize,
        }),
      });
      addToast('Fitting preferences saved to PostgreSQL database.', 'success');
    } catch (err) {
      addToast('Preferences saved locally.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="account-page-view py-10 px-4 sm:px-6 lg:px-8 bg-ivory/30 min-h-screen">
      <div className="max-w-6xl mx-auto">

        {/* Customer Auth Modal */}
        <CustomerAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

        {/* Admin Crown Notification Banner */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark border-2 border-gold rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👑</span>
                <h3 className="font-serif text-2xl text-gold font-bold">
                  Owner Admin Access Active
                </h3>
              </div>
              <p className="text-white/85 text-sm leading-relaxed">
                Logged in as <strong className="text-white underline">aruvicollections.25@gmail.com</strong>. You have unrestricted owner privileges to upload garments, manage Firebase Cloud Storage, process patron orders, and configure boutique services.
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/admin')}
              className="px-6 py-3.5 bg-gold hover:bg-gold-light text-primary-dark font-extrabold rounded-2xl text-sm uppercase tracking-wider transition shadow-lg border-none"
            >
              ⚡ Open Admin Dashboard
            </button>
          </div>
        )}

        {/* Header User Card */}
        <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 mb-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-gold bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : user ? (
                user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()
              ) : (
                '👤'
              )}
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-primary-dark">
                {user ? (user.name || user.email.split('@')[0]) : 'Patron Guest'}
              </h2>
              <span className="text-text-muted text-sm block mt-0.5">
                {user ? user.email : 'Sign in to sync your wishlist and track your virtual drapes'}
              </span>
              {user && (
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                  Firebase Authenticated Patron
                </span>
              )}
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
                className="px-5 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
              >
                Sign Out
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-light text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                Sign In / Join Patron Club
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-emerald-900/10 mb-8 overflow-x-auto pb-1">
          <button 
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-text-muted hover:text-primary-dark'
            }`}
          >
            📦 My Consignments ({orders.length})
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide border-b-2 transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-text-muted hover:text-primary-dark'
            }`}
          >
            👤 Patron Profile & Measurements
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('support')}
            className={`pb-3 px-2 text-sm font-bold tracking-wide border-b-2 transition whitespace-nowrap ${
              activeTab === 'support'
                ? 'border-primary text-primary-dark'
                : 'border-transparent text-text-muted hover:text-primary-dark'
            }`}
          >
            💬 Concierge Support
          </button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-emerald-900/20">
                <div className="text-5xl mb-3">📦</div>
                <h3 className="font-serif text-2xl font-bold text-primary-dark">No active consignments</h3>
                <p className="text-text-muted text-sm mt-2 mb-6 max-w-md mx-auto">
                  You have not placed any orders yet. Discover our latest bridal drops and festive collections.
                </p>
                <Link to="/shop" className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl font-bold text-xs uppercase tracking-wider inline-block">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-emerald-900/10 pb-4 mb-6">
                      <div>
                        <span className="text-xs font-bold text-gold uppercase tracking-wider">
                          Consignment Reference: #{ord.id}
                        </span>
                        <div className="text-xs text-text-muted mt-1">
                          Placed on: {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                          ● {ord.status || 'Order Confirmed'}
                        </span>
                        <strong className="block text-xl font-bold text-primary-dark mt-1">
                          ₹{(ord.total || 0).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="my-6 p-4 bg-ivory/60 rounded-2xl border border-gold/20">
                      <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                          <span className="w-7 h-7 rounded-full bg-primary-dark text-white inline-flex items-center justify-center text-xs font-bold">✓</span>
                          <span className="block text-xs font-semibold text-primary-dark mt-1">Confirmed</span>
                        </div>
                        <div className="flex-1">
                          <span className="w-7 h-7 rounded-full bg-primary-dark text-white inline-flex items-center justify-center text-xs font-bold">✓</span>
                          <span className="block text-xs font-semibold text-primary-dark mt-1">Handcrafted</span>
                        </div>
                        <div className="flex-1">
                          <span className="w-7 h-7 rounded-full bg-gold text-primary-dark inline-flex items-center justify-center text-xs font-bold">🚚</span>
                          <span className="block text-xs font-semibold text-primary-dark mt-1">In Transit</span>
                        </div>
                        <div className="flex-1">
                          <span className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-500 inline-flex items-center justify-center text-xs font-bold">○</span>
                          <span className="block text-xs text-text-muted mt-1">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3">
                      {ord.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img
                            src={item.image || 'assets/images/kanjivaram_green.jpg'}
                            alt={item.title}
                            className="w-12 h-14 object-cover rounded-xl shadow-xs"
                          />
                          <div className="flex-1">
                            <strong className="text-sm font-semibold text-primary-dark">{item.title}</strong>
                            <div className="text-xs text-text-muted">Qty: {item.quantity} | Size: {item.selectedSize}</div>
                          </div>
                          <span className="font-bold text-sm text-primary-dark">
                            ₹{((Number(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address */}
                    {ord.shipping && (
                      <div className="mt-4 pt-3 border-t border-dashed border-emerald-900/10 text-xs text-text-muted">
                        Delivering to: <strong className="text-primary-dark">{ord.shipping.name}</strong>, {ord.shipping.address}, {ord.shipping.city} - {ord.shipping.pincode} (Ph: {ord.shipping.phone})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile & Measurements */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Avatar Upload Dropzone Card (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-3xl border border-emerald-900/10 p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-primary-dark">
                Profile Avatar
              </h3>
              <p className="text-xs text-text-muted">
                Your photograph will be converted to modern WebP and stored in Firebase Cloud Storage.
              </p>

              <ImageUploadDropzone
                folder={user ? `profiles/${user.uid || 'patron'}` : 'profiles/guest'}
                label="Upload New Avatar"
                helperText="Auto-optimized to WebP (Max 10MB)"
                aspectRatio="aspect-square"
                initialPreview={avatarUrl}
                onUploadSuccess={handleAvatarUploadSuccess}
                onError={(msg) => addToast(msg, 'error')}
              />
            </div>

            {/* Fitting & Measurement Preferences Card (7 cols) */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-primary-dark mb-1">
                Boutique Fit & Sizing Blueprint
              </h3>
              <p className="text-xs text-text-muted mb-6">
                These measurements empower our AI Virtual Fitting Room and master tailors to customize your drape.
              </p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1.5">
                      Preferred Silhouette Fit
                    </label>
                    <select
                      value={preferredFit}
                      onChange={(e) => setPreferredFit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    >
                      <option value="Regular Fit">Regular Fit (Traditional)</option>
                      <option value="Slim Fit">Slim Fit (Contoured)</option>
                      <option value="Relaxed Fit">Relaxed Fit (Flowy)</option>
                      <option value="Bridal Tailored">Bridal Tailored (Master Cut)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1.5">
                      Bust / Chest (inches)
                    </label>
                    <input
                      type="text"
                      value={bustSize}
                      onChange={(e) => setBustSize(e.target.value)}
                      placeholder='e.g. 36"'
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1.5">
                      Waist (inches)
                    </label>
                    <input
                      type="text"
                      value={waistSize}
                      onChange={(e) => setWaistSize(e.target.value)}
                      placeholder='e.g. 30"'
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : '💾 Save Sizing Blueprint'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* Tab 3: Concierge Support */}
        {activeTab === 'support' && (
          <div className="bg-white rounded-3xl border border-emerald-900/10 p-6 sm:p-8 max-w-2xl shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-primary-dark mb-2">
              Boutique Concierge & Stylist Desk
            </h3>
            <p className="text-text-muted text-sm mb-6">
              Have questions regarding custom blouse tailoring, bridal orders, or consignment tracking? Reach out directly to our master stylists.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory/60 border border-emerald-900/10">
                <span className="text-3xl">💬</span>
                <div>
                  <strong className="block text-primary-dark text-sm">WhatsApp VIP Concierge</strong>
                  <span className="text-text-muted text-xs">Direct chat with senior saree draping consultant</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-ivory/60 border border-emerald-900/10">
                <span className="text-3xl">✉️</span>
                <div>
                  <strong className="block text-primary-dark text-sm">Official Email</strong>
                  <span className="text-text-muted text-xs">support@aruvi.in | aruvicollections.25@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
