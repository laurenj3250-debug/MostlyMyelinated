import React from 'react';

interface ScanlineOverlayProps {
  intensity?: 'light' | 'medium' | 'heavy';
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

/**
 * Animated scan line overlay effect for that medical monitor aesthetic
 */
export default function ScanlineOverlay({
  intensity = 'medium',
  speed = 'normal',
  className = '',
}: ScanlineOverlayProps) {
  const getIntensityClass = () => {
    switch (intensity) {
      case 'light':
        return 'opacity-20';
      case 'heavy':
        return 'opacity-60';
      default:
        return 'opacity-40';
    }
  };

  const getAnimationDuration = () => {
    switch (speed) {
      case 'slow':
        return '12s';
      case 'fast':
        return '4s';
      default:
        return '8s';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Horizontal scan lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 217, 255, 0.03) 2px,
            rgba(0, 217, 255, 0.03) 3px
          )`,
        }}
      />

      {/* Moving scan line */}
      <div
        className={`absolute left-0 right-0 h-1 ${getIntensityClass()}`}
        style={{
          background: `linear-gradient(to bottom,
            transparent,
            rgba(0, 217, 255, 0.8),
            rgba(0, 217, 255, 0.8),
            transparent
          )`,
          animation: `scan-line ${getAnimationDuration()} linear infinite`,
        }}
      />

      {/* CRT curve effect at edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 70%,
            rgba(0, 0, 0, 0.1) 100%
          )`,
        }}
      />
    </div>
  );
}