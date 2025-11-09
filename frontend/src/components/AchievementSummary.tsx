import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  progress: number;
}

interface AchievementSummaryProps {
  reviewsToday: number;
  reviewsGoal: number;
  newCardsToday: number;
  newCardsGoal: number;
  xpToday: number;
  achievements: Achievement[];
}

export default function AchievementSummary({
  reviewsToday,
  reviewsGoal,
  newCardsToday,
  newCardsGoal,
  xpToday,
  achievements
}: AchievementSummaryProps) {
  const navigate = useNavigate();

  // Find next closest achievement
  const nextAchievement = achievements
    .filter(a => a.progress < 100)
    .sort((a, b) => b.progress - a.progress)[0];

  // Empty state when no reviews
  if (reviewsToday === 0 && newCardsToday === 0) {
    return (
      <div className="bg-black border-2 border-lab-border p-6" style={{ borderRadius: '2px' }}>
        <h3 className="text-sm font-mono uppercase text-lab-cyan/70 tracking-wider mb-4">
          TODAY'S ACTIVITY
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">Reviews</div>
            <div className="text-3xl font-mono font-bold text-lab-text-tertiary mb-2">0</div>
            <ProgressBar current={0} total={reviewsGoal} colorScheme="cyan" size="sm" />
          </div>
          <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">New Cards</div>
            <div className="text-3xl font-mono font-bold text-lab-text-tertiary mb-2">0</div>
            <ProgressBar current={0} total={newCardsGoal} colorScheme="mint" size="sm" />
          </div>
          <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">XP Gained</div>
            <div className="text-3xl font-mono font-bold text-lab-text-tertiary mb-2">0</div>
            <div className="text-2xl mt-2">💀</div>
          </div>
        </div>

        <div className="text-center py-4 border border-lab-alert/30 bg-lab-alert/5" style={{ borderRadius: '2px' }}>
          <p className="text-sm font-mono text-lab-text-primary mb-2">
            0 reviews completed today.
          </p>
          <p className="text-sm font-mono text-lab-alert">
            Your myelin is actively degrading. Fix this.
          </p>
          <button
            onClick={() => navigate('/study')}
            className="mt-4 px-6 py-3 bg-lab-alert border-2 border-lab-alert text-white font-mono uppercase font-bold hover:bg-lab-alert/80 transition-all"
            style={{ borderRadius: '2px' }}
          >
            START STUDYING NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border-2 border-lab-border p-6" style={{ borderRadius: '2px' }}>
      <h3 className="text-sm font-mono uppercase text-lab-cyan/70 tracking-wider mb-4">
        TODAY'S ACTIVITY
      </h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
          <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">Reviews</div>
          <div className="text-3xl font-mono font-bold text-lab-cyan mb-2">
            {reviewsToday} / {reviewsGoal}
          </div>
          <ProgressBar
            current={reviewsToday}
            total={reviewsGoal}
            colorScheme="cyan"
            size="sm"
          />
        </div>

        <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
          <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">New Cards</div>
          <div className="text-3xl font-mono font-bold text-lab-mint mb-2">
            {newCardsToday} / {newCardsGoal}
          </div>
          <ProgressBar
            current={newCardsToday}
            total={newCardsGoal}
            colorScheme="mint"
            size="sm"
          />
        </div>

        <div className="bg-lab-card border border-lab-border p-3" style={{ borderRadius: '2px' }}>
          <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">XP Gained</div>
          <div className="text-3xl font-mono font-bold text-lab-cyan mb-2">
            +{xpToday}
          </div>
          <div className="text-2xl mt-2">⚡</div>
        </div>
      </div>

      {/* Next Achievement */}
      {nextAchievement && (
        <div className="mb-4">
          <h4 className="text-sm font-mono uppercase text-lab-text-tertiary mb-2">
            NEXT ACHIEVEMENT
          </h4>
          <div className="bg-lab-card border border-lab-cyan/30 p-4" style={{ borderRadius: '2px' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{nextAchievement.icon}</span>
              <div className="flex-1">
                <div className="font-mono text-lg text-lab-text-primary uppercase">
                  {nextAchievement.name}
                </div>
                <div className="text-xs font-mono text-lab-text-tertiary">
                  {nextAchievement.description}
                </div>
              </div>
            </div>
            <div className="text-sm font-mono text-lab-cyan mb-2">
              Progress: {nextAchievement.current} / {nextAchievement.target} ({nextAchievement.progress.toFixed(0)}%)
            </div>
            <ProgressBar
              current={nextAchievement.current}
              total={nextAchievement.target}
              colorScheme="cyan"
            />
          </div>
        </div>
      )}

      {/* View All Link */}
      <button
        onClick={() => navigate('/badges')}
        className="w-full py-3 border border-lab-cyan/30 text-lab-cyan font-mono uppercase text-sm hover:border-lab-cyan hover:bg-lab-cyan/10 transition-all"
        style={{ borderRadius: '2px' }}
      >
        VIEW ALL BADGES & ACHIEVEMENTS →
      </button>
    </div>
  );
}
