import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '#/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fbf9f6 0%, #f4eee5 100%)',
          color: '#0e2920'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(200, 157, 56, 0.15)',
            border: '2px solid var(--color-gold, #c89d38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            marginBottom: '20px'
          }}>
            ✨
          </div>
          <h2 style={{ fontFamily: 'serif', fontSize: '1.8rem', color: '#0e2920', marginBottom: '8px' }}>
            Aruvi Collections Atelier
          </h2>
          <p style={{ color: '#667770', maxWidth: '480px', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
            A temporary display refresh occurred. Tap below to return to the boutique home.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              borderRadius: '99px',
              background: '#0e2920',
              color: '#f6e05e',
              border: '1.5px solid #c89d38',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(14,41,32,0.15)'
            }}
          >
            ← Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
