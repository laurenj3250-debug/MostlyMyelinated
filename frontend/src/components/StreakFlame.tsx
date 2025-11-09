interface StreakFlameProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
}

/**
 * MAXIMUM DOPAMINE STREAK FLAME
 * Animated flame visualization that grows with streak
 */
export default function StreakFlame({
  streak,
  size = 'medium',
  showNumber = true,
}: StreakFlameProps) {
  // Determine flame visual based on streak
  const getFlameStyle = () => {
    if (streak === 0) {
      return {
        emoji: '💀',
        label: 'Dead',
        color: 'text-gray-500',
        bgColor: 'bg-gray-900',
        borderColor: 'border-gray-700',
        animate: false,
      };
    } else if (streak < 7) {
      return {
        emoji: '🔥',
        label: 'Warming up',
        color: 'text-orange-500',
        bgColor: 'bg-gradient-to-t from-orange-900/50 to-orange-600/30',
        borderColor: 'border-orange-500/50',
        animate: true,
      };
    } else if (streak < 30) {
      return {
        emoji: '🔥🔥',
        label: 'On fire!',
        color: 'text-red-500',
        bgColor: 'bg-gradient-to-t from-red-900/50 to-red-600/30',
        borderColor: 'border-red-500/50',
        animate: true,
      };
    } else if (streak < 100) {
      return {
        emoji: '🔥🔥🔥',
        label: 'BLAZING!',
        color: 'text-red-600',
        bgColor: 'bg-gradient-to-t from-red-900/70 to-yellow-600/50',
        borderColor: 'border-red-600/70',
        animate: true,
      };
    } else {
      return {
        emoji: '💥🔥🔥🔥💥',
        label: 'LEGENDARY',
        color: 'text-yellow-400',
        bgColor: 'bg-gradient-to-t from-red-900 via-orange-600 to-yellow-500',
        borderColor: 'border-yellow-500',
        animate: true,
      };
    }
  };

  const sizeClasses = {
    small: 'text-2xl p-2',
    medium: 'text-4xl p-3',
    large: 'text-6xl p-4',
  };

  const numberSize = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl',
  };

  const flameStyle = getFlameStyle();

  return (
    <div className="inline-flex flex-col items-center space-y-1">
      <div
        className={`
          relative
          ${flameStyle.bgColor}
          ${flameStyle.borderColor}
          border-2 rounded-2xl
          ${sizeClasses[size]}
          ${flameStyle.animate ? 'animate-flicker' : ''}
          shadow-lg
          transition-all duration-300
          hover:scale-110
          cursor-pointer
        `}
        title={`${streak} day streak - ${flameStyle.label}`}
      >
        <div className={`${flameStyle.animate ? 'animate-float' : ''}`}>
          {flameStyle.emoji}
        </div>

        {streak >= 100 && (
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500 rounded-2xl opacity-75 blur animate-pulse"></div>
        )}
      </div>

      {showNumber && (
        <div className="flex flex-col items-center">
          <span className={`${numberSize[size]} font-black ${flameStyle.color}`}>
            {streak}
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
      )}

      {streak >= 7 && (
        <div className="text-xs font-bold text-center max-w-[120px]">
          <span className={flameStyle.color}>
            {flameStyle.label}
          </span>
        </div>
      )}

      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px currentColor); }
          50% { filter: drop-shadow(0 0 15px currentColor); }
        }
        .animate-flicker {
          animation: flicker 1.5s ease-in-out infinite;
        }
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
