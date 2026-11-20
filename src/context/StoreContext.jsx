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
  { id: 'jeans-pants', name: 'Jeans (Baggy Pants / Straight Pants / Pallazzo Pants)', icon: '👖', description: 'High-waisted Jeans, Baggy Pants, Straight Cuts & Palazzo Trousers', featured: true, image: 'assets/images/hero_saree_model.jpg' },
  { id: 'kids-wear', name: 'Kids Wear', icon: '👶', description: 'Designer Kids Festive Outfits, Frocks & Traditional Sets', featured: true, image: 'assets/images/cotton_saree.jpg' }
];

export const DEFAULT_HERO = {
  badge: 'BOUTIQUE COUTURE & FESTIVE COLLECTION • 2026',
  title: 'Tradition In Every Thread.',
  subtitle: 'Discover designer Salwar, Sharara, flowing Maxi’s, fusion Co-ordsets, Western wear, and kids couture curated for every celebration.',
  discountTag: 'FLAT 20% OFF FESTIVE LAUNCH',
  ctaText: 'Explore Collections',
  ctaLink: '/shop?category=salwar',
  image: 'assets/images/anarkali_suit.jpg'
};

export const DEFAULT_COUPONS = [
  { code: 'ARUVI20', type: 'percentage', value: 20, minOrder: 999, active: true },
  { code: 'FESTIVE10', type: 'percentage', value: 10, minOrder: 499, active: true },
  { code: 'BRIDAL500', type: 'flat', value: 500, minOrder: 4999, active: true },
  { code: 'WELCOME100', type: 'flat', value: 100, minOrder: 999, active: true }
];

