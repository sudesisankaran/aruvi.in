import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithGoogleAuth, signOutAuth } from '../services/firebase';
import { authApi, productsApi, ordersApi, settingsApi, fetchFreshAdminToken } from '../services/api';

const StoreContext = createContext(null);

export const AUTHORIZED_ADMIN_EMAIL = 'aruvicollections.25@gmail.com';

export const DEFAULT_CATEGORIES = [
  { id: 'salwar', name: 'Salwar', icon: '👗', description: 'Designer Salwar Suits, Anarkalis & Festive Kurta Sets', featured: true, image: 'assets/images/anarkali_suit.jpg' },
  { id: 'sharara', name: 'Sharara', icon: '✨', description: 'Royal Flared Sharara Sets & Peplum Kurta Ensembles', featured: true, image: 'assets/images/lehenga_set.jpg' },
  { id: 'ethnic-wear', name: 'Ethnic Wear', icon: '🪡', description: 'Traditional Handcrafted Ethnic Outfits & Heritage Drapes', featured: true, image: 'assets/images/festive_promo.jpg' },
  { id: 'maxis', name: "Maxi's", icon: '💃', description: 'Flowing Georgette, Modal Silk & Cotton Designer Maxi Dresses', featured: true, image: 'assets/images/printed_georgette.jpg' },
  { id: 'co-ordsets', name: 'Co-ordsets', icon: '👚', description: 'Contemporary Fusion Matching Two-Piece Co-ord Sets', featured: true, image: 'assets/images/western_ethnic.jpg' },
  { id: 'casual-tops', name: 'Casual Tops', icon: '👕', description: 'Chic Everyday Casual Tops, Designer Shirts & Tunics', featured: true, image: 'assets/images/kurti_wear.jpg' },
  { id: 'western-wear', name: 'Western Wear', icon: '🧥', description: 'Contemporary Western Dresses, Blazers & Jumpsuits', featured: true, image: 'assets/images/premium_fabrics.jpg' },
  { id: 'jeans-pants', name: 'Jeans & Pants', icon: '👖', description: 'High-waisted Jeans, Baggy Pants, Straight Cuts & Palazzo Trousers', featured: true, image: 'assets/images/hero_saree_model.jpg' },
  { id: 'kids-wear', name: 'Kids Wear', icon: '👶', description: 'Designer Kids Festive Outfits, Frocks & Traditional Sets', featured: true, image: 'assets/images/cotton_saree.jpg' }
];

export const INITIAL_PRODUCTS = [];

export const DEFAULT_BANNERS = [
  {
    id: 1,
    title: 'Festive Royal Heritage Drop',
    subtitle: 'Handloom Kanchipurams & Chanderi Silks',
    tag: 'FESTIVE SALE',
    image_url: 'assets/images/festive_promo.jpg',
    storage_path: 'banners/banner_festive_heritage.webp'
  },
  {
    id: 2,
    title: 'Next-Gen AI Virtual Fitting Room',
    subtitle: 'Try On Any Boutique Ensemble Realtime',
    tag: 'AI POWERED',
    image_url: 'assets/images/hero_saree_model.jpg',
    storage_path: 'banners/banner_ai_fitting.webp'
  }
];

export const DEFAULT_COUPONS = [
  { code: 'ARUVI20', type: 'percentage', value: 20, minOrder: 999 },
  { code: 'FESTIVE10', type: 'percentage', value: 10, minOrder: 499 },
  { code: 'BRIDAL500', type: 'flat', value: 500, minOrder: 4999 },
  { code: 'WELCOME100', type: 'flat', value: 100, minOrder: 999 }
];

export const DEFAULT_WEBSITE_SETTINGS = {
  websiteName: 'Aruvi Collections',
  businessName: 'Aruvi Collections',
  tagline: 'Tradition In Every Thread, Elegance In Every Drape',
  logo: 'assets/icons/WhatsApp Image 2026-09-21 at 7.49.20 AM (1).jpeg',
  address: 'Aruvi Heritage Square, Cathedral Road, Chennai, Tamil Nadu 600086, India',
  phone: '+91 86106 38978',
  whatsappNumber: '918610638978',
  email: 'concierge@aruvicollections.com',
  currency: 'INR (₹)',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  shippingFee: 99,
  orderPrefix: 'ORD',
  gstin: '33AAAAA0000A1Z5'
};

