import { useNavigate } from 'react-router-dom';

interface NeuroStatusHeroProps {
  overallScore: number;
  statusLabel: string;
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
  statusLabel,
  nodeDistribution,
  dueCards,
  newCards,
  weakNodeCount,
  totalNodes
}: NeuroStatusHeroProps) {
  const navigate = useNavigate();

  // Empty state when no nodes exist
  if (totalNodes === 0) {
    return (
      <div className="bg-black border-2 border-lab-cyan/50 p-8" style={{ borderRadius: '2px' }}>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-mono uppercase text-lab-cyan mb-4">
            NEUROLOGICAL STATUS: UNKNOWN
          </h2>
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-lg font-mono text-lab-text-primary mb-2">
            You have mapped 0 neural pathways.
          </p>
          <p className="text-lg font-mono text-lab-text-primary mb-6">
            Your brain is functionally decorative.
          </p>
          <p className="text-sm font-mono text-lab-text-secondary mb-6">
            Create your first node to establish baseline cognitive function.
          </p>

          <div className="text-left bg-lab-card border border-lab-border p-4 mb-6">
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

  // Heat map colors for each band
  const bands = [
    { key: 'brainDead', label: 'BRAIN-DEAD', color: 'bg-purple-600', textColor: 'text-purple-400', count: nodeDistribution.brainDead },
    { key: 'lmnTetraplegic', label: 'LMN TETRA', color: 'bg-blue-600', textColor: 'text-blue-400', count: nodeDistribution.lmnTetraplegic },
    { key: 'nonAmbulatoryAtaxic', label: 'NON-AMB', color: 'bg-cyan-600', textColor: 'text-cyan-400', count: nodeDistribution.nonAmbulatoryAtaxic },
    { key: 'ambulatoryAtaxic', label: 'AMB ATAXIC', color: 'bg-yellow-600', textColor: 'text-yellow-400', count: nodeDistribution.ambulatoryAtaxic },
    { key: 'mildParesis', label: 'MILD', color: 'bg-orange-600', textColor: 'text-orange-400', count: nodeDistribution.mildParesis },
    { key: 'bar', label: 'BAR', color: 'bg-green-600', textColor: 'text-green-400', count: nodeDistribution.bar },
    { key: 'hyperreflexic', label: 'HYPER', color: 'bg-emerald-600', textColor: 'text-emerald-400', count: nodeDistribution.hyperreflexic },
  ];

  return (
    <div className="bg-black border-2 border-lab-cyan/50 p-6 shadow-glow-cyan relative overflow-hidden" style={{ borderRadius: '2px' }}>
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
        <h2 className="text-sm font-mono uppercase text-lab-cyan/70 tracking-wider mb-4">
          NEUROLOGICAL STATUS ASSESSMENT
        </h2>

        {/* Score Display */}
        <div className="flex items-center gap-8 mb-6">
          <div>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">
              Overall Cognitive Index
            </div>
            <div className="text-7xl font-mono font-bold text-lab-cyan text-glow">
              {overallScore.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono uppercase tracking-wide text-lab-text-primary">
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Heat Map Bar */}
        <div className="mb-6">
          <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-2">
            Node Distribution
          </div>
          <div className="h-8 flex border border-lab-cyan/30 overflow-hidden" style={{ borderRadius: '2px' }}>
            {bands.map(band => {
              const percentage = total > 0 ? (band.count / total) * 100 : 0;
              if (percentage === 0) return null;
              return (
                <div
                  key={band.key}
                  className={`${band.color} relative`}
                  style={{ width: `${percentage}%` }}
                  title={`${band.label}: ${band.count} nodes`}
                >
                  {percentage > 10 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {band.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribution Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
          {bands.map(band => (
            <div
              key={band.key}
              className="bg-lab-card border border-lab-border p-2 text-center"
              style={{ borderRadius: '2px' }}
            >
              <div className={`text-2xl font-mono font-bold ${band.textColor}`}>
                {band.count}
              </div>
              <div className="text-xs font-mono text-lab-text-tertiary uppercase mt-1">
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
                ? 'bg-lab-alert/20 border-lab-alert text-lab-alert hover:bg-lab-alert/30 shadow-glow-alert'
                : 'bg-lab-border/20 border-lab-border text-lab-text-tertiary cursor-not-allowed opacity-50'
              }
            `}
            style={{ borderRadius: '2px' }}
          >
            <div className="text-lg">🚨 DRILL WEAKEST NODES</div>
            <div className="text-xs mt-1">
              {weakNodeCount > 0
                ? `${weakNodeCount} critical nodes`
                : 'No weak nodes to drill'
              }
            </div>
          </button>

          <button
            onClick={() => navigate('/study')}
            className="px-6 py-4 bg-lab-cyan/20 border-2 border-lab-cyan text-lab-cyan font-mono uppercase font-bold hover:bg-lab-cyan/30 transition-all shadow-glow-cyan"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-lg">START TODAY'S SESSION</div>
            <div className="text-xs mt-1">
              {dueCards > 0 || newCards > 0
                ? `${dueCards} reviews • ${newCards} new cards`
                : 'No cards due today'
              }
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
