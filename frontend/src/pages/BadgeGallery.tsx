import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { burstConfetti } from '../utils/confetti';

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  earned: boolean;
  earnedAt?: string;
}

export default function BadgeGallery() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/gamification/badges', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBadges(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-xl shadow-yellow-500/50 animate-pulse';
      case 'epic': return 'shadow-lg shadow-purple-500/30';
      case 'rare': return 'shadow-md shadow-blue-500/20';
      default: return '';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const filteredBadges = badges.filter((badge) => {
    if (filter === 'earned' && !badge.earned) return false;
    if (filter === 'locked' && badge.earned) return false;
    if (rarityFilter && badge.rarity !== rarityFilter) return false;
    return true;
  });

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-4xl text-purple-400 animate-pulse">Loading badges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
            BADGE COLLECTION
          </h1>
          <div className="text-2xl md:text-3xl font-bold text-purple-300 mb-4 md:mb-6">
            {earnedCount} / {totalCount} Unlocked
          </div>
          <div className="text-lg text-purple-400 mb-4">
            {((earnedCount / totalCount) * 100).toFixed(1)}% Complete
          </div>
          <div className="bg-gray-800 h-4 rounded-full overflow-hidden max-w-2xl mx-auto">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 transition-all duration-700"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            >
              <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'all' ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'earned' ? 'bg-green-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all ${
              filter === 'locked' ? 'bg-red-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            Locked ({totalCount - earnedCount})
          </button>
        </div>

        {/* Rarity Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
          {['legendary', 'epic', 'rare', 'common'].map((rarity) => (
            <button
              key={rarity}
              onClick={() => setRarityFilter(rarityFilter === rarity ? null : rarity)}
              className={`px-3 md:px-4 py-1 rounded text-xs md:text-sm font-bold transition-all ${
                rarityFilter === rarity
                  ? rarity === 'legendary' ? 'bg-yellow-600 scale-110' :
                    rarity === 'epic' ? 'bg-purple-600 scale-110' :
                    rarity === 'rare' ? 'bg-blue-600 scale-110' : 'bg-gray-600 scale-110'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              {rarity.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mb-8">
          {filteredBadges.map((badge, index) => (
            <div
              key={badge.id}
              className={`
                ${getRarityColor(badge.rarity)}
                ${badge.earned ? getRarityGlow(badge.rarity) : 'opacity-40 grayscale'}
                border-2 rounded-2xl p-4 md:p-6 text-center
                transition-all duration-300 hover:scale-105 cursor-pointer
                animate-fadeIn
              `}
              style={{ animationDelay: `${index * 0.03}s` }}
              onClick={(e) => {
                if (badge.earned) {
                  burstConfetti(e.currentTarget);
                }
              }}
            >
              <div className={`text-4xl md:text-6xl mb-2 md:mb-3 ${!badge.earned && 'filter blur-sm'}`}>
                {badge.earned ? badge.emoji : '❓'}
              </div>
              <div className={`font-bold text-sm md:text-lg mb-1 ${!badge.earned && 'filter blur-sm'}`}>
                {badge.earned ? badge.name : '???'}
              </div>
              <div className="text-xs md:text-sm text-gray-400 mb-2 line-clamp-2">
                {badge.earned ? badge.description : 'Complete the requirement to unlock'}
              </div>
              <div className={`text-xs font-bold uppercase ${getRarityTextColor(badge.rarity)}`}>
                {badge.rarity} • +{badge.xpBonus} XP
              </div>
              {badge.earned && badge.earnedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center text-gray-400 text-xl py-12">
            No badges match your filters
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-8 md:mt-12">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 md:px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Back to Dashboard
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
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
