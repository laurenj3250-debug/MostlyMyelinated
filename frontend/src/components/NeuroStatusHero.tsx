import { useNavigate } from 'react-router-dom';

interface NeuroStatusHeroProps {
  overallScore: number;
  nodeDistribution: {
    brainDead: number;
    lmnTetraplegic: number;
    nonAmbulatoryAtaxic: number;
    ambulatoryAtaxic: number;
    mildParesis: number;
    bar: number;
    hyperreflexic: number;
  };
  dueCards: number;
  newCards: number;
  weakNodeCount: number;
  totalNodes: number;
}

export default function NeuroStatusHero({
  overallScore,
  nodeDistribution,
  dueCards,
  newCards,
  weakNodeCount,
  totalNodes
}: NeuroStatusHeroProps) {
  const navigate = useNavigate();

  // Get band-appropriate styling based on score
  const getBandStyling = (score: number) => {
    if (score < 20) return {
      color: '#5b21b6',
      glow: 'rgba(91, 33, 182, 0.5)',
      label: 'BRAIN-DEAD',
      message: 'Neural pathways critically compromised. Emergency intervention required.'
    };
    if (score < 40) return {
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.5)',
      label: 'LMN TETRAPLEGIC',
      message: 'Severe cognitive deficit detected. Motor function impaired.'
    };
    if (score < 60) return {
      color: '#14b8a6',
      glow: 'rgba(20, 184, 166, 0.5)',
      label: 'NON-AMBULATORY',
      message: 'Moderate impairment. Assisted learning protocols recommended.'
    };
    if (score < 75) return {
      color: '#f97316',
      glow: 'rgba(249, 115, 22, 0.5)',
      label: 'AMBULATORY ATAXIC',
      message: 'Functional but unsteady. Continue strengthening weak pathways.'
    };
    if (score < 85) return {
      color: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.5)',
      label: 'MILD PARESIS',
      message: 'Good cognitive function. Minor deficits remain.'
    };
    if (score < 95) return {
      color: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.5)',
      label: 'BAR (Bright, Alert, Responsive)',
      message: 'Excellent neural integration. Maintain current protocols.'
    };
    return {
      color: '#00d9ff',
      glow: 'rgba(0, 217, 255, 0.6)',
      label: 'HYPERREFLEXIC',
      message: 'Peak cognitive performance. Neural pathways optimized.'
    };
  };

  const bandStyle = getBandStyling(overallScore);

  // Empty state when no nodes exist
  if (totalNodes === 0) {
    return (
      <div
        className="p-12 relative overflow-hidden rounded-xl backdrop-blur-md border-fat"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
          borderColor: 'rgba(255, 94, 205, 0.4)',
          boxShadow: '0 0 40px rgba(255, 90, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Giant glowing orb background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none animate-orb-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(255, 94, 205, 0.25) 0%, rgba(163, 75, 255, 0.15) 40%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl font-display font-extrabold uppercase tracking-[0.2em] text-holographic mb-8">
            NEUROLOGICAL STATUS: UNKNOWN
          </h2>
          <div
            className="text-[10rem] font-display font-black leading-none mb-6 animate-pulse-glow-neon"
            style={{
              color: '#ff5ecd',
              textShadow: '0 0 30px rgba(255, 94, 205, 0.8), 0 0 60px rgba(255, 94, 205, 0.5), 0 0 100px rgba(255, 94, 205, 0.3)'
            }}
          >
            0.0
          </div>
          <p className="text-3xl font-display font-extrabold text-neon-pink mb-3 uppercase tracking-wider">
            BRAIN-DEAD
          </p>
          <p className="text-lg font-sans text-lab-text-muted mb-10 max-w-xl mx-auto">
            Your brain is functionally decorative. No neural pathways mapped.
          </p>

          <div
            className="text-left p-6 mb-10 rounded-lg border-thin mx-auto max-w-md"
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              borderColor: 'rgba(255, 156, 255, 0.2)'
            }}
          >
            <div className="text-sm font-display font-bold text-neon-cyan uppercase tracking-wider mb-3">
              Examples:
            </div>
            <ul className="text-base font-sans text-lab-text-muted space-y-2">
              <li>▸ C6-T2 Spinal Lesion Patterns</li>
              <li>▸ Cranial Nerve Reflexes</li>
              <li>▸ Vestibular System Anatomy</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/nodes/new')}
            className="relative overflow-hidden px-10 py-5 font-display font-extrabold text-lg uppercase tracking-wider rounded-pill border-none transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
              color: '#ffffff',
              boxShadow: '0 0 30px rgba(255, 90, 255, 0.6), 0 0 60px rgba(255, 90, 255, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 90, 255, 0.8), 0 0 80px rgba(255, 90, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 90, 255, 0.6), 0 0 60px rgba(255, 90, 255, 0.4)';
            }}
          >
            + CREATE FIRST NODE
          </button>
        </div>
      </div>
    );
  }

  // Calculate total for percentage
  const total = Object.values(nodeDistribution).reduce((sum, count) => sum + count, 0);

  // Heat map colors for each band with design tokens
  const bands = [
    { key: 'brainDead', label: 'BRAIN-DEAD', color: 'bg-band-braindead', textColor: 'text-band-braindead', count: nodeDistribution.brainDead },
    { key: 'lmnTetraplegic', label: 'LMN TETRA', color: 'bg-band-lmn', textColor: 'text-band-lmn', count: nodeDistribution.lmnTetraplegic },
    { key: 'nonAmbulatoryAtaxic', label: 'NON-AMB', color: 'bg-band-nonamb', textColor: 'text-band-nonamb', count: nodeDistribution.nonAmbulatoryAtaxic },
    { key: 'ambulatoryAtaxic', label: 'AMB ATAXIC', color: 'bg-band-amb', textColor: 'text-band-amb', count: nodeDistribution.ambulatoryAtaxic },
    { key: 'mildParesis', label: 'MILD', color: 'bg-band-paresis', textColor: 'text-band-paresis', count: nodeDistribution.mildParesis },
    { key: 'bar', label: 'BAR', color: 'bg-band-bar', textColor: 'text-band-bar', count: nodeDistribution.bar },
    { key: 'hyperreflexic', label: 'HYPER', color: 'bg-band-hyper', textColor: 'text-band-hyper', count: nodeDistribution.hyperreflexic },
  ];

  return (
    <div
      className="p-12 relative overflow-hidden rounded-xl backdrop-blur-md border-fat"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.05) 0%, rgba(163, 75, 255, 0.05) 50%, rgba(0, 234, 255, 0.05) 100%)',
        borderColor: bandStyle.color,
        boxShadow: `0 0 40px ${bandStyle.glow}, 0 0 80px ${bandStyle.glow}, 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      }}
    >
      {/* HERO ORB - Giant glowing orb behind score */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-orb-pulse"
        style={{
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${bandStyle.glow} 0%, ${bandStyle.color}40 30%, transparent 70%)`,
          filter: 'blur(80px)',
          opacity: 0.4
        }}
      />

      {/* Subtle scan line grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(255, 156, 255, 0.03) 3px,
              rgba(255, 156, 255, 0.03) 4px
            )`,
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-sm font-display font-bold uppercase tracking-[0.25em] text-holographic">
            NEUROLOGICAL STATUS ASSESSMENT
          </h2>
          <div className="text-sm font-display font-semibold text-lab-text-muted">
            {totalNodes} NODES MAPPED
          </div>
        </div>

        {/* Large Score Display with Holographic Effect */}
        <div className="mb-10 text-center">
          <div
            className="text-[12rem] font-display font-black leading-none mb-4 animate-pulse-glow-neon"
            style={{
              color: bandStyle.color,
              textShadow: `0 0 30px ${bandStyle.glow}, 0 0 60px ${bandStyle.glow}, 0 0 100px ${bandStyle.glow}`
            }}
          >
            {overallScore.toFixed(1)}
            <span className="text-6xl ml-3">%</span>
          </div>
          <div
            className="text-4xl font-display font-extrabold uppercase tracking-[0.2em] mb-4"
            style={{
              color: bandStyle.color,
              textShadow: `0 0 16px ${bandStyle.glow}`
            }}
          >
            {bandStyle.label}
          </div>
          <p className="text-lg font-sans text-lab-text-muted max-w-3xl mx-auto">
            {bandStyle.message}
          </p>
        </div>

        {/* Large Progress Bar with Animated Scan */}
        <div className="mb-10">
          <div className="text-sm font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-3">
            COGNITIVE INDEX PROGRESSION
          </div>
          <div
            className="h-16 relative overflow-hidden rounded-pill border-medium"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: bandStyle.color
            }}
          >
            {/* Progress fill with gradient */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-1000 rounded-pill"
              style={{
                width: `${overallScore}%`,
                background: `linear-gradient(90deg, ${bandStyle.color} 0%, ${bandStyle.glow} 50%, ${bandStyle.color} 100%)`,
                boxShadow: `inset 0 0 30px ${bandStyle.glow}, 0 0 20px ${bandStyle.glow}`
              }}
            />

            {/* Animated scanning line at current position */}
            <div
              className="absolute inset-y-0 w-2"
              style={{
                background: `linear-gradient(to right, transparent, ${bandStyle.color}, transparent)`,
                boxShadow: `0 0 15px ${bandStyle.glow}`,
                left: `${overallScore}%`,
                transform: 'translateX(-50%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />

            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-2xl font-display font-extrabold tracking-wider"
                style={{
                  color: overallScore > 50 ? '#000' : '#fff',
                  textShadow: overallScore > 50 ? 'none' : `0 0 12px ${bandStyle.glow}, 0 0 24px ${bandStyle.glow}`
                }}
              >
                {overallScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Node Distribution Heat Map */}
        <div className="mb-8">
          <div className="text-sm font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-3">
            NODE DISTRIBUTION SPECTRUM
          </div>
          <div className="h-12 flex rounded-pill border-thin overflow-hidden" style={{ borderColor: 'rgba(255, 156, 255, 0.3)' }}>
            {bands.map(band => {
              const percentage = total > 0 ? (band.count / total) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={band.key}
                  className={`${band.color} relative`}
                  style={{ width: `${percentage}%` }}
                  title={`${band.label}: ${band.count} nodes (${percentage.toFixed(1)}%)`}
                >
                  {percentage > 8 && (
                    <span className="absolute inset-0 flex items-center justify-center text-base font-display font-extrabold text-white drop-shadow-lg">
                      {band.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution Cards - Compact */}
        <div className="grid grid-cols-7 gap-3 mb-10">
          {bands.map(band => (
            <div
              key={band.key}
              className="p-3 text-center transition-all rounded-lg border-thin"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: 'rgba(255, 156, 255, 0.2)'
              }}
            >
              <div className={`text-2xl font-display font-extrabold ${band.textColor}`} style={{ textShadow: '0 0 8px currentColor' }}>
                {band.count}
              </div>
              <div className="text-[10px] font-display font-semibold text-lab-text-dim uppercase mt-1 leading-tight tracking-wide">
                {band.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/study?mode=weak-drill')}
            disabled={weakNodeCount === 0}
            className={`
              px-8 py-5 rounded-pill font-display font-extrabold uppercase tracking-wider transition-all
              ${weakNodeCount > 0
                ? 'border-medium hover:scale-[1.02]'
                : 'border-thin cursor-not-allowed opacity-40'
              }
            `}
            style={weakNodeCount > 0 ? {
              background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.15), rgba(255, 94, 205, 0.08))',
              borderColor: '#ff5ecd',
              color: '#ff9cff',
              boxShadow: '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.2)'
            } : {
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: 'rgba(255, 156, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (weakNodeCount > 0) {
                e.currentTarget.style.boxShadow = '0 0 28px rgba(255, 94, 205, 0.6), 0 0 56px rgba(255, 94, 205, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (weakNodeCount > 0) {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.2)';
              }
            }}
          >
            <div className="text-lg tracking-wider">DRILL WEAKEST NODES</div>
            <div className="text-sm mt-2 opacity-80 font-normal">
              {weakNodeCount > 0
                ? `${weakNodeCount} critical nodes flagged`
                : 'No weak nodes detected'
              }
            </div>
          </button>

          <button
            onClick={() => navigate('/study')}
            className="relative overflow-hidden px-8 py-5 rounded-pill border-none font-display font-extrabold uppercase tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 32px rgba(255, 90, 255, 0.7), 0 0 64px rgba(255, 90, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)';
            }}
          >
            <div className="relative z-10">
              <div className="text-lg tracking-wider">START TODAY'S SESSION</div>
              <div className="text-sm mt-2 opacity-90 font-normal">
                {dueCards > 0 || newCards > 0
                  ? `${dueCards} reviews • ${newCards} new cards`
                  : 'All caught up for today'
                }
              </div>
            </div>
            <div
              className="absolute inset-0 w-1/2 h-full animate-light-sweep"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
