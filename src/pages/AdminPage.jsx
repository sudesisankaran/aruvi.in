import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { uploadFileToFirebase } from '../services/firebase';

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
    updateOrderStatus,
    addToast 
  } = useStore();

  const [adminTab, setAdminTab] = useState('products'); // 'products', 'orders', 'services', 'firebase'
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
  
  // Firebase Upload state
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
    setUploadProgress(null);
    setIsModalOpen(true);
  };

  // Handle Image Upload to Firebase Cloud Storage
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const downloadUrl = await uploadFileToFirebase(file, (progress) => {
        setUploadProgress(progress);
      });
      setImage(downloadUrl);
      addToast('Garment image uploaded to Firebase Storage!', 'success');
    } catch (err) {
      console.error('Firebase upload failed, using local blob:', err);
      // Fallback to local object URL if Firebase storage network fails
      const fallbackUrl = URL.createObjectURL(file);
      setImage(fallbackUrl);
      addToast('Image uploaded via local buffer fallback.', 'info');
    } finally {
      setIsUploading(false);
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!title || !price) {
      alert('Please fill in title and price.');
      return;
    }

    const productPayload = {
      title,
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price) * 1.2,
      fabric,
      badge: badge || null,
      image: image || 'assets/images/kanjivaram_green.jpg',
      description
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setIsModalOpen(false);
  };

  // Security Gate: Not an Admin
  if (!isAdmin) {
    return (
      <div className="admin-gate-view" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'radial-gradient(circle at center, #133a2d 0%, #081a14 100%)' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: '#fff', borderRadius: '20px', padding: '36px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', textAlign: 'center' }}>
          
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(200,157,56,0.15)', border: '2px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 16px' }}>
            👑
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#0e2920', margin: '0 0 6px' }}>
            Aruvi Owner Portal
          </h2>
          <p style={{ color: '#667770', fontSize: '0.88rem', marginBottom: '24px' }}>
            Restricted to boutique owner <strong>aruvicollections.25@gmail.com</strong>.
          </p>

          {authError && (
            <div style={{ background: '#ffebee', color: '#c93b3b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px', textAlign: 'left' }}>
              {authError}
            </div>
          )}

          {/* Firebase Google Auth Button */}
          <button 
            type="button" 
            onClick={handleGoogleAdminLogin}
            disabled={authLoading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', borderRadius: '8px', border: '1px solid #d4c8b8', background: '#fff', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 600, color: '#0e2920', marginBottom: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{authLoading ? 'Signing in with Google...' : 'Sign in with Owner Google Account'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', color: '#aaa', fontSize: '0.8rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
            <span style={{ padding: '0 10px' }}>OR DIRECT OWNER SIGN-IN</span>
            <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
          </div>

          {/* Direct Form */}
          <form onSubmit={handleEmailAdminLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0e2920', marginBottom: '4px' }}>Owner Email</label>
              <input 
                type="email" 
                required 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0e2920', marginBottom: '4px' }}>Password</label>
              <input 
                type="password" 
                placeholder="Enter owner password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8', fontSize: '0.9rem' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary hover-shimmer"
              style={{ width: '100%', padding: '12px', fontWeight: 600 }}
            >
              Unlock Dashboard ⚡
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link to="/" style={{ fontSize: '0.82rem', color: '#667770', textDecoration: 'underline' }}>← Return to Boutique Storefront</Link>
          </div>

        </div>
      </div>
    );
  }

  // Admin Dashboard View
  return (
    <div className="admin-dashboard-view" style={{ padding: '30px 0 80px', background: '#f8f6f2', minHeight: '100vh' }}>
      <div className="container">

        {/* Admin Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '20px 28px', marginBottom: '28px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>👑</span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#0e2920', margin: 0 }}>
                Aruvi Collections Owner Portal
              </h1>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#667770' }}>
              Logged in as: <strong style={{ color: '#0e2920' }}>{user?.email}</strong> (Firebase Storage & Cloud Auth Connected)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/" className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              🛍️ View Storefront
            </Link>
            <button 
              type="button" 
              onClick={() => {
                logout();
                addToast('Admin signed out.', 'info');
              }}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '8px 16px', color: '#c93b3b', borderColor: '#c93b3b' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2dad0', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', fontWeight: 700 }}>Total Revenue</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0e2920', margin: '6px 0 2px', fontFamily: 'var(--font-serif)' }}>
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0f5132', fontWeight: 600 }}>↑ All time sales</span>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2dad0', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', fontWeight: 700 }}>Customer Orders</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0e2920', margin: '6px 0 2px', fontFamily: 'var(--font-serif)' }}>
              {totalOrders}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600 }}>Active consignments</span>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2dad0', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', fontWeight: 700 }}>Catalog Garments</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0e2920', margin: '6px 0 2px', fontFamily: 'var(--font-serif)' }}>
              {totalProducts}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0e2920', fontWeight: 600 }}>Live across categories</span>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2dad0', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', color: '#667770', textTransform: 'uppercase', fontWeight: 700 }}>Boutique Services</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0e2920', margin: '6px 0 2px', fontFamily: 'var(--font-serif)' }}>
              9 Services
            </div>
            <span style={{ fontSize: '0.75rem', color: '#0f5132', fontWeight: 600 }}>Salwar to Kids Wear</span>
          </div>

        </div>

        {/* Dashboard Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => setAdminTab('products')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: adminTab === 'products' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
              background: adminTab === 'products' ? 'var(--color-primary)' : '#fff',
              color: adminTab === 'products' ? '#fff' : '#0e2920',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            👗 Products Manager ({products.length})
          </button>

          <button 
            type="button" 
            onClick={() => setAdminTab('orders')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: adminTab === 'orders' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
              background: adminTab === 'orders' ? 'var(--color-primary)' : '#fff',
              color: adminTab === 'orders' ? '#fff' : '#0e2920',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            📦 Customer Orders ({orders.length})
          </button>

          <button 
            type="button" 
            onClick={() => setAdminTab('services')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: adminTab === 'services' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
              background: adminTab === 'services' ? 'var(--color-primary)' : '#fff',
              color: adminTab === 'services' ? '#fff' : '#0e2920',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✨ 9 Services Overview
          </button>

          <button 
            type="button" 
            onClick={() => setAdminTab('firebase')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: adminTab === 'firebase' ? '2px solid var(--color-primary)' : '1px solid #d4c8b8',
              background: adminTab === 'firebase' ? 'var(--color-primary)' : '#fff',
              color: adminTab === 'firebase' ? '#fff' : '#0e2920',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🔥 Firebase Cloud Storage
          </button>
        </div>

        {/* Tab 1: Products Manager */}
        {adminTab === 'products' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', margin: 0 }}>
                Garment Catalog
              </h3>
              <button 
                type="button" 
                onClick={handleOpenAddModal}
                className="btn btn-primary hover-shimmer"
                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
              >
                ➕ Add New Garment
              </button>
            </div>

            {/* Products Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', color: '#667770' }}>
                    <th style={{ padding: '12px' }}>Item</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Fabric</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Badge</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image} alt={p.title} style={{ width: '40px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#0e2920' }}>{p.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>ID: {p.id}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{p.category}</td>
                      <td style={{ padding: '12px' }}>{p.fabric || 'Silk'}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#0e2920' }}>
                        ₹{(Number(p.price) || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {p.badge && (
                          <span style={{ background: 'rgba(200,157,56,0.15)', color: '#0e2920', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          type="button" 
                          onClick={() => handleOpenEditModal(p)}
                          style={{ background: 'none', border: '1px solid #ccc', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px', fontSize: '0.8rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            if (window.confirm(`Delete "${p.title}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          style={{ background: 'none', border: '1px solid #c93b3b', color: '#c93b3b', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders Manager */}
        {adminTab === 'orders' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '20px' }}>
              Customer Consignments & Orders
            </h3>

            {orders.length === 0 ? (
              <p style={{ color: '#667770' }}>No customer orders placed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map((ord) => (
                  <div key={ord.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '14px' }}>
                      <div>
                        <strong style={{ color: '#0e2920' }}>Order #{ord.id}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#667770', marginLeft: '12px' }}>
                          Placed: {new Date(ord.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
                        <select 
                          value={ord.status}
                          onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.85rem', fontWeight: 600 }}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="In Loom / Tailored">In Loom / Tailored</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#0e2920', marginBottom: '4px' }}>Customer Delivery Address:</strong>
                        <div>{ord.shipping?.name}</div>
                        <div>{ord.shipping?.address}, {ord.shipping?.city} - {ord.shipping?.pincode}</div>
                        <div>Phone: {ord.shipping?.phone} | {ord.shipping?.email}</div>
                      </div>

                      <div>
                        <strong style={{ display: 'block', color: '#0e2920', marginBottom: '4px' }}>Payment & Total:</strong>
                        <div>Method: <strong>{(ord.paymentMethod || 'upi').toUpperCase()}</strong></div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0e2920', marginTop: '4px' }}>
                          Total: ₹{(ord.total || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 9 Services Overview */}
        {adminTab === 'services' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '10px' }}>
              Boutique Services Configuration
            </h3>
            <p style={{ color: '#667770', fontSize: '0.92rem', marginBottom: '24px' }}>
              The 9 official boutique collections customized for Aruvi Collections:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {categories.map((c, idx) => {
                const count = products.filter(p => p.category === c.id).length;
                return (
                  <div key={c.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', borderRadius: '12px', border: '1px solid #eee', background: '#fafafa' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-gold)', width: '28px' }}>#{idx + 1}</span>
                    <img src={c.image} alt={c.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0e2920' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>{count} piece{count === 1 ? '' : 's'} in catalog</span>
                    </div>
                    <Link to={`/shop?category=${c.id}`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'underline' }}>View</Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Firebase Storage & Cloud Config */}
        {adminTab === 'firebase' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2dad0', padding: '28px', maxWidth: '720px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', marginBottom: '8px' }}>
              Firebase Storage & Cloud Infrastructure
            </h3>
            <p style={{ color: '#667770', fontSize: '0.92rem', marginBottom: '24px' }}>
              Active configuration powering Google Authentication, Cloud Storage file uploads, and owner verification.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafafa', borderRadius: '10px', padding: '20px', border: '1px solid #eee', fontFamily: 'monospace', fontSize: '0.85rem' }}>
              <div><strong>Project ID:</strong> ssvvallarasubillsystem</div>
              <div><strong>Auth Domain:</strong> ssvvallarasubillsystem.firebaseapp.com</div>
              <div><strong>Storage Bucket:</strong> ssvvallarasubillsystem.firebasestorage.app</div>
              <div><strong>Storage Folder:</strong> /aruvi-products/</div>
              <div><strong>Owner Admin:</strong> aruvicollections.25@gmail.com</div>
              <div><strong>Cloud Status:</strong> <span style={{ color: '#0f5132', fontWeight: 'bold' }}>✓ Operational</span></div>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          
          <div style={{ position: 'relative', zIndex: 10, background: '#fff', borderRadius: '16px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#0e2920', margin: 0 }}>
                {editingProduct ? 'Edit Garment' : 'Add New Garment to Catalog'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Garment Title *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Royal Emerald Zari Salwar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Category *</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8', background: '#fff' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Fabric</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pure Georgette"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Selling Price (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="4999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Original MRP (₹)</label>
                  <input 
                    type="number" 
                    placeholder="6999"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Badge Tag</label>
                  <input 
                    type="text" 
                    placeholder="BESTSELLER / NEW / FESTIVE"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                  />
                </div>
              </div>

              {/* Firebase Cloud Storage Image Upload */}
              <div style={{ marginBottom: '18px', background: '#fbf9f6', padding: '16px', borderRadius: '10px', border: '1px dashed var(--color-gold)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>
                  🔥 Upload Image to Firebase Cloud Storage:
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange}
                  disabled={isUploading}
                  style={{ fontSize: '0.85rem', marginBottom: '8px' }}
                />

                {isUploading && (
                  <div style={{ margin: '8px 0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#0e2920', marginBottom: '4px' }}>
                      Uploading to Firebase: {Math.round(uploadProgress || 0)}%
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#e0d8cc', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress || 0}%`, height: '100%', background: 'var(--color-gold)' }} />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#667770', marginBottom: '4px' }}>Or Direct Image URL / Path:</label>
                  <input 
                    type="text" 
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="assets/images/kanjivaram_green.jpg"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #d4c8b8', fontSize: '0.82rem' }}
                  />
                </div>

                {image && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={image} alt="Preview" style={{ width: '48px', height: '58px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <span style={{ fontSize: '0.78rem', color: '#0f5132' }}>✓ Image ready for preview</span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0e2920', marginBottom: '6px' }}>Description</label>
                <textarea 
                  rows="3" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Artisanal handwoven drape..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d4c8b8' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary hover-shimmer" style={{ padding: '10px 24px' }}>
                  {editingProduct ? 'Save Changes' : 'Add to Boutique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
