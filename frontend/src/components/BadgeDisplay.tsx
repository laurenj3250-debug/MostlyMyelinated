import { useEffect, useState } from 'react';
import { study } from '../services/api';
import { Trophy, Lock, ChevronDown, ChevronRight } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedAt?: string;
}

export default function BadgeDisplay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocked, setShowLocked] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const res = await study.getBadges();
      setBadges((res.data as any).badges || []);
    } catch (error) {
      console.error('Failed to load badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-gradient">
        <div className="skeleton h-8 w-48 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);
  const completionPercent = badges.length > 0 ? Math.round((earnedBadges.length / badges.length) * 100) : 0;

  return (
    <div className="card-gradient">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gradient-blue">Achievements</h2>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gradient-green">
            {earnedBadges.length}<span className="text-gray-400 text-xl"> / {badges.length}</span>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {completionPercent}% Complete
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-xl mb-4 text-gradient-green flex items-center gap-2">
            <span className="text-2xl">✓</span> Earned
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge, index) => (
              <div
                key={badge.id}
                className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50
                          p-5 rounded-2xl border-2 border-green-300
                          hover:shadow-xl hover:-translate-y-1
                          transition-all duration-300
                          shadow-glow-green
                          animate-scale-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-400 rounded-full
                                mix-blend-multiply filter blur-2xl opacity-20" />
                <div className="relative flex items-start gap-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform animate-float">
                    {badge.emoji}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-green-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-green-700 leading-relaxed mb-2">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-green-600 font-medium">
                        🎉 {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <button
            onClick={() => setShowLocked(!showLocked)}
            className="w-full flex items-center justify-between p-4 rounded-xl
                      bg-gray-100 hover:bg-gray-200 transition-colors duration-200
                      border-2 border-gray-300 mb-4 group"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
              <h3 className="font-bold text-xl text-gray-700 group-hover:text-gray-900 transition-colors">
                Locked Achievements
              </h3>
              <span className="text-sm text-gray-500 font-medium">
                ({unearnedBadges.length} remaining)
              </span>
            </div>
            {showLocked ? (
              <ChevronDown className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronRight className="w-6 h-6 text-gray-500" />
            )}
          </button>

          {showLocked && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-in">
              {unearnedBadges.map((badge, index) => (
                <div
                  key={badge.id}
                  className="relative overflow-hidden bg-gray-100
                            p-5 rounded-2xl border-2 border-gray-300
                            hover:border-gray-400 transition-all duration-300
                            opacity-70 hover:opacity-90 group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl grayscale group-hover:grayscale-0 transition-all duration-300">
                      {badge.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4 text-gray-500" />
                        <h4 className="font-bold text-lg text-gray-700">{badge.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {earnedBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-50">🏆</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No badges earned yet!</p>
          <p className="text-gray-600">Keep studying to unlock achievements and celebrate your progress.</p>
        </div>
      )}
    </div>
  );
}
