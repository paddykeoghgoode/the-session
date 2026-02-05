'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  icon?: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => void;
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => void;
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'success', icon: options?.icon ?? '✓', ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'error', icon: options?.icon ?? '✕', ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    addToast({ message, type: 'info', icon: options?.icon ?? 'ℹ', ...options });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm md:top-4 md:right-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const bgColors = {
    success: 'bg-green-500/10 border-green-500',
    error: 'bg-red-500/10 border-red-500',
    info: 'bg-blue-500/10 border-blue-500',
    warning: 'bg-yellow-500/10 border-yellow-500',
  };

  const textColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
  };

  return (
    <div
      className={`${bgColors[toast.type]} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-slide-in-right pointer-events-auto`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {toast.icon && (
          <span className={`text-xl ${textColors[toast.type]} flex-shrink-0`}>
            {toast.icon}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <p className={`${textColors[toast.type]} text-sm font-medium`}>
            {toast.message}
          </p>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={`${textColors[toast.type]} text-xs font-semibold mt-2 hover:underline`}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-stout-400 hover:text-cream-100 transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
