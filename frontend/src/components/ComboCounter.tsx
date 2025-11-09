import { useEffect, useState } from 'react';

interface ComboCounterProps {
  combo: number;
  multiplier: number;
}

/**
 * REAL-TIME COMBO MONITOR
 * Digital readout display - no emojis, pure data
 */
export default function ComboCounter({ combo, multiplier }: ComboCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCombo, setPrevCombo] = useState(combo);

  useEffect(() => {
    if (combo > prevCombo) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    setPrevCombo(combo);
  }, [combo, prevCombo]);

  if (combo < 3) {
    return null; // Don't show until 3+ combo
  }

  // Determine alert level based on combo
  const getAlertLevel = () => {
    if (combo >= 20) return 'CRITICAL';
    if (combo >= 10) return 'HIGH';
    if (combo >= 5) return 'ELEVATED';
    return 'ACTIVE';
  };

  const getGlowColor = () => {
    if (combo >= 20) return 'shadow-glow-alert';
    if (combo >= 10) return 'shadow-glow-cyan';
    return 'shadow-glow-mint';
  };

  const getTextColor = () => {
    if (combo >= 20) return 'text-lab-alert';
    if (combo >= 10) return 'text-lab-cyan';
    return 'text-lab-mint';
  };

  const getBorderColor = () => {
    if (combo >= 20) return 'border-lab-alert';
    if (combo >= 10) return 'border-lab-cyan';
    return 'border-lab-mint';
  };

  return (
    <div
      className={`
        fixed top-24 right-4 z-50
        bg-black border-2 ${getBorderColor()}
        p-4 ${getGlowColor()}
        transform transition-all duration-200
        ${isAnimating ? 'scale-105 animate-data-flicker' : 'scale-100'}
        ${combo >= 20 ? 'animate-pulse-cyan' : ''}
      `}
      style={{ borderRadius: '2px' }}
    >
      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 217, 255, 0.05) 2px,
              rgba(0, 217, 255, 0.05) 3px
            )`,
          }}
        />
      </div>

      <div className="relative z-10 min-w-[200px]">
        {/* Header */}
        <div className="border-b border-lab-cyan/30 pb-2 mb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider">
              COMBO MONITOR
            </span>
            <span className={`text-xs font-mono ${getTextColor()} font-bold uppercase tracking-wider`}>
              {getAlertLevel()}
            </span>
          </div>
        </div>

        {/* Main combo display */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider mb-1">
              STREAK
            </div>
            <div className={`text-5xl font-mono font-bold ${getTextColor()} text-glow leading-none`}>
              {String(combo).padStart(2, '0')}
            </div>
          </div>
          <div className={`text-xl font-mono ${getTextColor()} mb-1`}>x</div>
        </div>

        {/* Multiplier display */}
        <div className="border-t border-lab-cyan/30 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-lab-text-tertiary uppercase">
              XP MULTIPLIER
            </span>
            <span className={`text-lg font-mono font-bold ${getTextColor()}`}>
              {multiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Bonus XP indicator */}
        <div className="mt-2 text-xs font-mono text-lab-text-tertiary">
          +{Math.round((multiplier - 1) * 100)}% BONUS
        </div>

        {/* Activity indicator bars */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: Math.min(combo, 10) }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 ${
                i < combo ? getBorderColor().replace('border-', 'bg-') : 'bg-lab-border'
              } transition-all duration-300`}
            />
          ))}
        </div>

        {/* System time stamp */}
        <div className="mt-3 text-xs font-mono text-lab-text-tertiary opacity-50">
          {new Date().toISOString().slice(11, 19)} UTC
        </div>
      </div>

      {/* Pulse indicator for high combos */}
      {combo >= 10 && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${getBorderColor().replace('border-', 'bg-')} rounded-full animate-pulse`} />
      )}
    </div>
  );
}