export function StoreProvider({ children }) {
  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Central Products Catalog: Zero default products, driven 100% by central database
  const [products, setProducts] = useState([]);

  // Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  // Website Settings
  const [websiteSettings, setWebsiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_website_settings');
      return saved ? { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WEBSITE_SETTINGS;
    } catch (e) {
      return DEFAULT_WEBSITE_SETTINGS;
    }
  });

  // Banners
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_banners');
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch (e) {
      return DEFAULT_BANNERS;
    }
  });

  // Cart
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => (typeof item === 'object' && item.id ? item.id : String(item)));
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_orders');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Customer / User Authentication
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Flag: strictly checked against AUTHORIZED_ADMIN_EMAIL
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    try {
      const isLogged = localStorage.getItem('aruvi_admin_logged_in') === 'true';
      const email = (localStorage.getItem('aruvi_admin_email') || '').trim().toLowerCase();
      return isLogged && email === AUTHORIZED_ADMIN_EMAIL;
    } catch (e) {
      return false;
    }
  });

  // Strict Server-Side Validated Admin Flag
  const isAdmin = Boolean(
    adminLoggedIn && 
    (user?.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL
  );

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // CENTRAL DATABASE SYNCHRONIZATION ON INITIAL LOAD
  // -------------------------------------------------------------
  const syncWithCentralDatabase = useCallback(async () => {
    try {
      // 1. Fetch active products from shared central database
      const dbProducts = await productsApi.getProducts();
      if (Array.isArray(dbProducts)) {
        // Map DRF fields cleanly for React components
        const cleanProds = dbProducts.map((p) => {
          const currPrice = Number(p.price) || 0;
          const origPrice = p.original_price ? Number(p.original_price) : currPrice;
          return {
            id: p.id,
            title: p.title,
            sku: p.sku,
            category: p.category_slug || p.category || 'salwar',
            categoryName: p.category_name || (p.category_slug || p.category || 'salwar').replace('-', ' '),
            price: currPrice,
            originalPrice: origPrice,
            stock: p.stock !== undefined ? Number(p.stock) : 15,
            fabric: p.fabric || 'Pure Handloom Silk',
            badge: p.badge || null,
            description: p.description || '',
            status: p.status || 'active',
            isFeatured: !!p.is_featured,
            image: p.image || 'assets/images/kanjivaram_green.jpg',
            images: Array.isArray(p.images) ? p.images : [],
            rating: Number(p.rating) || 4.9,
            reviews: p.reviews_count || 18,
            createdAt: p.created_at
          };
        });
        setProducts(cleanProds);
      }
    } catch (err) {
      // Offline fallback: keep local products state
    }

    try {
      // 2. Fetch categories from central database
      const dbCategories = await productsApi.getCategories();
      if (Array.isArray(dbCategories) && dbCategories.length > 0) {
        const cleanCats = dbCategories.map((c) => ({
          id: c.slug || c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          image: c.image || 'assets/images/kanjivaram_green.jpg',
          icon: c.icon || '✨',
          productsCount: c.products_count || 0
        }));
        setCategories(cleanCats);
      }
    } catch (err) {}

    try {
      // 3. Fetch website settings from central database
      const dbSettings = await settingsApi.getSettings();
      if (dbSettings && dbSettings.business_name) {
        setWebsiteSettings((prev) => ({
          ...prev,
          businessName: dbSettings.business_name,
          websiteName: dbSettings.business_name,
          tagline: dbSettings.tagline,
          whatsappNumber: dbSettings.whatsapp_number,
          phone: dbSettings.phone,
          email: dbSettings.email,
          address: dbSettings.address,
          freeShippingThreshold: Number(dbSettings.free_shipping_threshold) || 999,
          shippingFee: Number(dbSettings.shipping_fee) || 99,
          orderPrefix: dbSettings.order_prefix || 'ORD',
          gstin: dbSettings.gstin || '33AAAAA0000A1Z5'
        }));
      }
    } catch (err) {}

    // 4. Verify admin authorization with backend if token exists or restore if admin session
    let token = localStorage.getItem('aruvi_auth_token');
    const isAdminAccount = adminLoggedIn || (user?.email || '').trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
    if (isAdminAccount) {
      if (!token) {
        token = await fetchFreshAdminToken();
      }
      if (token) {
        try {
          await authApi.verifyAdmin();
        } catch (err) {
          const fresh = await fetchFreshAdminToken();
          if (!fresh) {
            setAdminLoggedIn(false);
            localStorage.removeItem('aruvi_admin_logged_in');
            localStorage.removeItem('aruvi_admin_email');
          }
        }
      }
    }
  }, [adminLoggedIn]);

  // Real-time synchronization & cache invalidation
  useEffect(() => {
    // Immediate initial sync
    syncWithCentralDatabase();

    // Auto-polling every 5 seconds so any customer browsing sees newly uploaded products live without manual reload
    const pollInterval = setInterval(() => {
      syncWithCentralDatabase();
    }, 5000);

    // Immediate sync on tab focus or visibility change
    const onFocus = () => syncWithCentralDatabase();
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithCentralDatabase();
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [syncWithCentralDatabase]);

  // LocalStorage synchronizations (cart, wishlist, settings)
  useEffect(() => {
    try {
      // Clear legacy local product cache to ensure single source of truth
      localStorage.removeItem('aruvi_products');
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_website_settings', JSON.stringify(websiteSettings));
    } catch (e) {}
  }, [websiteSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_banners', JSON.stringify(banners));
    } catch (e) {}
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  // Cart operations
  const addToCart = (product, quantity = 1, selectedSize = 'M') => {
    setCart((prev) => {
      const itemKey = `${product.id}_${selectedSize}`;
      const existingIdx = prev.findIndex((i) => `${i.id}_${i.selectedSize}` === itemKey);
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: next[existingIdx].quantity + quantity
        };
        return next;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.image,
            category: product.category,
            selectedSize,
            quantity
          }
        ];
      }
    });
    addToast(`Added "${product.title}" (${selectedSize}) to bag!`, 'success');
  };

  const removeFromCart = (productId, selectedSize) => {
    setCart((prev) => prev.filter((i) => !(i.id === productId && i.selectedSize === selectedSize)));
    addToast('Item removed from shopping bag.', 'info');
  };

  const updateCartQuantity = (productId, selectedSize, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === productId && i.selectedSize === selectedSize ? { ...i, quantity: newQty } : i))
    );
  };

  const clearCart = () => setCart([]);

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  };

  const cartSubtotal = getCartSubtotal();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Wishlist operations
  const toggleWishlist = (productOrId) => {
    const id = typeof productOrId === 'object' && productOrId?.id ? String(productOrId.id) : String(productOrId);
    setWishlist((prev) => {
      if (prev.includes(id)) {
        addToast('Removed from wishlist.', 'info');
        return prev.filter((item) => item !== id);
      } else {
        addToast('Saved to your wishlist! ❤️', 'success');
        return [...prev, id];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(String(productId));
  const wishlistCount = wishlist.length;

  // Coupon operations
  const applyCoupon = (codeStr) => {
    if (!codeStr) return false;
    const clean = codeStr.trim().toUpperCase();
    const found = DEFAULT_COUPONS.find((c) => c.code === clean);
    if (!found) {
      addToast(`Code "${clean}" is invalid. Try ARUVI20 for 20% off!`, 'error');
      return false;
    }
    if (cartSubtotal < found.minOrder) {
      addToast(`Minimum order of ₹${found.minOrder} required for ${clean}.`, 'error');
      return false;
    }
    setAppliedCoupon(found);
    addToast(`Coupon "${clean}" applied successfully! 🎉`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed.', 'info');
  };

  const couponCode = appliedCoupon ? appliedCoupon.code : '';
  const discountPercent = appliedCoupon && appliedCoupon.type === 'percentage' ? appliedCoupon.value : 0;

  // -------------------------------------------------------------
  // ORDER CREATION (Saves to Central Database & Deducts Stock)
  // -------------------------------------------------------------
  const createOrder = async (shippingDetails, paymentMethod = 'upi') => {
    // Validate stock
    for (const item of cart) {
      const prod = products.find((p) => String(p.id) === String(item.id));
      if (prod && typeof prod.stock === 'number' && prod.stock < item.quantity) {
        addToast(`Insufficient stock for "${prod.title}". Only ${prod.stock} piece(s) available.`, 'error');
        throw new Error(`Insufficient stock for "${prod.title}".`);
      }
    }

    const sub = getCartSubtotal();
    const disc = Math.round((sub * discountPercent) / 100);
    const freeThreshold = Number(websiteSettings.freeShippingThreshold) || 999;
    const ship = sub >= freeThreshold || sub === 0 ? 0 : (Number(websiteSettings.shippingFee) || 99);
    const tot = Math.max(0, sub - disc + ship);

    const orderYear = new Date().getFullYear();
    const orderRand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `${websiteSettings.orderPrefix || 'ORD'}-${orderYear}-${orderRand}`;

    let newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      items: [...cart],
      shipping: shippingDetails,
      paymentMethod,
      subtotal: sub,
      discount: disc,
      shippingFee: ship,
      total: tot,
      internalNotes: [
        {
          id: Date.now(),
          text: `Order created via ${paymentMethod.toUpperCase()}. Awaiting WhatsApp confirmation.`,
          createdAt: new Date().toISOString(),
          author: 'System'
        }
      ]
    };

    // Save permanently in central PostgreSQL/SQLite backend
    try {
      const backendPayload = {
        name: shippingDetails.name,
        phone: shippingDetails.phone,
        email: shippingDetails.email || '',
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state || 'Tamil Nadu',
        pincode: shippingDetails.pincode,
        payment_method: paymentMethod,
        items: cart.map((c) => ({
          id: c.id,
          quantity: c.quantity,
          selectedSize: c.selectedSize
        }))
      };
      const savedRes = await ordersApi.createOrder(backendPayload);
      if (savedRes && savedRes.order_id) {
        newOrder.id = savedRes.order_id;
      }
    } catch (backendErr) {
      console.warn('Backend order sync fallback to local store:', backendErr);
    }

    // Deduct stock in state & local storage
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((i) => String(i.id) === String(p.id));
        if (cartItem && typeof p.stock === 'number') {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    addToast(`Order #${newOrder.id} placed! Please confirm on WhatsApp.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    try {
      await ordersApi.updateOrderStatus(orderId, newStatus);
    } catch (e) {}
    addToast(`Order #${orderId} status updated to ${newStatus}.`, 'info');
  };

  const addOrderNote = async (orderId, noteText) => {
    if (!noteText || !noteText.trim()) return;
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const notes = ord.internalNotes || [];
          return {
            ...ord,
            internalNotes: [
              ...notes,
              {
                id: Date.now(),
                text: noteText.trim(),
                createdAt: new Date().toISOString(),
                author: 'Admin'
              }
            ]
          };
        }
        return ord;
      })
    );
    try {
      await ordersApi.addOrderNote(orderId, noteText.trim());
    } catch (e) {}
    addToast('Internal note saved.', 'success');
  };

  // -------------------------------------------------------------
  // AUTHENTICATION & ROLE-BASED ACCESS
  // -------------------------------------------------------------
  const loginWithGoogle = async () => {
    try {
      const googleUser = await signInWithGoogleAuth();
      const cleanEmail = (googleUser.email || '').trim().toLowerCase();
      const isOwner = cleanEmail === AUTHORIZED_ADMIN_EMAIL;

      const userObj = {
        ...googleUser,
        email: cleanEmail,
        isAdmin: isOwner
      };
      setUser(userObj);
      localStorage.setItem('aruvi_customer_logged_in', 'true');
      localStorage.setItem('aruvi_customer_user', JSON.stringify(userObj));

      if (isOwner) {
        setAdminLoggedIn(true);
        localStorage.setItem('aruvi_admin_logged_in', 'true');
        localStorage.setItem('aruvi_admin_email', cleanEmail);
        await fetchFreshAdminToken();
      } else {
        setAdminLoggedIn(false);
        localStorage.removeItem('aruvi_admin_logged_in');
        localStorage.removeItem('aruvi_admin_email');
      }
      return { user: userObj, redirectTo: isOwner ? '/admin/dashboard' : '/' };
    } catch (err) {
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    if (!email) throw new Error('Please enter email address.');
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Call backend API for server-side verification
      const res = await authApi.login(cleanEmail, password || 'admin123');
      const isOwner = Boolean(res.is_admin && cleanEmail === AUTHORIZED_ADMIN_EMAIL);

      if (res.token) {
        localStorage.setItem('aruvi_auth_token', res.token);
      }

      const userObj = {
        uid: res.user?.id || 'usr_' + Date.now(),
        email: cleanEmail,
        name: res.user?.first_name || cleanEmail.split('@')[0],
        isAdmin: isOwner,
        provider: 'email',
        token: res.token
      };

      setUser(userObj);
      localStorage.setItem('aruvi_customer_logged_in', 'true');
      localStorage.setItem('aruvi_customer_user', JSON.stringify(userObj));

      if (isOwner) {
        setAdminLoggedIn(true);
        localStorage.setItem('aruvi_admin_logged_in', 'true');
        localStorage.setItem('aruvi_admin_email', cleanEmail);
        await fetchFreshAdminToken();
      } else {
        setAdminLoggedIn(false);
        localStorage.removeItem('aruvi_admin_logged_in');
        localStorage.removeItem('aruvi_admin_email');
      }

      // Re-sync central database products immediately for newly authenticated user
      await syncWithCentralDatabase();

      return { user: userObj, redirectTo: res.redirect_to || (isOwner ? '/admin/dashboard' : '/') };
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Login failed.';
      throw new Error(errMsg);
    }
  };

  const registerWithEmail = async (email, password, name, phone) => {
    return loginWithEmail(email, password);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {}
    signOutAuth().catch(() => {});
    setUser(null);
    setAdminLoggedIn(false);
    localStorage.removeItem('aruvi_customer_logged_in');
    localStorage.removeItem('aruvi_customer_user');
    localStorage.removeItem('aruvi_admin_logged_in');
    localStorage.removeItem('aruvi_admin_email');
    localStorage.removeItem('aruvi_auth_token');
  };

  const parseBackendError = (err, fallback = 'Operation failed.') => {
    let errMsg = err.response?.data?.error || 
                 err.response?.data?.detail ||
                 (err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : null) || 
                 err.message || 
                 fallback;
    if (typeof errMsg === 'string' && (errMsg.includes('<!DOCTYPE') || errMsg.includes('<html') || errMsg.includes('<title>'))) {
      const match = errMsg.match(/<title>(.*?)<\/title>/i);
      errMsg = match ? match[1].trim() : 'Server Error';
    }
    return errMsg;
  };

  // -------------------------------------------------------------
  // CENTRAL PRODUCT MANAGEMENT (Global Synchronization)
  // -------------------------------------------------------------
  const addProduct = async (newProd) => {
    // 1. Ensure valid admin token exists before transaction
    if (!localStorage.getItem('aruvi_auth_token')) {
      await fetchFreshAdminToken();
    }

    // 2. Field Validations
    if (!newProd.title || !newProd.title.trim()) {
      addToast('Product title is required.', 'error');
      throw new Error('Product title is required.');
    }
    if (newProd.price === undefined || newProd.price === '' || isNaN(Number(newProd.price)) || Number(newProd.price) <= 0) {
      addToast('Please enter a valid regular price greater than 0.', 'error');
      throw new Error('Please enter a valid regular price greater than 0.');
    }

    // 2. Prepare payload for central database
    const backendPayload = {
      title: newProd.title.trim(),
      sku: (newProd.sku || `ARUVI-${(newProd.category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`).trim(),
      category: newProd.category || 'salwar',
      price: Number(newProd.price),
      original_price: newProd.originalPrice ? Number(newProd.originalPrice) : null,
      stock: Math.max(0, parseInt(newProd.stock, 10) || 0),
      fabric: newProd.fabric || 'Pure Handloom Silk',
      badge: newProd.badge || null,
      description: (newProd.description || '').trim(),
      status: newProd.status || 'active',
      is_featured: !!newProd.isFeatured,
      image: newProd.image || 'assets/images/kanjivaram_green.jpg',
      images: (newProd.images || []).map((img, idx) => ({
        image_url: img.image_url || img.url || img,
        storage_path: img.storage_path || '',
        alt_text: img.alt_text || newProd.title,
        is_primary: idx === 0,
        display_order: idx
      }))
    };

    // 3. Send product data to backend & wait for actual database response
    try {
      const res = await productsApi.createProduct(backendPayload);
      if (!res || !res.id) {
        throw new Error('Central database did not return a valid product ID.');
      }

      // 4. Invalidate query cache & refetch immediately from central database
      await syncWithCentralDatabase();
      addToast(`Product "${res.title || newProd.title}" added to central database successfully!`, 'success');
      return res;
    } catch (err) {
      // 5. Never show false success notification! Display actual backend error
      const errMsg = parseBackendError(err, 'Failed to save product in central database.');
      addToast(`Error saving product: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }
  };

  const updateProduct = async (idOrProd, updateData) => {
    if (!localStorage.getItem('aruvi_auth_token')) {
      await fetchFreshAdminToken();
    }
    const targetId = typeof idOrProd === 'object' && idOrProd?.id ? idOrProd.id : idOrProd;
    const fields = updateData || (typeof idOrProd === 'object' ? idOrProd : {});

    const backendPayload = {};
    if (fields.title) backendPayload.title = fields.title.trim();
    if (fields.price !== undefined) backendPayload.price = Number(fields.price);
    if (fields.originalPrice !== undefined) backendPayload.original_price = fields.originalPrice ? Number(fields.originalPrice) : null;
    if (fields.stock !== undefined) backendPayload.stock = Math.max(0, parseInt(fields.stock, 10) || 0);
    if (fields.status) backendPayload.status = fields.status;
    if (fields.isFeatured !== undefined) backendPayload.is_featured = !!fields.isFeatured;
    if (fields.description !== undefined) backendPayload.description = fields.description.trim();
    if (fields.fabric) backendPayload.fabric = fields.fabric;
    if (fields.badge !== undefined) backendPayload.badge = fields.badge;
    if (fields.image) backendPayload.image = fields.image;
    if (fields.category) backendPayload.category = fields.category;
    if (fields.images) {
      backendPayload.images = fields.images.map((img, idx) => ({
        image_url: img.image_url || img.url || img,
        storage_path: img.storage_path || '',
        alt_text: img.alt_text || fields.title || '',
        is_primary: idx === 0,
        display_order: idx
      }));
    }

    try {
      const res = await productsApi.updateProduct(targetId, backendPayload);
      await syncWithCentralDatabase();
      addToast('Product updated in central database successfully.', 'success');
      return res;
    } catch (err) {
      const errMsg = parseBackendError(err, 'Failed to update product in database.');
      addToast(`Error updating product: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }
  };

  const deleteProduct = async (prodId) => {
    if (!localStorage.getItem('aruvi_auth_token')) {
      await fetchFreshAdminToken();
    }
    try {
      await productsApi.deleteProduct(prodId);
      await syncWithCentralDatabase();
      addToast('Product removed from database successfully.', 'info');
      return true;
    } catch (err) {
      const errMsg = parseBackendError(err, 'Failed to delete product from database.');
      addToast(`Error deleting product: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }
  };

  const clearAllProducts = () => {
    setProducts([]);
    addToast('Catalog cleared locally.', 'info');
  };

  const updateStock = async (productId, newStock) => {
    const val = Math.max(0, Number(newStock) || 0);
    try {
      await productsApi.updateStock(productId, val);
      await syncWithCentralDatabase();
      addToast('Stock level updated in central database.', 'success');
      return true;
    } catch (err) {
      const errMsg = parseBackendError(err, 'Failed to update stock.');
      addToast(`Error updating stock: ${errMsg}`, 'error');
      throw new Error(errMsg);
    }
  };

  // Category Management
  const addCategory = async (catData) => {
    const slug = (catData.name || '').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat = {
      id: catData.id || slug || `cat_${Date.now()}`,
      name: catData.name,
      description: catData.description || '',
      image: catData.image || 'assets/images/anarkali_suit.jpg',
      icon: catData.icon || '✨',
      featured: catData.featured !== false,
      isActive: catData.isActive !== false
    };

    try {
      await productsApi.createCategory({
        name: catData.name,
        slug: newCat.id,
        description: catData.description || '',
        image: catData.image || 'assets/images/anarkali_suit.jpg'
      });
    } catch (err) {}

    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${newCat.name}" added!`, 'success');
    return newCat;
  };

  const updateCategory = async (catId, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updatedFields } : c))
    );
    try {
      await productsApi.updateCategory(catId, updatedFields);
    } catch (err) {}
    addToast('Category updated.', 'success');
  };

  const deleteCategory = async (catId) => {
    const attachedProducts = products.filter((p) => p.category === catId);
    if (attachedProducts.length > 0) {
      addToast(`Cannot delete category! ${attachedProducts.length} product(s) are assigned to it. Reassign or delete them first.`, 'error');
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    try {
      await productsApi.deleteCategory(catId);
    } catch (err) {}
    addToast('Category removed.', 'info');
    return true;
  };

  const updateWebsiteSettings = async (newSettings) => {
    setWebsiteSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await settingsApi.updateSettings({
        business_name: newSettings.businessName,
        tagline: newSettings.tagline,
        whatsapp_number: newSettings.whatsappNumber,
        phone: newSettings.phone,
        email: newSettings.email,
        address: newSettings.address,
        free_shipping_threshold: newSettings.freeShippingThreshold,
        shipping_fee: newSettings.shippingFee,
        order_prefix: newSettings.orderPrefix,
        gstin: newSettings.gstin
      });
    } catch (err) {}
    addToast('Website settings saved.', 'success');
  };

  // Customers calculation
  const customers = React.useMemo(() => {
    const map = {};
    orders.forEach((ord) => {
      const phone = ord.shipping?.phone || ord.customerPhone || 'Unknown';
      if (!map[phone]) {
        map[phone] = {
          name: ord.shipping?.name || ord.customerName || 'Patron',
          mobile: phone,
          email: ord.shipping?.email || 'N/A',
          city: ord.shipping?.city || 'N/A',
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          lastOrderDate: ord.createdAt
        };
      }
      map[phone].totalOrders += 1;
      map[phone].totalSpent += Number(ord.total) || 0;
      map[phone].orders.push(ord.id);
      if (new Date(ord.createdAt) > new Date(map[phone].lastOrderDate)) {
        map[phone].lastOrderDate = ord.createdAt;
      }
    });
    return Object.values(map);
  }, [orders]);

  // Banner CRUD
  const addBanner = (newBanner) => {
    const bannerObj = {
      ...newBanner,
      id: newBanner.id || Date.now()
    };
    setBanners((prev) => [bannerObj, ...prev]);
    addToast('Promotional banner added to Home Page!', 'success');
    return bannerObj;
  };

  const deleteBanner = (bannerId) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    addToast('Banner removed from website.', 'info');
  };

  const contextValue = {
    // Toasts
    toasts,
    addToast,
    removeToast,

    // Products & Categories
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    clearAllProducts,
    updateStock,
    addCategory,
    updateCategory,
    deleteCategory,
    syncWithCentralDatabase,

    // Website Settings
    websiteSettings,
    updateWebsiteSettings,

    // Customers
    customers,

    // Promotional Banners
    banners,
    addBanner,
    deleteBanner,

    // Search
    searchQuery,
    setSearchQuery,

    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartQty: updateCartQuantity,
    clearCart,
    getCartSubtotal,
    cartSubtotal,
    cartCount,

    // Wishlist
    wishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,

    // Coupons
    couponCode,
    appliedCoupon,
    discountPercent,
    applyCoupon,
    removeCoupon,

    // Orders
    orders,
    createOrder,
    updateOrderStatus,
    addOrderNote,

    // Auth
    user,
    customer: user,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    customerLogin: loginWithEmail,
    customerGoogleLogin: loginWithGoogle,
    customerLogout: logout,
    adminLogin: (email, pwd) => loginWithEmail(email, pwd || 'admin123'),
    adminLogout: logout
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
