import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  totalXpEarned: number;
  showDetails?: boolean;
}

/**
 * MAXIMUM DOPAMINE XP BAR
 * Always visible progress bar showing level and XP
 */
export default function XPBar({
  level,
  xp,
  xpToNextLevel,
  title,
  totalXpEarned,
  showDetails = false,
}: XPBarProps) {
  const [prevXP, setPrevXP] = useState(xp);
  const progress = (xp / xpToNextLevel) * 100;
  const navigate = useNavigate();

  useEffect(() => {
    setPrevXP(xp);
  }, [xp]);

  return (
    <div
      className="w-full bg-gray-800 rounded-lg p-3 shadow-lg border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer"
      onClick={() => navigate('/badges')}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-400">
              LVL {level}
            </span>
            <div className="h-6 w-px bg-purple-500/30"></div>
            <span className="text-sm text-purple-300 font-medium max-w-xs truncate">
              {title}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            <CountUp
              start={prevXP}
              end={xp}
              duration={0.8}
              separator=","
            />
            /{xpToNextLevel.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative h-6 bg-gray-900 rounded-full overflow-hidden border border-purple-500/20">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 animate-pulse"></div>

        {/* Progress fill with gradient */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow-lg">
            {progress.toFixed(1)}%
          </span>
        </div>

        {/* Border glow on hover */}
        <div className="absolute inset-0 border-2 border-purple-500/0 hover:border-purple-500/50 rounded-full transition-all"></div>
      </div>

      {showDetails && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Total XP Earned: {totalXpEarned.toLocaleString()}</span>
            <span>Next level in {(xpToNextLevel - xp).toLocaleString()} XP</span>
          </div>
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
