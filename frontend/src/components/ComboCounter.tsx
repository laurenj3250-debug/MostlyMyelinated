import { useEffect, useState } from 'react';

interface ComboCounterProps {
  combo: number;
  multiplier: number;
}

/**
 * MAXIMUM DOPAMINE COMBO COUNTER
 * Visual combo display that grows and shakes with size
 */
export default function ComboCounter({ combo, multiplier }: ComboCounterProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCombo, setPrevCombo] = useState(combo);

  useEffect(() => {
    if (combo > prevCombo) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    setPrevCombo(combo);
  }, [combo, prevCombo]);

  if (combo < 3) {
    return null; // Don't show until 3+ combo
  }

  // Visual states based on combo size
  const getComboStyle = () => {
    if (combo >= 20) {
      return {
        size: 'text-6xl',
        emoji: '💥💥💥',
        label: 'MEGA COMBO',
        bgColor: 'from-red-600 via-orange-500 to-yellow-500',
        borderColor: 'border-yellow-500',
        glow: 'shadow-2xl shadow-yellow-500/50',
        shake: true,
      };
    } else if (combo >= 10) {
      return {
        size: 'text-5xl',
        emoji: '🔥🔥🔥',
        label: 'HUGE COMBO',
        bgColor: 'from-red-600 via-orange-500 to-red-600',
        borderColor: 'border-red-500',
        glow: 'shadow-xl shadow-red-500/50',
        shake: true,
      };
    } else if (combo >= 5) {
      return {
        size: 'text-4xl',
        emoji: '🔥🔥',
        label: 'BIG COMBO',
        bgColor: 'from-orange-600 via-yellow-500 to-orange-600',
        borderColor: 'border-orange-500',
        glow: 'shadow-lg shadow-orange-500/50',
        shake: false,
      };
    } else {
      return {
        size: 'text-3xl',
        emoji: '🔥',
        label: 'COMBO',
        bgColor: 'from-orange-500 to-red-500',
        borderColor: 'border-orange-400',
        glow: 'shadow-md shadow-orange-500/30',
        shake: false,
      };
    }
  };

  const style = getComboStyle();

  return (
    <div
      className={`
        fixed top-24 right-4 z-50
        bg-gradient-to-br ${style.bgColor}
        border-4 ${style.borderColor}
        rounded-2xl p-4
        ${style.glow}
        transform transition-all duration-300
        ${isAnimating ? 'scale-110' : 'scale-100'}
        ${style.shake && isAnimating ? 'animate-shake' : ''}
        ${combo >= 20 ? 'animate-pulse' : ''}
      `}
    >
      <div className="text-center">
        <div className={`${style.size} font-black text-white mb-1 drop-shadow-lg`}>
          {combo}x
        </div>
        <div className="text-xs font-bold text-white/90 uppercase tracking-wider mb-1">
          {style.label}
        </div>
        <div className="text-2xl mb-1">{style.emoji}</div>
        <div className="text-sm font-bold text-white/90">
          {multiplier}x XP
        </div>
      </div>

      {/* Flame particles for high combos */}
      {combo >= 10 && (
        <div className="absolute -top-2 -right-2">
          <span className="text-3xl animate-bounce">🔥</span>
        </div>
      )}
      {combo >= 10 && (
        <div className="absolute -top-2 -left-2">
          <span className="text-3xl animate-bounce delay-100">🔥</span>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-2deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(2deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}
