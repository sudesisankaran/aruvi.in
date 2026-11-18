/* ==========================================================================
   ARUVI COLLECTIONS - CORE E-COMMERCE LOGIC
   Handles:
   - Product Catalog Data & Dynamic Rendering
   - Advanced Filtering & Sorting (Category, Price, Color, Fabric)
   - Cart State & Slide-Over Drawer
   - Wishlist System with Microinteractions
   - Quick View 3D Modal
   - Interactive Checkout Flow
   - Mobile Preview Drawer
   - Toast Notifications
   ========================================================================== */

(function () {
  'use strict';

  // Master Catalog Data - 0 existing products as requested (Admin has 100% control)
  const PRODUCTS = [];

  // Storage Persistence Helpers for Dynamic Catalog & Admin Sync
  function loadStoredProducts() {
    try {
      if (window.AruviStore) {
        return window.AruviStore.getProducts();
      }
      const data = localStorage.getItem('aruvi_products');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter(function (p) { return p.status !== 'inactive'; });
        }
      }
    } catch (e) {
      console.warn('Could not read stored products:', e);
    }
    return [];
  }

  function loadStoredCart() {
    try {
      const data = localStorage.getItem('aruvi_cart');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveStoredCart() {
    try {
      localStorage.setItem('aruvi_cart', JSON.stringify(AppState.cart));
    } catch (e) {}
  }

  function loadStoredWishlist() {
    try {
      const data = localStorage.getItem('aruvi_wishlist');
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveStoredWishlist() {
    try {
      localStorage.setItem('aruvi_wishlist', JSON.stringify(AppState.wishlist));
    } catch (e) {}
  }

  // Application State
  const activeProductsList = loadStoredProducts();
  const AppState = {
    products: activeProductsList,
    filteredProducts: [...activeProductsList],
    activeCategory: 'all',
    activeTab: 'all',
    activeColor: null,
    maxPrice: 15000,
    searchQuery: '',
    selectedFabrics: [],
    selectedOccasions: [],
    selectedSizes: [],
    minDiscount: 0,
    sortBy: 'popularity',
    cart: loadStoredCart(),
    wishlist: loadStoredWishlist(),
    appliedCoupon: null,
    couponDiscountPercent: 0,
    couponFlatDiscount: 0,
    shippingFee: 0,
    freeShippingThreshold: 999
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const DOMElements = {
    productsGrid: document.getElementById('products-grid'),
    cartDrawer: document.getElementById('cart-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    cartItemsList: document.getElementById('cart-items-list'),
    cartEmptyState: document.getElementById('cart-empty-state'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartShipping: document.getElementById('cart-shipping'),
    cartDiscountRow: document.getElementById('cart-discount-row'),
    cartDiscountAmt: document.getElementById('cart-discount-amt'),
    cartTotal: document.getElementById('cart-total'),
    cartCountBadges: document.querySelectorAll('.cart-count-badge'),
    wishlistCountBadges: document.querySelectorAll('.wishlist-count-badge'),
    wishlistDrawer: document.getElementById('wishlist-drawer'),
    wishlistItemsList: document.getElementById('wishlist-items-list'),
    wishlistEmptyState: document.getElementById('wishlist-empty-state'),
    shippingProgressFill: document.getElementById('shipping-progress-fill'),
    shippingProgressText: document.getElementById('shipping-progress-text'),
    quickViewModal: document.getElementById('quick-view-modal'),
    checkoutModal: document.getElementById('checkout-modal'),
    mobilePreviewDrawer: document.getElementById('mobile-preview-drawer'),
    toastContainer: document.getElementById('toast-container'),
    priceSlider: document.getElementById('price-range-slider'),
    priceValueDisplay: document.getElementById('max-price-display'),
    headerSearchInput: document.getElementById('header-search-input'),
  };

  /* ==========================================================================
     CATEGORY META & DYNAMIC HEADER SYNC
     ========================================================================== */
  const CATEGORY_META = {
    sarees: {
      title: 'Sarees',
      subtitle: 'Grace in every drape',
      desc: 'Explore authentic Kanjivaram pure silk, Banarasi gold zari, Chanderi festive weaves, and lightweight handloom cottons.',
      image: 'assets/images/kanjivaram_green.jpg'
    },
    salwar: {
      title: 'Salwar Suits',
      subtitle: 'Graceful & classy silhouettes',
      desc: 'Explore floor-length flared Anarkalis, pure georgette ensembles, and festive suit sets with intricate embroidery.',
      image: 'assets/images/anarkali_suit.jpg'
    },
    sharara: {
      title: 'Sharara Sets',
      subtitle: 'Royal flared sharara ensembles',
      desc: 'Discover royal flared georgette and silk sharara sets enriched with exquisite zari borders and matching dupattas.',
      image: 'assets/images/lehenga_set.jpg'
    },
    'ethnic-wears': {
      title: 'Ethnic Wears',
      subtitle: 'Traditional artisanal handcrafts',
      desc: 'Handcrafted South Indian ethnic ensembles, Anarkali gowns, and authentic heritage festival wear.',
      image: 'assets/images/festive_promo.jpg'
    },
    'co-ord-sets': {
      title: 'Co-ord Sets',
      subtitle: 'Chic matching fusion sets',
      desc: 'Contemporary designer two-piece fusion outfits crafted from printed georgette, silk, and structured velvet.',
      image: 'assets/images/printed_georgette.jpg'
    },
    'western-tops': {
      title: 'Western Tops',
      subtitle: 'Modern peplum & chic tops',
      desc: 'Airy georgette and Chanderi silk peplum western tops featuring scalloped borders and designer silhouettes.',
      image: 'assets/images/premium_fabrics.jpg'
    },
    kids: {
      title: 'Kids Collection',
      subtitle: 'Adorable festive ethnic wear for little ones',
      desc: 'Handcrafted pure silk Pattu Pavadai, ethnic kurta dhoti sets, and festive celebratory wear for kids.',
      image: 'assets/images/cotton_saree.jpg'
    }
  };

  function updateCategoryHeader(cat) {
    const meta = CATEGORY_META[cat];
    if (!meta) return;

    const bannerTitle = document.getElementById('shop-banner-title');
    const bannerSubtitle = document.getElementById('shop-banner-subtitle');
    const bannerDesc = document.getElementById('shop-banner-desc');
    const bannerImg = document.getElementById('shop-banner-img');
    const breadcrumbCat = document.getElementById('shop-breadcrumb-category');

    if (bannerTitle) bannerTitle.textContent = meta.title;
    if (bannerSubtitle) bannerSubtitle.textContent = meta.subtitle;
    if (bannerDesc) bannerDesc.textContent = meta.desc;
    if (bannerImg) bannerImg.src = meta.image;
    if (breadcrumbCat) breadcrumbCat.textContent = meta.title;
  }

  function parseURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const tab = params.get('tab');
    const search = params.get('search');

    if (cat) {
      AppState.activeCategory = cat;
      updateCategoryHeader(cat);
      document.querySelectorAll('input[name="filter-cat"]').forEach((chk) => {
        chk.checked = chk.value === cat;
      });
      document.querySelectorAll('.category-circle-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.category === cat);
      });
    }

    if (tab) {
      AppState.activeTab = tab;
      document.querySelectorAll('.filter-tab-pill').forEach((pill) => {
        pill.classList.toggle('active', pill.dataset.tab === tab);
      });
    }

    if (search) {
      AppState.searchQuery = search;
      if (DOMElements.headerSearchInput) {
        DOMElements.headerSearchInput.value = search;
      }
    }
  }

  /* ==========================================================================
     PRODUCT RENDERING & 3D CARDS
     ========================================================================== */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderProducts(productsToRender) {
    if (!DOMElements.productsGrid) return;
    const isAdmin = window.AruviStore && window.AruviStore.isAdmin();

    if (productsToRender.length === 0) {
      if (isAdmin) {
        const catName = (AppState.activeCategory && AppState.activeCategory !== 'all')
          ? (CATEGORY_META[AppState.activeCategory] ? CATEGORY_META[AppState.activeCategory].title : AppState.activeCategory)
          : 'this collection';

        DOMElements.productsGrid.innerHTML = `
          <div class="empty-products-admin-box" style="grid-column: 1 / -1; text-align: center; padding: 60px 24px; background: #ffffff; border: 2px dashed var(--color-gold); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
            <div style="font-size: 3.2rem; margin-bottom: 12px;">🥻</div>
            <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--color-gold-dark); background: var(--color-gold-pale); padding: 4px 14px; border-radius: var(--radius-full); display: inline-block; margin-bottom: 12px; border: 1px solid rgba(200,157,56,0.3);">
              👑 Admin Mode Active
            </span>
            <h3 style="font-family: var(--font-serif); font-size: 1.6rem; color: var(--color-primary-dark); margin-bottom: 8px;">
              No Products in ${escapeHtml(catName)} Yet
            </h3>
            <p style="color: var(--color-text-muted); font-size: 0.92rem; max-width: 520px; margin: 0 auto 22px auto;">
              All previous products were cleared as requested. You have complete admin control over the boutique catalog. Click below to add your first product under <strong>${escapeHtml(catName)}</strong>.
            </p>
            <button class="btn btn-primary hover-lift" id="btn-empty-add-prod" style="padding: 12px 30px; font-weight: 700; border: 1.5px solid var(--color-gold); display: inline-flex; align-items: center; gap: 8px; font-size: 0.95rem;">
              <span>✨ + Add Product to ${escapeHtml(catName)}</span>
            </button>
          </div>
        `;
        const addBtn = document.getElementById('btn-empty-add-prod');
        if (addBtn) {
          addBtn.addEventListener('click', function () {
            openStorefrontProductModal(null, AppState.activeCategory !== 'all' ? AppState.activeCategory : 'sarees');
          });
        }
      } else {
        DOMElements.productsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">🌿</div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--color-primary-dark); margin-bottom: 8px;">Exclusive Collection Coming Soon</h3>
            <p style="color: var(--color-text-muted); font-size: 0.88rem; margin-bottom: 20px;">We are handcrafting new luxury additions for this collection. Please check back shortly or explore our other collections.</p>
            <a href="shop.html" class="btn btn-secondary btn-sm">Explore All Collections</a>
          </div>
        `;
      }
      return;
    }

    DOMElements.productsGrid.innerHTML = productsToRender.map((product) => {
      const isWishlisted = AppState.wishlist.includes(product.id);
      const origPrice = Number(product.originalPrice) || Number(product.price);
      const currPrice = Number(product.price);
      const discountPercent = origPrice > currPrice ? Math.round(((origPrice - currPrice) / origPrice) * 100) : 0;

      return `
        <article class="product-card card-3d hover-gold-glow" data-id="${product.id}" data-animate="fade-up">
          <div class="product-media-wrap">
            ${product.badge ? `<span class="product-badge-tag ${product.badgeType || 'tag-gold'}">${escapeHtml(product.badge)}</span>` : ''}
            ${discountPercent > 0 ? `<span class="product-badge-tag tag-discount" style="left: auto; right: 60px;">${discountPercent}% OFF</span>` : ''}
            
            <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Add to Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <a href="product-detail.html?id=${product.id}" class="product-img-link" style="display: block; width: 100%; height: 100%;">
              <img src="${product.image || 'assets/images/kanjivaram_green.jpg'}" alt="${escapeHtml(product.title)}" loading="lazy" />
            </a>

            <div class="product-hover-actions">
              <button class="btn-quick-view" data-quickview-id="${product.id}" title="Quick View">
                Quick
              </button>
              <button class="btn-card-tryon btn-ai-tryon" data-product-id="${product.id}" title="AI Virtual Try-On">
                🪞 Try-On
              </button>
              <button class="btn-card-cart" data-cart-id="${product.id}" title="Add to Bag">
                Add
              </button>
            </div>
          </div>

          <div class="product-content">
            <span class="product-category-text">${escapeHtml((product.category || '').toUpperCase())} • ${escapeHtml(product.fabric || 'silk')}</span>
            <h3 class="product-title"><a href="product-detail.html?id=${product.id}">${escapeHtml(product.title)}</a></h3>

            <div class="product-rating-row">
              <span class="star-icons">★★★★★</span>
              <span class="rating-count">${product.rating || '4.8'} (${product.reviews || '12'})</span>
            </div>

            <div class="product-price-row">
              <span class="price-current">₹${currPrice.toLocaleString('en-IN')}</span>
              ${origPrice > currPrice ? `<span class="price-original">₹${origPrice.toLocaleString('en-IN')}</span>` : ''}
            </div>

            ${isAdmin ? `
              <!-- Admin In-Page Controls -->
              <div class="card-admin-action-row">
                <button class="btn-card-admin btn-card-admin-edit" data-edit-id="${product.id}" title="Edit product details">
                  ✏️ Edit
                </button>
                <button class="btn-card-admin btn-card-admin-delete" data-delete-id="${product.id}" title="Delete product">
                  🗑️ Delete
                </button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Re-attach 3D tilt and trigger staggered entrance animation
    const cards = DOMElements.productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('is-revealed');
      }, index * 50);
    });

    if (window.rebind3DCardTilt) {
      window.rebind3DCardTilt();
    }
  }

  /* ==========================================================================
     FILTER & SEARCH SYSTEM
     ========================================================================== */
  function applyFilters() {
    let list = [...AppState.products];

    // Filter by Category
    if (AppState.activeCategory !== 'all') {
      list = list.filter((p) => p.category === AppState.activeCategory);
    }

    // Filter by Tab (Fresh, Bestsellers, Wedding, Under ₹3000)
    if (AppState.activeTab === 'fresh') {
      list = list.filter((p) => (p.badge && p.badge.includes('Fresh')) || p.badge === 'Popular');
    } else if (AppState.activeTab === 'bestseller') {
      list = list.filter((p) => p.badge === 'Bestseller' || p.rating >= 4.8);
    } else if (AppState.activeTab === 'wedding') {
      list = list.filter((p) => p.occasion === 'wedding');
    } else if (AppState.activeTab === 'under3k') {
      list = list.filter((p) => p.price <= 3000);
    }

    // Filter by Price Slider
    list = list.filter((p) => p.price <= AppState.maxPrice);

    // Filter by Color
    if (AppState.activeColor) {
      list = list.filter((p) => p.color === AppState.activeColor);
    }

    // Filter by Fabric checkboxes
    if (AppState.selectedFabrics.length > 0) {
      list = list.filter((p) => AppState.selectedFabrics.includes(p.fabric));
    }

    // Filter by Occasion checkboxes
    if (AppState.selectedOccasions.length > 0) {
      list = list.filter((p) => AppState.selectedOccasions.includes(p.occasion));
    }

    // Filter by Discount
    if (AppState.minDiscount > 0) {
      list = list.filter((p) => {
        const disc = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return disc >= AppState.minDiscount;
      });
    }

    // Filter by Size
    if (AppState.selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes.some((s) => AppState.selectedSizes.includes(s) || s === 'Free Size')
      );
    }

    // Filter by Search Query
    if (AppState.searchQuery.trim() !== '') {
      const q = AppState.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      );
    }

    // Sort
    if (AppState.sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (AppState.sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (AppState.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    AppState.filteredProducts = list;

    // Update product counter displays
    const countDisplay = document.getElementById('catalog-count-display');
    if (countDisplay) {
      countDisplay.textContent = list.length;
    }

    renderProducts(list);
  }

  function resetAllFilters() {
    AppState.activeCategory = 'all';
    AppState.activeTab = 'all';
    AppState.activeColor = null;
    AppState.maxPrice = 15000;
    AppState.searchQuery = '';
    AppState.selectedFabrics = [];
    AppState.selectedOccasions = [];
    AppState.selectedSizes = [];
    AppState.minDiscount = 0;
    AppState.sortBy = 'popularity';

    // Reset UI controls
    if (DOMElements.priceSlider) DOMElements.priceSlider.value = 15000;
    if (DOMElements.priceValueDisplay) DOMElements.priceValueDisplay.textContent = '₹15,000';
    if (DOMElements.headerSearchInput) DOMElements.headerSearchInput.value = '';

    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) sortSelect.value = 'popularity';

    document.querySelectorAll('.filter-tab-pill').forEach((pill) => pill.classList.toggle('active', pill.dataset.tab === 'all'));
    document.querySelectorAll('.category-circle-item').forEach((item) => item.classList.remove('active'));
    document.querySelectorAll('.color-swatch-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.filter-checkbox-label input').forEach((chk) => (chk.checked = false));
    document.querySelectorAll('.filter-size-btn').forEach((btn) => btn.classList.remove('active'));

    const bannerTitle = document.getElementById('shop-banner-title');
    if (bannerTitle) bannerTitle.textContent = 'All Collections';

    applyFilters();
    showToast('Filters reset to default', 'info');
  }

  /* ==========================================================================
     CART MANAGEMENT & DRAWER
     ========================================================================== */
  function updateCartDrawerUI() {
    try {
      // Filter out any corrupted or incomplete cart entries
      AppState.cart = (AppState.cart || []).filter(item => item && item.product && typeof item.product.price === 'number');

      const totalItems = AppState.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

      // Update Header and Drawer Badges
      const badges = document.querySelectorAll('.cart-count-badge');
      badges.forEach((badge) => {
        badge.textContent = totalItems;
      });

      const cartDrawer = document.getElementById('cart-drawer');
      const cartItemsList = document.getElementById('cart-items-list');
      const cartEmptyState = document.getElementById('cart-empty-state');

      if (!cartDrawer || !cartItemsList) {
        saveStoredCart();
        return;
      }

      if (totalItems === 0) {
        cartItemsList.style.display = 'none';
        if (cartEmptyState) cartEmptyState.style.display = 'flex';
        const subtotalEl = document.getElementById('cart-subtotal');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');
        if (subtotalEl) subtotalEl.textContent = '₹0';
        if (shippingEl) shippingEl.textContent = '₹0';
        if (totalEl) totalEl.textContent = '₹0';
        const fill = document.getElementById('shipping-progress-fill');
        const text = document.getElementById('shipping-progress-text');
        if (fill) fill.style.width = '0%';
        if (text) text.textContent = 'Add ₹999 for FREE Delivery';
        saveStoredCart();
        return;
      }

      cartItemsList.style.display = 'flex';
      if (cartEmptyState) cartEmptyState.style.display = 'none';

      cartItemsList.innerHTML = AppState.cart.map((item, index) => {
        const p = item.product;
        return `
          <div class="cart-item-row" data-cart-index="${index}">
            <img src="${p.image || ''}" alt="${p.title || 'Product'}" class="cart-item-img" />
            <div class="cart-item-info">
              <h4 class="cart-item-title">${p.title || 'Handcrafted Drape'}</h4>
              <div class="cart-item-attr">Size: ${item.selectedSize || 'Free Size'} • Color: ${item.selectedColor || 'Standard'}</div>
              <div class="cart-item-bottom">
                <div class="qty-counter-group">
                  <button class="qty-btn" data-action="decrement" data-index="${index}">-</button>
                  <span class="qty-num">${item.quantity || 1}</span>
                  <button class="qty-btn" data-action="increment" data-index="${index}">+</button>
                </div>
                <span class="cart-item-price">₹${((p.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button class="cart-item-remove-btn" data-action="remove" data-index="${index}" title="Remove item">✕</button>
          </div>
        `;
      }).join('');

      // Totals Calculation
      const subtotal = AppState.cart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);
      const shipping = subtotal >= AppState.freeShippingThreshold ? 0 : 99;
      let discount = 0;
      if (AppState.couponDiscountPercent > 0) {
        discount = Math.round(subtotal * (AppState.couponDiscountPercent / 100));
      } else if (AppState.couponFlatDiscount > 0) {
        discount = AppState.couponFlatDiscount;
      }
      const finalTotal = Math.max(0, subtotal + shipping - discount);

      const subtotalEl = document.getElementById('cart-subtotal');
      const shippingEl = document.getElementById('cart-shipping');
      const totalEl = document.getElementById('cart-total');
      const discountRow = document.getElementById('cart-discount-row');
      const discountAmt = document.getElementById('cart-discount-amt');

      if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
      if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
      
      if (discountRow) {
        if (discount > 0) {
          discountRow.style.display = 'flex';
          if (discountAmt) discountAmt.textContent = `-₹${discount.toLocaleString('en-IN')}`;
        } else {
          discountRow.style.display = 'none';
        }
      }

      if (totalEl) totalEl.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;

      // Free Shipping Progress
      const fillEl = document.getElementById('shipping-progress-fill');
      const textEl = document.getElementById('shipping-progress-text');
      if (fillEl && textEl) {
        if (subtotal >= AppState.freeShippingThreshold) {
          fillEl.style.width = '100%';
          textEl.innerHTML = `🎉 You unlocked <strong>FREE Express Shipping!</strong>`;
        } else {
          const remaining = AppState.freeShippingThreshold - subtotal;
          const percent = Math.min(100, Math.round((subtotal / AppState.freeShippingThreshold) * 100));
          fillEl.style.width = `${percent}%`;
          textEl.textContent = `Add ₹${remaining} more to unlock FREE Shipping!`;
        }
      }

      saveStoredCart();
    } catch (err) {
      console.warn('Cart sync notice:', err);
    }
  }

  function addToCart(productId, size = 'Free Size', color = 'Standard') {
    const product = AppState.products.find((p) => p.id === productId) || (window.AruviStore && window.AruviStore.getProductById(productId));
    if (!product) return;

    const existingIndex = AppState.cart.findIndex(
      (item) => item.product.id === productId && item.selectedSize === size
    );

    if (existingIndex > -1) {
      AppState.cart[existingIndex].quantity += 1;
    } else {
      AppState.cart.push({
        product: product,
        quantity: 1,
        selectedSize: size,
        selectedColor: color
      });
    }

    updateCartDrawerUI();
    showToast(`Added ${product.title} to your bag! 🛍️`, 'success');
  }

  function openCartDrawer() {
    if (!DOMElements.cartDrawer) {
      if (!window.location.pathname.endsWith('cart.html')) {
        window.location.href = 'cart.html';
      }
      return;
    }
    DOMElements.cartDrawer.classList.add('active');
    if (DOMElements.drawerBackdrop) DOMElements.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (DOMElements.cartDrawer) DOMElements.cartDrawer.classList.remove('active');
    if (DOMElements.drawerBackdrop) DOMElements.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     WISHLIST MANAGEMENT
     ========================================================================== */
  function toggleWishlist(productId, buttonElement) {
    const index = AppState.wishlist.indexOf(productId);
    const product = PRODUCTS.find((p) => p.id === productId);

    if (index > -1) {
      AppState.wishlist.splice(index, 1);
      if (buttonElement) buttonElement.classList.remove('active');
      showToast(`Removed from your Wishlist`, 'info');
    } else {
      AppState.wishlist.push(productId);
      if (buttonElement) {
        buttonElement.classList.add('active');
        if (window.triggerHeartBurst) window.triggerHeartBurst(buttonElement);
      }
      showToast(`Saved ${product ? product.title : ''} to Wishlist! ❤️`, 'love');
    }

    // Update Wishlist Header Badges
    DOMElements.wishlistCountBadges.forEach((badge) => {
      badge.textContent = AppState.wishlist.length;
      if (window.triggerBadgeBounce) window.triggerBadgeBounce(badge);
    });

    updateWishlistDrawerUI();
    saveStoredWishlist();
    renderProducts(AppState.filteredProducts);
  }

  function updateWishlistDrawerUI() {
    if (DOMElements.wishlistCountBadges) {
      DOMElements.wishlistCountBadges.forEach((badge) => {
        badge.textContent = AppState.wishlist.length;
        if (window.triggerBadgeBounce) window.triggerBadgeBounce(badge);
      });
    }

    if (!DOMElements.wishlistDrawer || !DOMElements.wishlistItemsList) return;

    if (AppState.wishlist.length === 0) {
      DOMElements.wishlistItemsList.style.display = 'none';
      if (DOMElements.wishlistEmptyState) DOMElements.wishlistEmptyState.style.display = 'flex';
      const footer = document.getElementById('wishlist-drawer-footer');
      if (footer) footer.style.display = 'none';
      return;
    }

    DOMElements.wishlistItemsList.style.display = 'flex';
    if (DOMElements.wishlistEmptyState) DOMElements.wishlistEmptyState.style.display = 'none';
    const footer = document.getElementById('wishlist-drawer-footer');
    if (footer) footer.style.display = 'block';

    const wishlistedProducts = PRODUCTS.filter((p) => AppState.wishlist.includes(p.id));

    DOMElements.wishlistItemsList.innerHTML = wishlistedProducts.map((p) => `
      <div class="cart-item-row" data-wishlist-item-id="${p.id}">
        <img src="${p.image}" alt="${p.title}" class="cart-item-img" />
        <div class="cart-item-info">
          <h4 class="cart-item-title">${p.title}</h4>
          <div class="cart-item-attr">${p.fabric.toUpperCase()} • ${p.category}</div>
          <div class="cart-item-bottom">
            <span class="cart-item-price">₹${p.price.toLocaleString('en-IN')}</span>
            <button class="btn btn-primary btn-sm btn-wishlist-to-cart" data-id="${p.id}" style="padding: 6px 14px; font-size: 0.76rem;">
              Move to Bag
            </button>
          </div>
        </div>
        <button class="cart-item-remove-btn btn-remove-wishlist" data-id="${p.id}" title="Remove">✕</button>
      </div>
    `).join('');
  }

  function openWishlistDrawer() {
    if (!DOMElements.wishlistDrawer) {
      if (!window.location.pathname.endsWith('wishlist.html')) {
        window.location.href = 'wishlist.html';
      }
      return;
    }
    updateWishlistDrawerUI();
    DOMElements.wishlistDrawer.classList.add('active');
    if (DOMElements.drawerBackdrop) DOMElements.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeWishlistDrawer() {
    if (!DOMElements.wishlistDrawer) return;
    DOMElements.wishlistDrawer.classList.remove('active');
    if (DOMElements.drawerBackdrop) DOMElements.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  window.closeWishlistDrawer = closeWishlistDrawer;
  window.openMobileNav = openMobileNav;
  window.closeMobileNav = closeMobileNav;


  /* ==========================================================================
     QUICK VIEW 3D MODAL
     ========================================================================== */
  function openQuickView(productId) {
    const product = AppState.products.find((p) => p.id === productId) || (window.AruviStore && window.AruviStore.getProductById(productId));
    if (!product || !DOMElements.quickViewModal) return;

    const modalBody = DOMElements.quickViewModal.querySelector('.modal-container');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <button class="modal-close-btn" id="modal-close-quickview">✕</button>
      <div class="modal-product-grid">
        <div class="modal-gallery-wrap">
          <img src="${product.image}" alt="${product.title}" class="modal-main-img" />
        </div>
        <div class="modal-details-col">
          <span class="modal-eyebrow">${product.category} • Authentic Heritage</span>
          <h2 class="modal-title">${product.title}</h2>
          
          <div class="product-rating-row" style="margin-bottom: 14px;">
            <span class="star-icons">★★★★★</span>
            <span class="rating-count">${product.rating} | 150+ Verified Reviews</span>
          </div>

          <div class="product-price-row" style="margin-bottom: 16px;">
            <span class="price-current" style="font-size: 1.6rem;">₹${product.price.toLocaleString('en-IN')}</span>
            <span class="price-original" style="font-size: 1.1rem;">₹${product.originalPrice.toLocaleString('en-IN')}</span>
            <span class="price-discount-tag">Save ₹${(product.originalPrice - product.price).toLocaleString('en-IN')}</span>
          </div>

          <p style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.7; margin-bottom: 18px;">
            ${product.tagline}
          </p>

          <div class="modal-specs-list">
            <div class="spec-item"><span class="spec-key">Fabric</span><span class="spec-val">${product.fabric.toUpperCase()}</span></div>
            <div class="spec-item"><span class="spec-key">Occasion</span><span class="spec-val">${product.occasion.toUpperCase()}</span></div>
            <div class="spec-item"><span class="spec-key">Care</span><span class="spec-val">Dry Clean Only</span></div>
            <div class="spec-item"><span class="spec-key">Blouse Piece</span><span class="spec-val">Included (80cm)</span></div>
          </div>

          <div style="margin-bottom: 22px;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 8px;">Select Size</label>
            <div style="display: flex; gap: 8px;">
              ${product.sizes.map((s, i) => `
                <button class="btn btn-secondary btn-sm size-selector-chip ${i === 0 ? 'active' : ''}" style="${i === 0 ? 'border-color: var(--color-primary); background: var(--color-mint-pale);' : ''}">${s}</button>
              `).join('')}
            </div>
          </div>

          <button class="btn hover-lift btn-ai-tryon" data-product-id="${product.id}" style="width: 100%; margin-bottom: 12px; background: linear-gradient(135deg, #0e2920 0%, #163e30 100%); color: #ffffff; border: 1.5px solid var(--color-gold); padding: 11px; border-radius: var(--radius-sm); font-weight: 700; font-size: 0.88rem; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
            <span>🪞 Try in AI Virtual Fitting Room</span>
          </button>

          <div style="display: flex; gap: 14px; margin-top: auto;">
            <button class="btn btn-primary" id="modal-btn-add-cart" style="flex: 2;">
              Add to Cart • ₹${product.price.toLocaleString('en-IN')}
            </button>
            <button class="btn btn-secondary" id="modal-btn-wishlist" style="flex: 1;">
              ❤️ Wishlist
            </button>
          </div>
        </div>
      </div>
    `;

    DOMElements.quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Modal action handlers
    const closeBtn = document.getElementById('modal-close-quickview');
    if (closeBtn) closeBtn.addEventListener('click', closeQuickView);

    const addBtn = document.getElementById('modal-btn-add-cart');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addToCart(product.id, product.sizes[0]);
        closeQuickView();
        openCartDrawer();
      });
    }

    const wishBtn = document.getElementById('modal-btn-wishlist');
    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        toggleWishlist(product.id);
      });
    }
  }

  function closeQuickView() {
    if (!DOMElements.quickViewModal) return;
    DOMElements.quickViewModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     CHECKOUT MODAL & ORDER CONFIRMATION
     ========================================================================== */
  function openCheckoutModal() {
    if (!DOMElements.checkoutModal) return;
    closeCartDrawer();
    DOMElements.checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    if (!DOMElements.checkoutModal) return;
    DOMElements.checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function processCheckoutOrder(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-confirm-order');
    if (btn) {
      btn.innerHTML = `<span class="btn-spinner"></span> Processing Secure Payment...`;
      btn.disabled = true;
    }

    setTimeout(() => {
      // Order ID & Calculation
      const orderId = 'ARUVI-' + Math.floor(100000 + Math.random() * 900000);
      const subtotal = AppState.cart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);
      const shipping = subtotal >= AppState.freeShippingThreshold ? 0 : 99;
      let discount = 0;
      if (AppState.couponDiscountPercent > 0) {
        discount = Math.round(subtotal * (AppState.couponDiscountPercent / 100));
      } else if (AppState.couponFlatDiscount > 0) {
        discount = AppState.couponFlatDiscount;
      }
      const finalTotal = Math.max(0, subtotal + shipping - discount);

      // Save Order to central data store
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        customerName: (document.getElementById('checkout-name') && document.getElementById('checkout-name').value.trim()) || 'Boutique Customer',
        customerPhone: (document.getElementById('checkout-phone') && document.getElementById('checkout-phone').value.trim()) || '',
        customerEmail: (document.getElementById('checkout-email') && document.getElementById('checkout-email').value.trim()) || 'customer@aruvicollections.com',
        shippingAddress: (document.getElementById('checkout-address') && document.getElementById('checkout-address').value.trim()) || 'Customer Address',
        items: JSON.parse(JSON.stringify(AppState.cart)),
        subtotal: subtotal,
        discount: discount,
        couponCode: AppState.appliedCoupon || '',
        deliveryFee: shipping,
        total: finalTotal,
        paymentMethod: 'UPI (Encrypted)',
        status: 'Confirmed',
        courier: 'BlueDart Express',
        trackingNumber: 'BD-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN'
      };

      try {
        const storedOrders = JSON.parse(localStorage.getItem('aruvi_orders') || '[]');
        storedOrders.unshift(newOrder);
        localStorage.setItem('aruvi_orders', JSON.stringify(storedOrders));
        window.dispatchEvent(new CustomEvent('aruvi:data_updated', { detail: { key: 'aruvi_orders', val: storedOrders } }));
      } catch (err) {
        console.warn('Failed saving order:', err);
      }

      // Order Success State
      const modalBody = DOMElements.checkoutModal.querySelector('.checkout-modal-container');
      if (modalBody) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 30px 10px;">
            <div style="font-size: 3.5rem; margin-bottom: 16px; animation: badge-pop 0.6s ease;">🎉</div>
            <h2 style="font-family: var(--font-serif); font-size: 2rem; color: var(--color-primary-dark); margin-bottom: 10px;">Order Placed Successfully!</h2>
            <p style="color: var(--color-text-muted); font-size: 0.92rem; margin-bottom: 24px; max-width: 420px; margin-left: auto; margin-right: auto;">
              Thank you for choosing Aruvi Collections. Your handcrafted drape is being prepared with utmost love and tradition. Order ID: <strong>#${orderId}</strong>
            </p>
            <div style="background: var(--color-mint-pale); border-radius: var(--radius-md); padding: 18px; margin-bottom: 28px; text-align: left;">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--color-primary); margin-bottom: 6px;">📦 Estimated Delivery: 3 Business Days via BlueDart Express</div>
              <div style="font-size: 0.78rem; color: var(--color-text-muted);">A confirmation SMS & WhatsApp dispatch tracking link has been sent to your mobile.</div>
            </div>
            <button class="btn btn-primary" id="btn-order-complete-close">Continue Shopping</button>
          </div>
        `;

        const closeSuccessBtn = document.getElementById('btn-order-complete-close');
        if (closeSuccessBtn) {
          closeSuccessBtn.addEventListener('click', () => {
            AppState.cart = [];
            saveStoredCart();
            updateCartDrawerUI();
            closeCheckoutModal();
          });
        }
      }
      showToast('Payment successful! Your order has been placed. 🎊', 'success');
    }, 1800);
  }

  /* ==========================================================================
     TOAST NOTIFICATION ENGINE
     ========================================================================== */
  function showToast(message, type = 'info') {
    if (!DOMElements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';

    let icon = '✨';
    let iconClass = 'toast-gold';
    if (type === 'success') {
      icon = '✓';
      iconClass = '';
    } else if (type === 'love') {
      icon = '❤️';
      iconClass = 'toast-gold';
    }

    toast.innerHTML = `
      <div class="toast-icon ${iconClass}">${icon}</div>
      <span>${message}</span>
      <div class="toast-progress-bar"></div>
    `;

    DOMElements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 350);
    }, 3200);
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */
  function bindEventListeners() {
    // Cart open/close triggers
    const headerCartBtn = document.getElementById('header-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    if (headerCartBtn) headerCartBtn.addEventListener('click', openCartDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
    if (DOMElements.drawerBackdrop) {
      DOMElements.drawerBackdrop.addEventListener('click', () => {
        closeCartDrawer();
        closeWishlistDrawer();
      });
    }

    // Wishlist Drawer Triggers & Actions
    const headerWishlistBtn = document.getElementById('header-wishlist-btn');
    const closeWishlistBtn = document.getElementById('close-wishlist-btn');
    const btnWishlistExplore = document.getElementById('btn-wishlist-explore');
    const btnMoveAllCart = document.getElementById('btn-move-all-cart');

    if (headerWishlistBtn) headerWishlistBtn.addEventListener('click', openWishlistDrawer);
    if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistDrawer);
    if (btnWishlistExplore) btnWishlistExplore.addEventListener('click', closeWishlistDrawer);

    if (btnMoveAllCart) {
      btnMoveAllCart.addEventListener('click', () => {
        const wishlisted = [...AppState.wishlist];
        wishlisted.forEach((id) => addToCart(id));
        AppState.wishlist = [];
        updateWishlistDrawerUI();
        renderProducts(AppState.filteredProducts);
        closeWishlistDrawer();
        openCartDrawer();
        showToast('Moved all wishlist items to bag! 🎉', 'success');
      });
    }

    if (DOMElements.wishlistItemsList) {
      DOMElements.wishlistItemsList.addEventListener('click', (e) => {
        const moveBtn = e.target.closest('.btn-wishlist-to-cart');
        if (moveBtn) {
          const id = moveBtn.dataset.id;
          addToCart(id);
          const idx = AppState.wishlist.indexOf(id);
          if (idx > -1) AppState.wishlist.splice(idx, 1);
          updateWishlistDrawerUI();
          renderProducts(AppState.filteredProducts);
          showToast('Moved item to bag! 🛍️', 'success');
          return;
        }

        const rmBtn = e.target.closest('.btn-remove-wishlist');
        if (rmBtn) {
          const id = rmBtn.dataset.id;
          const idx = AppState.wishlist.indexOf(id);
          if (idx > -1) AppState.wishlist.splice(idx, 1);
          updateWishlistDrawerUI();
          renderProducts(AppState.filteredProducts);
          showToast('Removed from wishlist', 'info');
          return;
        }
      });
    }

    // Cart actions (Quantity change, Remove item)
    if (DOMElements.cartItemsList) {
      DOMElements.cartItemsList.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index, 10);

        if (action === 'increment') {
          AppState.cart[index].quantity += 1;
          updateCartDrawerUI();
        } else if (action === 'decrement') {
          if (AppState.cart[index].quantity > 1) {
            AppState.cart[index].quantity -= 1;
          } else {
            AppState.cart.splice(index, 1);
          }
          updateCartDrawerUI();
        } else if (action === 'remove') {
          AppState.cart.splice(index, 1);
          updateCartDrawerUI();
          showToast('Item removed from cart', 'info');
        }
      });
    }

    // Apply Coupon Code
    const couponBtn = document.getElementById('btn-apply-coupon');
    const couponInput = document.getElementById('cart-coupon-input');
    if (couponBtn && couponInput) {
      couponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (!code) {
          showToast('Please enter a coupon code', 'info');
          return;
        }

        const subtotal = AppState.cart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);

        // Check AruviStore if available
        if (window.AruviStore) {
          const res = window.AruviStore.validateCoupon(code, subtotal);
          if (res.valid) {
            AppState.appliedCoupon = res.coupon.code;
            if (res.coupon.type === 'percentage') {
              AppState.couponDiscountPercent = res.coupon.value;
              AppState.couponFlatDiscount = 0;
            } else {
              AppState.couponDiscountPercent = 0;
              AppState.couponFlatDiscount = res.coupon.value;
            }
            updateCartDrawerUI();
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'info');
          }
          return;
        }

        // Fallback
        if (code === 'ARUVI20') {
          AppState.appliedCoupon = 'ARUVI20';
          AppState.couponDiscountPercent = 20;
          AppState.couponFlatDiscount = 0;
          updateCartDrawerUI();
          showToast('Coupon ARUVI20 applied! You saved 20% 🎉', 'success');
        } else {
          showToast('Invalid coupon code. Try ARUVI20', 'info');
        }
      });
    }

    // Checkout Modal Trigger
    const btnProceedCheckout = document.getElementById('btn-proceed-checkout');
    if (btnProceedCheckout) btnProceedCheckout.addEventListener('click', openCheckoutModal);

    const closeCheckoutBtn = document.getElementById('modal-close-checkout');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) checkoutForm.addEventListener('submit', processCheckoutOrder);

    // Product Grid Action Delegation (Quick View, Add to Cart, Wishlist, Storefront Admin Edit & Delete)
    if (DOMElements.productsGrid) {
      DOMElements.productsGrid.addEventListener('click', (e) => {
        // Storefront Admin: Edit Product
        const editBtn = e.target.closest('.btn-card-admin-edit');
        if (editBtn) {
          e.preventDefault();
          e.stopPropagation();
          const pId = editBtn.getAttribute('data-edit-id');
          openStorefrontProductModal(pId);
          return;
        }

        // Storefront Admin: Delete Product
        const deleteBtn = e.target.closest('.btn-card-admin-delete');
        if (deleteBtn) {
          e.preventDefault();
          e.stopPropagation();
          const pId = deleteBtn.getAttribute('data-delete-id');
          deleteProductStorefront(pId);
          return;
        }

        // Quick view
        const qvBtn = e.target.closest('.btn-quick-view');
        if (qvBtn) {
          e.preventDefault();
          const qvId = qvBtn.getAttribute('data-quickview-id');
          openQuickView(qvId);
          return;
        }

        // Add to cart
        const cartBtn = e.target.closest('.btn-card-cart');
        if (cartBtn) {
          e.preventDefault();
          const pId = cartBtn.getAttribute('data-cart-id');
          const product = AppState.products.find((p) => p.id === pId) || (window.AruviStore && window.AruviStore.getProductById(pId));
          if (window.triggerFlyToCart && product) {
            window.triggerFlyToCart(cartBtn, product.image);
          }
          addToCart(pId);
          return;
        }

        // Wishlist
        const wishBtn = e.target.closest('.btn-wishlist');
        if (wishBtn) {
          e.preventDefault();
          const wId = wishBtn.getAttribute('data-wishlist-id');
          toggleWishlist(wId, wishBtn);
          return;
        }
      });
    }

    // Category Circles Filter
    document.querySelectorAll('.category-circle-item').forEach((item) => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        document.querySelectorAll('.category-circle-item').forEach((c) => c.classList.remove('active'));
        if (AppState.activeCategory === cat) {
          AppState.activeCategory = 'all';
        } else {
          AppState.activeCategory = cat;
          item.classList.add('active');
        }
        applyFilters();
      });
    });

    // Filter Tabs (Fresh, Bestsellers, etc.)
    document.querySelectorAll('.filter-tab-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-tab-pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        AppState.activeTab = pill.dataset.tab;
        applyFilters();
      });
    });

    // Price Slider
    if (DOMElements.priceSlider) {
      DOMElements.priceSlider.addEventListener('input', (e) => {
        AppState.maxPrice = parseInt(e.target.value, 10);
        if (DOMElements.priceValueDisplay) {
          DOMElements.priceValueDisplay.textContent = `₹${AppState.maxPrice.toLocaleString('en-IN')}`;
        }
        applyFilters();
      });
    }

    // Color Swatches
    document.querySelectorAll('.color-swatch-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        if (AppState.activeColor === color) {
          AppState.activeColor = null;
          btn.classList.remove('active');
        } else {
          document.querySelectorAll('.color-swatch-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          AppState.activeColor = color;
        }
        applyFilters();
      });
    });

    // Fabric Checkboxes
    document.querySelectorAll('input[name="filter-fabric"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        AppState.selectedFabrics = Array.from(document.querySelectorAll('input[name="filter-fabric"]:checked')).map(
          (c) => c.value
        );
        applyFilters();
      });
    });

    // Occasion Checkboxes
    document.querySelectorAll('input[name="filter-occasion"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        AppState.selectedOccasions = Array.from(document.querySelectorAll('input[name="filter-occasion"]:checked')).map(
          (c) => c.value
        );
        applyFilters();
      });
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById('btn-clear-filters');
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', resetAllFilters);

    // Search bar input
    if (DOMElements.headerSearchInput) {
      DOMElements.headerSearchInput.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value;
        applyFilters();
      });
    }

    // Quick View Overlay click outside to close
    if (DOMElements.quickViewModal) {
      DOMElements.quickViewModal.addEventListener('click', (e) => {
        if (e.target === DOMElements.quickViewModal) closeQuickView();
      });
    }

    // Checkout Overlay click outside to close
    if (DOMElements.checkoutModal) {
      DOMElements.checkoutModal.addEventListener('click', (e) => {
        if (e.target === DOMElements.checkoutModal) closeCheckoutModal();
      });
    }

    // Mobile Nav Drawer Toggle
    document.querySelectorAll('.mobile-menu-toggle').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileNav();
      });
    });

    document.querySelectorAll('#close-mobile-nav, #mobile-nav-close, .mobile-nav-close, .drawer-close-btn').forEach((btn) => {
      btn.addEventListener('click', closeMobileNav);
    });

    // Mobile Filter Drawer Toggle (Shop Page)
    const toggleFilterBtn = document.getElementById('btn-toggle-mobile-filters');
    const closeFilterBtn = document.getElementById('btn-close-mobile-filters');
    const filterSidebar = document.getElementById('catalog-filter-sidebar') || document.querySelector('.filter-sidebar');
    
    if (toggleFilterBtn && filterSidebar) {
      toggleFilterBtn.addEventListener('click', () => {
        let backdrop = document.getElementById('drawer-backdrop');
        if (!backdrop) {
          backdrop = document.createElement('div');
          backdrop.id = 'drawer-backdrop';
          backdrop.className = 'drawer-backdrop';
          document.body.appendChild(backdrop);
        }
        filterSidebar.classList.add('active');
        backdrop.classList.add('active');
        if (closeFilterBtn) closeFilterBtn.style.display = 'inline-flex';
        backdrop.onclick = () => {
          filterSidebar.classList.remove('active');
          backdrop.classList.remove('active');
        };
      });

      if (closeFilterBtn) {
        closeFilterBtn.addEventListener('click', () => {
          filterSidebar.classList.remove('active');
          const backdrop = document.getElementById('drawer-backdrop');
          if (backdrop) backdrop.classList.remove('active');
        });
      }
    }

    // Horizontal Scrollable Category Pills Bar (Shop Page)
    document.querySelectorAll('.shop-cat-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.shop-cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat');
        AppState.activeCategory = cat;

        // sync checkboxes
        document.querySelectorAll('input[name="filter-cat"]').forEach((chk) => {
          chk.checked = (cat === 'all') ? false : (chk.value === cat);
        });

        updateCategoryHeader(cat);
        applyFilters();
      });
    });

    // Sort Dropdown on Shop Page
    const sortSelect = document.getElementById('catalog-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        AppState.sortBy = e.target.value;
        applyFilters();
      });
    }

    // Category Checkboxes on Shop Page
    document.querySelectorAll('input[name="filter-cat"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        const checkedBoxes = Array.from(document.querySelectorAll('input[name="filter-cat"]:checked'));
        if (checkedBoxes.length === 1) {
          AppState.activeCategory = checkedBoxes[0].value;
          updateCategoryHeader(checkedBoxes[0].value);
        } else if (checkedBoxes.length > 1) {
          AppState.activeCategory = chk.value;
          updateCategoryHeader(chk.value);
        } else {
          AppState.activeCategory = 'all';
        }
        applyFilters();
      });
    });

    // Discount Checkboxes on Shop Page
    document.querySelectorAll('input[name="filter-discount"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        const checkedVals = Array.from(document.querySelectorAll('input[name="filter-discount"]:checked')).map((c) => parseInt(c.value, 10));
        AppState.minDiscount = checkedVals.length > 0 ? Math.min(...checkedVals) : 0;
        applyFilters();
      });
    });

    // Size Filter Chips on Shop Page
    document.querySelectorAll('.filter-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size || btn.textContent.trim();
        const idx = AppState.selectedSizes.indexOf(size);
        if (idx > -1) {
          AppState.selectedSizes.splice(idx, 1);
          btn.classList.remove('active');
        } else {
          AppState.selectedSizes.push(size);
          btn.classList.add('active');
        }
        applyFilters();
      });
    });

    // Newsletter submit
    const newsletterForm = document.getElementById('footer-newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        if (input && input.value) {
          showToast(`Subscribed! Enjoy 20% off with ARUVI20 💌`, 'success');
          input.value = '';
        }
      });
    }
  }

  /* ==========================================================================
     SYNC STOREFRONT FROM ADMIN DASHBOARD SETTINGS
     ========================================================================== */
  function syncStorefrontSettings() {
    try {
      // Sync Top Announcement Bar
      const annData = localStorage.getItem('aruvi_announcement');
      if (annData) {
        const ann = JSON.parse(annData);
        const annBar = document.querySelector('.announcement-bar');
        if (annBar) {
          if (ann.enabled === false) {
            annBar.style.display = 'none';
          } else {
            annBar.style.display = '';
            const promoSpan = annBar.querySelector('.announcement-promo span:last-child');
            const promoTag = annBar.querySelector('.announcement-tag');
            if (promoSpan && ann.text) promoSpan.textContent = ann.text;
            if (promoTag && ann.tag) promoTag.textContent = ann.tag;
          }
        }
      }

      // Sync Hero Banner on index.html
      const heroData = localStorage.getItem('aruvi_hero');
      if (heroData) {
        const hero = JSON.parse(heroData);
        const heroBadge = document.querySelector('.hero-badge-pill span:last-child');
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroImg = document.querySelector('.hero-image-card img');
        if (heroBadge && hero.badge) heroBadge.textContent = hero.badge;
        if (heroTitle && hero.title) heroTitle.innerHTML = hero.title;
        if (heroSubtitle && hero.subtitle) heroSubtitle.textContent = hero.subtitle;
        if (heroImg && hero.image) heroImg.src = hero.image;
      }
    } catch (e) {
      console.warn('Sync storefront settings error', e);
    }
  }

  /* ==========================================================================
     STOREFRONT ADMIN SYSTEM & PRODUCT MANAGEMENT CONTROLLER
     Gives admin 100% control over the entire website directly from the storefront!
     ========================================================================== */
  function initStorefrontAdmin() {
    const isAdmin = window.AruviStore && window.AruviStore.isAdmin();
    
    // Toggle body class
    document.body.classList.toggle('admin-mode-active', !!isAdmin);

    // 1. Manage Top Admin Bar
    let adminBar = document.getElementById('aruvi-storefront-admin-bar');
    if (isAdmin) {
      const adminEmail = window.AruviStore.getAdminEmail();
      if (!adminBar) {
        adminBar = document.createElement('div');
        adminBar.id = 'aruvi-storefront-admin-bar';
        adminBar.className = 'storefront-admin-bar';
        document.body.prepend(adminBar);
      }
      adminBar.innerHTML = `
        <div class="admin-bar-inner">
          <div class="admin-bar-left">
            <span class="admin-crown-badge">👑 Admin Mode Active</span>
            <span class="admin-email-tag">Logged in: <strong>${escapeHtml(adminEmail)}</strong></span>
          </div>
          <div class="admin-bar-right">
            <button id="btn-admin-bar-add" class="admin-bar-btn admin-bar-btn-add">
              ✨ + Add Product
            </button>
            <a href="admin.html" class="admin-bar-btn admin-bar-btn-portal" target="_blank">
              📊 Admin Dashboard
            </a>
            <button id="btn-admin-bar-logout" class="admin-bar-btn admin-bar-btn-logout">
              🚪 Logout
            </button>
          </div>
        </div>
      `;

      // Bind Top Admin Bar buttons
      const barAddBtn = document.getElementById('btn-admin-bar-add');
      if (barAddBtn) {
        barAddBtn.onclick = function () {
          const defaultCat = AppState.activeCategory && AppState.activeCategory !== 'all' ? AppState.activeCategory : 'sarees';
          openStorefrontProductModal(null, defaultCat);
        };
      }

      const barLogoutBtn = document.getElementById('btn-admin-bar-logout');
      if (barLogoutBtn) {
        barLogoutBtn.onclick = function () {
          if (confirm('Log out of Boutique Admin Mode?')) {
            window.AruviStore.logout();
            showToast('Logged out of Admin Mode', 'info');
            initStorefrontAdmin();
            applyFilters();
          }
        };
      }
    } else if (adminBar) {
      adminBar.remove();
    }

    // 2. Service Pages & Home Page "Add Product" button
    renderServiceAddProductButton(isAdmin);

    // 3. Inject Storefront Add/Edit Product Modal
    injectStorefrontProductModal();
  }

  function renderServiceAddProductButton(isAdmin) {
    // 2a. On shop.html (Service Pages)
    const shopSortSelect = document.getElementById('catalog-sort-select');
    const shopToolbar = shopSortSelect ? shopSortSelect.parentElement : null;
    let serviceBtnBox = document.getElementById('service-admin-action-box');

    if (isAdmin) {
      const activeCat = AppState.activeCategory && AppState.activeCategory !== 'all' ? AppState.activeCategory : null;
      const catMeta = activeCat && CATEGORY_META[activeCat] ? CATEGORY_META[activeCat] : null;
      const btnLabel = catMeta ? `✨ + Add ${catMeta.title} Product` : '✨ + Add New Product';

      if (shopToolbar) {
        if (!serviceBtnBox) {
          serviceBtnBox = document.createElement('div');
          serviceBtnBox.id = 'service-admin-action-box';
          serviceBtnBox.className = 'service-admin-action-box';
          shopToolbar.parentElement.insertBefore(serviceBtnBox, shopToolbar.nextSibling);
        }
        serviceBtnBox.innerHTML = `
          <button id="btn-service-add-product" class="btn btn-primary hover-lift" style="display:inline-flex;align-items:center;gap:8px;font-weight:700;border:1.5px solid var(--color-gold);padding:8px 20px;border-radius:var(--radius-full);cursor:pointer;background:var(--color-primary);color:#fff;box-shadow:var(--shadow-sm);">
            ${btnLabel}
          </button>
        `;
        const serviceBtn = document.getElementById('btn-service-add-product');
        if (serviceBtn) {
          serviceBtn.onclick = function () {
            openStorefrontProductModal(null, activeCat || 'sarees');
          };
        }
      }

      // Also on Home Page (index.html) catalog section
      const catalogHeader = document.querySelector('.section-header-block');
      let homeAddBtn = document.getElementById('btn-home-admin-add');
      if (catalogHeader) {
        if (!homeAddBtn) {
          homeAddBtn = document.createElement('button');
          homeAddBtn.id = 'btn-home-admin-add';
          homeAddBtn.className = 'btn btn-primary hover-lift';
          homeAddBtn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;font-weight:700;border:1.5px solid var(--color-gold);padding:8px 20px;border-radius:var(--radius-full);cursor:pointer;background:var(--color-primary);color:#fff;box-shadow:var(--shadow-sm);margin-top:10px;';
          homeAddBtn.innerHTML = '✨ + Add Product to Catalog';
          catalogHeader.appendChild(homeAddBtn);
        }
        homeAddBtn.onclick = function () {
          openStorefrontProductModal(null, AppState.activeCategory !== 'all' ? AppState.activeCategory : 'sarees');
        };
      }
    } else {
      if (serviceBtnBox) serviceBtnBox.remove();
      const homeAddBtn = document.getElementById('btn-home-admin-add');
      if (homeAddBtn) homeAddBtn.remove();
    }
  }

  function injectStorefrontProductModal() {
    if (document.getElementById('storefront-product-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'storefront-product-modal';
    modal.className = 'sf-modal-overlay';
    modal.innerHTML = `
      <div class="sf-modal-card">
        <div class="sf-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.4rem;">🛍️</span>
            <div>
              <h3 id="sf-modal-title" style="font-family:var(--font-serif);font-size:1.35rem;color:var(--color-primary-dark);margin:0;">Add New Product</h3>
              <p style="font-size:0.76rem;color:var(--color-text-muted);margin:0;">Instantly published to Home Page & relevant Service Collection</p>
            </div>
          </div>
          <button type="button" id="btn-close-sf-modal" class="sf-modal-close" aria-label="Close modal">&times;</button>
        </div>

        <form id="sf-product-form" style="padding:22px 26px;">
          <input type="hidden" id="sf-input-id" value="">

          <div class="sf-form-row sf-row-2">
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-title">Product Title *</label>
              <input type="text" id="sf-input-title" class="sf-input" required placeholder="e.g. Royal Kanjivaram Silk Saree">
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-category">Service / Collection *</label>
              <select id="sf-input-category" class="sf-select" required>
                <option value="sarees">1. Sarees</option>
                <option value="salwar">2. Salwar</option>
                <option value="sharara">3. Sharara</option>
                <option value="ethnic-wears">4. Ethnic Wears</option>
                <option value="co-ord-sets">5. Co-ord Sets</option>
                <option value="western-tops">6. Western Tops</option>
                <option value="kids">7. Kids</option>
              </select>
            </div>
          </div>

          <div class="sf-form-row sf-row-3">
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-price">Offer Price (₹) *</label>
              <input type="number" id="sf-input-price" class="sf-input" required min="1" placeholder="4999">
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-orig-price">Original MRP (₹) *</label>
              <input type="number" id="sf-input-orig-price" class="sf-input" required min="1" placeholder="6499">
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-stock">Stock Count *</label>
              <input type="number" id="sf-input-stock" class="sf-input" required min="1" value="15">
            </div>
          </div>

          <div class="sf-form-row sf-row-3">
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-fabric">Fabric Type</label>
              <select id="sf-input-fabric" class="sf-select">
                <option value="silk">Pure Silk</option>
                <option value="georgette">Georgette & Chiffon</option>
                <option value="cotton">Handloom Cotton</option>
                <option value="velvet">Royal Velvet</option>
                <option value="chanderi">Chanderi Silk</option>
              </select>
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-occasion">Occasion</label>
              <select id="sf-input-occasion" class="sf-select">
                <option value="wedding">Wedding & Bridal</option>
                <option value="festive">Festive & Celebrations</option>
                <option value="party">Party & Reception</option>
                <option value="daily">Daily & Work Wear</option>
              </select>
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-color">Primary Color</label>
              <select id="sf-input-color" class="sf-select">
                <option value="green">Emerald Green</option>
                <option value="red">Ruby Red</option>
                <option value="purple">Royal Wine / Purple</option>
                <option value="mustard">Mustard Gold</option>
                <option value="mint">Mint Green</option>
                <option value="peach">Blush Peach</option>
                <option value="gold">Antique Zari Gold</option>
              </select>
            </div>
          </div>

          <div class="sf-form-row sf-row-2">
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-badge">Highlight Badge</label>
              <select id="sf-input-badge" class="sf-select">
                <option value="">No Badge</option>
                <option value="Bestseller">Bestseller (Gold Tag)</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Handwoven">Handwoven</option>
                <option value="Royal Bridal">Royal Bridal</option>
                <option value="Fresh Style">Fresh Style</option>
                <option value="Popular">Popular</option>
              </select>
            </div>
            <div class="sf-form-group">
              <label class="sf-label" for="sf-input-sizes">Available Sizes</label>
              <input type="text" id="sf-input-sizes" class="sf-input" value="Free Size, S, M, L, XL" placeholder="Free Size, S, M, L, XL">
            </div>
          </div>

          <div class="sf-form-group">
            <label class="sf-label" for="sf-input-image">Product Image URL or Upload</label>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
              <input type="text" id="sf-input-image" class="sf-input" style="flex:1;" placeholder="assets/images/kanjivaram_green.jpg or https://..." value="assets/images/kanjivaram_green.jpg" required>
              <label class="btn btn-secondary btn-sm" style="margin:0;white-space:nowrap;padding:9px 14px;cursor:pointer;font-size:0.8rem;border:1px solid var(--color-border);">
                📁 Upload Photo
                <input type="file" id="sf-input-file" accept="image/*" style="display:none;">
              </label>
            </div>

            <div style="font-size:0.75rem;color:var(--color-text-muted);margin-bottom:6px;">Or pick from luxury boutique presets:</div>
            <div class="sf-presets-row" id="sf-presets-container">
              <img src="assets/images/kanjivaram_green.jpg" alt="Preset 1" class="sf-preset-thumb active" data-src="assets/images/kanjivaram_green.jpg" />
              <img src="assets/images/banarasi_saree.jpg" alt="Preset 2" class="sf-preset-thumb" data-src="assets/images/banarasi_saree.jpg" />
              <img src="assets/images/anarkali_suit.jpg" alt="Preset 3" class="sf-preset-thumb" data-src="assets/images/anarkali_suit.jpg" />
              <img src="assets/images/cotton_saree.jpg" alt="Preset 4" class="sf-preset-thumb" data-src="assets/images/cotton_saree.jpg" />
              <img src="assets/images/lehenga_set.jpg" alt="Preset 5" class="sf-preset-thumb" data-src="assets/images/lehenga_set.jpg" />
              <img src="assets/images/festive_promo.jpg" alt="Preset 6" class="sf-preset-thumb" data-src="assets/images/festive_promo.jpg" />
              <img src="assets/images/printed_georgette.jpg" alt="Preset 7" class="sf-preset-thumb" data-src="assets/images/printed_georgette.jpg" />
              <img src="assets/images/western_ethnic.jpg" alt="Preset 8" class="sf-preset-thumb" data-src="assets/images/western_ethnic.jpg" />
              <img src="assets/images/premium_fabrics.jpg" alt="Preset 9" class="sf-preset-thumb" data-src="assets/images/premium_fabrics.jpg" />
              <img src="assets/images/kurti_wear.jpg" alt="Preset 10" class="sf-preset-thumb" data-src="assets/images/kurti_wear.jpg" />
            </div>
          </div>

          <div class="sf-form-group">
            <label class="sf-label" for="sf-input-tagline">Tagline & Description</label>
            <textarea id="sf-input-tagline" class="sf-input" rows="2" placeholder="Exquisite handcrafted drape featuring delicate gold zari motifs and authentic silk weave."></textarea>
          </div>

          <div class="sf-modal-footer">
            <button type="button" id="btn-cancel-sf-modal" class="btn btn-secondary">Cancel</button>
            <button type="submit" id="btn-submit-sf-modal" class="btn btn-primary" style="border:1.5px solid var(--color-gold);">
              <span>✨ Save & Publish Product</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Modal Events
    const closeBtn = document.getElementById('btn-close-sf-modal');
    const cancelBtn = document.getElementById('btn-cancel-sf-modal');
    function closeModal() {
      modal.classList.remove('active');
    }
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = function (e) {
      if (e.target === modal) closeModal();
    };

    // Preset selection
    modal.querySelectorAll('.sf-preset-thumb').forEach(function (thumb) {
      thumb.onclick = function () {
        modal.querySelectorAll('.sf-preset-thumb').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        const imgInput = document.getElementById('sf-input-image');
        if (imgInput) imgInput.value = this.getAttribute('data-src');
      };
    });

    // File upload via Firebase Storage
    const fileIn = document.getElementById('sf-input-file');
    if (fileIn) {
      fileIn.onchange = function (e) {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const label = fileIn.parentElement;
          if (label) label.innerHTML = '⏳ Uploading...<input type="file" id="sf-input-file" accept="image/*" style="display:none;">';

          if (window.AruviFirebaseStorage && typeof window.AruviFirebaseStorage.uploadProductImage === 'function') {
            window.AruviFirebaseStorage.uploadProductImage(file).then(function (result) {
              const imgInput = document.getElementById('sf-input-image');
              if (imgInput) imgInput.value = result.url;
              if (label) label.innerHTML = '🔥 Firebase Stored<input type="file" id="sf-input-file" accept="image/*" style="display:none;">';
              modal.querySelectorAll('.sf-preset-thumb').forEach(function (t) { t.classList.remove('active'); });
              if (window.Aruvi && window.Aruvi.showToast) {
                window.Aruvi.showToast('Product photo uploaded to Firebase Storage! 🔥', 'success');
              }
            });
          } else {
            const reader = new FileReader();
            reader.onload = function (ev) {
              const imgInput = document.getElementById('sf-input-image');
              if (imgInput) imgInput.value = ev.target.result;
              if (label) label.innerHTML = '📁 Photo Ready<input type="file" id="sf-input-file" accept="image/*" style="display:none;">';
              modal.querySelectorAll('.sf-preset-thumb').forEach(function (t) { t.classList.remove('active'); });
            };
            reader.readAsDataURL(file);
          }
        }
      };
    }

    // Form Submit
    const form = document.getElementById('sf-product-form');
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        saveStorefrontProductForm();
      };
    }
  }

  function openStorefrontProductModal(productId, defaultCategory) {
    injectStorefrontProductModal();
    const modal = document.getElementById('storefront-product-modal');
    if (!modal) return;

    const titleEl = document.getElementById('sf-modal-title');
    const form = document.getElementById('sf-product-form');
    if (form) form.reset();

    const idInput = document.getElementById('sf-input-id');
    const titleInput = document.getElementById('sf-input-title');
    const catInput = document.getElementById('sf-input-category');
    const priceInput = document.getElementById('sf-input-price');
    const origPriceInput = document.getElementById('sf-input-orig-price');
    const stockInput = document.getElementById('sf-input-stock');
    const fabricInput = document.getElementById('sf-input-fabric');
    const occasionInput = document.getElementById('sf-input-occasion');
    const colorInput = document.getElementById('sf-input-color');
    const badgeInput = document.getElementById('sf-input-badge');
    const sizesInput = document.getElementById('sf-input-sizes');
    const imageInput = document.getElementById('sf-input-image');
    const taglineInput = document.getElementById('sf-input-tagline');

    if (productId) {
      // Edit Mode
      const product = window.AruviStore ? window.AruviStore.getProductById(productId) : null;
      if (!product) return;

      if (titleEl) titleEl.textContent = 'Edit Product: ' + product.title;
      if (idInput) idInput.value = product.id;
      if (titleInput) titleInput.value = product.title || '';
      if (catInput) catInput.value = product.category || 'sarees';
      if (priceInput) priceInput.value = product.price || '';
      if (origPriceInput) origPriceInput.value = product.originalPrice || product.price || '';
      if (stockInput) stockInput.value = product.stock || 15;
      if (fabricInput) fabricInput.value = product.fabric || 'silk';
      if (occasionInput) occasionInput.value = product.occasion || 'wedding';
      if (colorInput) colorInput.value = product.color || 'green';
      if (badgeInput) badgeInput.value = product.badge || '';
      if (sizesInput) sizesInput.value = Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || 'Free Size');
      if (imageInput) imageInput.value = product.image || 'assets/images/kanjivaram_green.jpg';
      if (taglineInput) taglineInput.value = product.tagline || '';
    } else {
      // Create Mode
      if (titleEl) titleEl.textContent = 'Add New Collection Item';
      if (idInput) idInput.value = 'p_' + Date.now();
      if (catInput) catInput.value = defaultCategory || (AppState.activeCategory !== 'all' ? AppState.activeCategory : 'sarees');
      if (stockInput) stockInput.value = 15;
      if (sizesInput) sizesInput.value = 'Free Size, S, M, L, XL';
      if (imageInput) imageInput.value = 'assets/images/kanjivaram_green.jpg';
    }

    // Highlight preset if matches
    modal.querySelectorAll('.sf-preset-thumb').forEach(function (thumb) {
      thumb.classList.toggle('active', thumb.getAttribute('data-src') === (imageInput ? imageInput.value : ''));
    });

    modal.classList.add('active');
  }

  function saveStorefrontProductForm() {
    if (!window.AruviStore) return;
    const id = document.getElementById('sf-input-id').value || ('p_' + Date.now());
    const title = document.getElementById('sf-input-title').value.trim();
    const category = document.getElementById('sf-input-category').value;
    const price = parseInt(document.getElementById('sf-input-price').value, 10) || 0;
    const originalPrice = parseInt(document.getElementById('sf-input-orig-price').value, 10) || price;
    const stock = parseInt(document.getElementById('sf-input-stock').value, 10) || 10;
    const fabric = document.getElementById('sf-input-fabric').value;
    const occasion = document.getElementById('sf-input-occasion').value;
    const color = document.getElementById('sf-input-color').value;
    const badge = document.getElementById('sf-input-badge').value;
    const sizesRaw = document.getElementById('sf-input-sizes').value;
    const sizes = sizesRaw.split(',').map(s => s.trim()).filter(Boolean);
    const image = document.getElementById('sf-input-image').value.trim() || 'assets/images/kanjivaram_green.jpg';
    const tagline = document.getElementById('sf-input-tagline').value.trim();

    const productData = {
      id: id,
      title: title,
      category: category,
      price: price,
      originalPrice: originalPrice,
      stock: stock,
      fabric: fabric,
      occasion: occasion,
      color: color,
      badge: badge,
      badgeType: badge === 'Bestseller' ? 'tag-gold' : '',
      sizes: sizes.length ? sizes : ['Free Size'],
      image: image,
      tagline: tagline,
      rating: 4.9,
      reviews: 18,
      status: 'active'
    };

    window.AruviStore.saveProduct(productData);

    const modal = document.getElementById('storefront-product-modal');
    if (modal) modal.classList.remove('active');

    showToast(`Product "${productData.title}" published! 🌿`, 'success');
    
    // Refresh storefront catalog
    AppState.products = window.AruviStore.getProducts();
    applyFilters();
  }

  function deleteProductStorefront(productId) {
    if (!window.AruviStore) return;
    const product = window.AruviStore.getProductById(productId);
    const title = product ? product.title : 'this product';

    if (confirm(`Are you sure you want to permanently delete "${title}" from the boutique catalog?`)) {
      window.AruviStore.deleteProduct(productId);
      showToast(`"${title}" has been deleted.`, 'info');
      AppState.products = window.AruviStore.getProducts();
      applyFilters();
    }
  }

  /* ==========================================================================
     INIT APP ON DOM LOAD & GLOBAL EXPORT
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    parseURLParameters();
    syncStorefrontSettings();
    initStorefrontAdmin();
    if (DOMElements.productsGrid) {
      applyFilters();
    }
    updateCartDrawerUI();
    updateWishlistDrawerUI();
    bindEventListeners();

    // Real-time synchronization when admin updates catalog/settings/auth across website & tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'aruvi_products') {
        AppState.products = loadStoredProducts();
        applyFilters();
      }
      if (e.key === 'aruvi_admin_logged_in') {
        initStorefrontAdmin();
        applyFilters();
      }
      if (e.key === 'aruvi_announcement' || e.key === 'aruvi_hero') {
        syncStorefrontSettings();
      }
    });

    window.addEventListener('aruvi:data_updated', (e) => {
      if (e.detail && e.detail.key === 'aruvi_products') {
        AppState.products = loadStoredProducts();
        applyFilters();
      }
      if (e.detail && e.detail.key === 'aruvi_admin_logged_in') {
        initStorefrontAdmin();
        applyFilters();
      }
      syncStorefrontSettings();
    });

    window.addEventListener('aruvi:admin_auth_changed', () => {
      initStorefrontAdmin();
      applyFilters();
    });
  });

  // Global API for all separate pages
  window.Aruvi = {
    PRODUCTS: AppState.products,
    AppState,
    addToCart,
    toggleWishlist,
    openCartDrawer,
    closeCartDrawer,
    openWishlistDrawer,
    closeWishlistDrawer,
    openMobileNav,
    closeMobileNav,
    openQuickView,
    closeQuickView,
    showToast,
    updateCartDrawerUI,
    updateWishlistDrawerUI,
    renderProducts,
    applyFilters,
    parseURLParameters,
    updateCategoryHeader,
    saveStoredCart,
    saveStoredWishlist
  };

})();

