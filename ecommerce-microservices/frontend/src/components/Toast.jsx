import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

// A simple imperative event emitter for toasts could be used, or just globally mount a toast container.
// Here we provide a presentational Toast, and for global state we'll need a utility or Context.
export const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center p-4 mb-4 text-gray-300 bg-nexus-card border-l-4 rounded-r shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-[slideIn_0.3s_ease-out]" 
         style={{ borderColor: type === 'success' ? '#00d4aa' : '#ef4444' }}>
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {type === 'success' ? <CheckCircle className="w-5 h-5 text-nexus-secondary" /> : <XCircle className="w-5 h-5 text-red-500" />}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
    </div>
  );
};

// Global Toast Manager would realistically be a Context, for simplicity we provide the component.
export default Toast;
