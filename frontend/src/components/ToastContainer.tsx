import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import ToastNotification from './ToastNotification';

interface Toast {
  id: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface Props {
  children: ReactNode;
}

export function ToastProvider({ children }: Props) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container - fixed top-right */}
      <div className="fixed top-4 right-4 z-50 max-w-md w-full px-4 pointer-events-none">
        <div className="pointer-events-auto space-y-3">
          {toasts.map(toast => (
            <ToastNotification
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onDismiss={removeToast}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
