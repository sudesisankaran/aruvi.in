import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

export default function CustomerAuthModal({ isOpen, onClose }) {
  const { user, isAdmin, loginWithGoogle, loginWithEmail, registerWithEmail, logout, addToast } = useStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res && res.email) {
        addToast(`Welcome back, ${res.name || res.email}!`, 'success');
        if (res.isAdmin) {
          addToast('👑 Owner Admin privileges active!', 'success');
        }
        onClose();
      }
    } catch (err) {
      console.warn('Google Auth Error:', err);
      // Helpful fallback for unauthorized domain or popup block
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console. Please whitelist your hostname in Firebase Authentication Settings.');
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google. You can sign in using email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      const loggedUser = loginWithEmail(loginEmail, loginPassword);
      addToast(`Signed in as ${loggedUser.name || loggedUser.email}`, 'success');
      if (loggedUser.isAdmin) {
        addToast('👑 Welcome Admin (aruvicollections.25@gmail.com)!', 'success');
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed');
    }
  };

  const handleEmailRegister = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regEmail || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    try {
      const newUser = registerWithEmail(regEmail, regPassword, regName, regPhone);
      addToast(`Account created for ${newUser.name || newUser.email}!`, 'success');
      if (newUser.isAdmin) {
        addToast('👑 Welcome Admin!', 'success');
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-modal-overlay active" role="dialog" aria-modal="true">
      <div className="auth-modal-backdrop" onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(5, 18, 14, 0.75)', backdropFilter: 'blur(6px)' }}></div>
      <div className="auth-modal-card" style={{ position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div className="auth-card-header">
          <button className="auth-close-btn" onClick={onClose} aria-label="Close Authentication">✕</button>
          <span className="auth-badge">ARUVI PATRON ACCESS</span>
          <h2 className="auth-title">My Account</h2>
          <p className="auth-subtitle">Sign in to track orders, access wishlist & checkout faster.</p>
        </div>

        {/* If already logged in */}
        {user ? (
          <div className="auth-card-body" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{isAdmin ? '👑' : '✨'}</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#0e2920', marginBottom: '8px' }}>
              {isAdmin ? 'Owner Admin Active' : `Hello, ${user.name || user.email}`}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Logged in as: <strong>{user.email}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isAdmin && (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    navigate('/admin');
                  }}
                  style={{ background: 'var(--color-gold)', color: '#0e2920', fontWeight: 'bold' }}
                >
                  ⚡ Open Owner Admin Dashboard
                </button>
              )}
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  navigate('/account');
                }}
              >
                View Account & Orders
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={() => {
                  logout();
                  addToast('Signed out successfully.', 'info');
                }}
                style={{ color: '#c93b3b', borderColor: '#c93b3b' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs: Sign In / Create Account */}
            <div className="auth-tabs-row">
              <button 
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
              >
                Sign In
              </button>
              <button 
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Body */}
            <div className="auth-card-body">
              {errorMsg && (
                <div className="auth-alert-box error" style={{ display: 'block', background: '#ffebee', color: '#c93b3b', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.85rem' }}>
                  {errorMsg}
                </div>
              )}

              {/* Firebase Google Sign-In */}
              <button 
                type="button" 
                className="btn-google-auth" 
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="google-logo-svg" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
              </button>

              <div className="auth-divider">
                <span>OR WITH EMAIL</span>
              </div>

              {activeTab === 'login' ? (
                <form onSubmit={handleEmailLogin}>
                  <div className="auth-form-group">
                    <label className="auth-form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="auth-form-input" 
                      placeholder="aruvicollections.25@gmail.com" 
                      required 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Password *</label>
                    <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="auth-form-input" 
                        placeholder="Enter your password" 
                        required 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="auth-password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="auth-helper-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 16px' }}>
                    <label className="auth-remember-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" defaultChecked />
                      <span>Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      className="auth-forgot-link" 
                      onClick={() => addToast('Please contact concierge or reset password via Firebase console.', 'info')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button type="submit" className="btn btn-primary btn-auth-submit hover-shimmer" style={{ width: '100%' }}>
                    Sign In to Boutique
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailRegister}>
                  <div className="auth-form-group">
                    <label className="auth-form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="auth-form-input" 
                      placeholder="e.g. Priyadarshini" 
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="auth-form-input" 
                      placeholder="name@example.com" 
                      required 
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="auth-form-input" 
                      placeholder="+91 98765 43210" 
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                    />
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">Create Password *</label>
                    <div className="auth-input-wrapper" style={{ position: 'relative' }}>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        className="auth-form-input" 
                        placeholder="At least 6 characters" 
                        required 
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="auth-password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-auth-submit hover-shimmer" style={{ width: '100%', marginTop: '16px' }}>
                    Create Patron Account
                  </button>
                </form>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
