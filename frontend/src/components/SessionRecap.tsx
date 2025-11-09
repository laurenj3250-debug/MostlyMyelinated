import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { celebrationConfetti, perfectSessionConfetti } from '../utils/confetti';

interface SessionStats {
  totalReviews: number;
  totalXP: number;
  failedReviews: number;
  perfectReviews: number;
  highestCombo: number;
  accuracy: number;
  isPerfectSession: boolean;
  newBadges?: Array<{
    name: string;
    emoji: string;
    rarity: string;
  }>;
  leveledUp?: boolean;
  newLevel?: number;
  nodesLeveledUp?: number;
}

interface SessionRecapProps {
  stats: SessionStats;
  onClose: () => void;
}

/**
 * MAXIMUM DOPAMINE SESSION RECAP
 * Full-screen celebration with animated stats
 */
export default function SessionRecap({ stats, onClose }: SessionRecapProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti on mount
    if (stats.isPerfectSession) {
      perfectSessionConfetti();
    } else {
      celebrationConfetti();
    }
  }, [stats.isPerfectSession]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-yellow-400';
      case 'epic':
        return 'text-purple-400';
      case 'rare':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full">
        {/* Title */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 mb-4">
            {stats.isPerfectSession ? '🌟 PERFECT SESSION! 🌟' : '🎉 SESSION COMPLETE! 🎉'}
          </h1>
          {stats.isPerfectSession && (
            <p className="text-2xl text-yellow-400 font-bold animate-pulse">
              Not a single "Again" answer! FLAWLESS!
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Total XP */}
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-2 border-purple-500 rounded-2xl p-6 text-center animate-slideInLeft">
            <div className="text-6xl font-black text-purple-400 mb-2">
              +<CountUp end={stats.totalXP} duration={2} separator="," />
            </div>
            <div className="text-lg text-purple-300 font-bold">XP EARNED</div>
          </div>

          {/* Total Reviews */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-2 border-blue-500 rounded-2xl p-6 text-center animate-slideInRight">
            <div className="text-6xl font-black text-blue-400 mb-2">
              <CountUp end={stats.totalReviews} duration={2} />
            </div>
            <div className="text-lg text-blue-300 font-bold">CARDS REVIEWED</div>
          </div>

          {/* Highest Combo */}
          <div className="bg-gradient-to-br from-red-900/50 to-orange-800/50 border-2 border-orange-500 rounded-2xl p-6 text-center animate-slideInLeft delay-100">
            <div className="text-6xl font-black text-orange-400 mb-2">
              <CountUp end={stats.highestCombo} duration={2} />x 🔥
            </div>
            <div className="text-lg text-orange-300 font-bold">HIGHEST COMBO</div>
          </div>

          {/* Accuracy */}
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-2 border-green-500 rounded-2xl p-6 text-center animate-slideInRight delay-100">
            <div className="text-6xl font-black text-green-400 mb-2">
              <CountUp end={stats.accuracy} duration={2} decimals={1} suffix="%" />
            </div>
            <div className="text-lg text-green-300 font-bold">ACCURACY</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-8 animate-fadeIn delay-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl text-green-400 font-bold">
                <CountUp end={stats.perfectReviews} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">Easy Answers</div>
            </div>
            <div>
              <div className="text-3xl text-red-400 font-bold">
                <CountUp end={stats.failedReviews} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">"Again" Answers</div>
            </div>
          </div>
        </div>

        {/* Level Up Notification */}
        {stats.leveledUp && stats.newLevel && (
          <div className="bg-gradient-to-r from-yellow-900/50 via-yellow-600/50 to-yellow-900/50 border-2 border-yellow-500 rounded-2xl p-6 text-center mb-8 animate-bounce">
            <div className="text-5xl mb-2">⬆️</div>
            <div className="text-3xl font-black text-yellow-400 mb-2">
              LEVEL UP!
            </div>
            <div className="text-xl text-yellow-300">
              You reached Level {stats.newLevel}!
            </div>
          </div>
        )}

        {/* New Badges */}
        {stats.newBadges && stats.newBadges.length > 0 && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 mb-8 animate-fadeIn delay-300">
            <h3 className="text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              🏆 NEW BADGES UNLOCKED! 🏆
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.newBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-3 text-center hover:scale-105 transition-transform"
                >
                  <div className="text-3xl mb-1">{badge.emoji}</div>
                  <div className={`text-sm font-bold ${getRarityColor(badge.rarity)}`}>
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nodes Leveled Up */}
        {stats.nodesLeveledUp && stats.nodesLeveledUp > 0 && (
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-center mb-8 animate-fadeIn delay-400">
            <div className="text-xl text-purple-400 font-bold">
              🧠 {stats.nodesLeveledUp} Node{stats.nodesLeveledUp > 1 ? 's' : ''} Strengthened!
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 animate-fadeIn delay-500">
          <button
            onClick={() => navigate('/badges')}
            className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            View All Badges
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
