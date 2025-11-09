import { useNavigate } from 'react-router-dom';
import HeatMapBar from './HeatMapBar';

interface CriticalNode {
  id: string;
  name: string;
  strength: number;
  statusLabel: string;
  dueCards: number;
  lastReviewed: string | null;
  trendDirection: 'up' | 'down' | 'stable';
  totalCards: number;
}

interface CriticalNodesPanelProps {
  nodes: CriticalNode[];
  totalNodes: number;
}

export default function CriticalNodesPanel({ nodes, totalNodes }: CriticalNodesPanelProps) {
  const navigate = useNavigate();

  // If no weak nodes, show healthy state
  if (nodes.length === 0) {
    return (
      <div className="bg-black border-2 border-lab-mint/50 p-6" style={{ borderRadius: '2px' }}>
        <div className="text-center">
          <div className="text-4xl mb-2">✓</div>
          <h3 className="text-lg font-mono uppercase text-lab-mint mb-2">
            NO CRITICAL NODES
          </h3>
          <p className="text-sm font-mono text-lab-text-secondary">
            All nodes are functioning at acceptable levels. Current status: STABLE
          </p>
          <p className="text-xs font-mono text-lab-text-tertiary mt-2">
            Continue regular reviews to maintain neural integrity.
          </p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    if (direction === 'down') return <span className="text-lab-alert">↓ DECLINING</span>;
    if (direction === 'up') return <span className="text-lab-mint">↑ IMPROVING</span>;
    return <span className="text-lab-text-tertiary">→ STABLE</span>;
  };

  const getTimeAgo = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-black border-2 border-lab-alert/50 p-6 shadow-glow-alert" style={{ borderRadius: '2px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🚨</span>
        <h3 className="text-lg font-mono uppercase text-lab-alert">
          NODES REQUIRING IMMEDIATE INTERVENTION
        </h3>
      </div>

      {/* Critical Node Cards */}
      <div className="space-y-3 mb-4">
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className="bg-lab-card border border-lab-border p-4 hover:border-lab-cyan/50 transition-all cursor-pointer"
            style={{ borderRadius: '2px' }}
            onClick={() => navigate(`/nodes/${node.id}`)}
          >
            <div className="flex items-start gap-4">
              {/* Rank Number */}
              <div className="text-3xl font-mono text-lab-text-tertiary font-bold">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Node Name */}
                <h4 className="text-xl font-mono uppercase text-lab-text-primary mb-2">
                  {node.name}
                </h4>

                {/* Status Line */}
                <div className="text-sm font-mono mb-2 flex items-center gap-4">
                  <span className="text-lab-alert font-bold">
                    {node.strength.toFixed(1)}%
                  </span>
                  <span className="text-lab-alert uppercase">
                    {node.statusLabel}
                  </span>
                  <span className="text-xs">
                    {getTrendIcon(node.trendDirection)}
                  </span>
                </div>

                {/* Heat Map Bar */}
                <div className="mb-2">
                  <HeatMapBar strength={node.strength} showPercentage={false} />
                </div>

                {/* Metadata */}
                <div className="text-xs font-mono text-lab-text-tertiary mb-3">
                  {node.dueCards} cards overdue • Last: {getTimeAgo(node.lastReviewed)} • Total: {node.totalCards} cards
                </div>

                {/* Drill Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/study?mode=drill&nodeId=${node.id}`);
                  }}
                  className={`
                    px-4 py-2 border-2 font-mono uppercase text-sm font-bold transition-all
                    ${node.strength < 20
                      ? 'bg-lab-alert/20 border-lab-alert text-lab-alert hover:bg-lab-alert/30'
                      : 'bg-orange-500/20 border-orange-500 text-orange-500 hover:bg-orange-500/30'
                    }
                  `}
                  style={{ borderRadius: '2px' }}
                >
                  {node.strength < 20 ? '🚨 EMERGENCY DRILL' : 'DRILL'} - {node.dueCards} CARDS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      <button
        onClick={() => navigate('/nodes')}
        className="w-full py-3 border border-lab-cyan/30 text-lab-cyan font-mono uppercase text-sm hover:border-lab-cyan hover:bg-lab-cyan/10 transition-all"
        style={{ borderRadius: '2px' }}
      >
        VIEW ALL {totalNodes} NODES →
      </button>
    </div>
  );
}
