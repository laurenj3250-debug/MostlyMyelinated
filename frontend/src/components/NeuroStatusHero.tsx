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
      <div className="bg-lab-card border-2 border-lab-cyan/50 p-8 relative overflow-hidden" style={{ borderRadius: '2px' }}>
        {/* Background accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, transparent 70%)'
          }}
        />

        <div className="text-center max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl font-mono uppercase text-lab-alert mb-4 tracking-wider">
            NEUROLOGICAL STATUS: UNKNOWN
          </h2>
          <div
            className="text-9xl font-mono font-black mb-4"
            style={{
              color: '#ff3366',
              textShadow: '0 0 20px rgba(255, 51, 102, 0.6)'
            }}
          >
            0.0
          </div>
          <p className="text-xl font-mono text-lab-text-primary mb-2 uppercase tracking-wide">
            BRAIN-DEAD
          </p>
          <p className="text-base font-mono text-lab-text-secondary mb-6">
            Your brain is functionally decorative. No neural pathways mapped.
          </p>

          <div className="text-left bg-black border border-lab-border p-4 mb-6">
            <div className="text-xs font-mono text-lab-cyan uppercase tracking-wider mb-2">
              Examples:
            </div>
            <ul className="text-sm font-mono text-lab-text-tertiary space-y-1">
              <li>• C6-T2 Spinal Lesion Patterns</li>
              <li>• Cranial Nerve Reflexes</li>
              <li>• Vestibular System Anatomy</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/nodes/new')}
            className="px-8 py-4 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all shadow-glow-cyan"
            style={{ borderRadius: '2px' }}
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
      className="bg-lab-card border-2 p-8 relative overflow-hidden"
      style={{
        borderRadius: '2px',
        borderColor: bandStyle.color,
        boxShadow: `0 0 24px ${bandStyle.glow}`
      }}
    >
      {/* Background accent blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${bandStyle.glow} 0%, transparent 70%)`,
          opacity: 0.15
        }}
      />

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

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-lab-text-muted">
            NEUROLOGICAL STATUS ASSESSMENT
          </h2>
          <div className="text-xs font-mono text-lab-text-tertiary">
            {totalNodes} NODES MAPPED
          </div>
        </div>

        {/* Large Score Display */}
        <div className="mb-8">
          <div
            className="text-9xl font-mono font-black leading-none mb-3"
            style={{
              color: bandStyle.color,
              textShadow: `0 0 24px ${bandStyle.glow}, 0 0 48px ${bandStyle.glow}`
            }}
          >
            {overallScore.toFixed(1)}
            <span className="text-4xl ml-2">%</span>
          </div>
          <div
            className="text-2xl font-mono uppercase tracking-[0.15em] mb-2"
            style={{ color: bandStyle.color }}
          >
            {bandStyle.label}
          </div>
          <p className="text-sm font-mono text-lab-text-secondary max-w-2xl">
            {bandStyle.message}
          </p>
        </div>

        {/* Large Progress Bar with Animated Scan */}
        <div className="mb-8">
          <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider mb-2">
            COGNITIVE INDEX PROGRESSION
          </div>
          <div
            className="h-12 bg-black border relative overflow-hidden"
            style={{
              borderRadius: '2px',
              borderColor: bandStyle.color,
              borderWidth: '2px'
            }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-1000"
              style={{
                width: `${overallScore}%`,
                background: `linear-gradient(90deg, ${bandStyle.color} 0%, ${bandStyle.glow} 100%)`,
                boxShadow: `inset 0 0 20px ${bandStyle.glow}`
              }}
            />

            {/* Animated scanning line */}
            <div
              className="absolute inset-y-0 w-1 animate-scan-line"
              style={{
                background: `linear-gradient(to right, transparent, ${bandStyle.color}, transparent)`,
                boxShadow: `0 0 10px ${bandStyle.glow}`,
                left: `${overallScore}%`,
                animation: 'scan 2s ease-in-out infinite'
              }}
            />

            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-lg font-mono font-bold"
                style={{
                  color: overallScore > 50 ? '#000' : bandStyle.color,
                  textShadow: overallScore > 50 ? 'none' : `0 0 8px ${bandStyle.glow}`
                }}
              >
                {overallScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Node Distribution Heat Map */}
        <div className="mb-6">
          <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider mb-2">
            NODE DISTRIBUTION SPECTRUM
          </div>
          <div className="h-10 flex border-2 border-lab-border overflow-hidden" style={{ borderRadius: '2px' }}>
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
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-mono font-bold text-white drop-shadow-lg">
                      {band.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution Cards - Compact */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {bands.map(band => (
            <div
              key={band.key}
              className="bg-black border border-lab-border p-2 text-center hover:border-lab-cyan/50 transition-all"
              style={{ borderRadius: '2px' }}
            >
              <div className={`text-xl font-mono font-bold ${band.textColor}`}>
                {band.count}
              </div>
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase mt-1 leading-tight">
                {band.label}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/study?mode=weak-drill')}
            disabled={weakNodeCount === 0}
            className={`
              px-6 py-4 border-2 font-mono uppercase font-bold transition-all
              ${weakNodeCount > 0
                ? 'bg-lab-alert/20 border-lab-alert text-lab-alert hover:bg-lab-alert/30 hover:shadow-glow-alert hover:scale-[1.02]'
                : 'bg-lab-border/20 border-lab-border text-lab-text-tertiary cursor-not-allowed opacity-50'
              }
            `}
            style={{ borderRadius: '2px' }}
          >
            <div className="text-base tracking-wider">DRILL WEAKEST NODES</div>
            <div className="text-xs mt-1 opacity-80">
              {weakNodeCount > 0
                ? `${weakNodeCount} critical nodes flagged`
                : 'No weak nodes detected'
              }
            </div>
          </button>

          <button
            onClick={() => navigate('/study')}
            className="px-6 py-4 border-2 font-mono uppercase font-bold transition-all hover:scale-[1.02]"
            style={{
              borderRadius: '2px',
              background: `linear-gradient(135deg, rgba(0, 217, 255, 0.2) 0%, rgba(0, 255, 136, 0.2) 100%)`,
              borderColor: '#00d9ff',
              color: '#00d9ff',
              boxShadow: '0 0 16px rgba(0, 217, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 217, 255, 0.5), 0 0 48px rgba(0, 255, 136, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 217, 255, 0.3)';
            }}
          >
            <div className="text-base tracking-wider">START TODAY'S SESSION</div>
            <div className="text-xs mt-1 opacity-80">
              {dueCards > 0 || newCards > 0
                ? `${dueCards} reviews • ${newCards} new cards`
                : 'All caught up for today'
              }
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
