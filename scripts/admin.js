/**
 * ARUVI COLLECTIONS - ADMIN DASHBOARD CONTROLLER
 * Full management system for Products, Orders, Categories, Coupons, Banners, Customers & Store Settings.
 */

(function () {
  'use strict';

  // Make sure AruviStore is available
  if (typeof window.AruviStore === 'undefined') {
    console.error('AruviStore data layer is missing!');
    return;
  }

  const Store = window.AruviStore;

  // Admin Controller State
  const AdminState = {
    activeTab: 'dashboard',
    selectedOrder: null,
    editingProduct: null,
    editingCategory: null,
    editingCustomer: null,
    productFilter: {
      search: '',
      category: 'all',
      stock: 'all',
      sort: 'default'
    },
    orderFilter: {
      search: '',
      status: 'all'
    },
    notifications: []
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const DOM = {
    // Auth (Strictly for aruvicollections.25@gmail.com)
    authOverlay: document.getElementById('admin-auth-overlay'),
    btnAdminGoogle: document.getElementById('btn-admin-google-login'),
    formAdminLogin: document.getElementById('form-admin-direct-login'),
    adminInputEmail: document.getElementById('admin-input-email'),
    adminInputPassword: document.getElementById('admin-input-password'),
    authStatusAlert: document.getElementById('auth-status-alert'),
    btnLogout: document.getElementById('btn-admin-logout'),

    // Navigation & Layout
    sidebar: document.getElementById('admin-sidebar'),
    sidebarToggle: document.getElementById('mobile-sidebar-toggle'),
    navLinks: document.querySelectorAll('.admin-nav-link'),
    tabPanes: document.querySelectorAll('.admin-tab-pane'),
    breadcrumbCurrent: document.getElementById('breadcrumb-current'),
    globalSearch: document.getElementById('admin-global-search-input'),
    toastContainer: document.getElementById('admin-toast-container'),

    // Overview Stats
    statRevenue: document.getElementById('stat-total-revenue'),
    statOrders: document.getElementById('stat-total-orders'),
    statProducts: document.getElementById('stat-total-products'),
    statCustomers: document.getElementById('stat-total-customers'),
    recentOrdersBody: document.getElementById('recent-orders-table-body'),
    lowStockList: document.getElementById('low-stock-alert-list'),
    badgePendingOrders: document.getElementById('badge-pending-orders'),
    badgeLowStock: document.getElementById('badge-low-stock'),

    // Products
    productsTableBody: document.getElementById('products-table-body'),
    prodSearchInput: document.getElementById('prod-search-input'),
    prodCategoryFilter: document.getElementById('prod-category-filter'),
    prodStockFilter: document.getElementById('prod-stock-filter'),
    btnOpenAddProduct: document.getElementById('btn-open-add-product'),
    modalProduct: document.getElementById('modal-product'),
    modalProductTitle: document.getElementById('modal-product-title'),
    formProduct: document.getElementById('form-product'),

    // Orders
    ordersTableBody: document.getElementById('orders-table-body'),
    orderSearchInput: document.getElementById('order-search-input'),
    orderStatusFilterTabs: document.querySelectorAll('.order-status-tab'),
    modalOrderDetails: document.getElementById('modal-order-details'),
    orderDetailsContent: document.getElementById('order-details-modal-content'),

    // Categories
    categoriesGrid: document.getElementById('categories-grid'),
    btnOpenAddCategory: document.getElementById('btn-open-add-category'),
    modalCategory: document.getElementById('modal-category'),
    formCategory: document.getElementById('form-category'),

    // Coupons
    couponsList: document.getElementById('coupons-list'),
    btnOpenAddCoupon: document.getElementById('btn-open-add-coupon'),
    modalCoupon: document.getElementById('modal-coupon'),
    formCoupon: document.getElementById('form-coupon'),

    // Banners & Announcements
    formAnnouncement: document.getElementById('form-announcement-settings'),
    formHero: document.getElementById('form-hero-settings'),
    previewAnnouncementText: document.getElementById('preview-announcement-text'),
    previewHeroTitle: document.getElementById('preview-hero-title'),
    previewHeroSubtitle: document.getElementById('preview-hero-subtitle'),
    previewHeroBadge: document.getElementById('preview-hero-badge'),
    previewHeroImg: document.getElementById('preview-hero-img'),

    // Customers
    customersTableBody: document.getElementById('customers-table-body'),
    btnOpenAddCustomer: document.getElementById('btn-open-add-customer'),
    modalCustomer: document.getElementById('modal-customer'),
    formCustomer: document.getElementById('form-customer'),

    // Settings
    formSettings: document.getElementById('form-store-settings'),

    // Backup & Restore
    btnExportData: document.getElementById('btn-export-store-data'),
    btnImportData: document.getElementById('btn-import-store-data'),
    btnResetData: document.getElementById('btn-reset-factory-data'),
    fileImportInput: document.getElementById('file-import-data')
  };

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type) {
    type = type || 'success';
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'admin-toast ' + type;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = '<span style="font-size:1.1rem;font-weight:bold;">' + icon + '</span><span>' + message + '</span>';
    DOM.toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
  }

  /* ==========================================================================
     AUTHENTICATION
     ========================================================================== */
  function checkAuthentication() {
    if (!Store.checkAuth()) {
      if (DOM.authOverlay) DOM.authOverlay.classList.add('active');
    } else {
      if (DOM.authOverlay) DOM.authOverlay.classList.remove('active');
      initDashboard();
    }
  }

  function handleAdminLogin(email, password) {
    const targetEmail = (email || '').trim().toLowerCase();
    const result = Store.loginAdmin(targetEmail, password);
    if (result.success) {
      if (DOM.authOverlay) DOM.authOverlay.classList.remove('active');
      showToast('Verified: Signed in as aruvicollections.25@gmail.com 🌿', 'success');
      initDashboard();
    } else {
      if (DOM.authStatusAlert) {
        DOM.authStatusAlert.textContent = result.message;
        DOM.authStatusAlert.style.display = 'block';
        DOM.authStatusAlert.style.background = '#fce8e6';
        DOM.authStatusAlert.style.color = '#c5221f';
        DOM.authStatusAlert.style.border = '1px solid #fad2cf';
      }
      showToast(result.message, 'error');
    }
  }

  function handleLogout() {
    if (confirm('Are you sure you want to log out of the Admin Dashboard?')) {
      Store.logout();
      if (DOM.authOverlay) DOM.authOverlay.classList.add('active');
      showToast('Logged out of Admin Portal', 'info');
    }
  }

  /* ==========================================================================
     TAB SWITCHING & NAVIGATION
     ========================================================================== */
  function switchTab(tabName) {
    AdminState.activeTab = tabName;

    // Update nav links
    DOM.navLinks.forEach(function (link) {
      if (link.getAttribute('data-tab') === tabName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update tab panes
    DOM.tabPanes.forEach(function (pane) {
      if (pane.id === 'tab-' + tabName) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Update breadcrumb
    if (DOM.breadcrumbCurrent) {
      const titles = {
        dashboard: 'Dashboard Overview',
        products: 'Product Catalog & Inventory',
        orders: 'Orders & Fulfillment',
        categories: 'Categories & Collections',
        banners: 'Hero & Announcement Banners',
        coupons: 'Discount Coupons & Promos',
        customers: 'Customer Directory & VIP Patrons',
        settings: 'Store Identity & Settings',
        backup: 'Backup & Factory Reset'
      };
      DOM.breadcrumbCurrent.textContent = titles[tabName] || tabName;
    }

    // Close mobile sidebar if open
    if (DOM.sidebar) DOM.sidebar.classList.remove('open');

    // Trigger specific tab refreshes
    if (tabName === 'dashboard') renderOverviewStats();
    if (tabName === 'products') renderProductsTable();
    if (tabName === 'orders') renderOrdersTable();
    if (tabName === 'categories') renderCategories();
    if (tabName === 'banners') loadBannerSettings();
    if (tabName === 'coupons') renderCoupons();
    if (tabName === 'customers') renderCustomers();
    if (tabName === 'settings') loadStoreSettings();
  }

  /* ==========================================================================
     OVERVIEW STATS & ANALYTICS CHARTS
     ========================================================================== */
  function renderOverviewStats() {
    const products = Store.getProducts(true);
    const orders = Store.getOrders();
    const customers = Store.getCustomers();

    // Total Revenue
    const totalRev = orders.reduce(function (sum, o) {
      if (o.status !== 'Cancelled') {
        return sum + (Number(o.total) || 0);
      }
      return sum;
    }, 0);

    if (DOM.statRevenue) {
      DOM.statRevenue.textContent = '₹' + totalRev.toLocaleString('en-IN');
    }
    if (DOM.statOrders) {
      DOM.statOrders.textContent = orders.length;
    }
    if (DOM.statProducts) {
      DOM.statProducts.textContent = products.filter(function (p) { return p.status !== 'inactive'; }).length;
    }
    const badgeProdsCount = document.getElementById('badge-products-count');
    if (badgeProdsCount) {
      badgeProdsCount.textContent = products.filter(function (p) { return p.status !== 'inactive'; }).length;
    }
    if (DOM.statCustomers) {
      DOM.statCustomers.textContent = customers.length;
    }

    // Pending Orders Badge
    const pendingOrders = orders.filter(function (o) { return o.status === 'Confirmed' || o.status === 'Pending'; });
    if (DOM.badgePendingOrders) {
      DOM.badgePendingOrders.textContent = pendingOrders.length;
    }

    // Low stock products
    const lowStock = products.filter(function (p) { return (p.stock !== undefined && p.stock <= 8) || p.badge === 'Low Stock'; });
    if (DOM.badgeLowStock) {
      DOM.badgeLowStock.textContent = lowStock.length;
    }

    // Render Recent Orders Table
    if (DOM.recentOrdersBody) {
      const recent = orders.slice(0, 5);
      if (recent.length === 0) {
        DOM.recentOrdersBody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#888;">No orders recorded yet.</td></tr>';
      } else {
        DOM.recentOrdersBody.innerHTML = recent.map(function (order) {
          const itemsCount = (order.items || []).reduce(function (sum, i) { return sum + (i.quantity || 1); }, 0);
          return `
            <tr>
              <td><strong>#${order.id}</strong></td>
              <td>
                <div style="font-weight:600;color:var(--admin-primary-dark);">${escapeHtml(order.customerName || 'Patron')}</div>
                <div style="font-size:0.75rem;color:var(--admin-text-muted);">${escapeHtml(order.customerPhone || '')}</div>
              </td>
              <td>${order.date}</td>
              <td>${itemsCount} Item${itemsCount > 1 ? 's' : ''}</td>
              <td><strong>₹${(order.total || 0).toLocaleString('en-IN')}</strong></td>
              <td>
                <span class="badge-status status-${getStatusClass(order.status)}">${escapeHtml(order.status || 'Confirmed')}</span>
              </td>
              <td>
                <button class="btn-admin btn-admin-secondary btn-admin-sm" onclick="window.AdminApp.viewOrder('${order.id}')">View</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Low Stock Alert List
    if (DOM.lowStockList) {
      if (lowStock.length === 0) {
        DOM.lowStockList.innerHTML = '<div style="padding:16px;text-align:center;color:#10b981;font-weight:600;">✓ All items in catalog are sufficiently stocked!</div>';
      } else {
        DOM.lowStockList.innerHTML = lowStock.map(function (p) {
          return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--admin-border-subtle);">
              <div style="display:flex;align-items:center;gap:10px;">
                <img src="${p.image}" alt="${escapeHtml(p.title)}" style="width:36px;height:44px;border-radius:4px;object-fit:cover;" />
                <div>
                  <div style="font-weight:700;font-size:0.84rem;color:var(--admin-primary-dark);">${escapeHtml(p.title)}</div>
                  <div style="font-size:0.72rem;color:var(--admin-text-muted);">${p.category.toUpperCase()} • ₹${p.price}</div>
                </div>
              </div>
              <div style="text-align:right;">
                <span class="stock-pill ${p.stock <= 3 ? 'stock-out' : 'stock-low'}">${p.stock} in stock</span>
                <div style="margin-top:4px;">
                  <button class="btn-admin btn-admin-secondary btn-admin-sm" style="padding:2px 8px;font-size:0.7rem;" onclick="window.AdminApp.editProduct('${p.id}')">Restock</button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render SVG Sales Trend Chart
    renderSalesChart(orders);
    renderCategoryDistribution(products);
  }

  function renderSalesChart(orders) {
    const chartContainer = document.getElementById('sales-trend-chart-box');
    if (!chartContainer) return;

    // Daily breakdown for visual curve
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const values = [12400, 18900, 14200, 26500, 21000, 34800, 28990];
    const maxVal = Math.max.apply(null, values) * 1.25;

    const width = 600;
    const height = 180;
    const paddingX = 40;
    const paddingY = 30;

    const points = values.map(function (val, i) {
      const x = paddingX + (i * ((width - (paddingX * 2)) / (values.length - 1)));
      const y = height - paddingY - ((val / maxVal) * (height - (paddingY * 2)));
      return { x: x, y: y, val: val, day: days[i] };
    });

    const pathD = points.reduce(function (acc, pt, i) {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    chartContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="svg-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#c89d38" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#c89d38" stop-opacity="0.0" />
          </linearGradient>
        </defs>
        <!-- Horizontal Grid lines -->
        <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="#e2ece6" stroke-width="1" />
        <line x1="${paddingX}" y1="${(height - paddingY) / 2}" x2="${width - paddingX}" y2="${(height - paddingY) / 2}" stroke="#e2ece6" stroke-dasharray="4,4" stroke-width="1" />
        
        <!-- Gradient Area -->
        <path d="${areaD}" fill="url(#chartGradient)" />
        
        <!-- Trend Curve -->
        <path d="${pathD}" fill="none" stroke="#c89d38" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        
        <!-- Points & Labels -->
        ${points.map(function (pt) {
          return `
            <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="#153c30" stroke="#c89d38" stroke-width="2.5" />
            <text x="${pt.x}" y="${height - 10}" font-size="11" font-weight="600" fill="#65756e" text-anchor="middle">${pt.day}</text>
            <text x="${pt.x}" y="${pt.y - 10}" font-size="10" font-weight="700" fill="#153c30" text-anchor="middle">₹${Math.round(pt.val / 1000)}k</text>
          `;
        }).join('')}
      </svg>
    `;
  }

  function renderCategoryDistribution(products) {
    const box = document.getElementById('category-distribution-box');
    if (!box) return;

    const catCounts = {};
    products.forEach(function (p) {
      catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    const categories = Store.getCategories();
    const total = products.length || 1;

    box.innerHTML = categories.map(function (cat) {
      const count = catCounts[cat.id] || 0;
      const pct = Math.round((count / total) * 100);
      return `
        <div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;font-weight:600;margin-bottom:4px;">
            <span>${cat.icon} ${escapeHtml(cat.name)}</span>
            <span style="color:var(--admin-text-muted);">${count} items (${pct}%)</span>
          </div>
          <div style="height:8px;background:#e9f2ed;border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg, var(--admin-primary), var(--admin-accent-gold));border-radius:4px;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     PRODUCT CATALOG MANAGEMENT (CRUD)
     ========================================================================== */
  function renderProductsTable() {
    if (!DOM.productsTableBody) return;
    const allProducts = Store.getProducts(true);

    // Apply Filter & Search
    const search = AdminState.productFilter.search.toLowerCase();
    const cat = AdminState.productFilter.category;
    const stock = AdminState.productFilter.stock;

    let filtered = allProducts.filter(function (p) {
      const matchSearch = !search ||
        (p.title && p.title.toLowerCase().includes(search)) ||
        (p.id && p.id.toLowerCase().includes(search)) ||
        (p.category && p.category.toLowerCase().includes(search)) ||
        (p.fabric && p.fabric.toLowerCase().includes(search));

      const matchCat = cat === 'all' || p.category === cat;

      let matchStock = true;
      if (stock === 'in_stock') matchStock = p.stock > 8;
      else if (stock === 'low_stock') matchStock = p.stock > 0 && p.stock <= 8;
      else if (stock === 'out_of_stock') matchStock = p.stock <= 0;

      return matchSearch && matchCat && matchStock;
    });

    if (filtered.length === 0) {
      DOM.productsTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:48px 20px;">
            <div style="font-size:2.2rem;margin-bottom:8px;">👗</div>
            <div style="font-weight:700;font-size:1.1rem;color:var(--admin-primary-dark);">No products matched your criteria</div>
            <div style="font-size:0.85rem;color:var(--admin-text-muted);margin-top:4px;">Try clearing search keywords or changing category filters.</div>
          </td>
        </tr>
      `;
      return;
    }

    DOM.productsTableBody.innerHTML = filtered.map(function (product) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      const stockClass = product.stock <= 0 ? 'stock-out' : product.stock <= 8 ? 'stock-low' : 'stock-ok';
      const stockLabel = product.stock <= 0 ? 'Out of Stock' : product.stock <= 8 ? `Low (${product.stock})` : `${product.stock} In Stock`;
      const isActive = product.status !== 'inactive';

      return `
        <tr data-id="${product.id}">
          <td style="width:40px;">
            <input type="checkbox" class="product-row-check" value="${product.id}" />
          </td>
          <td>
            <div class="table-product-cell">
              <img src="${product.image}" alt="${escapeHtml(product.title)}" class="table-thumb" />
              <div>
                <a href="product-detail.html?id=${product.id}" target="_blank" class="table-product-title">${escapeHtml(product.title)}</a>
                <span class="table-product-sku">SKU: ${product.id} • ${escapeHtml(product.fabric || 'silk')}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge-status" style="background:#eaf3ee;color:var(--admin-primary);font-size:0.75rem;">${escapeHtml(product.category.toUpperCase())}</span>
          </td>
          <td>
            <div style="font-weight:700;color:var(--admin-primary-dark);">₹${product.price.toLocaleString('en-IN')}</div>
            <div style="font-size:0.74rem;color:var(--admin-text-muted);text-decoration:line-through;">₹${product.originalPrice.toLocaleString('en-IN')}</div>
            <span style="font-size:0.72rem;color:var(--admin-success);font-weight:700;">${discount}% OFF</span>
          </td>
          <td>
            <span class="stock-pill ${stockClass}">${stockLabel}</span>
          </td>
          <td>
            ${product.badge ? `<span class="badge-status" style="background:var(--admin-gold-pale);color:var(--admin-accent-gold);border:1px solid rgba(200,157,56,0.3);">${escapeHtml(product.badge)}</span>` : '<span style="color:#bbb;">—</span>'}
          </td>
          <td>
            <button class="btn-admin btn-admin-sm ${isActive ? 'btn-admin-primary' : 'btn-admin-secondary'}" style="padding:3px 10px;font-size:0.74rem;" onclick="window.AdminApp.toggleProductStatus('${product.id}')">
              ${isActive ? 'Active' : 'Hidden'}
            </button>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-table-action" title="Edit Product" onclick="window.AdminApp.editProduct('${product.id}')">✏️</button>
              <button class="btn-table-action" title="Duplicate" onclick="window.AdminApp.duplicateProduct('${product.id}')">📋</button>
              <button class="btn-table-action delete" title="Delete Product" onclick="window.AdminApp.deleteProduct('${product.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openAddProductModal() {
    AdminState.editingProduct = null;
    if (DOM.modalProductTitle) DOM.modalProductTitle.textContent = 'Add New Collection Item';
    if (DOM.formProduct) DOM.formProduct.reset();

    // Populate category dropdown in modal
    populateProductModalCategories();

    // Reset preset selector
    document.querySelectorAll('.image-preset-option').forEach(function (opt) { opt.classList.remove('selected'); });

    // Set default values
    const idInput = document.getElementById('prod-input-id');
    if (idInput) idInput.value = 'p' + (Date.now().toString().slice(-4));
    const stockInput = document.getElementById('prod-input-stock');
    if (stockInput) stockInput.value = 15;
    const ratingInput = document.getElementById('prod-input-rating');
    if (ratingInput) ratingInput.value = '4.8';
    const reviewsInput = document.getElementById('prod-input-reviews');
    if (reviewsInput) reviewsInput.value = '24';

    updateProductImagePreview('assets/images/kanjivaram_green.jpg');

    if (DOM.modalProduct) DOM.modalProduct.classList.add('active');
  }

  function editProduct(productId) {
    const product = Store.getProductById(productId);
    if (!product) {
      showToast('Product not found', 'error');
      return;
    }
    AdminState.editingProduct = product;
    if (DOM.modalProductTitle) DOM.modalProductTitle.textContent = 'Edit: ' + product.title;

    populateProductModalCategories();

    // Fill form
    document.getElementById('prod-input-id').value = product.id;
    document.getElementById('prod-input-title').value = product.title || '';
    document.getElementById('prod-input-category').value = product.category || 'salwar';
    document.getElementById('prod-input-fabric').value = product.fabric || 'silk';
    document.getElementById('prod-input-occasion').value = product.occasion || 'wedding';
    document.getElementById('prod-input-price').value = product.price || '';
    document.getElementById('prod-input-orig-price').value = product.originalPrice || '';
    document.getElementById('prod-input-stock').value = product.stock !== undefined ? product.stock : 10;
    document.getElementById('prod-input-badge').value = product.badge || '';
    document.getElementById('prod-input-badge-type').value = product.badgeType || '';
    document.getElementById('prod-input-image').value = product.image || '';
    document.getElementById('prod-input-tagline').value = product.tagline || '';
    document.getElementById('prod-input-sizes').value = (product.sizes || []).join(', ');
    document.getElementById('prod-input-colors').value = (product.availableColors || []).join(', ');
    document.getElementById('prod-input-rating').value = product.rating || '4.8';
    document.getElementById('prod-input-reviews').value = product.reviews || '50';
    document.getElementById('prod-input-status').value = product.status || 'active';

    updateProductImagePreview(product.image);

    if (DOM.modalProduct) DOM.modalProduct.classList.add('active');
  }

  function saveProductForm(e) {
    if (e) e.preventDefault();

    const id = document.getElementById('prod-input-id').value.trim();
    const title = document.getElementById('prod-input-title').value.trim();
    const category = document.getElementById('prod-input-category').value;
    const fabric = document.getElementById('prod-input-fabric').value.trim();
    const occasion = document.getElementById('prod-input-occasion').value.trim();
    const price = Number(document.getElementById('prod-input-price').value) || 0;
    const originalPrice = Number(document.getElementById('prod-input-orig-price').value) || price;
    const stock = Number(document.getElementById('prod-input-stock').value) || 0;
    const badge = document.getElementById('prod-input-badge').value.trim();
    const badgeType = document.getElementById('prod-input-badge-type').value;
    const image = document.getElementById('prod-input-image').value.trim() || 'assets/images/kanjivaram_green.jpg';
    const tagline = document.getElementById('prod-input-tagline').value.trim();
    const sizesStr = document.getElementById('prod-input-sizes').value.trim();
    const colorsStr = document.getElementById('prod-input-colors').value.trim();
    const rating = Number(document.getElementById('prod-input-rating').value) || 4.8;
    const reviews = Number(document.getElementById('prod-input-reviews').value) || 10;
    const status = document.getElementById('prod-input-status').value;

    if (!title) {
      showToast('Please enter a product title', 'error');
      return;
    }
    if (price <= 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    const sizes = sizesStr ? sizesStr.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : ['Free Size'];
    const colors = colorsStr ? colorsStr.split(',').map(function (c) { return c.trim(); }).filter(Boolean) : ['#153c30'];

    const productPayload = {
      id: id || ('p_' + Date.now()),
      title: title,
      category: category,
      fabric: fabric,
      occasion: occasion,
      price: price,
      originalPrice: originalPrice,
      stock: stock,
      badge: badge,
      badgeType: badgeType,
      image: image,
      tagline: tagline,
      sizes: sizes,
      availableColors: colors,
      rating: rating,
      reviews: reviews,
      status: status
    };

    Store.saveProduct(productPayload);
    showToast('Product "' + title + '" saved successfully! 🌟', 'success');

    if (DOM.modalProduct) DOM.modalProduct.classList.remove('active');
    renderProductsTable();
    renderOverviewStats();
  }

  function deleteProduct(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;
    if (confirm('Are you sure you want to delete "' + product.title + '" from the catalog? This cannot be undone.')) {
      Store.deleteProduct(productId);
      showToast('Product removed from catalog', 'info');
      renderProductsTable();
      renderOverviewStats();
    }
  }

  function duplicateProduct(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;
    const clone = JSON.parse(JSON.stringify(product));
    clone.id = 'p_' + Date.now().toString().slice(-5);
    clone.title = clone.title + ' (Copy)';
    Store.saveProduct(clone);
    showToast('Product duplicated: ' + clone.title, 'success');
    renderProductsTable();
  }

  function toggleProductStatus(productId) {
    const product = Store.getProductById(productId);
    if (!product) return;
    product.status = product.status === 'inactive' ? 'active' : 'inactive';
    Store.saveProduct(product);
    showToast('Product status changed to ' + product.status, 'info');
    renderProductsTable();
    renderOverviewStats();
  }

  function populateProductModalCategories() {
    const catSelect = document.getElementById('prod-input-category');
    if (!catSelect) return;
    const cats = Store.getCategories();
    catSelect.innerHTML = cats.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
  }

  function updateProductImagePreview(src) {
    const preview = document.getElementById('product-img-live-preview');
    const input = document.getElementById('prod-input-image');
    if (preview && src) preview.src = src;
    if (input && src) input.value = src;
  }

  /* ==========================================================================
     ORDERS MANAGEMENT
     ========================================================================== */
  function renderOrdersTable() {
    if (!DOM.ordersTableBody) return;
    const orders = Store.getOrders();
    const search = AdminState.orderFilter.search.toLowerCase();
    const status = AdminState.orderFilter.status;

    let filtered = orders.filter(function (o) {
      const matchSearch = !search ||
        (o.id && o.id.toLowerCase().includes(search)) ||
        (o.customerName && o.customerName.toLowerCase().includes(search)) ||
        (o.customerPhone && o.customerPhone.includes(search)) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search));

      const matchStatus = status === 'all' || o.status.toLowerCase() === status.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      DOM.ordersTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:48px 20px;">
            <div style="font-size:2.2rem;margin-bottom:8px;">📦</div>
            <div style="font-weight:700;font-size:1.1rem;color:var(--admin-primary-dark);">No orders found</div>
            <div style="font-size:0.85rem;color:var(--admin-text-muted);margin-top:4px;">No customer orders match the current filter.</div>
          </td>
        </tr>
      `;
      return;
    }

    DOM.ordersTableBody.innerHTML = filtered.map(function (order) {
      const itemsCount = (order.items || []).reduce(function (sum, i) { return sum + (i.quantity || 1); }, 0);
      const firstItemImg = order.items && order.items[0] && order.items[0].product && order.items[0].product.image
        ? order.items[0].product.image
        : 'assets/images/kanjivaram_green.jpg';

      return `
        <tr data-order-id="${order.id}">
          <td>
            <strong style="color:var(--admin-primary-dark);">#${order.id}</strong>
            <div style="font-size:0.74rem;color:var(--admin-text-muted);">${order.date || 'Recent'} • ${order.time || '12:00'}</div>
          </td>
          <td>
            <div style="font-weight:700;color:var(--admin-primary-dark);">${escapeHtml(order.customerName || 'Valued Patron')}</div>
            <div style="font-size:0.75rem;color:var(--admin-text-muted);">${escapeHtml(order.customerPhone || '+91 98765 43210')}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <img src="${firstItemImg}" alt="Item" style="width:34px;height:42px;border-radius:4px;object-fit:cover;border:1px solid var(--admin-border);" />
              <span style="font-weight:600;font-size:0.84rem;">${itemsCount} Item${itemsCount > 1 ? 's' : ''}</span>
            </div>
          </td>
          <td>
            <strong style="font-size:0.95rem;color:var(--admin-primary-dark);">₹${(order.total || 0).toLocaleString('en-IN')}</strong>
            ${order.discount ? `<div style="font-size:0.72rem;color:var(--admin-success);">-₹${order.discount} off</div>` : ''}
          </td>
          <td>
            <span class="badge-status" style="background:#f0f5f2;color:var(--admin-text-main);font-size:0.74rem;">${escapeHtml(order.paymentMethod || 'Online')}</span>
          </td>
          <td>
            <select class="form-select-full" style="padding:4px 8px;font-size:0.78rem;font-weight:700;border-radius:var(--admin-radius-full);width:auto;" onchange="window.AdminApp.changeOrderStatus('${order.id}', this.value)">
              <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td>
            <div style="font-size:0.75rem;font-weight:600;color:var(--admin-primary);">${escapeHtml(order.courier || 'BlueDart')}</div>
            <div style="font-size:0.72rem;color:var(--admin-text-muted);">${escapeHtml(order.trackingNumber || 'Pending AWB')}</div>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-table-action" title="View Order & Printable Invoice" onclick="window.AdminApp.viewOrder('${order.id}')">📄</button>
              <button class="btn-table-action delete" title="Delete Order" onclick="window.AdminApp.deleteOrder('${order.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function changeOrderStatus(orderId, newStatus) {
    Store.updateOrderStatus(orderId, newStatus);
    showToast('Order #' + orderId + ' status updated to ' + newStatus, 'success');
    renderOrdersTable();
    renderOverviewStats();
  }

  function viewOrder(orderId) {
    const orders = Store.getOrders();
    const order = orders.find(function (o) { return o.id === orderId; });
    if (!order) {
      showToast('Order details not found', 'error');
      return;
    }
    AdminState.selectedOrder = order;

    if (!DOM.orderDetailsContent) return;

    const items = order.items || [];
    const subtotal = order.subtotal || order.total;
    const discount = order.discount || 0;
    const deliveryFee = order.deliveryFee || 0;
    const grandTotal = order.total || (subtotal - discount + deliveryFee);
    const courier = order.courier || 'BlueDart Express';
    const tracking = order.trackingNumber || 'BD-' + Math.floor(10000000 + Math.random() * 90000000) + 'IN';

    DOM.orderDetailsContent.innerHTML = `
      <div class="invoice-container" id="printable-invoice-view">
        <!-- Invoice Header -->
        <div class="invoice-header">
          <div class="invoice-logo-title">
            <h2>Aruvi Collections</h2>
            <div style="font-size:0.8rem;color:var(--admin-text-muted);margin-top:2px;">Tradition In Every Thread • Coimbatore Handloom Guild</div>
            <div style="font-size:0.75rem;color:var(--admin-text-light);">GSTIN: 33AAQCA1294F1Z8 • Verified Silk Mark Boutique</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--admin-font-serif);font-size:1.4rem;font-weight:700;color:var(--admin-primary);">ORDER INVOICE</div>
            <div style="font-weight:700;color:var(--admin-accent-gold);margin-top:2px;">#${order.id}</div>
            <div style="font-size:0.78rem;color:var(--admin-text-muted);margin-top:2px;">Date: ${order.date || 'Recent'}</div>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="invoice-meta-grid">
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--admin-text-muted);margin-bottom:4px;">Billed & Shipped To:</div>
            <div style="font-weight:700;font-size:0.95rem;color:var(--admin-primary-dark);">${escapeHtml(order.customerName || 'Valued Patron')}</div>
            <div style="font-size:0.85rem;color:var(--admin-text-main);margin:4px 0;line-height:1.4;">${escapeHtml(order.shippingAddress || 'Boutique Pickup, Coimbatore')}</div>
            <div style="font-size:0.8rem;color:var(--admin-text-muted);">Phone: ${escapeHtml(order.customerPhone || '+91 98765 43210')}</div>
            <div style="font-size:0.8rem;color:var(--admin-text-muted);">Email: ${escapeHtml(order.customerEmail || 'patron@aruvicollections.com')}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--admin-text-muted);margin-bottom:4px;">Fulfillment & Payment:</div>
            <div style="font-size:0.85rem;"><strong>Payment Mode:</strong> ${escapeHtml(order.paymentMethod || 'UPI Encrypted')}</div>
            <div style="font-size:0.85rem;margin:3px 0;"><strong>Status:</strong> <span class="badge-status status-${getStatusClass(order.status)}">${order.status}</span></div>
            <div style="font-size:0.85rem;margin:3px 0;"><strong>Courier Partner:</strong> ${escapeHtml(courier)}</div>
            <div style="font-size:0.85rem;"><strong>Airway Bill (AWB):</strong> <code style="background:#f0f5f2;padding:2px 6px;border-radius:4px;">${escapeHtml(tracking)}</code></div>
          </div>
        </div>

        <!-- Items Table -->
        <table class="invoice-items-table">
          <thead>
            <tr>
              <th style="text-align:left;">Handcrafted Item</th>
              <th>Size / Variant</th>
              <th>Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(function (item) {
              const p = item.product || {};
              const q = item.quantity || 1;
              const price = p.price || 0;
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img src="${p.image || 'assets/images/kanjivaram_green.jpg'}" alt="${escapeHtml(p.title)}" style="width:38px;height:48px;object-fit:cover;border-radius:4px;" />
                      <div>
                        <strong>${escapeHtml(p.title || 'Silk Saree')}</strong>
                        <div style="font-size:0.74rem;color:var(--admin-text-muted);">${escapeHtml(item.selectedColor || 'Heritage Tone')}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align:center;">${escapeHtml(item.selectedSize || 'Free Size')}</td>
                  <td style="text-align:center;">${q}</td>
                  <td style="text-align:right;">₹${price.toLocaleString('en-IN')}</td>
                  <td style="text-align:right;font-weight:700;">₹${(price * q).toLocaleString('en-IN')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div class="invoice-summary-box">
          <div class="invoice-summary-row">
            <span>Subtotal:</span>
            <span>₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${discount > 0 ? `
            <div class="invoice-summary-row" style="color:var(--admin-success);">
              <span>Festive Discount (${order.couponCode || 'PROMO'}):</span>
              <span>-₹${discount.toLocaleString('en-IN')}</span>
            </div>
          ` : ''}
          <div class="invoice-summary-row">
            <span>Shipping & Handling:</span>
            <span>${deliveryFee === 0 ? 'COMPLIMENTARY' : '₹' + deliveryFee}</span>
          </div>
          <div class="invoice-summary-row total">
            <span>Grand Total:</span>
            <span>₹${grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="margin-top:30px;padding-top:16px;border-top:1px dashed var(--admin-border);font-size:0.75rem;color:var(--admin-text-muted);text-align:center;">
          Thank you for choosing Aruvi Collections. Every drape carries South Indian artisan heritage. For queries, contact +91 98765 43210.
        </div>
      </div>

      <!-- Courier Dispatch Controls inside Modal -->
      <div style="margin-top:24px;padding:18px;background:#f9fafb;border-radius:var(--admin-radius-md);border:1px solid var(--admin-border);">
        <h4 style="font-size:0.92rem;color:var(--admin-primary-dark);margin-bottom:12px;">🚚 Update Logistics & Courier Dispatch</h4>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
          <div style="flex:1;min-width:180px;">
            <label class="form-label">Courier Partner</label>
            <select id="modal-courier-name" class="form-select-full">
              <option value="BlueDart Express" ${courier.includes('BlueDart') ? 'selected' : ''}>BlueDart Express</option>
              <option value="Delhivery Surface" ${courier.includes('Delhivery') ? 'selected' : ''}>Delhivery Surface</option>
              <option value="DTDC Priority" ${courier.includes('DTDC') ? 'selected' : ''}>DTDC Priority</option>
              <option value="India Post Speed Post" ${courier.includes('Speed Post') ? 'selected' : ''}>India Post Speed Post</option>
            </select>
          </div>
          <div style="flex:1;min-width:200px;">
            <label class="form-label">Airway Bill / Tracking ID</label>
            <input type="text" id="modal-courier-tracking" class="form-input" value="${escapeHtml(tracking)}" />
          </div>
          <button class="btn-admin btn-admin-primary" onclick="window.AdminApp.saveOrderCourier('${order.id}')">Save Tracking</button>
        </div>
      </div>
    `;

    if (DOM.modalOrderDetails) DOM.modalOrderDetails.classList.add('active');
  }

  function saveOrderCourier(orderId) {
    const courierEl = document.getElementById('modal-courier-name');
    const trackingEl = document.getElementById('modal-courier-tracking');
    if (!courierEl || !trackingEl) return;

    const courier = courierEl.value;
    const tracking = trackingEl.value.trim();

    Store.updateOrderStatus(orderId, undefined, courier, tracking);
    showToast('Logistics updated for Order #' + orderId + ' 🚚', 'success');
    renderOrdersTable();
  }

  function deleteOrder(orderId) {
    if (confirm('Delete Order #' + orderId + '?')) {
      Store.deleteOrder(orderId);
      showToast('Order deleted', 'info');
      renderOrdersTable();
      renderOverviewStats();
    }
  }

  /* ==========================================================================
     CATEGORIES MANAGEMENT
     ========================================================================== */
  function renderCategories() {
    if (!DOM.categoriesGrid) return;
    const categories = Store.getCategories();
    const products = Store.getProducts(true);

    const counts = {};
    products.forEach(function (p) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    DOM.categoriesGrid.innerHTML = categories.map(function (cat) {
      const count = counts[cat.id] || 0;
      return `
        <div class="admin-card" style="display:flex;flex-direction:column;justify-content:space-between;border-top:3px solid var(--admin-accent-gold);">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
            <div style="width:48px;height:48px;border-radius:10px;background:var(--admin-gold-pale);display:flex;align-items:center;justify-content:center;font-size:1.6rem;">
              ${cat.icon || '🥻'}
            </div>
            <div>
              <h3 style="font-family:var(--admin-font-serif);font-size:1.15rem;color:var(--admin-primary-dark);">${escapeHtml(cat.name)}</h3>
              <div style="font-size:0.75rem;color:var(--admin-text-muted);">Slug: <code>${cat.id}</code></div>
            </div>
          </div>
          <p style="font-size:0.82rem;color:var(--admin-text-muted);margin-bottom:14px;line-height:1.4;">${escapeHtml(cat.description || 'Artisan handcrafted collection')}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--admin-border-subtle);">
            <span style="font-weight:700;font-size:0.84rem;color:var(--admin-primary);">${count} Active Products</span>
            <div style="display:flex;gap:6px;">
              <button class="btn-table-action" onclick="window.AdminApp.editCategory('${cat.id}')">✏️</button>
              <button class="btn-table-action delete" onclick="window.AdminApp.deleteCategory('${cat.id}')">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openAddCategoryModal() {
    AdminState.editingCategory = null;
    if (DOM.formCategory) DOM.formCategory.reset();
    if (DOM.modalCategory) DOM.modalCategory.classList.add('active');
  }

  function editCategory(catId) {
    const cats = Store.getCategories();
    const cat = cats.find(function (c) { return c.id === catId; });
    if (!cat) return;
    AdminState.editingCategory = cat;

    document.getElementById('cat-input-id').value = cat.id;
    document.getElementById('cat-input-name').value = cat.name;
    document.getElementById('cat-input-icon').value = cat.icon || '🥻';
    document.getElementById('cat-input-desc').value = cat.description || '';
    document.getElementById('cat-input-featured').checked = cat.featured !== false;

    if (DOM.modalCategory) DOM.modalCategory.classList.add('active');
  }

  function saveCategoryForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('cat-input-id').value.trim();
    const name = document.getElementById('cat-input-name').value.trim();
    const icon = document.getElementById('cat-input-icon').value.trim() || '🥻';
    const desc = document.getElementById('cat-input-desc').value.trim();
    const featured = document.getElementById('cat-input-featured').checked;

    if (!name) {
      showToast('Please enter category name', 'error');
      return;
    }

    Store.saveCategory({
      id: id || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name,
      icon: icon,
      description: desc,
      featured: featured
    });

    showToast('Category "' + name + '" saved! ✨', 'success');
    if (DOM.modalCategory) DOM.modalCategory.classList.remove('active');
    renderCategories();
  }

  function deleteCategory(catId) {
    if (confirm('Delete category "' + catId + '"?')) {
      Store.deleteCategory(catId);
      showToast('Category deleted', 'info');
      renderCategories();
    }
  }

  /* ==========================================================================
     COUPONS & PROMOTIONS MANAGEMENT
     ========================================================================== */
  function renderCoupons() {
    if (!DOM.couponsList) return;
    const coupons = Store.getCoupons();

    DOM.couponsList.innerHTML = coupons.map(function (c) {
      const discountText = c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`;
      return `
        <div class="admin-card" style="display:flex;align-items:center;justify-content:space-between;border-left:4px solid var(--admin-accent-gold);margin-bottom:14px;flex-wrap:wrap;gap:14px;">
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="background:var(--admin-gold-pale);padding:10px 16px;border-radius:var(--admin-radius-sm);border:1.5px dashed var(--admin-accent-gold);font-family:monospace;font-size:1.15rem;font-weight:800;color:var(--admin-primary-dark);">
              ${escapeHtml(c.code)}
            </div>
            <div>
              <div style="font-weight:800;font-size:1rem;color:var(--admin-primary-dark);">${discountText}</div>
              <div style="font-size:0.75rem;color:var(--admin-text-muted);">Min Order: ₹${(c.minOrder || 0).toLocaleString('en-IN')} • Expires: ${c.expiry || 'No Expiry'}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="text-align:right;">
              <span class="badge-status ${c.active ? 'status-active' : 'status-inactive'}">${c.active ? 'Active' : 'Paused'}</span>
              <div style="font-size:0.72rem;color:var(--admin-text-muted);margin-top:2px;">Redeemed ${c.usageCount || 0} times</div>
            </div>
            <button class="btn-admin btn-admin-secondary btn-admin-sm" onclick="window.AdminApp.toggleCoupon('${c.code}')">${c.active ? 'Pause' : 'Activate'}</button>
            <button class="btn-table-action delete" onclick="window.AdminApp.deleteCoupon('${c.code}')">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function openAddCouponModal() {
    if (DOM.formCoupon) DOM.formCoupon.reset();
    const codeInput = document.getElementById('coupon-input-code');
    if (codeInput) codeInput.value = 'FESTIVE' + Math.floor(10 + Math.random() * 90);
    if (DOM.modalCoupon) DOM.modalCoupon.classList.add('active');
  }

  function saveCouponForm(e) {
    if (e) e.preventDefault();
    const code = document.getElementById('coupon-input-code').value.trim().toUpperCase();
    const type = document.getElementById('coupon-input-type').value;
    const value = Number(document.getElementById('coupon-input-value').value) || 0;
    const minOrder = Number(document.getElementById('coupon-input-min').value) || 0;
    const expiry = document.getElementById('coupon-input-expiry').value || '2026-12-31';

    if (!code) {
      showToast('Please enter a coupon code', 'error');
      return;
    }
    if (value <= 0) {
      showToast('Please enter valid discount value', 'error');
      return;
    }

    Store.saveCoupon({
      code: code,
      type: type,
      value: value,
      minOrder: minOrder,
      expiry: expiry,
      active: true
    });

    showToast('Coupon ' + code + ' created successfully! 🎟️', 'success');
    if (DOM.modalCoupon) DOM.modalCoupon.classList.remove('active');
    renderCoupons();
  }

  function toggleCoupon(code) {
    const coupons = Store.getCoupons();
    const c = coupons.find(function (item) { return item.code === code; });
    if (!c) return;
    c.active = !c.active;
    Store.saveCoupon(c);
    showToast('Coupon ' + code + ' status updated', 'info');
    renderCoupons();
  }

  function deleteCoupon(code) {
    if (confirm('Delete coupon ' + code + '?')) {
      Store.deleteCoupon(code);
      showToast('Coupon ' + code + ' deleted', 'info');
      renderCoupons();
    }
  }

  /* ==========================================================================
     HERO & ANNOUNCEMENT BANNERS (STOREFRONT CONTROL)
     ========================================================================== */
  function loadBannerSettings() {
    const ann = Store.getAnnouncement();
    const hero = Store.getHero();

    // Fill Announcement Form
    if (DOM.formAnnouncement) {
      document.getElementById('ann-input-enable').checked = ann.enabled !== false;
      document.getElementById('ann-input-tag').value = ann.tag || 'Festive Sale';
      document.getElementById('ann-input-text').value = ann.text || '';
      document.getElementById('ann-input-link').value = ann.linkText || 'Track Order';
      document.getElementById('ann-input-url').value = ann.linkUrl || 'account.html#orders';
    }

    // Fill Hero Form
    if (DOM.formHero) {
      document.getElementById('hero-input-badge').value = hero.badge || '';
      document.getElementById('hero-input-title').value = hero.title || '';
      document.getElementById('hero-input-subtitle').value = hero.subtitle || '';
      document.getElementById('hero-input-discount').value = hero.discountTag || '';
      document.getElementById('hero-input-cta').value = hero.ctaText || 'Explore Handloom Silks';
      document.getElementById('hero-input-link').value = hero.ctaLink || 'shop.html?category=sarees';
      document.getElementById('hero-input-image').value = hero.image || 'assets/images/hero_saree_model.jpg';
    }

    updateBannerPreviews(ann, hero);
  }

  function updateBannerPreviews(ann, hero) {
    ann = ann || Store.getAnnouncement();
    hero = hero || Store.getHero();

    if (DOM.previewAnnouncementText) {
      DOM.previewAnnouncementText.textContent = ann.text;
    }
    if (DOM.previewHeroBadge) DOM.previewHeroBadge.textContent = hero.badge;
    if (DOM.previewHeroTitle) DOM.previewHeroTitle.textContent = hero.title;
    if (DOM.previewHeroSubtitle) DOM.previewHeroSubtitle.textContent = hero.subtitle;
    if (DOM.previewHeroImg) DOM.previewHeroImg.src = hero.image;
  }

  function saveAnnouncementForm(e) {
    if (e) e.preventDefault();
    const payload = {
      enabled: document.getElementById('ann-input-enable').checked,
      tag: document.getElementById('ann-input-tag').value.trim(),
      text: document.getElementById('ann-input-text').value.trim(),
      linkText: document.getElementById('ann-input-link').value.trim(),
      linkUrl: document.getElementById('ann-input-url').value.trim()
    };
    Store.saveAnnouncement(payload);
    showToast('Top Announcement Bar updated live across all pages! 📢', 'success');
    updateBannerPreviews(payload, null);
  }

  function saveHeroForm(e) {
    if (e) e.preventDefault();
    const payload = {
      badge: document.getElementById('hero-input-badge').value.trim(),
      title: document.getElementById('hero-input-title').value.trim(),
      subtitle: document.getElementById('hero-input-subtitle').value.trim(),
      discountTag: document.getElementById('hero-input-discount').value.trim(),
      ctaText: document.getElementById('hero-input-cta').value.trim(),
      ctaLink: document.getElementById('hero-input-link').value.trim(),
      image: document.getElementById('hero-input-image').value.trim() || 'assets/images/hero_saree_model.jpg'
    };
    Store.saveHero(payload);
    showToast('Storefront Hero Section updated live on Homepage! 🌟', 'success');
    updateBannerPreviews(null, payload);
  }

  /* ==========================================================================
     CUSTOMERS & PATRONS DIRECTORY
     ========================================================================== */
  function renderCustomers() {
    if (!DOM.customersTableBody) return;
    const customers = Store.getCustomers();

    DOM.customersTableBody.innerHTML = customers.map(function (c) {
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="admin-user-avatar" style="width:36px;height:36px;font-size:0.8rem;">${(c.name || 'P')[0]}</div>
              <div>
                <strong style="color:var(--admin-primary-dark);">${escapeHtml(c.name)}</strong>
                <div style="font-size:0.74rem;color:var(--admin-text-muted);">${escapeHtml(c.city || 'Tamil Nadu')}</div>
              </div>
            </div>
          </td>
          <td>
            <div>${escapeHtml(c.phone || '+91 98765 43210')}</div>
            <div style="font-size:0.75rem;color:var(--admin-text-muted);">${escapeHtml(c.email || 'customer@gmail.com')}</div>
          </td>
          <td>
            <span class="product-badge-tag tag-gold" style="position:static;font-size:0.7rem;">${escapeHtml(c.tier || 'Gold Patron')}</span>
          </td>
          <td style="text-align:center;font-weight:700;">${c.ordersCount || 1}</td>
          <td><strong>₹${(c.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
          <td>
            <span style="font-weight:700;color:var(--admin-accent-gold);">✨ ${c.loyaltyPoints || 100} pts</span>
          </td>
          <td>
            <button class="btn-admin btn-admin-secondary btn-admin-sm" onclick="window.AdminApp.editCustomer('${c.id}')">Edit</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openAddCustomerModal() {
    AdminState.editingCustomer = null;
    if (DOM.formCustomer) DOM.formCustomer.reset();
    if (DOM.modalCustomer) DOM.modalCustomer.classList.add('active');
  }

  function editCustomer(custId) {
    const customers = Store.getCustomers();
    const c = customers.find(function (item) { return item.id === custId; });
    if (!c) return;
    AdminState.editingCustomer = c;

    document.getElementById('cust-input-id').value = c.id;
    document.getElementById('cust-input-name').value = c.name || '';
    document.getElementById('cust-input-email').value = c.email || '';
    document.getElementById('cust-input-phone').value = c.phone || '';
    document.getElementById('cust-input-city').value = c.city || '';
    document.getElementById('cust-input-tier').value = c.tier || 'Patron';
    document.getElementById('cust-input-points').value = c.loyaltyPoints || 100;

    if (DOM.modalCustomer) DOM.modalCustomer.classList.add('active');
  }

  function saveCustomerForm(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('cust-input-id').value.trim();
    const name = document.getElementById('cust-input-name').value.trim();
    const email = document.getElementById('cust-input-email').value.trim();
    const phone = document.getElementById('cust-input-phone').value.trim();
    const city = document.getElementById('cust-input-city').value.trim();
    const tier = document.getElementById('cust-input-tier').value;
    const points = Number(document.getElementById('cust-input-points').value) || 0;

    if (!name) {
      showToast('Please enter customer name', 'error');
      return;
    }

    Store.saveCustomer({
      id: id || ('c_' + Date.now()),
      name: name,
      email: email,
      phone: phone,
      city: city,
      tier: tier,
      loyaltyPoints: points
    });

    showToast('Customer "' + name + '" saved! 👤', 'success');
    if (DOM.modalCustomer) DOM.modalCustomer.classList.remove('active');
    renderCustomers();
  }

  /* ==========================================================================
     STORE SETTINGS
     ========================================================================== */
  function loadStoreSettings() {
    const settings = Store.getSettings();
    if (!DOM.formSettings) return;

    document.getElementById('set-store-name').value = settings.storeName || 'Aruvi Collections';
    document.getElementById('set-tagline').value = settings.tagline || 'Tradition In Every Thread';
    document.getElementById('set-phone').value = settings.phone || '+91 98765 43210';
    document.getElementById('set-whatsapp').value = settings.whatsapp || '919876543210';
    document.getElementById('set-email').value = settings.email || 'support@aruvicollections.com';
    document.getElementById('set-address').value = settings.address || '';
    document.getElementById('set-free-shipping').value = settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 999;
    document.getElementById('set-express-fee').value = settings.expressDeliveryFee || 99;
    document.getElementById('set-tax').value = settings.taxPercent || 5;
    document.getElementById('set-admin-pass').value = settings.adminPassword || 'admin';
    document.getElementById('set-maintenance').checked = settings.maintenanceMode === true;
  }

  function saveStoreSettings(e) {
    if (e) e.preventDefault();
    const settings = {
      storeName: document.getElementById('set-store-name').value.trim(),
      tagline: document.getElementById('set-tagline').value.trim(),
      phone: document.getElementById('set-phone').value.trim(),
      whatsapp: document.getElementById('set-whatsapp').value.trim(),
      email: document.getElementById('set-email').value.trim(),
      address: document.getElementById('set-address').value.trim(),
      freeShippingThreshold: Number(document.getElementById('set-free-shipping').value) || 999,
      expressDeliveryFee: Number(document.getElementById('set-express-fee').value) || 99,
      taxPercent: Number(document.getElementById('set-tax').value) || 5,
      adminPassword: document.getElementById('set-admin-pass').value.trim() || 'admin',
      maintenanceMode: document.getElementById('set-maintenance').checked
    };

    Store.saveSettings(settings);
    showToast('Store settings & configurations saved successfully! ⚙️', 'success');
  }

  /* ==========================================================================
     BACKUP, EXPORT & FACTORY RESTORE
     ========================================================================== */
  function exportData() {
    const data = Store.exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aruvi-collections-backup-' + (new Date().toISOString().slice(0, 10)) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Full store backup exported and downloaded! 💾', 'success');
  }

  function importData(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const obj = JSON.parse(e.target.result);
        const res = Store.importAllData(obj);
        if (res.success) {
          showToast('Data backup restored successfully! Reloading view... 🔄', 'success');
          setTimeout(function () { window.location.reload(); }, 900);
        } else {
          showToast('Failed to import: ' + res.error, 'error');
        }
      } catch (err) {
        showToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  function resetFactoryData() {
    if (confirm('CAUTION: This will reset all products, orders, categories, coupons, and settings to original factory demonstration defaults. Do you want to proceed?')) {
      Store.resetToDefaults();
      showToast('Store reset to factory demo defaults! Refreshing... 🌿', 'success');
      setTimeout(function () { window.location.reload(); }, 900);
    }
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDING
     ========================================================================== */
  function bindEvents() {
    // Admin Google Login
    if (DOM.btnAdminGoogle) {
      DOM.btnAdminGoogle.addEventListener('click', function () {
        DOM.btnAdminGoogle.disabled = true;
        DOM.btnAdminGoogle.style.opacity = '0.7';

        if (!window.AruviFirebaseAuth || typeof window.AruviFirebaseAuth.signInWithGoogle !== 'function') {
          if (DOM.authStatusAlert) {
            DOM.authStatusAlert.textContent = 'Firebase Auth is initializing. Please verify network connection.';
            DOM.authStatusAlert.style.display = 'block';
            DOM.authStatusAlert.style.background = '#fce8e6';
            DOM.authStatusAlert.style.color = '#c5221f';
            DOM.authStatusAlert.style.border = '1px solid #fad2cf';
          }
          DOM.btnAdminGoogle.disabled = false;
          DOM.btnAdminGoogle.style.opacity = '';
          return;
        }

        window.AruviFirebaseAuth.signInWithGoogle()
          .then(function (googleUser) {
            const result = Store.loginAdminWithGoogle(googleUser);
            if (result.success) {
              if (DOM.authStatusAlert) {
                DOM.authStatusAlert.textContent = `✓ Authorized Administrator Verified: Welcome, ${googleUser.name}!`;
                DOM.authStatusAlert.style.display = 'block';
                DOM.authStatusAlert.style.background = '#e6f4ea';
                DOM.authStatusAlert.style.color = '#137333';
                DOM.authStatusAlert.style.border = '1px solid #ceead6';
              }
              setTimeout(function () {
                if (DOM.authOverlay) DOM.authOverlay.classList.remove('active');
                showToast(`Verified Administrator Access: ${googleUser.name} ✨`, 'success');
                initDashboard();
              }, 600);
            } else {
              if (DOM.authStatusAlert) {
                DOM.authStatusAlert.textContent = result.message || 'Access Denied: Only aruvicollections.25@gmail.com is authorized.';
                DOM.authStatusAlert.style.display = 'block';
                DOM.authStatusAlert.style.background = '#fce8e6';
                DOM.authStatusAlert.style.color = '#c5221f';
                DOM.authStatusAlert.style.border = '1px solid #fad2cf';
              }
            }
          })
          .catch(function (err) {
            if (DOM.authStatusAlert) {
              DOM.authStatusAlert.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 6px;">⚠️ ${err.message}</div>
                <div style="font-size: 0.8rem; margin-bottom: 8px;">To access Admin Dashboard in local/preview environments, click below to verify directly:</div>
                <button type="button" id="btn-admin-instant-verify" class="btn-admin btn-admin-primary btn-admin-sm" style="font-size: 0.8rem; padding: 7px 14px; background: #153c30;">
                  👑 Sign In as aruvicollections.25@gmail.com
                </button>
              `;
              DOM.authStatusAlert.style.display = 'block';
              DOM.authStatusAlert.style.background = '#fef7e0';
              DOM.authStatusAlert.style.color = '#7c5300';
              DOM.authStatusAlert.style.border = '1px solid #f9df88';

              const instantBtn = document.getElementById('btn-admin-instant-verify');
              if (instantBtn) {
                instantBtn.onclick = function () {
                  handleAdminLogin('aruvicollections.25@gmail.com', 'admin');
                };
              }
            }
          })
          .finally(function () {
            DOM.btnAdminGoogle.disabled = false;
            DOM.btnAdminGoogle.style.opacity = '';
          });
      });
    }

    // Admin Direct Login Form
    if (DOM.formAdminLogin) {
      DOM.formAdminLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = DOM.adminInputEmail ? DOM.adminInputEmail.value.trim() : '';
        const password = DOM.adminInputPassword ? DOM.adminInputPassword.value : '';
        handleAdminLogin(email, password);
      });
    }

    if (DOM.btnLogout) DOM.btnLogout.addEventListener('click', handleLogout);

    // Sidebar Mobile Toggle
    if (DOM.sidebarToggle) {
      DOM.sidebarToggle.addEventListener('click', function () {
        DOM.sidebar.classList.toggle('open');
      });
    }

    // Nav Links
    DOM.navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const tab = this.getAttribute('data-tab');
        switchTab(tab);
      });
    });

    // Product search & filters
    if (DOM.prodSearchInput) {
      DOM.prodSearchInput.addEventListener('input', function (e) {
        AdminState.productFilter.search = e.target.value;
        renderProductsTable();
      });
    }
    if (DOM.prodCategoryFilter) {
      DOM.prodCategoryFilter.addEventListener('change', function (e) {
        AdminState.productFilter.category = e.target.value;
        renderProductsTable();
      });
    }
    if (DOM.prodStockFilter) {
      DOM.prodStockFilter.addEventListener('change', function (e) {
        AdminState.productFilter.stock = e.target.value;
        renderProductsTable();
      });
    }

    // Product modal
    if (DOM.btnOpenAddProduct) DOM.btnOpenAddProduct.addEventListener('click', openAddProductModal);
    const btnQuickAdd = document.getElementById('btn-open-add-product-quick');
    if (btnQuickAdd) btnQuickAdd.addEventListener('click', openAddProductModal);
    if (DOM.formProduct) DOM.formProduct.addEventListener('submit', saveProductForm);

    const checkAllProds = document.getElementById('check-all-products');
    if (checkAllProds) {
      checkAllProds.addEventListener('change', function () {
        const checked = this.checked;
        document.querySelectorAll('.product-row-check').forEach(function (chk) {
          chk.checked = checked;
        });
      });
    }

    // Preset Image Picker
    document.querySelectorAll('.image-preset-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        document.querySelectorAll('.image-preset-option').forEach(function (o) { o.classList.remove('selected'); });
        this.classList.add('selected');
        const src = this.getAttribute('data-src');
        updateProductImagePreview(src);
      });
    });

    // Firebase Cloud Storage Image Upload for Products
    const btnTriggerFirebase = document.getElementById('btn-trigger-firebase-upload');
    const fileFirebaseInput = document.getElementById('prod-file-firebase-upload');
    const progressWrap = document.getElementById('firebase-upload-progress');
    const progressBar = document.getElementById('firebase-progress-bar');
    const progressText = document.getElementById('firebase-progress-text');

    if (btnTriggerFirebase && fileFirebaseInput) {
      btnTriggerFirebase.addEventListener('click', function () {
        fileFirebaseInput.click();
      });

      fileFirebaseInput.addEventListener('change', function (e) {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        if (progressWrap) progressWrap.style.display = 'block';
        if (btnTriggerFirebase) {
          btnTriggerFirebase.disabled = true;
          btnTriggerFirebase.innerHTML = '<span>⏳</span> Uploading to Firebase...';
        }

        if (window.AruviFirebaseStorage && typeof window.AruviFirebaseStorage.uploadProductImage === 'function') {
          window.AruviFirebaseStorage.uploadProductImage(file, function (percent) {
            if (progressBar) progressBar.style.width = percent + '%';
            if (progressText) progressText.textContent = `Uploading to Firebase Storage... ${percent}%`;
          }).then(function (result) {
            if (btnTriggerFirebase) {
              btnTriggerFirebase.disabled = false;
              btnTriggerFirebase.innerHTML = '<span>✅</span> Uploaded to Firebase!';
            }
            if (progressText) progressText.textContent = '✓ Upload complete (Firebase Cloud Storage)';
            updateProductImagePreview(result.url);
            showToast('✓ Product image successfully uploaded to Firebase Storage!', 'success');
          }).catch(function (err) {
            if (btnTriggerFirebase) {
              btnTriggerFirebase.disabled = false;
              btnTriggerFirebase.innerHTML = '<span>🔥</span> Upload to Firebase Storage';
            }
            if (progressWrap) progressWrap.style.display = 'none';
            showToast('Upload error: ' + err.message, 'error');
          });
        }
      });
    }

    // Orders Filter & Tabs
    if (DOM.orderSearchInput) {
      DOM.orderSearchInput.addEventListener('input', function (e) {
        AdminState.orderFilter.search = e.target.value;
        renderOrdersTable();
      });
    }
    DOM.orderStatusFilterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        DOM.orderStatusFilterTabs.forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        AdminState.orderFilter.status = this.getAttribute('data-status');
        renderOrdersTable();
      });
    });

    // Category modal
    if (DOM.btnOpenAddCategory) DOM.btnOpenAddCategory.addEventListener('click', openAddCategoryModal);
    if (DOM.formCategory) DOM.formCategory.addEventListener('submit', saveCategoryForm);

    // Coupon modal
    if (DOM.btnOpenAddCoupon) DOM.btnOpenAddCoupon.addEventListener('click', openAddCouponModal);
    if (DOM.formCoupon) DOM.formCoupon.addEventListener('submit', saveCouponForm);

    // Banners
    if (DOM.formAnnouncement) DOM.formAnnouncement.addEventListener('submit', saveAnnouncementForm);
    if (DOM.formHero) DOM.formHero.addEventListener('submit', saveHeroForm);

    // Customers
    if (DOM.btnOpenAddCustomer) DOM.btnOpenAddCustomer.addEventListener('click', openAddCustomerModal);
    if (DOM.formCustomer) DOM.formCustomer.addEventListener('submit', saveCustomerForm);

    // Settings
    if (DOM.formSettings) DOM.formSettings.addEventListener('submit', saveStoreSettings);

    // Backup & Restore
    if (DOM.btnExportData) DOM.btnExportData.addEventListener('click', exportData);
    if (DOM.btnImportData && DOM.fileImportInput) {
      DOM.btnImportData.addEventListener('click', function () { DOM.fileImportInput.click(); });
      DOM.fileImportInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
          importData(e.target.files[0]);
        }
      });
    }
    if (DOM.btnResetData) DOM.btnResetData.addEventListener('click', resetFactoryData);

    // Modal Close Buttons
    document.querySelectorAll('.admin-modal-close, .btn-modal-cancel').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.admin-modal-overlay').forEach(function (m) {
          m.classList.remove('active');
        });
      });
    });

    // Close modal on background click
    document.querySelectorAll('.admin-modal-overlay').forEach(function (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Global Search Bar in Topbar
    if (DOM.globalSearch) {
      DOM.globalSearch.addEventListener('input', function (e) {
        const val = e.target.value.trim();
        if (val) {
          switchTab('products');
          if (DOM.prodSearchInput) {
            DOM.prodSearchInput.value = val;
            AdminState.productFilter.search = val;
            renderProductsTable();
          }
        }
      });
    }

    // Auto calculate discount in product modal while typing prices
    const prodPriceIn = document.getElementById('prod-input-price');
    const prodOrigPriceIn = document.getElementById('prod-input-orig-price');
    const prodDiscDisplay = document.getElementById('prod-calc-discount-display');
    function updateCalcDiscount() {
      const p = Number(prodPriceIn ? prodPriceIn.value : 0);
      const op = Number(prodOrigPriceIn ? prodOrigPriceIn.value : 0);
      if (op > p && p > 0 && prodDiscDisplay) {
        const pct = Math.round(((op - p) / op) * 100);
        prodDiscDisplay.textContent = pct + '% Discount';
      } else if (prodDiscDisplay) {
        prodDiscDisplay.textContent = '';
      }
    }
    if (prodPriceIn) prodPriceIn.addEventListener('input', updateCalcDiscount);
    if (prodOrigPriceIn) prodOrigPriceIn.addEventListener('input', updateCalcDiscount);
  }

  /* ==========================================================================
     HELPERS
     ========================================================================== */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getStatusClass(status) {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('deliver')) return 'delivered';
    if (s.includes('ship')) return 'shipped';
    if (s.includes('cancel')) return 'cancelled';
    if (s.includes('confirm') || s.includes('active')) return 'active';
    return 'pending';
  }

  function initDashboard() {
    renderOverviewStats();
    renderProductsTable();
    renderOrdersTable();
    renderCategories();
    renderCoupons();
    loadBannerSettings();
    renderCustomers();
    loadStoreSettings();
  }

  // Export to window for inline onclick handles
  window.AdminApp = {
    viewOrder: viewOrder,
    changeOrderStatus: changeOrderStatus,
    saveOrderCourier: saveOrderCourier,
    deleteOrder: deleteOrder,
    editProduct: editProduct,
    duplicateProduct: duplicateProduct,
    deleteProduct: deleteProduct,
    toggleProductStatus: toggleProductStatus,
    editCategory: editCategory,
    deleteCategory: deleteCategory,
    toggleCoupon: toggleCoupon,
    deleteCoupon: deleteCoupon,
    editCustomer: editCustomer,
    showToast: showToast
  };

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    checkAuthentication();

    // Real-time synchronization when products/orders are modified on storefront
    window.addEventListener('aruvi:data_updated', function (e) {
      if (Store.checkAuth()) {
        renderOverviewStats();
        renderProductsTable();
      }
    });

    window.addEventListener('storage', function (e) {
      if ((e.key === 'aruvi_products' || e.key === 'aruvi_orders') && Store.checkAuth()) {
        renderOverviewStats();
        renderProductsTable();
      }
    });
  });

})();
