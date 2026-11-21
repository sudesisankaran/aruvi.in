import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { fetchFreshAdminToken, tryonApi } from '../services/api';
import { downloadOrderInvoicePDF } from '../utils/pdfGenerator';
import { openWhatsAppOrderChat } from '../utils/whatsappHelper';
import { uploadFileToFirebase } from '../services/firebase';
import { getProductImageUrl, handleImageError } from '../utils/imageUtils';
import AdminProductGalleryManager from '../components/AdminProductGalleryManager';
import ImageUploadDropzone from '../components/ImageUploadDropzone';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  ShoppingCart,
  Users,
  Boxes,
  FileText,
  MessageSquare,
  Settings,
  UserCheck,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Plus,
  Save,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function AdminPage({ initialTab = 'dashboard' }) {
  const {
    user,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    logout,
    products,
    categories,
    orders,
    customers,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    updateStock,
    addCategory,
    updateCategory,
    deleteCategory,
    websiteSettings,
    updateWebsiteSettings,
    banners,
    addBanner,
    deleteBanner,
    updateOrderStatus,
    addOrderNote,
    addToast
  } = useStore();

  const navigate = useNavigate();

  // Ensure valid admin token on AdminPage mount
  useEffect(() => {
    if (isAdmin && !localStorage.getItem('aruvi_auth_token')) {
      fetchFreshAdminToken();
    }
  }, [isAdmin]);

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auth State
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('aruvicollections.25@gmail.com');
  const [passwordInput, setPasswordInput] = useState('admin123');

  // Product Add / Edit Form State
  const [editingProductId, setEditingProductId] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState(categories[0]?.slug || categories[0]?.id || 'salwar');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOriginalPrice, setProdOriginalPrice] = useState('');
  const [prodStock, setProdStock] = useState('15');
  const [prodFabric, setProdFabric] = useState('Pure Silk');
  const [prodBadge, setProdBadge] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStatus, setProdStatus] = useState('active');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodImages, setProdImages] = useState([]);

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [productSort, setProductSort] = useState('latest');

  // Order Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrderModal, setSelectedOrderModal] = useState(null);
  const [newOrderNoteText, setNewOrderNoteText] = useState('');

  // Category Add / Edit State
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);

  // FASHN AI Virtual Try-On Admin State
  const [tryonStats, setTryonStats] = useState(null);
  const [loadingTryonStats, setLoadingTryonStats] = useState(false);
  const [selectedTryonImg, setSelectedTryonImg] = useState(null);

  const fetchTryonStats = useCallback(async () => {
    setLoadingTryonStats(true);
    try {
      const data = await tryonApi.getAdminStats();
      setTryonStats(data);
    } catch (err) {
      console.warn('Failed to load try-on stats:', err);
    } finally {
      setLoadingTryonStats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tryon') {
      fetchTryonStats();
    }
  }, [activeTab, fetchTryonStats]);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState({
    businessName: websiteSettings?.businessName || 'Aruvi Collections',
    whatsappNumber: websiteSettings?.whatsappNumber || '918610638978',
    phone: websiteSettings?.phone || '+91 86106 38978',
    email: websiteSettings?.email || 'concierge@aruvicollections.com',
    address: websiteSettings?.address || 'Aruvi Heritage Square, Cathedral Road, Chennai, Tamil Nadu 600086, India',
    freeShippingThreshold: websiteSettings?.freeShippingThreshold || 999,
    shippingFee: websiteSettings?.shippingFee || 99,
    orderPrefix: websiteSettings?.orderPrefix || 'ORD',
    gstin: websiteSettings?.gstin || '33AAAAA0000A1Z5'
  });

  // Calculate Dashboard KPI Metrics
  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const avgOrderVal = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;
    const pendingOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length;
    const confirmedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'confirmed').length;
    const completedOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'completed').length;
    const cancelledOrders = orders.filter((o) => (o.status || '').toLowerCase() === 'cancelled').length;

    const activeProds = products.filter((p) => p.status !== 'inactive').length;
    const outOfStockProds = products.filter((p) => Number(p.stock) <= 0).length;

    return {
      totalRevenue: totalRev,
      avgOrderValue: avgOrderVal,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalProducts: products.length,
      activeProducts: activeProds,
      outOfStockProducts: outOfStockProds,
      totalCustomers: customers.length
    };
  }, [orders, products, customers]);

  // Auth Handlers
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await loginWithEmail(emailInput, passwordInput);
      if (res && res.user && res.user.isAdmin) {
        addToast('👑 Welcome Owner Admin! Dashboard unlocked.', 'success');
        setActiveTab('dashboard');
        navigate('/admin/dashboard');
      } else {
        setAuthError('Access denied. Administrator privileges require aruvicollections.25@gmail.com.');
        navigate('/');
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res && res.isAdmin) {
        addToast('👑 Owner Admin authenticated via Google!', 'success');
      } else {
        addToast(`Signed in as ${res?.email}. Admin access requires aruvicollections.25@gmail.com.`, 'info');
      }
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    logout();
    addToast('Admin logged out securely.', 'info');
    navigate('/');
  };

  // Product Form Reset
  const resetProductForm = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdSku('');
    setProdCategory(categories[0]?.slug || categories[0]?.id || 'salwar');
    setProdPrice('');
    setProdOriginalPrice('');
    setProdStock('15');
    setProdFabric('Pure Silk');
    setProdBadge('');
    setProdDescription('');
    setProdStatus('active');
    setProdIsFeatured(false);
    setProdImages([]);
  };

  const handleStartEditProduct = (prod) => {
    if (!prod) return;
    setEditingProductId(prod.id);
    setProdTitle(prod.title || '');
    setProdSku(prod.sku || '');
    const catVal = typeof prod.category === 'object' && prod.category !== null 
      ? (prod.category.slug || prod.category.id) 
      : (prod.category_slug || prod.category || 'salwar');
    setProdCategory(String(catVal).toLowerCase().trim());
    setProdPrice(prod.price !== undefined ? String(prod.price) : '');
    setProdOriginalPrice(prod.originalPrice ? String(prod.originalPrice) : '');
    setProdStock(typeof prod.stock === 'number' ? String(prod.stock) : (prod.stock || '15'));
    setProdFabric(prod.fabric || 'Pure Silk');
    setProdBadge(prod.badge || '');
    setProdDescription(prod.description || '');
    setProdStatus(prod.status || 'active');
    setProdIsFeatured(!!prod.isFeatured);
    setProdImages(
      prod.images && prod.images.length > 0
        ? prod.images
        : (prod.image && !prod.image.includes('kanjivaram_green.jpg'))
          ? [{ id: '1', image_url: prod.image, is_primary: true }]
          : []
    );
    setActiveTab('add-product');
  };

  // Delete Product with confirmation & loading state
  const handleDeleteProduct = async (prod) => {
    if (!prod) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${prod.title}"?\n\nThis will permanently remove it from your store catalog.`
    );
    if (!confirmDelete) return;

    setDeletingProductId(prod.id);
    try {
      await deleteProduct(prod.id);
    } catch (err) {
      console.error('Delete product failed:', err);
    } finally {
      setDeletingProductId(null);
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodPrice) {
      addToast('Please enter a product title and price.', 'error');
      return;
    }

    setSavingProduct(true);
    const primaryImg = prodImages.find((img) => img.is_primary) || prodImages[0];
    const mainImageUrl = primaryImg
      ? (primaryImg.image_url || primaryImg.storage_path || '')
      : (prodImages.length > 0 ? (prodImages[0].image_url || prodImages[0].storage_path || '') : '');

    const catValue = (prodCategory || (categories[0]?.slug || categories[0]?.id || 'salwar')).toLowerCase();

    const payload = {
      title: prodTitle.trim(),
      sku: prodSku.trim() || (editingProductId ? undefined : `ARUVI-${catValue.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`),
      category: catValue,
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice ? Number(prodOriginalPrice) : null,
      stock: Math.max(0, parseInt(prodStock, 10) || 0),
      fabric: prodFabric,
      badge: prodBadge.trim() || null,
      description: prodDescription.trim(),
      status: prodStatus,
      isFeatured: prodIsFeatured,
      image: mainImageUrl,
      images: prodImages
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await addProduct(payload);
      }
      resetProductForm();
      setActiveTab('products');
    } catch (err) {
      console.error('Save product transaction failed:', err);
    } finally {
      setSavingProduct(false);
    }
  };

  // Filtered Products for Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCatFilter !== 'all' && (p.category || '').toLowerCase() !== productCatFilter.toLowerCase()) {
        return false;
      }
      if (productStatusFilter !== 'all' && p.status !== productStatusFilter) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSku) return false;
      }
      return true;
    }).sort((a, b) => {
      if (productSort === 'price-low') return (a.price || 0) - (b.price || 0);
      if (productSort === 'price-high') return (b.price || 0) - (a.price || 0);
      if (productSort === 'stock') return (a.stock || 0) - (b.stock || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [products, productCatFilter, productStatusFilter, productSearch, productSort]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'all' && (o.status || '').toLowerCase() !== orderStatusFilter.toLowerCase()) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchName = (o.shipping?.name || o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.shipping?.phone || o.customerPhone || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Category Operations
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      addToast('Please enter category name.', 'error');
      return;
    }
    const defaultCatImg = `assets/images/category_${catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')}.jpg`;
    if (editingCatId) {
      updateCategory(editingCatId, {
        name: catName.trim(),
        description: catDesc.trim(),
        image: catImage.trim() || defaultCatImg
      });
      setEditingCatId(null);
    } else {
      addCategory({
        name: catName.trim(),
        description: catDesc.trim(),
        image: catImage.trim() || defaultCatImg
      });
    }
    setCatName('');
    setCatDesc('');
    setCatImage('');
  };

  // Add Internal Order Note
  const handleAddNote = () => {
    if (!selectedOrderModal || !newOrderNoteText.trim()) return;
    addOrderNote(selectedOrderModal.id, newOrderNoteText.trim());
    // Update local modal state
    setSelectedOrderModal((prev) => ({
      ...prev,
      internalNotes: [
        ...(prev.internalNotes || []),
        { id: Date.now(), text: newOrderNoteText.trim(), createdAt: new Date().toISOString(), author: 'Admin' }
      ]
    }));
    setNewOrderNoteText('');
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateWebsiteSettings(settingsForm);
    addToast('Website & business settings saved successfully!', 'success');
  };

  // Test Download Invoice PDF
  const handleTestDownloadPDF = () => {
    const sampleOrder = orders[0] || {
      id: `${settingsForm.orderPrefix}-2026-9999`,
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      items: [
        { id: 'sample-1', title: 'Royal Kanjivaram Brocade Drape', price: 8999, quantity: 1, selectedSize: 'Free Size' },
        { id: 'sample-2', title: 'Emerald Artisanal Salwar Suit', price: 4999, quantity: 1, selectedSize: 'M' }
      ],
      shipping: {
        name: 'Mahalakshmi Sundaresan',
        phone: '9840123456',
        email: 'mahalakshmi@example.com',
        address: '42 Poes Garden, Alwarpet',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600018'
      },
      paymentMethod: 'UPI / GPay',
      subtotal: 13998,
      discount: 2799,
      shippingFee: 0,
      total: 11199
    };
    downloadOrderInvoicePDF(sampleOrder, settingsForm);
    addToast('Sample invoice PDF generated & downloaded!', 'success');
  };

  // -------------------------------------------------------------
  // RENDER: Unauthenticated Admin Login Gate
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory/40 flex items-center justify-center p-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-900/15 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-900 via-gold to-emerald-900" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-gold flex items-center justify-center mx-auto mb-4 border border-gold/40 shadow-md">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-primary-dark">
              Owner Admin Portal
            </h1>
            <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-semibold">
              Aruvi Collections Atelier
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
              <strong>Authentication Notice:</strong> {authError}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-primary-dark mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-900/20 text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-primary-dark hover:bg-emerald-950 text-gold font-bold text-sm uppercase tracking-wider transition shadow-md cursor-pointer"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-emerald-900/10" /></div>
            <span className="relative bg-white px-3 text-xs text-text-muted uppercase tracking-wider">or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full py-2.5 rounded-xl bg-white border border-emerald-900/20 hover:bg-emerald-50/50 text-primary-dark font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <span>Sign In with Google</span>
          </button>

          <div className="mt-6 text-center border-t border-emerald-900/10 pt-4">
            <Link to="/" className="text-xs text-text-muted hover:text-primary-dark font-semibold">
              ← Return to Boutique Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Navigation Menu Configuration (12 Complete Sections)
  // -------------------------------------------------------------
  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, count: products.length },
    { id: 'add-product', label: editingProductId ? 'Edit Product' : 'Add Product', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, count: orders.length },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'inventory', label: 'Inventory / Stock', icon: Boxes },
    { id: 'tryon', label: 'FASHN Virtual Try-On', icon: Sparkles },
    { id: 'pdf-management', label: 'PDF & Invoices', icon: FileText },
    { id: 'whatsapp-settings', label: 'WhatsApp Settings', icon: MessageSquare },
    { id: 'website-settings', label: 'Website Settings', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: UserCheck },
  ];

  return (
    <div className="admin-page-view min-h-screen bg-slate-50 flex flex-col lg:flex-row">

      {/* -------------------------------------------------------------
          SIDEBAR NAVIGATION (12 Sections)
          ------------------------------------------------------------- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-emerald-950 text-white flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-emerald-900/50 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-serif font-bold text-xl">
                A
              </div>
              <div>
                <h2 className="font-serif font-bold text-white text-base tracking-wide">Aruvi Collections</h2>
                <span className="text-[10px] text-gold uppercase tracking-widest font-semibold block">Admin Portal</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${isActive
                    ? 'bg-gold text-emerald-950 font-bold shadow-md'
                    : 'text-emerald-100/70 hover:bg-emerald-900/60 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-emerald-950 text-gold' : 'bg-emerald-900 text-white'
                      }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer & Logout (Item #12) */}
        <div className="p-4 border-t border-emerald-900/50 space-y-2">
          <button
            type="button"
            onClick={handleAdminLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>12. Logout</span>
          </button>
          <div className="px-4 py-2 text-[10px] text-emerald-300/50 flex items-center justify-between">
            <span>v2.4 Boutique Suite</span>
            <Link to="/" className="text-gold hover:underline">View Store →</Link>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* -------------------------------------------------------------
          MAIN CONTENT AREA
          ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-primary-dark capitalize">
              {navMenuItems.find((i) => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Storefront</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gold/20 text-gold-dark font-bold text-xs flex items-center justify-center border border-gold/40">
                👑
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-slate-800 leading-tight">Super Admin</span>
                <span className="block text-[10px] text-slate-500 leading-tight">aruvicollections.25@gmail.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">

          {/* =========================================================
              1. DASHBOARD TAB
              ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                {/* Total Revenue */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-800">₹</span>
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Avg Order: ₹{stats.avgOrderValue.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Total Orders */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
                    <ShoppingCart className="w-5 h-5 text-gold-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark">{stats.totalOrders}</h3>
                  <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                    {stats.pendingOrders} Pending Confirmation
                  </span>
                </div>

                {/* Products Count */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</span>
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-dark">{stats.totalProducts}</h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {stats.activeProducts} Active in Catalog
                  </span>
                </div>

                {/* Out of Stock */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Alert</span>
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-rose-700">{stats.outOfStockProducts}</h3>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Out of Stock items
                  </span>
                </div>

              </div>

              {/* Order Status Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-center">
                  <span className="text-xs font-bold text-amber-800 uppercase block">Pending</span>
                  <strong className="text-2xl text-amber-900 font-bold">{stats.pendingOrders}</strong>
                </div>
                <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-xl text-center">
                  <span className="text-xs font-bold text-blue-800 uppercase block">Confirmed</span>
                  <strong className="text-2xl text-blue-900 font-bold">{stats.confirmedOrders}</strong>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-center">
                  <span className="text-xs font-bold text-emerald-800 uppercase block">Completed</span>
                  <strong className="text-2xl text-emerald-900 font-bold">{stats.completedOrders}</strong>
                </div>
                <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl text-center">
                  <span className="text-xs font-bold text-rose-800 uppercase block">Cancelled</span>
                  <strong className="text-2xl text-rose-900 font-bold">{stats.cancelledOrders}</strong>
                </div>
              </div>

              {/* Quick Actions & Recent Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary-dark">Recent Customer Orders</h3>
                    <p className="text-xs text-slate-500">Latest orders placed via website & WhatsApp</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetProductForm();
                        setActiveTab('add-product');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary-dark text-gold text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      View All Orders
                    </button>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No orders placed yet. As customers order, they will appear here live!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono font-bold text-primary-dark">{ord.id}</td>
                            <td className="p-3 font-semibold text-slate-800">
                              {ord.shipping?.name || ord.customerName || 'Patron'}
                              <span className="block text-[11px] text-slate-500">{ord.shipping?.phone || 'No phone'}</span>
                            </td>
                            <td className="p-3">{ord.items?.length || 1} item(s)</td>
                            <td className="p-3 font-bold text-slate-900">₹{Number(ord.total || 0).toLocaleString('en-IN')}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${ord.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                                  ord.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                }`}>
                                {ord.status || 'Pending'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderModal(ord)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-primary-dark font-bold text-[11px]"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* =========================================================
              2. PRODUCTS TAB
              ========================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">

              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary-dark">Product Catalog</h3>
                  <p className="text-xs text-slate-500">Manage all live garments, pricing, stock and visibility</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('add-product');
                    }}
                    className="px-4 py-2 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>

                  {products.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove all products? This will leave the store completely empty.')) {
                          clearAllProducts();
                        }
                      }}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                    >
                      Clear All Products
                    </button>
                  )}
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <select
                  value={productCatFilter}
                  onChange={(e) => setProductCatFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                >
                  <option value="all">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock">Stock Level</option>
                </select>
              </div>

              {/* Products Table or Empty State */}
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">👗</div>
                  <h4 className="font-serif text-lg font-bold text-slate-800">
                    {products.length === 0 ? 'Catalog Currently Has 0 Products' : 'No products match your search/filters'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
                    {products.length === 0
                      ? 'All demo products have been removed. Use the Add Product form to upload real pieces from your atelier.'
                      : 'Try resetting the category filter or clearing search keywords.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('add-product');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider"
                  >
                    + Add First Product
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Product</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((p) => {
                          const currPrice = Number(p.price) || 0;
                          const origPrice = Number(p.originalPrice) || 0;
                          const isStockLow = (p.stock || 0) <= 3;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={getProductImageUrl(p)}
                                  alt={p.title}
                                  className="w-12 h-14 object-cover rounded-lg border border-slate-200"
                                  onError={(e) => handleImageError(e, p)}
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">{p.title}</span>
                                  <span className="text-[11px] text-slate-500">{p.fabric || 'Pure Silk'}</span>
                                  {p.isFeatured && (
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 mt-0.5">
                                      ⭐ Featured
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-3 font-mono text-[11px] text-slate-600">{p.sku || 'N/A'}</td>

                              <td className="p-3 capitalize font-semibold text-slate-700">
                                {p.category?.replace('-', ' ')}
                              </td>

                              <td className="p-3">
                                <strong className="text-slate-900 font-bold">₹{currPrice.toLocaleString('en-IN')}</strong>
                                {origPrice > currPrice && (
                                  <span className="block text-[10px] text-slate-400 line-through">
                                    ₹{origPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(p.stock || 0) <= 0 ? 'bg-rose-100 text-rose-800' :
                                  isStockLow ? 'bg-amber-100 text-amber-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                  {p.stock ?? 0} in stock
                                </span>
                              </td>

                              <td className="p-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStatus = p.status === 'inactive' ? 'active' : 'inactive';
                                    updateProduct(p.id, { status: nextStatus });
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${p.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    }`}
                                >
                                  {p.status === 'inactive' ? 'Inactive' : 'Active'}
                                </button>
                              </td>

                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditProduct(p)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-primary-dark transition"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={deletingProductId === p.id}
                                    onClick={() => handleDeleteProduct(p)}
                                    className={`p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition ${deletingProductId === p.id ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================
              3. ADD / EDIT PRODUCT TAB
              ========================================================= */}
          {activeTab === 'add-product' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl">
              <div className="border-b border-slate-200 pb-4 mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary-dark">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fill in garment specifications, pricing, inventory, and upload high-resolution images
                  </p>
                </div>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('products');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">

                {/* Basic Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pure Kanjivaram Brocade Silk Saree"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Product SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ARUVI-KAN-101 (auto-generated if empty)"
                      value={prodSku}
                      onChange={(e) => setProdSku(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-gold capitalize"
                    >
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.slug || c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Regular Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 8999"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Discounted / Original MRP (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 11999"
                      value={prodOriginalPrice}
                      onChange={(e) => setProdOriginalPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Fabric / Material
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Mulberry Silk / Handloom Cotton"
                      value={prodFabric}
                      onChange={(e) => setProdFabric(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller / Festive Drop"
                      value={prodBadge}
                      onChange={(e) => setProdBadge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Garment Description & Weaver Story
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Describe the weaving technique, zari purity, occasion styling, and drape elegance..."
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Status & Featured Options */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Status:</label>
                    <select
                      value={prodStatus}
                      onChange={(e) => setProdStatus(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold"
                    >
                      <option value="active">Active (Visible in Store)</option>
                      <option value="inactive">Inactive (Hidden / Draft)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodIsFeatured}
                      onChange={(e) => setProdIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-800"
                    />
                    <span className="text-xs font-bold text-slate-800">Feature this product on Homepage Hero Showcase</span>
                  </label>
                </div>

                {/* Product Images Gallery Management */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Product Image Gallery & Uploads
                  </label>
                  <AdminProductGalleryManager
                    images={prodImages}
                    productId={editingProductId}
                    onImagesChange={(updated) => setProdImages(updated)}
                    showNotification={(msg, type) => addToast(msg, type)}
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      resetProductForm();
                      setActiveTab('products');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className={`px-6 py-2.5 rounded-xl bg-primary-dark hover:bg-emerald-950 text-gold font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer transition ${savingProduct ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {savingProduct 
                        ? (editingProductId ? 'Updating Product...' : 'Publishing Product...') 
                        : (editingProductId ? 'Update Product' : 'Save & Publish Product')}
                    </span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* =========================================================
              4. CATEGORIES TAB
              ========================================================= */}
          {activeTab === 'categories' && (
            <div className="space-y-8">

              {/* Category Add Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-primary-dark mb-4">
                  {editingCatId ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleSaveCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Silk Sarees, Lehenga, Salwar"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Image URL (or Asset Path)
                    </label>
                    <input
                      type="text"
                      placeholder="assets/images/category_salwar.jpg"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Short curation description"
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="sm:col-span-3 flex justify-end gap-2">
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(null);
                          setCatName('');
                          setCatDesc('');
                          setCatImage('');
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider shadow"
                    >
                      {editingCatId ? 'Update Category' : '+ Add Category'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((c) => {
                  const assignedCount = products.filter((p) => (p.category || '').toLowerCase() === c.id.toLowerCase()).length;
                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="p-4 flex items-center gap-4">
                        <img
                          src={c.image || 'assets/images/category_salwar.jpg'}
                          alt={c.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                          onError={(e) => { e.currentTarget.src = 'assets/images/category_salwar.jpg'; }}
                        />
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-base">{c.name}</h4>
                          <span className="text-[11px] font-mono text-slate-500 block">ID: {c.id}</span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mt-1">
                            {assignedCount} {assignedCount === 1 ? 'Product' : 'Products'} Attached
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(c.id);
                            setCatName(c.name);
                            setCatDesc(c.description || '');
                            setCatImage(c.image || '');
                          }}
                          className="text-slate-700 font-bold hover:text-primary-dark"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (assignedCount > 0) {
                              alert(`Cannot delete "${c.name}"! There are ${assignedCount} product(s) assigned to this category. Reassign or delete those products first.`);
                              return;
                            }
                            if (window.confirm(`Delete category "${c.name}"?`)) {
                              deleteCategory(c.id);
                            }
                          }}
                          className={`font-bold ${assignedCount > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-rose-600 hover:underline'}`}
                          title={assignedCount > 0 ? "Protected from deletion: Contains products" : "Delete category"}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* =========================================================
              5. ORDERS TAB
              ========================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">

              {/* Filter Tabs & Search */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary-dark">Customer Orders</h3>
                    <p className="text-xs text-slate-500">Track and update orders, manage dispatches, download invoices</p>
                  </div>
                  <div className="w-full sm:w-72 relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search Order ID, Name, Phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['all', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${orderStatusFilter === st
                        ? 'bg-primary-dark text-gold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">📦</div>
                  <h4 className="font-serif text-lg font-bold text-slate-800">No Orders Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    No customer orders match your selected status or search filter.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Items</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map((ord) => {
                          const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN') : 'Recent';
                          return (
                            <tr key={ord.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-primary-dark">{ord.id}</td>
                              <td className="p-3 text-slate-500">{dateStr}</td>
                              <td className="p-3 font-semibold text-slate-800">
                                {ord.shipping?.name || ord.customerName || 'Patron'}
                                <span className="block text-[11px] text-slate-500">{ord.shipping?.phone || 'No phone'}</span>
                              </td>
                              <td className="p-3">{ord.items?.length || 1} item(s)</td>
                              <td className="p-3 font-bold text-slate-900">₹{Number(ord.total || 0).toLocaleString('en-IN')}</td>
                              <td className="p-3">
                                <select
                                  value={ord.status || 'Pending'}
                                  onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                                  className={`px-2 py-1 rounded text-[11px] font-bold uppercase border ${ord.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                                    ord.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                                      ord.status === 'Confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                                        'bg-amber-50 text-amber-800 border-amber-300'
                                    }`}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderModal(ord)}
                                  className="px-2.5 py-1 rounded bg-primary-dark text-gold font-bold text-[11px]"
                                >
                                  Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadOrderInvoicePDF(ord, websiteSettings)}
                                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]"
                                  title="Download Invoice PDF"
                                >
                                  PDF
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================
              6. CUSTOMERS TAB
              ========================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary-dark">Customer Directory</h3>
                  <p className="text-xs text-slate-500">Patrons who have placed orders with Aruvi Collections</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {customers.length} Patrons
                </span>
              </div>

              {customers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">👥</div>
                  <h4 className="font-serif text-lg font-bold text-slate-800">No Customer Records Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    When customers place orders via the checkout page or WhatsApp, their contact info and order history will compile here automatically.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Customer Name</th>
                          <th className="p-3">Mobile / Phone</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">City</th>
                          <th className="p-3">Orders</th>
                          <th className="p-3">Total Spent</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{c.name}</td>
                            <td className="p-3 font-mono text-slate-600">{c.mobile}</td>
                            <td className="p-3 text-slate-500">{c.email}</td>
                            <td className="p-3 font-medium text-slate-700">{c.city}</td>
                            <td className="p-3 font-bold text-primary-dark">{c.totalOrders} order(s)</td>
                            <td className="p-3 font-bold text-slate-900">₹{c.totalSpent.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const num = c.mobile.replace(/[^0-9]/g, '');
                                  window.open(`https://wa.me/${num}?text=Hello%20${encodeURIComponent(c.name)},%20greetings%20from%20Aruvi%20Collections!`, '_blank');
                                }}
                                className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase hover:bg-emerald-500 flex items-center gap-1 ml-auto"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              7. INVENTORY / STOCK TAB
              ========================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary-dark">Inventory & Stock Control</h3>
                  <p className="text-xs text-slate-500">Monitor quantities, receive low-stock alerts, and perform live stock adjustments</p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-3">📦</div>
                  <h4 className="font-serif text-lg font-bold text-slate-800">No Products in Inventory</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    Add garments to your catalog to track stock counts.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('add-product')}
                    className="px-4 py-2 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase"
                  >
                    + Add Product
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Product Name & SKU</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Current Stock</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Quick Stock Adjustment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((p) => {
                          const stockNum = Number(p.stock) || 0;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="p-3 flex items-center gap-3">
                                <img
                                  src={getProductImageUrl(p)}
                                  alt={p.title}
                                  className="w-10 h-12 object-cover rounded border border-slate-200"
                                  onError={(e) => handleImageError(e, p)}
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">{p.title}</span>
                                  <span className="text-[10px] font-mono text-slate-500">SKU: {p.sku || 'N/A'}</span>
                                </div>
                              </td>

                              <td className="p-3 capitalize font-semibold text-slate-700">
                                {p.category?.replace('-', ' ')}
                              </td>

                              <td className="p-3 font-bold text-base text-slate-900">{stockNum}</td>

                              <td className="p-3">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${stockNum <= 0 ? 'bg-rose-100 text-rose-800' :
                                  stockNum <= 3 ? 'bg-amber-100 text-amber-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                  {stockNum <= 0 ? 'Out of Stock' : stockNum <= 3 ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>

                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateStock(p.id, Math.max(0, stockNum - 1))}
                                    className="w-7 h-7 rounded border border-slate-300 font-bold hover:bg-slate-100"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stockNum}
                                    onChange={(e) => updateStock(p.id, parseInt(e.target.value, 10) || 0)}
                                    className="w-14 px-2 py-1 text-center font-bold border border-slate-300 rounded text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateStock(p.id, stockNum + 1)}
                                    className="w-7 h-7 rounded border border-slate-300 font-bold hover:bg-slate-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              FASHN AI VIRTUAL TRY-ON MANAGEMENT (PHASE 11)
              ========================================================= */}
          {activeTab === 'tryon' && (
            <div className="space-y-6">

              {/* Header Banner */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold-dark border border-gold/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-gold-dark" />
                      FASHN AI Engine
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Model: tryon-v1.6
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-primary-dark">
                    Virtual Try-On Neural Atelier
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time monitoring, customer silhouette drape metrics, and FASHN API connection health.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchTryonStats}
                    disabled={loadingTryonStats}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition flex items-center gap-2 border border-slate-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTryonStats ? 'animate-spin text-gold' : ''}`} />
                    <span>{loadingTryonStats ? 'Refreshing...' : 'Refresh Metrics'}</span>
                  </button>
                  <Link
                    to="/fitting-room"
                    target="_blank"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Eye className="w-3.5 h-3.5 text-gold" />
                    <span>Open Customer Fitting Studio ↗</span>
                  </Link>
                </div>
              </div>

              {/* API Security Notice */}
              <div className="bg-emerald-50/70 border border-emerald-900/10 rounded-2xl p-4 flex items-start gap-3 text-emerald-950 text-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                    Zero-Exposure Backend Architecture
                  </h4>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed">
                    The FASHN AI API key is read exclusively by the Django backend from environment variables (<code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">FASHN_API_KEY</code>). Client requests route securely through <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">/api/virtual-tryon/</code>; the secret key is never exposed to frontend code or client network inspectors.
                  </p>
                </div>
              </div>

              {/* 4-Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Card 1: Provider Status */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    AI Provider & Model
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-primary-dark">
                      FASHN AI
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tryonStats?.api_configured
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                      {tryonStats?.api_configured ? '● Key Configured' : '⚠ Key Required'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    tryon-v1.6 • Balanced Mode
                  </p>
                </div>

                {/* Card 2: Total Generations */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Try-On Requests
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-primary-dark">
                      {tryonStats?.total_requests ?? 0}
                    </span>
                    <Sparkles className="w-5 h-5 text-gold-dark" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    All-time customer simulations
                  </p>
                </div>

                {/* Card 3: Successful */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Completed Renders
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-emerald-700">
                      {tryonStats?.successful ?? 0}
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    High-fidelity generated drapes
                  </p>
                </div>

                {/* Card 4: Failed / In-Flight */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    In Progress / Issues
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-slate-700">
                      {tryonStats?.in_progress ?? 0} <span className="text-xs text-slate-400 font-normal">in queue</span>
                    </span>
                    <span className="text-xs text-rose-600 font-bold">
                      {tryonStats?.failed ?? 0} failed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Real-time queue activity
                  </p>
                </div>
              </div>

              {/* Generation History Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-primary-dark">
                      Recent Generation Sessions
                    </h4>
                    <p className="text-xs text-slate-500">
                      Audited logs of customer try-on requests with FASHN prediction status
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Showing latest {tryonStats?.recent_sessions?.length ?? 0} sessions
                  </span>
                </div>

                {loadingTryonStats ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    Loading try-on logs...
                  </div>
                ) : !tryonStats?.recent_sessions || tryonStats.recent_sessions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Sparkles className="w-8 h-8 text-gold mx-auto" />
                    <h5 className="font-bold text-sm text-slate-700">No Try-On Sessions Yet</h5>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Customers can click "Preview on Me" on any product detail page or visit the Virtual Fitting Studio to initiate simulations.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4">Date / Time</th>
                          <th className="py-3 px-4">Garment</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Prediction ID</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tryonStats.recent_sessions.map((sess) => (
                          <tr key={sess.id} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                              {new Date(sess.created_at).toLocaleString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 truncate max-w-[180px]">
                                {sess.product_title || 'Aruvi Garment'}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                ₹{sess.product_price ? Number(sess.product_price).toLocaleString('en-IN') : 'N/A'}
                              </span>
                            </td>
                            <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">
                              {sess.category || 'auto'}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                              {sess.prediction_id ? sess.prediction_id.substring(0, 16) + '...' : 'N/A'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${sess.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : sess.status === 'failed'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border border-amber-300'
                                }`}>
                                {sess.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {sess.result_image_url ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedTryonImg(sess.result_image_url)}
                                  className="text-xs text-gold-dark hover:underline font-bold inline-flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[11px] italic">
                                  {sess.status === 'failed' ? 'Failed' : 'Pending'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Preview for Clicked Try-On Image */}
              {selectedTryonImg && (
                <div
                  className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setSelectedTryonImg(null)}
                >
                  <div className="bg-white rounded-3xl p-4 max-w-md w-full shadow-2xl space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-serif font-bold text-sm text-primary-dark">
                        FASHN AI Output Preview
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedTryonImg(null)}
                        className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                      <img src={selectedTryonImg} alt="Generated look" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <a
                        href={selectedTryonImg}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark"
                      >
                        Open Full Resolution ↗
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* =========================================================
              8. PDF & INVOICE MANAGEMENT TAB
              ========================================================= */}
          {activeTab === 'pdf-management' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary-dark">PDF & Invoice Management</h3>
                <p className="text-xs text-slate-500">
                  Customise printable tax invoices, company registration codes, terms of service, and test live invoice downloads
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-800">Aruvi Collections Official Invoice Template</h4>
                    <span className="text-[11px] text-slate-500">Royal Emerald & Gold Styling • A4 High-Resolution Vector</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestDownloadPDF}
                    className="px-4 py-2 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Sample PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-slate-600 uppercase">GSTIN / Registration No:</span>
                    <p className="font-mono text-slate-900 font-bold mt-0.5">{websiteSettings?.gstin || '33AAAAA0000A1Z5'}</p>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-600 uppercase">Invoice Terms:</span>
                    <p className="text-slate-700 mt-0.5">Complimentary insured delivery. 7-day handcrafted guarantee.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              9. WHATSAPP SETTINGS TAB
              ========================================================= */}
          {activeTab === 'whatsapp-settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary-dark">WhatsApp Integration Settings</h3>
                <p className="text-xs text-slate-500">
                  Configure the business WhatsApp number that receives instant customer orders and concierge inquiries
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Business WhatsApp Mobile Number * (with Country Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 918610638978"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Format: Country code followed by mobile (e.g. 918610638978 for India). No spaces or + symbol.
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <strong className="block font-bold">Standard WhatsApp Order Message Format:</strong>
                  <pre className="font-mono text-[11px] bg-white p-3 rounded-lg border border-emerald-200 overflow-x-auto whitespace-pre-wrap">
                    {`NEW CUSTOMER ORDER
Order ID: ORD-2026-0001
Date: 20 Nov 2026

CUSTOMER DETAILS:
Name: Priyadarshini Sundaram
Mobile: 9840123456

PRODUCT DETAILS:
Product: Pure Kanjivaram Brocade Drape
Price: ₹8,999
Quantity: 1
Subtotal: ₹8,999

TOTAL AMOUNT: ₹8,999
Please confirm this order.`}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const cleanNum = settingsForm.whatsappNumber.replace(/[^0-9]/g, '');
                      window.open(`https://wa.me/${cleanNum}?text=Hello%20Aruvi%20Collections%20Test%20Order`, '_blank');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-emerald-600 text-emerald-800 font-bold text-xs uppercase flex items-center gap-2 hover:bg-emerald-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Test WhatsApp Link</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider shadow"
                  >
                    Save WhatsApp Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================
              10. WEBSITE SETTINGS TAB
              ========================================================= */}
          {activeTab === 'website-settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary-dark">Website & Boutique Settings</h3>
                <p className="text-xs text-slate-500">
                  Manage store contact details, addresses, free shipping thresholds, and order prefixes
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.businessName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, businessName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Order Prefix
                    </label>
                    <input
                      type="text"
                      value={settingsForm.orderPrefix}
                      onChange={(e) => setSettingsForm({ ...settingsForm, orderPrefix: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Concierge Helpline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Concierge Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Boutique Atelier Address
                  </label>
                  <textarea
                    rows="2"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Free Shipping Order Threshold (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Default Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.shippingFee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shippingFee: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase tracking-wider shadow"
                  >
                    Save All Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================
              11. ADMIN PROFILE TAB
              ========================================================= */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-primary-dark">Admin Profile & Security</h3>
                <p className="text-xs text-slate-500">Super Administrator account details and session status</p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-gold flex items-center justify-center font-bold text-2xl border border-gold/40">
                  👑
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-lg">Boutique Owner & Super Administrator</h4>
                  <p className="text-xs text-slate-600 font-mono">aruvicollections.25@gmail.com</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Full Store Privileges Active
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-bold">Role:</span>
                  <span>Super Admin / Atelier Owner</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-bold">Database:</span>
                  <span>PostgreSQL / Cloud Synced</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="font-bold">Security Standard:</span>
                  <span>Role-Based Token Verification</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link to="/" className="text-xs text-primary-dark font-bold hover:underline">
                  ← Open Storefront
                </Link>
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase hover:bg-rose-700 shadow"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* -------------------------------------------------------------
          ORDER DETAILS MODAL
          ------------------------------------------------------------- */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedOrderModal(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold/15 text-primary-dark border border-gold/40 mb-2">
                Order #{selectedOrderModal.id}
              </span>
              <h3 className="font-serif text-2xl font-bold text-primary-dark">
                Order Details & Customer Dispatch
              </h3>
              <span className="text-xs text-slate-500">
                Placed on {new Date(selectedOrderModal.createdAt || Date.now()).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Customer Details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-2 text-xs">
              <h4 className="font-bold text-primary-dark uppercase tracking-wider mb-1">Customer Shipping Info:</h4>
              <p><strong>Name:</strong> {selectedOrderModal.shipping?.name || selectedOrderModal.customerName || 'Patron'}</p>
              <p><strong>Phone:</strong> {selectedOrderModal.shipping?.phone || selectedOrderModal.customerPhone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedOrderModal.shipping?.email || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedOrderModal.shipping?.address || 'N/A'}, {selectedOrderModal.shipping?.city || ''} {selectedOrderModal.shipping?.pincode || ''}</p>
              <p><strong>Payment Method:</strong> {(selectedOrderModal.paymentMethod || 'upi').toUpperCase()}</p>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
              <h4 className="font-bold text-primary-dark text-xs uppercase tracking-wider">Ordered Garments:</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {(selectedOrderModal.items || []).map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900 block">{it.title}</span>
                      <span className="text-slate-500">Size: {it.selectedSize || 'Free Size'} • Qty: {it.quantity || 1}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{((Number(it.price) || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-emerald-950 text-white mb-6 space-y-1.5 text-xs">
              <div className="flex justify-between text-emerald-200">
                <span>Subtotal:</span>
                <span>₹{Number(selectedOrderModal.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {Number(selectedOrderModal.discount) > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount:</span>
                  <span>-₹{Number(selectedOrderModal.discount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-200">
                <span>Shipping:</span>
                <span>{Number(selectedOrderModal.shippingFee) === 0 ? 'FREE' : `₹${selectedOrderModal.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-emerald-900">
                <span>Final Total:</span>
                <span className="text-gold font-serif text-base">₹{Number(selectedOrderModal.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="mb-6 space-y-3">
              <h4 className="font-bold text-primary-dark text-xs uppercase tracking-wider">Internal Notes:</h4>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {(selectedOrderModal.internalNotes || []).map((note) => (
                  <div key={note.id} className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs">
                    <p className="text-slate-800">{note.text}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      By {note.author} on {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add dispatch note or measurement confirmation..."
                  value={newOrderNoteText}
                  onChange={(e) => setNewOrderNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-gold"
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-4 py-2 rounded-xl bg-primary-dark text-gold font-bold text-xs uppercase"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Status:</span>
                <select
                  value={selectedOrderModal.status || 'Pending'}
                  onChange={(e) => {
                    const st = e.target.value;
                    updateOrderStatus(selectedOrderModal.id, st);
                    setSelectedOrderModal((prev) => ({ ...prev, status: st }));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-800"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openWhatsAppOrderChat(selectedOrderModal, websiteSettings)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Patron</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadOrderInvoicePDF(selectedOrderModal, websiteSettings)}
                  className="px-4 py-2 rounded-xl bg-primary-dark hover:bg-emerald-950 text-gold font-bold text-xs uppercase flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
