import { useState } from 'react';
import axios from 'axios';

interface NewNodeBadgeProps {
  nodeId: string;
  importedAt: Date | string;
  sourceFile?: string;
  onDismiss?: (nodeId: string) => void;
  className?: string;
}

export default function NewNodeBadge({
  nodeId,
  importedAt,
  sourceFile,
  onDismiss,
  className = '',
}: NewNodeBadgeProps) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissing(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/nodes/${nodeId}/dismiss-new`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (onDismiss) {
        onDismiss(nodeId);
      }
    } catch (error) {
      console.error('Failed to dismiss badge:', error);
      setIsDismissing(false);
    }
  };

  const getTimeAgo = (): string => {
    const date = typeof importedAt === 'string' ? new Date(importedAt) : importedAt;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleDismiss}
        disabled={isDismissing}
        className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-pill border-none font-display font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 100%)',
          color: '#ffffff',
          boxShadow: isDismissing
            ? '0 0 8px rgba(255, 94, 205, 0.3)'
            : '0 0 12px rgba(255, 94, 205, 0.6)',
          animation: isDismissing ? 'none' : 'pulse-glow 1.5s ease-in-out infinite',
        }}
      >
        <span className="relative">
          {isDismissing ? 'DISMISSING...' : 'NEW'}
        </span>
        {!isDismissing && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !isDismissing && (
        <div
          className="absolute z-50 px-4 py-3 rounded-lg border-2 shadow-xl whitespace-nowrap pointer-events-none"
          style={{
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 14, 26, 0.98)',
            borderColor: '#a34bff',
            boxShadow: '0 0 20px rgba(163, 75, 255, 0.4)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="font-mono text-xs text-neon-purple font-bold uppercase">
              Imported {getTimeAgo()}
            </div>
            {sourceFile && (
              <div className="font-mono text-xs text-lab-text-dim">
                From: {sourceFile}
              </div>
            )}
            <div className="font-mono text-xs text-lab-text-dim italic mt-1">
              Click to dismiss
            </div>
          </div>
          {/* Arrow */}
          <div
            className="absolute w-3 h-3 transform rotate-45"
            style={{
              bottom: '-7px',
              left: 'calc(50% - 6px)',
              background: 'rgba(10, 14, 26, 0.98)',
              borderRight: '2px solid #a34bff',
              borderBottom: '2px solid #a34bff',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(255, 94, 205, 0.6);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 94, 205, 0.9);
          }
        }
      `}</style>
    </div>
  );
}
