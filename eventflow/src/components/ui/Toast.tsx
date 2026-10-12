import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const ICONS = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const COLORS = {
  success: '#28A745',
  error: 'var(--error)',
  warning: '#FFC107',
  info: 'var(--primary)',
};

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`toast toast-${toast.type}`} style={{ animation: 'slideIn 0.3s ease' }}>
      <span
        className="material-symbols-outlined toast-icon icon-filled"
        style={{ color: COLORS[toast.type] }}
      >
        {ICONS[toast.type]}
      </span>
      <div style={{ flex: 1 }}>
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message">{toast.message}</div>
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>close</span>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
