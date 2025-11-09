interface StreakFlameProps {
  streak: number;
  size?: 'small' | 'medium' | 'large';
  showNumber?: boolean;
}

/**
 * STREAK MONITOR - Clinical streak display
 * No emojis, pure data readout with clinical styling
 */
export default function StreakFlame({
  streak,
  size = 'medium',
  showNumber = true,
}: StreakFlameProps) {
  const isActive = streak > 0;

  // Determine status level
  const getStatus = () => {
    if (streak === 0) return { label: 'INACTIVE', color: 'text-lab-text-tertiary', border: 'border-lab-text-tertiary', glow: '' };
    if (streak < 7) return { label: 'ACTIVE', color: 'text-lab-mint', border: 'border-lab-mint', glow: 'shadow-glow-mint' };
    if (streak < 30) return { label: 'SUSTAINED', color: 'text-lab-cyan', border: 'border-lab-cyan', glow: 'shadow-glow-cyan' };
    if (streak < 100) return { label: 'EXCELLENT', color: 'text-lab-cyan', border: 'border-lab-cyan', glow: 'shadow-glow-cyan animate-pulse-cyan' };
    return { label: 'LEGENDARY', color: 'text-lab-mint', border: 'border-lab-mint', glow: 'shadow-glow-mint animate-pulse-cyan' };
  };

  const sizeClasses = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const numberSize = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  const status = getStatus();

  return (
    <div
      className={`
        inline-flex items-center gap-4
        bg-black border-2 ${status.border} ${status.glow}
        ${sizeClasses[size]}
        transition-all duration-300
        hover:scale-105
        cursor-pointer
        relative
      `}
      style={{ borderRadius: '2px' }}
      title={`${streak} day streak - ${status.label}`}
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

      <div className="relative z-10 flex items-center gap-4">
        {/* Streak count */}
        <div className="flex flex-col">
          <span className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider">
            STREAK
          </span>
          {showNumber && (
            <span className={`${numberSize[size]} font-mono font-bold ${status.color} text-glow leading-none`}>
              {String(streak).padStart(2, '0')}
            </span>
          )}
          <span className="text-xs font-mono text-lab-text-tertiary uppercase mt-1">
            {streak === 1 ? 'DAY' : 'DAYS'}
          </span>
        </div>

        <div className="h-12 w-px bg-lab-cyan/30"></div>

        {/* Status */}
        <div className="flex flex-col">
          <span className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider">
            STATUS
          </span>
          <span className={`text-sm font-mono font-bold ${status.color} uppercase tracking-wide`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Activity pulse indicator for active streaks */}
      {isActive && streak >= 7 && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${status.border.replace('border-', 'bg-')} rounded-full animate-pulse`} />
      )}
    </div>
  );
}