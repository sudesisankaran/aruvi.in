import React from 'react';
import { useStore } from '../context/StoreContext';

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toast-container" style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`toast-item toast-${toast.type || 'info'} animate-slide-up`}
          style={{
            background: toast.type === 'error' ? '#842029' : toast.type === 'success' ? '#0f5132' : '#0e2920',
            color: '#fff',
            border: '1px solid rgba(200,157,56,0.6)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '12px 18px',
            minWidth: '280px',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            lineHeight: 1.4
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{toast.type === 'error' ? '⚠️' : toast.type === 'success' ? '✨' : 'ℹ️'}</span>
            <span>{toast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1rem', marginLeft: '12px' }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
