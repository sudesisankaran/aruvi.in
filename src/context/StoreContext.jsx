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

export const INITIAL_PRODUCTS = [
  {
    id: 'prod_salwar_1',
    title: 'Royal Emerald Anarkali Salwar Suit',
    category: 'salwar',
    price: 4999,
    originalPrice: 6999,
    fabric: 'Pure Georgette & Zari',
    badge: 'BESTSELLER',
    badgeType: 'tag-gold',
    rating: 4.9,
    reviews: 42,
    image: 'assets/images/anarkali_suit.jpg',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Bespoke emerald green flared Anarkali salwar suit with handcrafted zari neckline, matching dupatta and churidar trousers.'
  },
  {
    id: 'prod_sharara_1',
    title: 'Gilded Mirrorwork Festive Sharara Set',
    category: 'sharara',
    price: 5499,
    originalPrice: 7999,
    fabric: 'Silk Chanderi',
    badge: 'FESTIVE',
    badgeType: 'tag-gold',
    rating: 4.9,
    reviews: 28,
    image: 'assets/images/lehenga_set.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Exquisite flared tiered sharara paired with heavily embellished mirrorwork peplum short kurti and sheer organza dupatta.'
  },
  {
    id: 'prod_ethnic_1',
    title: 'Bridal Heritage Kanjivaram Brocade Drape',
    category: 'ethnic-wear',
    price: 8999,
    originalPrice: 12499,
    fabric: 'Pure Silk & Gold Zari',
    badge: 'BRIDAL',
    badgeType: 'tag-gold',
    rating: 5.0,
    reviews: 56,
    image: 'assets/images/festive_promo.jpg',
    sizes: ['Free Size'],
    description: 'Centuries-old South Indian weaving technique with intricate temple motifs, heavy pallu, and unstitched matching blouse piece.'
  },
  {
    id: 'prod_maxis_1',
    title: 'Botanical Tiered Georgette Maxi Dress',
    category: 'maxis',
    price: 2799,
    originalPrice: 3999,
    fabric: 'Fine Georgette',
    badge: 'NEW',
    badgeType: 'tag-gold',
    rating: 4.8,
    reviews: 19,
    image: 'assets/images/printed_georgette.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Floor-length flowy maxi dress featuring artisan floral prints, balloon sleeves, and an adjustable cinched waist belt.'
  },
  {
    id: 'prod_coord_1',
    title: 'Indigo Handblock Artisanal Co-ord Set',
    category: 'co-ordsets',
    price: 3299,
    originalPrice: 4499,
    fabric: 'Organic Modal Silk',
    badge: 'TRENDING',
    badgeType: 'tag-gold',
    rating: 4.7,
    reviews: 23,
    image: 'assets/images/western_ethnic.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Contemporary two-piece co-ord set with a tailored collared shirt and straight-cut trousers featuring natural indigo motifs.'
  },
  {
    id: 'prod_tops_1',
    title: 'Mulmul Chikankari Casual Tunic Top',
    category: 'casual-tops',
    price: 1499,
    originalPrice: 1999,
    fabric: 'Pure Breathable Cotton',
    badge: 'EVERYDAY',
    badgeType: 'tag-gold',
    rating: 4.8,
    reviews: 31,
    image: 'assets/images/kurti_wear.jpg',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Delicate hand-embroidered Lucknowi chikankari work on featherlight cotton mulmul. Perfect for work and casual outings.'
  },
  {
    id: 'prod_western_1',
    title: 'Equestrian Tailored Linen-Silk Blazer Set',
    category: 'western-wear',
    price: 4299,
    originalPrice: 5999,
    fabric: 'Linen-Silk Blend',
    badge: 'EXCLUSIVE',
    badgeType: 'tag-gold',
    rating: 4.9,
    reviews: 15,
    image: 'assets/images/premium_fabrics.jpg',
    sizes: ['S', 'M', 'L'],
    description: 'Modern structured silhouette blended with rich artisanal texture. Suitable for evening galas and formal gatherings.'
  },
  {
    id: 'prod_jeans_1',
    title: 'High-Waist Baggy Denim & Palazzo Trousers',
    category: 'jeans-pants',
    price: 2199,
    originalPrice: 2999,
    fabric: '100% Premium Cotton Denim',
    badge: 'HOT',
    badgeType: 'tag-gold',
    rating: 4.8,
    reviews: 37,
    image: 'assets/images/hero_saree_model.jpg',
    sizes: ['26', '28', '30', '32', '34'],
    description: 'Ultra-comfortable vintage wash wide-leg baggy trousers with deep pockets and tailored high-rise waistline.'
  },
  {
    id: 'prod_kids_1',
    title: 'Traditional Pattu Pavadai Festive Kids Ensemble',
    category: 'kids-wear',
    price: 2499,
    originalPrice: 3499,
    fabric: 'Art Silk with Pure Zari Border',
    badge: 'NEW',
    badgeType: 'tag-gold',
    rating: 5.0,
    reviews: 29,
    image: 'assets/images/cotton_saree.jpg',
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-12Y'],
    description: 'Vibrant contrasting skirt and blouse set adorned with golden zari borders. Soft cotton lining to protect delicate skin.'
  }
];

export const DEFAULT_COUPONS = [
  { code: 'ARUVI20', type: 'percentage', value: 20, minOrder: 999 },
  { code: 'FESTIVE10', type: 'percentage', value: 10, minOrder: 499 },
  { code: 'BRIDAL500', type: 'flat', value: 500, minOrder: 4999 },
  { code: 'WELCOME100', type: 'flat', value: 100, minOrder: 999 }
];

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

  // Products
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('aruvi_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
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

  // Order creation
  const createOrder = (shippingDetails, paymentMethod = 'upi') => {
    const sub = getCartSubtotal();
    const disc = Math.round((sub * discountPercent) / 100);
    const ship = sub >= 999 || sub === 0 ? 0 : 99;
    const tot = Math.max(0, sub - disc + ship);

    const newOrder = {
      id: 'ARUVI-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      items: [...cart],
      shipping: shippingDetails,
      paymentMethod,
      subtotal: sub,
      discount: disc,
      shippingFee: ship,
      total: tot
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setAppliedCoupon(null);
    addToast(`Order #${newOrder.id} confirmed! Thank you for choosing Aruvi.`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    addToast(`Order #${orderId} status updated to ${newStatus}.`, 'info');
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
      rating: newProd.rating || 4.9,
      reviews: newProd.reviews || 1,
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
