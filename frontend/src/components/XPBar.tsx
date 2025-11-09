import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import MiniChart from './MiniChart';

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  totalXpEarned: number;
  showDetails?: boolean;
}

/**
 * NEURAL ACTIVITY MONITOR - Clinical XP Display
 * Styled like an EEG/activity monitor with cyan glow effects
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
  const [xpHistory, setXpHistory] = useState<Array<{ value: number }>>([]);
  const progress = (xp / xpToNextLevel) * 100;
  const navigate = useNavigate();

  useEffect(() => {
    setPrevXP(xp);
    // Simulate XP history for sparkline (in real app, would track actual history)
    setXpHistory(prev => {
      const newHistory = [...prev, { value: xp }].slice(-20);
      return newHistory;
    });
  }, [xp]);

  // Generate fake EEG-like data for visual effect
  const generateEEGData = () => {
    return Array.from({ length: 30 }, () => ({
      value: 50 + Math.random() * 30 * (progress / 100),
    }));
  };

  return (
    <div
      className="w-full bg-black border-2 border-lab-cyan/50 p-4 shadow-glow-cyan cursor-pointer hover:border-lab-cyan hover:shadow-glow-md transition-all duration-300 relative overflow-hidden"
      onClick={() => navigate('/badges')}
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
              rgba(0, 217, 255, 0.02) 2px,
              rgba(0, 217, 255, 0.02) 3px
            )`,
          }}
        />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3">
            {/* Level Display */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider">
                LEVEL
              </span>
              <span className="text-2xl font-mono font-bold text-lab-cyan text-glow">
                {String(level).padStart(2, '0')}
              </span>
            </div>

            <div className="h-8 w-px bg-lab-cyan/30"></div>

            {/* Title/Status */}
            <div className="flex flex-col">
              <span className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider">
                COGNITIVE STATUS
              </span>
              <span className="text-sm font-mono text-lab-text-primary uppercase tracking-wide">
                {title}
              </span>
            </div>
          </div>
        </div>

        {/* XP Counter */}
        <div className="flex flex-col items-end">
          <span className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider">
            NEURAL POINTS
          </span>
          <span className="text-sm font-mono text-lab-cyan">
            <CountUp
              start={prevXP}
              end={xp}
              duration={0.8}
              separator=","
            />
            /{xpToNextLevel.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Mini EEG Chart */}
      {xpHistory.length > 1 && (
        <div className="mb-3 h-8 opacity-50">
          <MiniChart
            data={generateEEGData()}
            type="line"
            color="#00d9ff"
            height={32}
          />
        </div>
      )}

      {/* XP Progress Bar - Neural Activity Style */}
      <div className="relative h-8 bg-black border border-lab-cyan/30 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 9px,
                rgba(0, 217, 255, 0.2) 9px,
                rgba(0, 217, 255, 0.2) 10px
              )`,
            }}
          />
        </div>

        {/* Progress fill with glow */}
        <div
          className="absolute inset-y-0 left-0 bg-lab-cyan/20 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Glowing edge */}
          <div className="absolute inset-y-0 right-0 w-2 bg-lab-cyan animate-pulse-cyan"></div>

          {/* Activity waves */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lab-cyan/30 to-transparent animate-shimmer"></div>
        </div>

        {/* Progress text */}
        <div className="absolute inset-0 flex items-center justify-between px-3">
          <span className="text-xs font-mono font-bold text-lab-cyan/70 uppercase">
            PROGRESS
          </span>
          <span className="text-xs font-mono font-bold text-lab-cyan text-glow">
            {progress.toFixed(1)}%
          </span>
        </div>

        {/* Tick marks at 25% intervals */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-lab-cyan/20"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-lab-cyan/20 relative z-10">
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-lab-cyan/70 uppercase">Total Earned:</span>
              <span className="text-lab-cyan ml-2">{totalXpEarned.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-lab-cyan/70 uppercase">To Next:</span>
              <span className="text-lab-cyan ml-2">{(xpToNextLevel - xp).toLocaleString()}</span>
            </div>
          </div>

          {/* Fake diagnostic data */}
          <div className="mt-2 text-xs font-mono text-lab-text-tertiary">
            <div>SYNC: STABLE | LAT: 12ms | FREQ: 42Hz</div>
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