export function StoreProvider({ children }) {
  // Products
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_products');
      return saved ? JSON.parse(saved) : [];
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
      return saved ? JSON.parse(saved) : [];
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

  // Customer Auth
  const [customer, setCustomer] = useState(() => {
    try {
      const logged = localStorage.getItem('aruvi_customer_logged_in') === 'true';
      const user = localStorage.getItem('aruvi_customer_user');
      return logged && user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  });

  // Admin Auth
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => {
    try {
      const logged = localStorage.getItem('aruvi_admin_logged_in') === 'true';
      const email = localStorage.getItem('aruvi_admin_email') || '';
      return logged && email.toLowerCase() === 'aruvicollections.25@gmail.com';
    } catch (e) {
      return false;
    }
  });

  // Hero Banner & Settings
  const [heroBanner, setHeroBanner] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_hero_banner');
      return saved ? JSON.parse(saved) : DEFAULT_HERO;
    } catch (e) {
      return DEFAULT_HERO;
    }
  });

  // Active Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Sync state to LocalStorage
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

  // Product Actions
  const addProduct = (newProd) => {
    const prod = {
      ...newProd,
      id: newProd.id || 'p_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setProducts((prev) => [prod, ...prev]);
    return prod;
  };

  const updateProduct = (updatedProd) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? { ...p, ...updatedProd } : p))
    );
  };

  const deleteProduct = (prodId) => {
    setProducts((prev) => prev.filter((p) => p.id !== prodId));
  };

  // Cart Actions
  const addToCart = (product, selectedSize = 'Free Size', quantity = 1) => {
    setCart((prev) => {
      const itemKey = `${product.id}_${selectedSize}`;
      const existing = prev.find((item) => `${item.id}_${item.selectedSize}` === itemKey);
      if (existing) {
        return prev.map((item) =>
          `${item.id}_${item.selectedSize}` === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, selectedSize, quantity }];
    });
  };

  const removeFromCart = (productId, selectedSize) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === productId && item.selectedSize === selectedSize))
    );
  };

  const updateCartQty = (productId, selectedSize, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === selectedSize
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const cartCount = cart.reduce((count, item) => count + (item.quantity || 1), 0);

  // Wishlist Actions
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);
  const wishlistCount = wishlist.length;

  // Coupon Actions
  const applyCoupon = (codeStr) => {
    if (!codeStr) return { success: false, message: 'Please enter a coupon code' };
    const clean = codeStr.trim().toUpperCase();
    const found = DEFAULT_COUPONS.find((c) => c.code === clean && c.active);
    if (!found) {
      return { success: false, message: `Invalid code "${clean}". Try ARUVI20 for 20% off!` };
    }
    if (cartSubtotal < found.minOrder) {
      return { success: false, message: `Minimum order value for ${clean} is ₹${found.minOrder}.` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${clean} applied successfully! ✨` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + (cart.length > 0 ? shippingFee : 0));

  // Orders
  const createOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: 'ARUVI-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      shipping: shippingFee,
      total: finalTotal
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    return newOrder;
  };

  // Customer Authentication
  const customerLogin = (email, password) => {
    if (!email || !password) return { success: false, message: 'Please provide email and password.' };
    const cleanEmail = email.trim().toLowerCase();
    const name = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const user = { uid: 'usr_' + Date.now(), name, email: cleanEmail, provider: 'password' };
    
    setCustomer(user);
    localStorage.setItem('aruvi_customer_logged_in', 'true');
    localStorage.setItem('aruvi_customer_user', JSON.stringify(user));

    // If owner admin email
    if (cleanEmail === 'aruvicollections.25@gmail.com') {
      adminLogin('aruvicollections.25@gmail.com');
    }
    return { success: true, user };
  };

  const customerGoogleLogin = async () => {
    try {
      const googleUser = await signInWithGoogleAuth();
      setCustomer(googleUser);
      localStorage.setItem('aruvi_customer_logged_in', 'true');
      localStorage.setItem('aruvi_customer_user', JSON.stringify(googleUser));

      if (googleUser.email === 'aruvicollections.25@gmail.com') {
        adminGoogleLogin(googleUser);
      }
      return { success: true, user: googleUser };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const customerLogout = () => {
    setCustomer(null);
    localStorage.removeItem('aruvi_customer_logged_in');
    localStorage.removeItem('aruvi_customer_user');
    signOutAuth();
  };

  // Admin Authentication
  const adminLogin = (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'aruvicollections.25@gmail.com') {
      setAdminLoggedIn(true);
      localStorage.setItem('aruvi_admin_logged_in', 'true');
      localStorage.setItem('aruvi_admin_email', cleanEmail);
      return { success: true };
    }
    return { success: false, message: 'Access Denied: Only aruvicollections.25@gmail.com is authorized.' };
  };

  const adminGoogleLogin = async (preExistingUser) => {
    try {
      const user = preExistingUser || (await signInWithGoogleAuth());
      if (user.email === 'aruvicollections.25@gmail.com') {
        setAdminLoggedIn(true);
        localStorage.setItem('aruvi_admin_logged_in', 'true');
        localStorage.setItem('aruvi_admin_email', user.email);
        localStorage.setItem('aruvi_admin_auth_provider', 'google.com');
        return { success: true, user };
      }
      return { success: false, message: `Access Denied: ${user.email} is not authorized. Only aruvicollections.25@gmail.com has Administrator privileges.` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const adminLogout = () => {
    setAdminLoggedIn(false);
    localStorage.removeItem('aruvi_admin_logged_in');
    localStorage.removeItem('aruvi_admin_email');
    localStorage.removeItem('aruvi_admin_auth_provider');
    signOutAuth();
  };

  const value = {
    // Catalog
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    heroBanner,
    setHeroBanner,

    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    cartCount,

    // Wishlist
    wishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,

    // Coupons
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    shippingFee,
    finalTotal,

    // Orders
    orders,
    createOrder,

    // Customer Auth
    customer,
    customerLogin,
    customerGoogleLogin,
    customerLogout,

    // Admin Auth
    adminLoggedIn,
    adminLogin,
    adminGoogleLogin,
    adminLogout,
    isAdmin: adminLoggedIn || (customer?.email?.toLowerCase() === 'aruvicollections.25@gmail.com')
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
