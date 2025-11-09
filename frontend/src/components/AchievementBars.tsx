import { useEffect, useState } from 'react';
import { study } from '../services/api';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  percentage: number;
}

export default function AchievementBars() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const res = await study.getAchievements();
      setAchievements(res.data.achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Get gradient color based on percentage
  const getGradientClass = (percentage: number) => {
    if (percentage >= 100) return 'from-blue-500 to-cyan-500';
    if (percentage >= 75) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-yellow-500 to-orange-500';
    if (percentage >= 25) return 'from-orange-500 to-red-500';
    return 'from-red-600 to-red-700';
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-blue-50
                    rounded-3xl shadow-2xl p-8 border-2 border-purple-100
                    animate-slide-in">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply
                      filter blur-3xl opacity-10 animate-float" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply
                      filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Achievement Progress
          </h2>
        </div>

        <div className="space-y-6">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {achievement.current} / {achievement.target}
                  </div>
                  <div className="text-xs font-semibold text-gray-500">
                    {Math.min(achievement.percentage, 100)}%
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full bg-gradient-to-r ${getGradientClass(achievement.percentage)}
                            transition-all duration-1000 ease-out shadow-lg`}
                  style={{
                    width: `${Math.min(achievement.percentage, 100)}%`,
                    animationDelay: `${index * 0.1 + 0.3}s`,
                  }}
                >
                  {achievement.percentage >= 100 && (
                    <div className="w-full h-full flex items-center justify-end pr-2">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
