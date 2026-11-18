/**
 * ARUVI COLLECTIONS - CENTRAL STORE DATA LAYER
 * Single source of truth for Products, Orders, Categories, Coupons, Banners & Settings.
 * Shared seamlessly across Storefront and Admin Dashboard via localStorage.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AruviStore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Storage Keys
  const STORAGE_KEYS = {
    PRODUCTS: 'aruvi_products',
    ORDERS: 'aruvi_orders',
    CATEGORIES: 'aruvi_categories',
    COUPONS: 'aruvi_coupons',
    ANNOUNCEMENT: 'aruvi_announcement',
    HERO: 'aruvi_hero',
    SETTINGS: 'aruvi_settings',
    CUSTOMERS: 'aruvi_customers',
    AUTH: 'aruvi_admin_auth'
  };

  // Schema Version for 7 exclusive collections & Admin Control
  const SCHEMA_VERSION_KEY = 'aruvi_schema_version';
  const CURRENT_SCHEMA_VERSION = 'v5_clean_zero_demo_data';

  // Master Initial Products - STRICTLY START EMPTY AS REQUESTED
  // Admin has complete control to add, edit, and delete products across the website
  const DEFAULT_PRODUCTS = [];

  // ONLY 7 EXCLUSIVE CATEGORIES
  const DEFAULT_CATEGORIES = [
    { id: 'sarees', name: 'Sarees', icon: '🥻', description: 'Pure Kanjivaram, Banarasi & Handloom Silk Sarees', featured: true, image: 'assets/images/kanjivaram_green.jpg' },
    { id: 'salwar', name: 'Salwar', icon: '👗', description: 'Designer Salwar Suits & Festive Kurta Sets', featured: true, image: 'assets/images/anarkali_suit.jpg' },
    { id: 'sharara', name: 'Sharara', icon: '✨', description: 'Royal Flared Sharara Sets & Peplum Kurta Ensembles', featured: true, image: 'assets/images/lehenga_set.jpg' },
    { id: 'ethnic-wears', name: 'Ethnic Wears', icon: '🪡', description: 'Traditional Handcrafted Ethnic Outfits & Drapes', featured: true, image: 'assets/images/festive_promo.jpg' },
    { id: 'co-ord-sets', name: 'Co-ord Sets', icon: '👚', description: 'Contemporary Fusion Matching Two-Piece Co-ord Sets', featured: true, image: 'assets/images/printed_georgette.jpg' },
    { id: 'western-tops', name: 'Western Tops', icon: '🧥', description: 'Chic Designer Western Tops & Peplum Blouses', featured: true, image: 'assets/images/premium_fabrics.jpg' },
    { id: 'kids', name: 'Kids', icon: '👶', description: 'Pure Pattu Pavadai, Festive Kurta Sets & Kids Ethnic Wear', featured: true, image: 'assets/images/cotton_saree.jpg' }
  ];

  // Initial Seed Orders
  const DEFAULT_ORDERS = [];

  // Initial Seed Coupons
  const DEFAULT_COUPONS = [
    { code: 'ARUVI20', type: 'percentage', value: 20, minOrder: 999, active: true, expiry: '2026-12-31', usageCount: 142 },
    { code: 'FESTIVE10', type: 'percentage', value: 10, minOrder: 499, active: true, expiry: '2026-11-30', usageCount: 68 },
    { code: 'BRIDAL500', type: 'flat', value: 500, minOrder: 4999, active: true, expiry: '2026-12-31', usageCount: 29 },
    { code: 'WELCOME100', type: 'flat', value: 100, minOrder: 999, active: true, expiry: '2027-01-01', usageCount: 184 }
  ];

  // Initial Seed Announcement Bar
  const DEFAULT_ANNOUNCEMENT = {
    enabled: true,
    tag: 'Festive Sale',
    text: '✨ Use code ARUVI20 for Extra 20% Off + Free Shipping on orders above ₹999 ✨',
    linkText: 'Track Order',
    linkUrl: 'account.html#orders'
  };

  // Initial Seed Hero Banner
  const DEFAULT_HERO = {
    badge: 'ROYAL HERITAGE COLLECTION • 2026',
    title: 'Tradition In Every Thread.',
    subtitle: 'Discover pure Kanchipuram silk sarees handwoven by multi-generational master weavers in South India. Timeless drape, gold zari motifs, and verified Silk Mark authenticity.',
    discountTag: 'FLAT 20% OFF FESTIVE LAUNCH',
    ctaText: 'Explore Handloom Silks',
    ctaLink: 'shop.html?category=sarees',
    image: 'assets/images/hero_saree_model.jpg'
  };

  // Initial Seed Settings
  const DEFAULT_SETTINGS = {
    storeName: 'Aruvi Collections',
    tagline: 'Tradition In Every Thread',
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: 'support@aruvicollections.com',
    address: 'Boutique Suite 402, Heritage Silk Enclave, Avinashi Road, Peelamedu, Coimbatore - 641004',
    currencySymbol: '₹',
    freeShippingThreshold: 999,
    standardDeliveryFee: 0,
    expressDeliveryFee: 99,
    taxPercent: 5,
    maintenanceMode: false,
    instagram: 'https://instagram.com/aruvicollections',
    facebook: 'https://facebook.com/aruvicollections',
    adminEmail: 'aruvicollections.25@gmail.com',
    adminPassword: 'admin' // Can be changed in Admin Dashboard
  };

  // Initial Seed Customers
  const DEFAULT_CUSTOMERS = [];

  // Helper storage functions
  function initStorageSchema() {
    try {
      const version = localStorage.getItem(SCHEMA_VERSION_KEY);
      if (version !== CURRENT_SCHEMA_VERSION) {
        // Delete all existing products from the website as requested (Start with 0 products)
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
        localStorage.removeItem('aruvi_saved_orders');
        localStorage.removeItem('aruvi_user_profile');
        localStorage.removeItem('aruvi_cart');
        localStorage.removeItem('aruvi_wishlist');
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
      }
    } catch (e) {
      console.warn('Auto migration error:', e);
    }
  }
  initStorageSchema();

  function getStored(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed;
      }
    } catch (e) {
      console.warn('AruviStore storage read error:', key, e);
    }
    // Seed default if missing
    setStored(key, fallback);
    return JSON.parse(JSON.stringify(fallback));
  }

  function setStored(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      // Dispatch custom storage change event for instant cross-tab sync
      window.dispatchEvent(new CustomEvent('aruvi:data_updated', { detail: { key, val } }));
    } catch (e) {
      console.error('AruviStore storage write error:', key, e);
    }
  }

  // Public API
  return {
    STORAGE_KEYS,
    DEFAULT_PRODUCTS,
    DEFAULT_CATEGORIES,
    DEFAULT_ORDERS,
    DEFAULT_COUPONS,
    DEFAULT_ANNOUNCEMENT,
    DEFAULT_HERO,
    DEFAULT_SETTINGS,
    DEFAULT_CUSTOMERS,

    // Product APIs
    getProducts: function (includeInactive) {
      const prods = getStored(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
      if (includeInactive) return prods;
      return prods.filter(function (p) { return p.status !== 'inactive'; });
    },

    saveProducts: function (products) {
      setStored(STORAGE_KEYS.PRODUCTS, products);
    },

    getProductById: function (id) {
      const prods = this.getProducts(true);
      return prods.find(function (p) { return p.id === id; });
    },

    saveProduct: function (product) {
      const prods = this.getProducts(true);
      const idx = prods.findIndex(function (p) { return p.id === product.id; });
      if (idx >= 0) {
        prods[idx] = Object.assign({}, prods[idx], product);
      } else {
        if (!product.id) {
          product.id = 'p_' + Date.now();
        }
        prods.unshift(product);
      }
      this.saveProducts(prods);
      return product;
    },

    deleteProduct: function (id) {
      let prods = this.getProducts(true);
      prods = prods.filter(function (p) { return p.id !== id; });
      this.saveProducts(prods);
      return prods;
    },

    // Orders APIs
    getOrders: function () {
      return getStored(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    },

    saveOrders: function (orders) {
      setStored(STORAGE_KEYS.ORDERS, orders);
    },

    addOrder: function (order) {
      const orders = this.getOrders();
      if (!order.id) {
        order.id = 'ARUVI-' + Math.floor(100000 + Math.random() * 900000);
      }
      if (!order.date) {
        order.date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      if (!order.time) {
        order.time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      }
      orders.unshift(order);
      this.saveOrders(orders);
      return order;
    },

    updateOrderStatus: function (orderId, newStatus, courier, trackingNumber) {
      const orders = this.getOrders();
      const order = orders.find(function (o) { return o.id === orderId; });
      if (order) {
        order.status = newStatus;
        if (courier) order.courier = courier;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        this.saveOrders(orders);
      }
      return order;
    },

    deleteOrder: function (orderId) {
      let orders = this.getOrders();
      orders = orders.filter(function (o) { return o.id !== orderId; });
      this.saveOrders(orders);
      return orders;
    },

    // Categories APIs
    getCategories: function () {
      return getStored(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    },

    saveCategories: function (categories) {
      setStored(STORAGE_KEYS.CATEGORIES, categories);
    },

    saveCategory: function (cat) {
      const cats = this.getCategories();
      const idx = cats.findIndex(function (c) { return c.id === cat.id; });
      if (idx >= 0) {
        cats[idx] = Object.assign({}, cats[idx], cat);
      } else {
        if (!cat.id) {
          cat.id = cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        cats.push(cat);
      }
      this.saveCategories(cats);
      return cat;
    },

    deleteCategory: function (catId) {
      let cats = this.getCategories();
      cats = cats.filter(function (c) { return c.id !== catId; });
      this.saveCategories(cats);
      return cats;
    },

    // Coupons APIs
    getCoupons: function () {
      return getStored(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    },

    saveCoupons: function (coupons) {
      setStored(STORAGE_KEYS.COUPONS, coupons);
    },

    validateCoupon: function (code, cartSubtotal) {
      if (!code) return { valid: false, message: 'Please enter a coupon code' };
      const normalized = code.trim().toUpperCase();
      const coupons = this.getCoupons();
      const coupon = coupons.find(function (c) { return c.code.toUpperCase() === normalized && c.active; });
      if (!coupon) {
        return { valid: false, message: 'Invalid or expired coupon code' };
      }
      if (coupon.minOrder && cartSubtotal < coupon.minOrder) {
        return {
          valid: false,
          message: 'Coupon requires minimum cart value of ₹' + coupon.minOrder.toLocaleString('en-IN')
        };
      }
      return {
        valid: true,
        coupon: coupon,
        message: 'Coupon ' + coupon.code + ' applied successfully! 🎉'
      };
    },

    saveCoupon: function (coupon) {
      const coupons = this.getCoupons();
      const idx = coupons.findIndex(function (c) { return c.code.toUpperCase() === coupon.code.toUpperCase(); });
      coupon.code = coupon.code.toUpperCase().trim();
      if (idx >= 0) {
        coupons[idx] = Object.assign({}, coupons[idx], coupon);
      } else {
        coupon.usageCount = coupon.usageCount || 0;
        coupons.unshift(coupon);
      }
      this.saveCoupons(coupons);
      return coupon;
    },

    deleteCoupon: function (code) {
      let coupons = this.getCoupons();
      coupons = coupons.filter(function (c) { return c.code.toUpperCase() !== code.toUpperCase(); });
      this.saveCoupons(coupons);
      return coupons;
    },

    // Announcement APIs
    getAnnouncement: function () {
      return getStored(STORAGE_KEYS.ANNOUNCEMENT, DEFAULT_ANNOUNCEMENT);
    },

    saveAnnouncement: function (announcement) {
      setStored(STORAGE_KEYS.ANNOUNCEMENT, announcement);
    },

    // Hero Banner APIs
    getHero: function () {
      return getStored(STORAGE_KEYS.HERO, DEFAULT_HERO);
    },

    saveHero: function (hero) {
      setStored(STORAGE_KEYS.HERO, hero);
    },

    // Settings APIs
    getSettings: function () {
      return getStored(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    },

    saveSettings: function (settings) {
      setStored(STORAGE_KEYS.SETTINGS, settings);
    },

    // Customers APIs
    getCustomers: function () {
      return getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    },

    saveCustomers: function (customers) {
      setStored(STORAGE_KEYS.CUSTOMERS, customers);
    },

    saveCustomer: function (customer) {
      const customers = this.getCustomers();
      const idx = customers.findIndex(function (c) { return c.id === customer.id; });
      if (idx >= 0) {
        customers[idx] = Object.assign({}, customers[idx], customer);
      } else {
        if (!customer.id) customer.id = 'c_' + Date.now();
        customer.joinDate = customer.joinDate || 'Nov 2026';
        customers.unshift(customer);
      }
      this.saveCustomers(customers);
      return customer;
    },

    // Admin Auth - Strictly Google Login with aruvicollections.25@gmail.com
    checkAuth: function () {
      try {
        const logged = (localStorage.getItem('aruvi_admin_logged_in') === 'true' || sessionStorage.getItem('aruvi_admin_logged_in') === 'true');
        const email = (localStorage.getItem('aruvi_admin_email') || '').toLowerCase();
        return logged && email === 'aruvicollections.25@gmail.com';
      } catch (e) {
        return false;
      }
    },

    isAdmin: function () {
      return this.checkAuth();
    },

    getAdminEmail: function () {
      return 'aruvicollections.25@gmail.com';
    },

    // Admin Email Login API - ONLY aruvicollections.25@gmail.com is allowed
    loginAdmin: function (email, password) {
      const normalized = (email || '').trim().toLowerCase();
      if (normalized === 'aruvicollections.25@gmail.com') {
        try {
          localStorage.setItem('aruvi_admin_logged_in', 'true');
          localStorage.setItem('aruvi_admin_email', 'aruvicollections.25@gmail.com');
          localStorage.setItem('aruvi_admin_auth_provider', 'email');
          sessionStorage.setItem('aruvi_admin_logged_in', 'true');
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('aruvi:admin_auth_changed', {
          detail: { loggedIn: true, email: 'aruvicollections.25@gmail.com', provider: 'email' }
        }));
        window.dispatchEvent(new CustomEvent('aruvi:data_updated', {
          detail: { key: 'aruvi_admin_logged_in', val: 'true' }
        }));
        return { success: true, email: 'aruvicollections.25@gmail.com' };
      }
      return {
        success: false,
        message: 'Access Denied: Only aruvicollections.25@gmail.com is authorized to access the Admin Dashboard.'
      };
    },

    login: function (identifier) {
      return this.loginAdmin(identifier);
    },

    logout: function () {
      try {
        localStorage.removeItem('aruvi_admin_logged_in');
        localStorage.removeItem('aruvi_admin_email');
        localStorage.removeItem('aruvi_admin_auth_provider');
        localStorage.removeItem('aruvi_admin_remember');
        sessionStorage.removeItem('aruvi_admin_logged_in');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('aruvi:admin_auth_changed', { detail: { loggedIn: false } }));
      window.dispatchEvent(new CustomEvent('aruvi:data_updated', { detail: { key: 'aruvi_admin_logged_in', val: 'false' } }));
    },

    // Customer Authentication (Email & Password)
    getCustomerAuth: function () {
      try {
        const logged = localStorage.getItem('aruvi_customer_logged_in') === 'true';
        const userStr = localStorage.getItem('aruvi_customer_user');
        const user = userStr ? JSON.parse(userStr) : null;
        return { loggedIn: logged && !!user, user: user };
      } catch (e) {
        return { loggedIn: false, user: null };
      }
    },

    loginCustomerWithEmail: function (email, password) {
      if (!email || !password) {
        return { success: false, message: 'Please provide both email and password.' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }
      const cleanEmail = email.trim().toLowerCase();
      const name = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const user = {
        uid: 'usr_' + Date.now(),
        name: name,
        email: cleanEmail,
        photoURL: '',
        provider: 'password',
        loginTime: new Date().toISOString()
      };
      try {
        localStorage.setItem('aruvi_customer_logged_in', 'true');
        localStorage.setItem('aruvi_customer_user', JSON.stringify(user));
      } catch (e) {}

      // If authorized admin email, automatically activate Admin Mode
      if (user.email === 'aruvicollections.25@gmail.com') {
        this.loginAdmin('aruvicollections.25@gmail.com');
      }

      window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', {
        detail: { loggedIn: true, user: user, provider: 'password' }
      }));
      return { success: true, user: user };
    },

    registerCustomer: function (name, email, password) {
      if (!name || !email || !password) {
        return { success: false, message: 'Please provide name, email and password.' };
      }
      if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters.' };
      }
      const cleanEmail = email.trim().toLowerCase();
      const user = {
        uid: 'reg_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        photoURL: '',
        provider: 'password',
        loginTime: new Date().toISOString()
      };
      try {
        localStorage.setItem('aruvi_customer_logged_in', 'true');
        localStorage.setItem('aruvi_customer_user', JSON.stringify(user));
      } catch (e) {}

      // If authorized admin email, automatically activate Admin Mode
      if (user.email === 'aruvicollections.25@gmail.com') {
        this.loginAdmin('aruvicollections.25@gmail.com');
      }

      window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', {
        detail: { loggedIn: true, user: user, provider: 'password' }
      }));
      return { success: true, user: user };
    },

    logoutCustomer: function () {
      try {
        localStorage.removeItem('aruvi_customer_logged_in');
        localStorage.removeItem('aruvi_customer_user');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', {
        detail: { loggedIn: false, user: null }
      }));
    },

    // Backup & Restore
    exportAllData: function () {
      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        storeName: 'Aruvi Collections',
        products: this.getProducts(true),
        orders: this.getOrders(),
        categories: this.getCategories(),
        coupons: this.getCoupons(),
        announcement: this.getAnnouncement(),
        hero: this.getHero(),
        settings: this.getSettings(),
        customers: this.getCustomers()
      };
    },

    importAllData: function (jsonObj) {
      try {
        if (jsonObj.products) this.saveProducts(jsonObj.products);
        if (jsonObj.orders) this.saveOrders(jsonObj.orders);
        if (jsonObj.categories) this.saveCategories(jsonObj.categories);
        if (jsonObj.coupons) this.saveCoupons(jsonObj.coupons);
        if (jsonObj.announcement) this.saveAnnouncement(jsonObj.announcement);
        if (jsonObj.hero) this.saveHero(jsonObj.hero);
        if (jsonObj.settings) this.saveSettings(jsonObj.settings);
        if (jsonObj.customers) this.saveCustomers(jsonObj.customers);
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    },

    resetToDefaults: function () {
      this.saveProducts(DEFAULT_PRODUCTS);
      this.saveOrders(DEFAULT_ORDERS);
      this.saveCategories(DEFAULT_CATEGORIES);
      this.saveCoupons(DEFAULT_COUPONS);
      this.saveAnnouncement(DEFAULT_ANNOUNCEMENT);
      this.saveHero(DEFAULT_HERO);
      this.saveSettings(DEFAULT_SETTINGS);
      this.saveCustomers(DEFAULT_CUSTOMERS);
      return { success: true };
    }
  };
});
