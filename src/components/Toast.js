import React from 'react';
import { useToast } from '../context/ToastContext';

export default function Toast({ rtl }) {
  const { toast } = useToast();
  if (!toast.visible) return null;
  let bg = 'bg-blue-600';
  if (toast.type === 'success') bg = 'bg-green-600';
  if (toast.type === 'error') bg = 'bg-red-600';
  return (
    <div className={`fixed z-50 bottom-6 ${rtl ? 'left-6' : 'right-6'} max-w-xs w-full animate-fade-in`}
      style={{ direction: rtl ? 'rtl' : 'ltr' }}>
      <div className={`rounded-lg shadow-lg px-4 py-3 text-white font-semibold ${bg} flex items-center gap-2`}>
        {toast.type === 'success' && <span>✅</span>}
        {toast.type === 'error' && <span>❌</span>}
        {toast.type === 'info' && <span>ℹ️</span>}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}