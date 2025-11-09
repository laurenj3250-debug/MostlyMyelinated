interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  colorScheme?: 'purple' | 'green' | 'blue' | 'red' | 'orange' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

/**
 * MAXIMUM DOPAMINE PROGRESS BAR
 * Reusable animated progress bar with color coding
 */
export default function ProgressBar({
  current,
  total,
  label,
  showPercentage = true,
  showNumbers = true,
  colorScheme = 'gradient',
  size = 'medium',
  animated = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  // Color schemes
  const colors = {
    purple: {
      bg: 'bg-purple-900/50',
      fill: 'bg-gradient-to-r from-purple-600 to-purple-400',
      border: 'border-purple-500/30',
    },
    green: {
      bg: 'bg-green-900/50',
      fill: 'bg-gradient-to-r from-green-600 to-green-400',
      border: 'border-green-500/30',
    },
    blue: {
      bg: 'bg-blue-900/50',
      fill: 'bg-gradient-to-r from-blue-600 to-blue-400',
      border: 'border-blue-500/30',
    },
    red: {
      bg: 'bg-red-900/50',
      fill: 'bg-gradient-to-r from-red-600 to-red-400',
      border: 'border-red-500/30',
    },
    orange: {
      bg: 'bg-orange-900/50',
      fill: 'bg-gradient-to-r from-orange-600 to-orange-400',
      border: 'border-orange-500/30',
    },
    gradient: {
      bg: 'bg-gray-900/50',
      fill: percentage < 30
        ? 'bg-gradient-to-r from-red-600 to-red-400'
        : percentage < 70
        ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
        : 'bg-gradient-to-r from-green-600 to-green-400',
      border: 'border-gray-500/30',
    },
  };

  const heights = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
  };

  const textSizes = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const colorStyle = colors[colorScheme];

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className={`${textSizes[size]} font-medium text-gray-300`}>
            {label}
          </span>
          {showNumbers && (
            <span className={`${textSizes[size]} text-gray-400`}>
              {current.toLocaleString()} / {total.toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div
        className={`
          relative w-full ${heights[size]} ${colorStyle.bg}
          rounded-full overflow-hidden border ${colorStyle.border}
        `}
      >
        {/* Progress fill */}
        <div
          className={`
            absolute inset-y-0 left-0 ${colorStyle.fill}
            ${animated ? 'transition-all duration-700 ease-out' : ''}
          `}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          )}
        </div>

        {/* Percentage text (for medium/large only) */}
        {showPercentage && size !== 'small' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSizes[size]} font-bold text-white drop-shadow-lg`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}

        {/* Pulse effect when full */}
        {percentage >= 100 && (
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        )}
      </div>

      {showPercentage && size === 'small' && (
        <div className="text-right mt-0.5">
          <span className="text-xs text-gray-400">{percentage.toFixed(0)}%</span>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
