import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  id: string;
  message: string;
  type?: 'error' | 'warning' | 'success' | 'info';
  duration?: number;
  onDismiss: (id: string) => void;
}

export default function ToastNotification({ id, message, type = 'info', duration = 5000, onDismiss }: Props) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800';
      case 'warning':
        return 'bg-gradient-to-r from-orange-600 to-red-600 text-white border-red-700';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-700';
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800';
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        rounded-xl shadow-2xl p-4 mb-3
        border-2 backdrop-blur-sm
        animate-slide-in
        max-w-md w-full
        flex items-start gap-3
      `}
    >
      {type === 'warning' && (
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight break-words">
          {message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
