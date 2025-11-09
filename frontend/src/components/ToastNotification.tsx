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
        return 'bg-black border-lab-alert text-lab-alert';
      case 'warning':
        return 'bg-black border-orange-500 text-orange-500';
      case 'success':
        return 'bg-black border-lab-mint text-lab-mint';
      default:
        return 'bg-black border-lab-cyan text-lab-cyan';
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        shadow-2xl p-4 mb-3
        border-2
        animate-slide-in
        max-w-md w-full
        flex items-start gap-3
        font-mono
      `}
      style={{ borderRadius: '2px' }}
    >
      {type === 'warning' && (
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight break-words uppercase tracking-wide">
          {message}
        </p>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 hover:opacity-70 p-1 transition-opacity"
        aria-label="Dismiss"
        style={{ borderRadius: '2px' }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
