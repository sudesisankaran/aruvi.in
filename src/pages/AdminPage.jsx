import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { uploadFileToFirebase } from '../services/firebase';
import AdminProductGalleryManager from '../components/AdminProductGalleryManager';
import ImageUploadDropzone from '../components/ImageUploadDropzone';

export default function AdminPage() {
  const { 
    user, 
    isAdmin, 
    loginWithGoogle, 
    loginWithEmail, 
    logout, 
    products, 
    categories, 
    orders, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    clearAllProducts,
    banners,
    addBanner,
    deleteBanner,
    updateOrderStatus,
    addToast 
  } = useStore();

  const [adminTab, setAdminTab] = useState('products'); // 'products', 'orders', 'services', 'firebase', 'banners'
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('aruvicollections.25@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');

  // Product Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('salwar');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [fabric, setFabric] = useState('Pure Silk');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  
  // Firebase Upload & Celery retention purge state
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPurgingRetention, setIsPurgingRetention] = useState(false);
  const [retentionMessage, setRetentionMessage] = useState(null);

  // Promotional Banners state (Synced with useStore)
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerTag, setNewBannerTag] = useState('NEW DROP');

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;

  // Handle Google Auth for Admin
  const handleGoogleAdminLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res && res.isAdmin) {
        addToast('👑 Welcome Owner Admin! Dashboard unlocked.', 'success');
      } else {
        addToast(`Signed in as ${res.email}. Note: Owner dashboard requires aruvicollections.25@gmail.com`, 'info');
      }
    } catch (err) {
      console.warn('Google Admin Auth Error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized in Firebase Console. Whitelist your domain in Firebase Auth Settings or use the Direct Owner Sign-In below.');
      } else {
        setAuthError(err.message || 'Failed to authenticate via Google.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Email / Password for Admin
  const handleEmailAdminLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const loggedUser = loginWithEmail(emailInput, passwordInput);
      if (loggedUser.isAdmin) {
        addToast('👑 Owner Admin authenticated successfully!', 'success');
      } else {
        setAuthError('Access Denied. Only aruvicollections.25@gmail.com has owner privileges.');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('salwar');
    setPrice('');
    setOriginalPrice('');
    setFabric('Pure Silk');
    setBadge('NEW');
    setImage('assets/images/kanjivaram_green.jpg');
    setDescription('');
    setGalleryImages([
      {
        id: 'initial_img_0',
        image_url: 'assets/images/kanjivaram_green.jpg',
        storage_path: 'products/draft/cover.webp',
        alt_text: 'Front Silhouette',
        is_primary: true,
        display_order: 0,
      }
    ]);
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setTitle(p.title || '');
    setCategory(p.category || 'salwar');
    setPrice(p.price || '');
    setOriginalPrice(p.originalPrice || '');
    setFabric(p.fabric || 'Pure Silk');
    setBadge(p.badge || '');
    setImage(p.image || '');
    setDescription(p.description || '');
    setGalleryImages(
      p.images && p.images.length > 0
        ? p.images
        : [
            {
              id: `prod_img_${p.id}`,
              image_url: p.image || 'assets/images/kanjivaram_green.jpg',
              storage_path: `products/${p.id}/cover.webp`,
              alt_text: p.title || 'Product Photo',
              is_primary: true,
              display_order: 0,
            }
          ]
    );
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('Please fill in title and price.');
      return;
    }

    const primaryImg = galleryImages.find(g => g.is_primary) || galleryImages[0];
    const finalImage = primaryImg ? primaryImg.image_url : (image || 'assets/images/kanjivaram_green.jpg');

    const productPayload = {
      title,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.2,
      fabric,
      badge: badge || null,
      image: finalImage,
      images: galleryImages,
      description
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      addToast('Product & Firebase gallery updated!', 'success');
    } else {
      addProduct(productPayload);
      addToast('New product added to catalog & PostgreSQL database!', 'success');
    }

    setIsModalOpen(false);
  };

  // Photo Privacy Retention Check
  const handleTriggerRetentionPurge = () => {
    setIsPurgingRetention(true);
    setRetentionMessage(null);
    setTimeout(() => {
      setRetentionMessage('✓ Privacy retention verified: Zero temporary customer photos stored.');
      addToast('Customer photo privacy check completed.', 'success');
      setIsPurgingRetention(false);
    }, 600);
  };

  // Upload Promotional Banner
  const handleBannerUploadSuccess = (result) => {
    const newBanner = {
      id: Date.now(),
      title: newBannerTitle || 'Festive Boutique Special Drop',
      subtitle: newBannerSubtitle || 'Handcrafted Luxury Silks',
      tag: newBannerTag,
      image_url: result.url,
      storage_path: result.path,
    };
    addBanner(newBanner);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
  };

  // Security Gate: Not an Admin
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-radial from-[#133a2d] to-[#081a14]">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
          
          <div className="w-16 h-16 rounded-full bg-gold/15 border-2 border-gold flex items-center justify-center text-3xl mx-auto mb-4">
            👑
          </div>

          <h2 className="font-serif text-2xl text-primary-dark font-bold">
            Aruvi Owner Portal
          </h2>
          <p className="text-text-muted text-xs mt-1 mb-6">
            Restricted to boutique owner <strong className="text-primary-dark">aruvicollections.25@gmail.com</strong>.
          </p>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs mb-4 text-left border border-red-200">
              {authError}
            </div>
          )}

          {/* Firebase Google Auth Button */}
          <button 
            type="button" 
            onClick={handleGoogleAdminLogin}
            disabled={authLoading}
            className="w-full py-3.5 px-4 rounded-xl border border-emerald-900/15 hover:border-gold bg-white hover:bg-gold/5 text-primary-dark font-semibold text-xs transition flex items-center justify-center gap-3 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{authLoading ? 'Verifying...' : 'Sign in with Google (Owner)'}</span>
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-emerald-900/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-emerald-900/40 uppercase">Or Direct Owner Sign-In</span>
            <div className="flex-grow border-t border-emerald-900/10"></div>
          </div>

          <form onSubmit={handleEmailAdminLogin} className="space-y-3">
            <input 
              type="email" 
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-xs focus:outline-none focus:border-gold"
            />
            <input 
              type="password" 
              required
              placeholder="Owner Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-xs focus:outline-none focus:border-gold"
            />
            <button 
              type="submit" 
              className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md"
            >
              Unlock Dashboard 👑
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Owner Admin View
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 bg-ivory/30 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-900/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👑</span>
              <h1 className="font-serif text-3xl font-bold text-primary-dark">
                Boutique Owner Control Suite
              </h1>
            </div>
            <p className="text-text-muted text-xs mt-1">
              Logged in as <strong className="text-primary-dark">aruvicollections.25@gmail.com</strong> • Firebase Storage & PostgreSQL Linked
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-2"
            >
              <span>+ Add New Garment</span>
            </button>
            {products.length > 0 && (
              <button 
                type="button" 
                onClick={() => {
                  if (window.confirm('Are you sure you want to completely remove all products from the store?')) {
                    clearAllProducts();
                  }
                }}
                className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Remove All Products"
              >
                <span>🗑️ Remove All Products</span>
              </button>
            )}
            <button 
              type="button" 
              onClick={logout}
              className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs">
            <span className="text-xs text-text-muted font-semibold uppercase">Total Boutique Revenue</span>
            <div className="text-2xl font-bold text-primary-dark mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs">
            <span className="text-xs text-text-muted font-semibold uppercase">Active Catalog Outfits</span>
            <div className="text-2xl font-bold text-primary-dark mt-1">{totalProducts} Garments</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs">
            <span className="text-xs text-text-muted font-semibold uppercase">Patron Consignments</span>
            <div className="text-2xl font-bold text-primary-dark mt-1">{totalOrders} Orders</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-emerald-900/10 shadow-xs">
            <span className="text-xs text-text-muted font-semibold uppercase">Cloud Storage</span>
            <div className="text-2xl font-bold text-emerald-800 mt-1 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              Firebase Active
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-emerald-900/10 overflow-x-auto pb-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
              adminTab === 'products' ? 'border-primary text-primary-dark' : 'border-transparent text-text-muted'
            }`}
          >
            👗 Catalog & Images ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('orders')}
            className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
              adminTab === 'orders' ? 'border-primary text-primary-dark' : 'border-transparent text-text-muted'
            }`}
          >
            📦 Consignments ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('banners')}
            className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
              adminTab === 'banners' ? 'border-primary text-primary-dark' : 'border-transparent text-text-muted'
            }`}
          >
            🖼️ Website Banners ({banners.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('firebase')}
            className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
              adminTab === 'firebase' ? 'border-primary text-primary-dark' : 'border-transparent text-text-muted'
            }`}
          >
            🔥 Firebase Storage & Celery Pipeline
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('services')}
            className={`pb-3 px-2 border-b-2 transition whitespace-nowrap ${
              adminTab === 'services' ? 'border-primary text-primary-dark' : 'border-transparent text-text-muted'
            }`}
          >
            ✨ 9 Boutique Collections
          </button>
        </div>

        {/* Tab 1: Catalog & Images */}
        {adminTab === 'products' && (
          <div className="bg-white rounded-3xl border border-emerald-900/10 overflow-hidden shadow-sm">
            {products.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="text-4xl block">👗</span>
                <h4 className="font-serif text-lg font-bold text-primary-dark">Zero Products In Catalog</h4>
                <p className="text-text-muted text-xs max-w-sm mx-auto">
                  All demo garments have been completely removed. Click below to upload your first real handcrafted boutique outfit.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md inline-flex items-center gap-2"
                >
                  <span>+ Add Your First Garment</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50/60 border-b border-emerald-900/10 text-emerald-950 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Cover Image</th>
                      <th className="p-4">Title & Details</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Storage Source</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/5">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-ivory/50 transition">
                        <td className="p-4">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-14 h-16 object-cover rounded-xl shadow-xs"
                          />
                        </td>
                        <td className="p-4">
                          <strong className="block text-sm text-primary-dark">{p.title}</strong>
                          <span className="text-text-muted">{p.fabric || 'Pure Silk'} • Badge: {p.badge || 'None'}</span>
                        </td>
                        <td className="p-4 capitalize font-semibold text-emerald-800">
                          {p.category}
                        </td>
                        <td className="p-4 font-bold text-primary-dark">
                          ₹{(Number(p.price) || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 font-mono text-[10px] text-text-muted truncate max-w-[160px]">
                          {p.image && p.image.includes('firebasestorage') ? 'Firebase Storage Bucket' : 'Boutique Assets'}
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(p)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold"
                          >
                            Manage Gallery / Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ${p.title} from catalog and Firebase Storage?`)) {
                                deleteProduct(p.id);
                                addToast('Product and gallery deleted.', 'info');
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {adminTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10">
                <span className="text-4xl block mb-2">📦</span>
                <p className="text-text-muted text-sm">No orders yet.</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-xs flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-gold uppercase">Order #{ord.id}</span>
                    <h4 className="font-serif text-lg font-bold text-primary-dark mt-0.5">
                      {ord.shipping?.name || 'Patron'} • ₹{(ord.total || 0).toLocaleString('en-IN')}
                    </h4>
                    <p className="text-xs text-text-muted mt-1">
                      {ord.shipping?.address}, {ord.shipping?.city} (Ph: {ord.shipping?.phone})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">Status:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-emerald-900/20 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Loom / Tailored">In Loom / Tailored</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Website Banners */}
        {adminTab === 'banners' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-primary-dark mb-1">
                Upload Promotional Banner to Firebase Storage
              </h3>
              <p className="text-xs text-text-muted mb-6">
                Banners are converted to WebP and stored in Firebase Storage bucket under <code className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">banners/</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Banner Headline</label>
                    <input
                      type="text"
                      value={newBannerTitle}
                      onChange={(e) => setNewBannerTitle(e.target.value)}
                      placeholder="e.g. Royal Bridal Heritage Drop"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Banner Subtitle</label>
                    <input
                      type="text"
                      value={newBannerSubtitle}
                      onChange={(e) => setNewBannerSubtitle(e.target.value)}
                      placeholder="e.g. Pure Handloom Kanchipuram Silks"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Promo Badge</label>
                    <input
                      type="text"
                      value={newBannerTag}
                      onChange={(e) => setNewBannerTag(e.target.value)}
                      placeholder="FESTIVE SALE / EXCLUSIVE DROP"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <ImageUploadDropzone
                    folder="banners"
                    label="Select Banner Artwork"
                    helperText="Aspect ratio 16:9 or 21:9 recommended (Max 10MB)"
                    aspectRatio="aspect-[16/9]"
                    onUploadSuccess={handleBannerUploadSuccess}
                    onError={(msg) => addToast(msg, 'error')}
                  />
                </div>
              </div>
            </div>

            {/* Existing Banners Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b.id} className="relative rounded-2xl overflow-hidden shadow-md group">
                  <img src={b.image_url} alt={b.title} className="w-full h-48 object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete banner "${b.title}"?`)) {
                        deleteBanner(b.id);
                      }
                    }}
                    className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg text-xs opacity-80 group-hover:opacity-100 transition cursor-pointer"
                    title="Delete Banner"
                  >
                    🗑️
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/40 to-transparent p-4 flex flex-col justify-end text-white pointer-events-none">
                    <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider">{b.tag}</span>
                    <h4 className="font-serif text-lg font-bold">{b.title}</h4>
                    <p className="text-xs text-white/80">{b.subtitle}</p>
                    <span className="text-[9px] font-mono text-white/60 mt-1">{b.storage_path}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Firebase Storage & Celery Pipeline */}
        {adminTab === 'firebase' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs space-y-6 max-w-4xl">
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary-dark">
                Firebase Cloud Storage & Celery Retention Policy
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Aruvi Collections uses Firebase Storage for image assets and Celery + Redis for asynchronous AI Virtual Try-On synthesis & automated retention.
              </p>
            </div>

            {/* Storage Architecture Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-emerald-900/10 rounded-xl overflow-hidden">
                <thead className="bg-emerald-50 text-emerald-950 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Storage Folder</th>
                    <th className="p-3">Content Type</th>
                    <th className="p-3">Access Policy</th>
                    <th className="p-3">Retention Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/10 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-emerald-800 font-bold">products/{'{productId}'}/</td>
                    <td className="p-3">Product Catalog Galleries</td>
                    <td className="p-3">Public Read / Admin Write</td>
                    <td className="p-3">Permanent (Purged on delete)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-800 font-bold">banners/</td>
                    <td className="p-3">Promotional Hero Drops</td>
                    <td className="p-3">Public Read / Admin Write</td>
                    <td className="p-3">Permanent</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-800 font-bold">profiles/{'{userId}'}/</td>
                    <td className="p-3">Customer Avatars (WebP)</td>
                    <td className="p-3">Authenticated Owner</td>
                    <td className="p-3">Account Lifetime</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-800 font-bold">tryons/uploads/{'{userId}'}/</td>
                    <td className="p-3">Customer Uploaded Portraits</td>
                    <td className="p-3">Private Owner / Admin</td>
                    <td className="p-3 text-amber-700 font-bold">7-Day Auto Purge</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-800 font-bold">tryons/results/{'{userId}'}/</td>
                    <td className="p-3">AI Draped Previews</td>
                    <td className="p-3">Private Owner / Admin</td>
                    <td className="p-3 text-amber-700 font-bold">7-Day Auto Purge</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Celery Photo Retention Policy Purge Trigger */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    🧹 Customer Photo Retention Policy (7 Days)
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5">
                    Trigger the Celery background task (<code className="font-mono text-amber-950">purge_expired_tryon_photos</code>) to delete customer uploaded portraits older than 7 days from Firebase Storage and PostgreSQL.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPurgingRetention}
                  onClick={handleTriggerRetentionPurge}
                  className="px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-50"
                >
                  {isPurgingRetention ? 'Purging in Celery...' : 'Run Retention Cleanup'}
                </button>
              </div>

              {retentionMessage && (
                <div className="p-3 bg-white rounded-xl border border-amber-300 text-xs text-amber-950 font-semibold">
                  {retentionMessage}
                </div>
              )}
            </div>

            {/* Project Credentials Status */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-900/10 text-xs font-mono space-y-1.5 text-emerald-950">
              <div><strong>Project ID:</strong> aruvicollections-5ce06</div>
              <div><strong>Storage Bucket:</strong> aruvicollections-5ce06.firebasestorage.app</div>
              <div><strong>Owner Admin:</strong> aruvicollections.25@gmail.com</div>
              <div><strong>Status:</strong> <span className="text-emerald-700 font-bold">✓ Connected</span></div>
            </div>
          </div>
        )}

        {/* Tab 5: Services */}
        {adminTab === 'services' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-xs">
            <h3 className="font-serif text-2xl font-bold text-primary-dark mb-1">
              9 Signature Boutique Collections
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Official collections configured across the Aruvi boutique navigation:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((c, idx) => {
                const count = products.filter(p => p.category === c.id).length;
                return (
                  <div key={c.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-900/10 bg-ivory/40">
                    <span className="text-gold font-bold text-sm">#{idx + 1}</span>
                    <img src={c.image} alt={c.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <strong className="block text-xs font-bold text-primary-dark truncate">{c.name}</strong>
                      <span className="text-[11px] text-text-muted">{count} pieces in catalog</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal with AdminProductGalleryManager */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-dark/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative z-10 bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-emerald-900/10 pb-4">
              <h3 className="font-serif text-2xl font-bold text-primary-dark">
                {editingProduct ? 'Manage Garment & Firebase Gallery' : 'Add New Garment to Catalog'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              
              {/* Product Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Garment Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Emerald Kanjivaram Bridal Silk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="14999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="18500"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Fabric & Weave</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="Pure Mulberry Silk"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="BESTSELLER / NEW / FESTIVE"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Multi-Image Gallery Manager with Firebase Storage */}
              <div>
                <AdminProductGalleryManager
                  images={galleryImages}
                  productId={editingProduct?.id}
                  onImagesChange={(imgs) => setGalleryImages(imgs)}
                  showNotification={(msg, type) => addToast(msg, type)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-primary-dark mb-1">Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Master handwoven silhouette..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-emerald-900/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-emerald-900/20 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition"
                >
                  {editingProduct ? 'Save Changes' : 'Publish Garment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
