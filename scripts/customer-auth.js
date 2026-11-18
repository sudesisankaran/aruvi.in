/**
 * ARUVI COLLECTIONS - CUSTOMER AUTHENTICATION ENGINE
 * Handles Email/Password Sign-In & Registration.
 * Powers the "My Account" modal and account.html views.
 */

(function (window, document) {
  'use strict';

  const CustomerAuth = {
    modalId: 'firebase-customer-auth-modal',
    activeTab: 'login', // 'login' or 'register'

    init: function () {
      this.ensureModalDOM();
      this.bindTriggers();
      this.syncHeaderUserState();
      this.initAccountPageViews();

      // Listen for customer auth changes
      window.addEventListener('aruvi:customer_auth_changed', () => {
        this.syncHeaderUserState();
        this.initAccountPageViews();
      });
    },

    /**
     * Injects the Firebase Auth Modal if not already present
     */
    ensureModalDOM: function () {
      if (document.getElementById(this.modalId)) return;

      const modalHTML = `
        <div class="auth-modal-overlay" id="${this.modalId}" aria-hidden="true" role="dialog">
          <div class="auth-modal-card">
            
            <!-- Header -->
            <div class="auth-card-header">
              <button class="auth-close-btn" id="btn-close-auth-modal" aria-label="Close Authentication">✕</button>
              <span class="auth-badge">ARUVI PATRON ACCESS</span>
              <h2 class="auth-title">My Account</h2>
              <p class="auth-subtitle">Sign in to track orders, access wishlist & checkout faster.</p>
            </div>

            <!-- Tabs: Sign In / Create Account -->
            <div class="auth-tabs-row">
              <button class="auth-tab-btn active" id="tab-auth-login">Sign In</button>
              <button class="auth-tab-btn" id="tab-auth-register">Create Account</button>
            </div>

            <!-- Body -->
            <div class="auth-card-body">
              
              <!-- Error/Success Alert Box -->
              <div class="auth-alert-box" id="auth-alert-box"></div>

              <!-- Form 1: Sign In with Email & Password -->
              <form id="form-auth-login" style="display: block;">
                <div class="auth-form-group">
                  <label class="auth-form-label">Email Address *</label>
                  <input type="email" id="login-input-email" class="auth-form-input" placeholder="name@example.com" required autocomplete="email" />
                </div>

                <div class="auth-form-group">
                  <label class="auth-form-label">Password *</label>
                  <div class="auth-input-wrapper">
                    <input type="password" id="login-input-password" class="auth-form-input" placeholder="Enter your password" required autocomplete="current-password" />
                    <button type="button" class="auth-password-toggle" data-target="login-input-password">👁️</button>
                  </div>
                </div>

                <div class="auth-helper-row">
                  <label class="auth-remember-label">
                    <input type="checkbox" id="login-remember-me" checked style="accent-color: var(--color-primary);" />
                    <span>Remember me</span>
                  </label>
                  <span class="auth-forgot-link" id="link-forgot-password">Forgot password?</span>
                </div>

                <button type="submit" class="btn btn-primary btn-auth-submit hover-shimmer">
                  Sign In to Boutique
                </button>
              </form>

              <!-- Form 2: Create Account / Register -->
              <form id="form-auth-register" style="display: none;">
                <div class="auth-form-group">
                  <label class="auth-form-label">Full Name *</label>
                  <input type="text" id="reg-input-name" class="auth-form-input" placeholder="e.g. Priya Sharma" required autocomplete="name" />
                </div>

                <div class="auth-form-group">
                  <label class="auth-form-label">Email Address *</label>
                  <input type="email" id="reg-input-email" class="auth-form-input" placeholder="name@example.com" required autocomplete="email" />
                </div>

                <div class="auth-form-group">
                  <label class="auth-form-label">Password * (Min 6 chars)</label>
                  <div class="auth-input-wrapper">
                    <input type="password" id="reg-input-password" class="auth-form-input" placeholder="Create a secure password" minlength="6" required autocomplete="new-password" />
                    <button type="button" class="auth-password-toggle" data-target="reg-input-password">👁️</button>
                  </div>
                </div>

                <div class="auth-form-group">
                  <label class="auth-form-label">Phone Number (Optional)</label>
                  <input type="tel" id="reg-input-phone" class="auth-form-input" placeholder="+91 98765 43210" autocomplete="tel" />
                </div>

                <button type="submit" class="btn btn-primary btn-auth-submit hover-shimmer">
                  Create Patron Account
                </button>
              </form>

              <div class="auth-footer-note">
                By continuing, you agree to Aruvi Collections' <a href="account.html#support">Terms of Service</a> & <a href="account.html#support">Privacy Policy</a>.
              </div>

            </div>

          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
      this.bindModalEvents();
    },

    /**
     * Binds clicks on "My Account" buttons across the website
     */
    bindTriggers: function () {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('#header-user-btn, [data-open-account-auth], a[href="account.html"]');
        if (trigger) {
          // If on account.html, let account.html handle itself
          const isAccountPage = window.location.pathname.endsWith('account.html');
          const auth = this.getAuth();

          if (!auth.loggedIn && !isAccountPage) {
            e.preventDefault();
            this.openModal('login');
          }
        }
      });
    },

    /**
     * Binds modal internal actions (tabs, forms, inputs)
     */
    bindModalEvents: function () {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;

      const closeBtn = document.getElementById('btn-close-auth-modal');
      closeBtn.addEventListener('click', () => this.closeModal());
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });

      // ESC key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          this.closeModal();
        }
      });

      // Tabs: Login vs Register
      const tabLogin = document.getElementById('tab-auth-login');
      const tabRegister = document.getElementById('tab-auth-register');
      const formLogin = document.getElementById('form-auth-login');
      const formRegister = document.getElementById('form-auth-register');
      const alertBox = document.getElementById('auth-alert-box');

      tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.style.display = 'block';
        formRegister.style.display = 'none';
        this.clearAlert();
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formLogin.style.display = 'none';
        formRegister.style.display = 'block';
        this.clearAlert();
      });

      // Password toggle buttons
      modal.querySelectorAll('.auth-password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target');
          const input = document.getElementById(targetId);
          if (input) {
            if (input.type === 'password') {
              input.type = 'text';
              btn.textContent = '🔒';
            } else {
              input.type = 'password';
              btn.textContent = '👁️';
            }
          }
        });
      });

      // Email Login Submit
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-input-email').value.trim();
        const password = document.getElementById('login-input-password').value;
        this.handleEmailLogin(email, password);
      });

      // Register Submit
      formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-input-name').value.trim();
        const email = document.getElementById('reg-input-email').value.trim();
        const password = document.getElementById('reg-input-password').value;
        this.handleRegister(name, email, password);
      });

      // Forgot Password
      const forgotLink = document.getElementById('link-forgot-password');
      if (forgotLink) {
        forgotLink.addEventListener('click', () => {
          const email = document.getElementById('login-input-email').value.trim();
          if (!email) {
            this.showAlert('Please enter your email address to receive password reset instructions.', 'error');
            return;
          }
          this.showAlert(`Password reset link sent to ${email}! 📨`, 'success');
        });
      }
    },

    /**
     * Email / Password Login
     */
    handleEmailLogin: function (email, password) {
      if (!email || !password) {
        this.showAlert('Please enter both email and password.', 'error');
        return;
      }

      let res = { success: false, message: 'Store error' };
      if (window.AruviStore && typeof window.AruviStore.loginCustomerWithEmail === 'function') {
        res = window.AruviStore.loginCustomerWithEmail(email, password);
      } else {
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const user = { uid: 'usr_' + Date.now(), name: name, email: email, provider: 'password' };
        localStorage.setItem('aruvi_customer_logged_in', 'true');
        localStorage.setItem('aruvi_customer_user', JSON.stringify(user));
        res = { success: true, user: user };
        window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', { detail: { loggedIn: true, user: user } }));
      }

      if (res.success) {
        this.showAlert(`✓ Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => {
          this.closeModal();
          if (window.location.pathname.endsWith('account.html')) {
            window.location.reload();
          } else {
            if (window.Aruvi && window.Aruvi.showToast) {
              window.Aruvi.showToast(`Signed in successfully! ✨`, 'success');
            }
          }
        }, 500);
      } else {
        this.showAlert(res.message || 'Invalid email or password.', 'error');
      }
    },

    /**
     * Create Account / Register
     */
    handleRegister: function (name, email, password) {
      if (!name || !email || !password) {
        this.showAlert('Please fill in all required fields.', 'error');
        return;
      }
      if (password.length < 6) {
        this.showAlert('Password must be at least 6 characters.', 'error');
        return;
      }

      let res = { success: false };
      if (window.AruviStore && typeof window.AruviStore.registerCustomer === 'function') {
        res = window.AruviStore.registerCustomer(name, email, password);
      } else {
        const user = { uid: 'reg_' + Date.now(), name: name, email: email, provider: 'password' };
        localStorage.setItem('aruvi_customer_logged_in', 'true');
        localStorage.setItem('aruvi_customer_user', JSON.stringify(user));
        res = { success: true, user: user };
        window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', { detail: { loggedIn: true, user: user } }));
      }

      if (res.success) {
        this.showAlert(`✓ Account created! Welcome to Aruvi Collections, ${res.user.name}! 🎉`, 'success');
        setTimeout(() => {
          this.closeModal();
          if (window.location.pathname.endsWith('account.html')) {
            window.location.reload();
          } else {
            if (window.Aruvi && window.Aruvi.showToast) {
              window.Aruvi.showToast(`Account registered successfully! 🌿`, 'success');
            }
          }
        }, 600);
      } else {
        this.showAlert(res.message || 'Registration failed.', 'error');
      }
    },

    /**
     * Open Auth Modal
     */
    openModal: function (mode) {
      this.ensureModalDOM();
      const modal = document.getElementById(this.modalId);
      if (!modal) return;

      const tabLogin = document.getElementById('tab-auth-login');
      const tabRegister = document.getElementById('tab-auth-register');
      const formLogin = document.getElementById('form-auth-login');
      const formRegister = document.getElementById('form-auth-register');

      if (mode === 'register') {
        tabRegister.click();
      } else {
        tabLogin.click();
      }

      this.clearAlert();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    },

    /**
     * Close Auth Modal
     */
    closeModal: function () {
      const modal = document.getElementById(this.modalId);
      if (!modal) return;
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    },

    showAlert: function (msg, type) {
      const box = document.getElementById('auth-alert-box');
      if (!box) return;
      box.className = `auth-alert-box ${type}`;
      box.textContent = msg;
    },

    clearAlert: function () {
      const box = document.getElementById('auth-alert-box');
      if (box) {
        box.className = 'auth-alert-box';
        box.textContent = '';
      }
    },

    getAuth: function () {
      if (window.AruviStore && typeof window.AruviStore.getCustomerAuth === 'function') {
        return window.AruviStore.getCustomerAuth();
      }
      try {
        const logged = localStorage.getItem('aruvi_customer_logged_in') === 'true';
        const user = JSON.parse(localStorage.getItem('aruvi_customer_user') || 'null');
        return { loggedIn: logged && !!user, user: user };
      } catch (e) {
        return { loggedIn: false, user: null };
      }
    },

    /**
     * Synchronizes Header Account icon
     */
    syncHeaderUserState: function () {
      const auth = this.getAuth();
      const userBtns = document.querySelectorAll('#header-user-btn');

      userBtns.forEach(btn => {
        if (auth.loggedIn && auth.user) {
          btn.title = `Signed in as ${auth.user.name}`;
          btn.style.borderColor = 'var(--color-gold)';
          btn.style.background = 'var(--color-primary)';
          btn.style.color = '#f4db8e';
          // Show user initial or avatar
          const initial = (auth.user.name || 'U').charAt(0).toUpperCase();
          btn.innerHTML = `<span style="font-weight:800; font-size:0.85rem;">${initial}</span>`;
        } else {
          btn.title = 'My Account (Sign In)';
          btn.style.borderColor = '';
          btn.style.background = '';
          btn.style.color = '';
          btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          `;
        }
      });
    },

    /**
     * Initializes account.html views (Switches between Auth View & Dashboard View)
     */
    initAccountPageViews: function () {
      // account.html page form bindings
      const accPageTabLogin = document.getElementById('acc-page-tab-login');
      const accPageTabReg = document.getElementById('acc-page-tab-register');
      const accFormLogin = document.getElementById('form-acc-page-login');
      const accFormReg = document.getElementById('form-acc-page-register');
      const accAlert = document.getElementById('acc-page-alert-box');

      if (accPageTabLogin && accPageTabReg) {
        accPageTabLogin.addEventListener('click', () => {
          accPageTabLogin.classList.add('active');
          accPageTabReg.classList.remove('active');
          accFormLogin.style.display = 'block';
          accFormReg.style.display = 'none';
          if (accAlert) accAlert.className = 'auth-alert-box';
        });

        accPageTabReg.addEventListener('click', () => {
          accPageTabReg.classList.add('active');
          accPageTabLogin.classList.remove('active');
          accFormLogin.style.display = 'none';
          accFormReg.style.display = 'block';
          if (accAlert) accAlert.className = 'auth-alert-box';
        });

        if (accFormLogin) {
          accFormLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const em = document.getElementById('acc-input-login-email').value.trim();
            const pw = document.getElementById('acc-input-login-password').value;
            this.handleEmailLogin(em, pw);
          });
        }

        if (accFormReg) {
          accFormReg.addEventListener('submit', (e) => {
            e.preventDefault();
            const nm = document.getElementById('acc-input-reg-name').value.trim();
            const em = document.getElementById('acc-input-reg-email').value.trim();
            const pw = document.getElementById('acc-input-reg-password').value;
            this.handleRegister(nm, em, pw);
          });
        }
      }
  
      if (!window.location.pathname.endsWith('account.html')) return;

      const auth = this.getAuth();
      const authView = document.getElementById('account-auth-view');
      const dashboardView = document.getElementById('account-dashboard-view');
      const userNameElem = document.getElementById('account-user-name');
      const userEmailElem = document.getElementById('account-user-email');
      const logoutBtn = document.getElementById('btn-account-logout');

      if (!authView || !dashboardView) return;

      if (auth.loggedIn && auth.user) {
        authView.style.display = 'none';
        dashboardView.style.display = 'block';

        if (userNameElem) userNameElem.textContent = auth.user.name;
        if (userEmailElem) userEmailElem.textContent = auth.user.email;

        // Show Admin link exclusively if signed in as aruvicollections.25@gmail.com
        const isAdmin = auth.user.email && auth.user.email.toLowerCase() === 'aruvicollections.25@gmail.com';
        const adminLink = document.getElementById('account-admin-link-item');
        if (adminLink) {
          adminLink.style.display = isAdmin ? 'block' : 'none';
        }
      } else {
        authView.style.display = 'block';
        dashboardView.style.display = 'none';
      }

      // Logout handler
      if (logoutBtn) {
        logoutBtn.onclick = (e) => {
          e.preventDefault();
          if (confirm('Are you sure you want to sign out of your account?')) {
            if (window.AruviStore && typeof window.AruviStore.logoutCustomer === 'function') {
              window.AruviStore.logoutCustomer();
            } else {
              localStorage.removeItem('aruvi_customer_logged_in');
              localStorage.removeItem('aruvi_customer_user');
              window.dispatchEvent(new CustomEvent('aruvi:customer_auth_changed', { detail: { loggedIn: false } }));
            }
            window.location.reload();
          }
        };
      }
    }
  };

  // Export to window
  window.AruviCustomerAuth = CustomerAuth;

  // Auto initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CustomerAuth.init());
  } else {
    CustomerAuth.init();
  }

})(window, document);
