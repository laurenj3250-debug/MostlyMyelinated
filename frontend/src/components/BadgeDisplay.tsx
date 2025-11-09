import React, { useEffect, useState } from 'react';
import { study } from '../services/api';

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
  const [showAll, setShowAll] = useState(false);

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
      <div className="card">
        <p className="text-gray-600">Loading badges...</p>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <div className="text-sm text-gray-600">
          {earnedBadges.length} / {badges.length} earned
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 text-green-700">Earned</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="p-4 bg-green-50 border-2 border-green-300 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{badge.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900">{badge.name}</h4>
                    <p className="text-sm text-green-700">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unearned Badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="font-bold text-lg mb-3 text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            Locked
            <span className="text-sm text-gray-500">
              {showAll ? '▼' : '▶'}
            </span>
          </button>

          {showAll && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unearnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl grayscale">{badge.emoji}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-700">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {earnedBadges.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p className="mb-2">No badges earned yet!</p>
          <p className="text-sm">Keep studying to unlock achievements.</p>
        </div>
      )}
    </div>
  );
}
