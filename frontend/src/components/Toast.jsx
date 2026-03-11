import React, { useState, useEffect, useCallback } from 'react';
import './Toast.css';

// Simple pub-sub event emitter for toast notifications
const toastEmitter = {
  listeners: [],
  on(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  emit(toast) {
    this.listeners.forEach(listener => listener(toast));
  }
};

export const toast = {
  success: (message) => toastEmitter.emit({ id: Date.now(), message, type: 'success' }),
  error: (message) => toastEmitter.emit({ id: Date.now(), message, type: 'error' }),
  custom: (message, type) => toastEmitter.emit({ id: Date.now(), message, type }),
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastEmitter.on((newToast) => {
      setToasts((currentToasts) => [...currentToasts, newToast]);
      
      // Auto dismiss after 3 seconds
      setTimeout(() => {
        removeToast(newToast.id);
      }, 3000);
    });
    
    return unsubscribe;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter(t => t.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} fade-in-up`}>
          <div className="toast-icon">
            {t.type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            )}
            {t.type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {t.type !== 'success' && t.type !== 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            )}
          </div>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
