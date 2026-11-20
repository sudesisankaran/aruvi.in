import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithGoogleAuth, signOutAuth } from '../services/firebase';

const StoreContext = createContext(null);

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
  tagline: 'Tradition In Every Thread',
  logo: 'assets/icons/WhatsApp Image 2026-09-21 at 7.49.20 AM (1).jpeg',
  businessAddress: '104, Heritage Weavers Lane, T. Nagar, Chennai, Tamil Nadu - 600017',
  contactNumber: '+91 98765 43210',
  whatsappNumber: '919876543210',
  emailAddress: 'aruvicollections.25@gmail.com',
  currency: 'INR (₹)',
  currencySymbol: '₹',
  freeShippingThreshold: 999,
  shippingFee: 99,
  taxRatePercent: 0,
  orderPrefix: 'ORD',
  instagram: 'https://instagram.com/aruvicollections',
  facebook: 'https://facebook.com/aruvicollections'
};

export function StoreProvider({ children }) {
  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Products: Clean slate (starts with 0 products until uploaded by admin)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out demo products starting with prod_
          const realOnly = parsed.filter(p => !String(p.id).startsWith('prod_'));
          if (realOnly.length !== parsed.length) {
            localStorage.setItem('aruvi_products', JSON.stringify(realOnly));
          }
          return realOnly;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Categories
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });

  // Promotional Banners (Synced with Admin Dashboard)
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_banners');
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch (e) {
      return DEFAULT_BANNERS;
    }
  });

  // Website Settings (Synced with Admin Dashboard)
  const [websiteSettings, setWebsiteSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_settings');
      return saved ? { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_WEBSITE_SETTINGS;
    } catch (e) {
      return DEFAULT_WEBSITE_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_settings', JSON.stringify(websiteSettings));
    } catch (e) {}
  }, [websiteSettings]);

  const updateWebsiteSettings = (newSettings) => {
    setWebsiteSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('aruvi_settings', JSON.stringify(updated));
      } catch (e) {}
      addToast('Website settings updated successfully!', 'success');
      return updated;
    });
  };

  // Cart: Array of { id, title, price, image, category, selectedSize, quantity }
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Wishlist: Array of product IDs (strings)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // ensure array of string IDs
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

  // Admin Flag
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    try {
      const isLogged = localStorage.getItem('aruvi_admin_logged_in') === 'true';
      const email = localStorage.getItem('aruvi_admin_email') || '';
      return isLogged && email.toLowerCase() === 'aruvicollections.25@gmail.com';
    } catch (e) {
      return false;
    }
  });

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Global search term
  const [searchQuery, setSearchQuery] = useState('');

  // LocalStorage synchronizations
  useEffect(() => {
    try {
      localStorage.setItem('aruvi_products', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('aruvi_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

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

  // Wishlist operations (stores ID strings)
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

  // Order creation (Initial state is Pending, validates & updates stock)
  const createOrder = (shippingDetails, paymentMethod = 'upi') => {
    // Validate stock for items in cart
    for (const item of cart) {
      const prod = products.find((p) => String(p.id) === String(item.id));
      if (prod && typeof prod.stock === 'number' && prod.stock < item.quantity) {
        addToast(`Insufficient stock for "${prod.title}". Only ${prod.stock} piece(s) available.`, 'error');
        throw new Error(`Insufficient stock for "${prod.title}".`);
      }
    }

    // Deduct stock for confirmed order creation
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((i) => String(i.id) === String(p.id));
        if (cartItem && typeof p.stock === 'number') {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      })
    );

    const sub = getCartSubtotal();
    const disc = Math.round((sub * discountPercent) / 100);
    const freeThreshold = Number(websiteSettings.freeShippingThreshold) || 999;
    const ship = sub >= freeThreshold || sub === 0 ? 0 : (Number(websiteSettings.shippingFee) || 99);
    const tot = Math.max(0, sub - disc + ship);

    const orderYear = new Date().getFullYear();
    const orderRand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `${websiteSettings.orderPrefix || 'ORD'}-${orderYear}-${orderRand}`;

    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'Pending', // Initially remains Pending until admin confirms
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

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    addToast(`Order #${newOrder.id} placed! Please confirm on WhatsApp.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    addToast(`Order #${orderId} status updated to ${newStatus}.`, 'info');
  };

  const addOrderNote = (orderId, noteText) => {
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
    addToast('Internal note saved.', 'success');
  };

  // Auth Operations
  const loginWithGoogle = async () => {
    try {
      const googleUser = await signInWithGoogleAuth();
      const isOwner = googleUser.email?.toLowerCase() === 'aruvicollections.25@gmail.com';
      const userObj = {
        ...googleUser,
        isAdmin: isOwner
      };
      setUser(userObj);
      localStorage.setItem('aruvi_customer_logged_in', 'true');
      localStorage.setItem('aruvi_customer_user', JSON.stringify(userObj));

      if (isOwner) {
        setAdminLoggedIn(true);
        localStorage.setItem('aruvi_admin_logged_in', 'true');
        localStorage.setItem('aruvi_admin_email', googleUser.email.toLowerCase());
      }
      return userObj;
    } catch (err) {
      throw err;
    }
  };

  const loginWithEmail = (email, password) => {
    if (!email) throw new Error('Please enter email address.');
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === 'aruvicollections.25@gmail.com';
    const name = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const userObj = {
      uid: 'usr_' + Date.now(),
      email: cleanEmail,
      name,
      isAdmin: isOwner,
      provider: 'email'
    };

    setUser(userObj);
    localStorage.setItem('aruvi_customer_logged_in', 'true');
    localStorage.setItem('aruvi_customer_user', JSON.stringify(userObj));

    if (isOwner) {
      setAdminLoggedIn(true);
      localStorage.setItem('aruvi_admin_logged_in', 'true');
      localStorage.setItem('aruvi_admin_email', cleanEmail);
    }
    return userObj;
  };

  const registerWithEmail = (email, password, name, phone) => {
    if (!email) throw new Error('Please enter email address.');
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === 'aruvicollections.25@gmail.com';

    const userObj = {
      uid: 'usr_' + Date.now(),
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      phone: phone || '',
      isAdmin: isOwner,
      provider: 'email'
    };

    setUser(userObj);
    localStorage.setItem('aruvi_customer_logged_in', 'true');
    localStorage.setItem('aruvi_customer_user', JSON.stringify(userObj));

    if (isOwner) {
      setAdminLoggedIn(true);
      localStorage.setItem('aruvi_admin_logged_in', 'true');
      localStorage.setItem('aruvi_admin_email', cleanEmail);
    }
    return userObj;
  };

  const logout = () => {
    signOutAuth().catch(() => {});
    setUser(null);
    setAdminLoggedIn(false);
    localStorage.removeItem('aruvi_customer_logged_in');
    localStorage.removeItem('aruvi_customer_user');
    localStorage.removeItem('aruvi_admin_logged_in');
    localStorage.removeItem('aruvi_admin_email');
  };

  // Product CRUD (Admin)
  const addProduct = (newProd) => {
    const prod = {
      ...newProd,
      id: newProd.id || 'p_' + Date.now(),
      sku: newProd.sku || `ARUVI-${(newProd.category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      rating: newProd.rating || 4.9,
      reviews: newProd.reviews || 1,
      stock: typeof newProd.stock === 'number' ? newProd.stock : (Number(newProd.stockQuantity) || 15),
      status: newProd.status || 'active',
      isFeatured: !!newProd.isFeatured,
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [prod, ...prev]);
    addToast(`Added "${prod.title}" to catalog!`, 'success');
    return prod;
  };

  const updateProduct = (idOrProd, updateData) => {
    const targetId = typeof idOrProd === 'object' && idOrProd?.id ? idOrProd.id : idOrProd;
    const fields = updateData || (typeof idOrProd === 'object' ? idOrProd : {});
    setProducts((prev) =>
      prev.map((p) => (p.id === targetId ? { ...p, ...fields } : p))
    );
    addToast('Product updated successfully.', 'success');
  };

  const deleteProduct = (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    addToast('Product removed from catalog.', 'info');
  };

  const clearAllProducts = () => {
    setProducts([]);
    try {
      localStorage.setItem('aruvi_products', JSON.stringify([]));
    } catch (e) {}
    addToast('All products removed from catalog.', 'info');
  };

  // Stock / Inventory Management
  const updateStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, Number(newStock) || 0) } : p))
    );
    addToast('Stock level updated.', 'success');
  };

  // Category Management
  const addCategory = (catData) => {
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
    setCategories((prev) => [...prev, newCat]);
    addToast(`Category "${newCat.name}" added!`, 'success');
    return newCat;
  };

  const updateCategory = (catId, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...updatedFields } : c))
    );
    addToast('Category updated.', 'success');
  };

  const deleteCategory = (catId) => {
    const attachedProducts = products.filter((p) => p.category === catId);
    if (attachedProducts.length > 0) {
      addToast(`Cannot delete category! ${attachedProducts.length} product(s) are assigned to it. Reassign or delete them first.`, 'error');
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    addToast('Category removed.', 'info');
    return true;
  };

  // Customers calculation (Derived from orders & profile users)
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

  // Banner CRUD (Admin)
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

  // True if logged in as aruvicollections.25@gmail.com
  const isAdmin = adminLoggedIn || user?.email?.toLowerCase() === 'aruvicollections.25@gmail.com';

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

    // Website Settings & Configurations
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
    adminLogin: (email) => loginWithEmail(email, 'admin'),
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
