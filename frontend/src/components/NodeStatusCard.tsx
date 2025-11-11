import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NewNodeBadge from './NewNodeBadge';

interface NodeStatusCardProps {
  node: {
    id: string;
    name: string;
    nodeStrength: number;
    module?: string;
    _count?: {
      cards: number;
    };
    dueCount?: number;
    importBatchId?: string;
    importedAt?: Date | string;
    sourceFile?: string;
    isDismissed?: boolean;
  };
  onClick?: () => void;
}

export default function NodeStatusCard({ node, onClick }: NodeStatusCardProps) {
  const navigate = useNavigate();
  const [badgeDismissed, setBadgeDismissed] = useState(false);

  // Check if node was imported within last 24 hours
  const isRecentlyImported = (): boolean => {
    if (!node.importedAt || node.isDismissed || badgeDismissed) return false;

    const importDate = typeof node.importedAt === 'string'
      ? new Date(node.importedAt)
      : node.importedAt;
    const now = new Date();
    const diffHours = (now.getTime() - importDate.getTime()) / (1000 * 60 * 60);

    return diffHours < 24;
  };

  const getStatusLabel = (strength: number) => {
    if (strength < 20)
      return {
        label: 'BRAIN-DEAD',
        color: 'bg-gray-600',
        glow: 'shadow-[0_0_10px_rgba(100,100,100,0.5)]',
        barColor: 'bg-gray-600'
      };
    if (strength < 40)
      return {
        label: 'LMN TETRAPLEGIC',
        color: 'bg-red-900',
        glow: 'shadow-[0_0_10px_rgba(127,29,29,0.5)]',
        barColor: 'bg-red-900'
      };
    if (strength < 60)
      return {
        label: 'NON-AMBULATORY ATAXIC',
        color: 'bg-red-600',
        glow: 'shadow-[0_0_10px_rgba(220,38,38,0.5)]',
        barColor: 'bg-red-600'
      };
    if (strength < 75)
      return {
        label: 'AMBULATORY ATAXIC',
        color: 'bg-orange-500',
        glow: 'shadow-[0_0_10px_rgba(249,115,22,0.5)]',
        barColor: 'bg-orange-500'
      };
    if (strength < 85)
      return {
        label: 'MILD PARESIS',
        color: 'bg-yellow-500',
        glow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]',
        barColor: 'bg-yellow-500'
      };
    if (strength < 95)
      return {
        label: 'BAR',
        color: 'bg-green-500',
        glow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]',
        barColor: 'bg-green-500'
      };
    return {
      label: 'HYPERREFLEXIC PROFESSOR',
      color: 'bg-lab-cyan',
      glow: 'shadow-[0_0_20px_rgba(0,217,255,0.7)]',
      barColor: 'bg-lab-cyan'
    };
  };

  const status = getStatusLabel(node.nodeStrength);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/nodes/${node.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-black border-2 border-lab-border hover:border-lab-cyan transition-all cursor-pointer group ${status.glow}`}
      style={{ borderRadius: '2px' }}
    >
      {/* Module tag */}
      {node.module && (
        <div className="px-3 py-1 border-b border-lab-border/30 bg-lab-card/30">
          <span className="text-xs font-mono text-lab-text-tertiary uppercase">{node.module}</span>
        </div>
      )}

      <div className="p-4">
        {/* Node name + strength + NEW badge */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 flex-1">
            <h3 className="text-base font-mono font-bold text-lab-text-primary group-hover:text-lab-cyan transition-colors">
              {node.name}
            </h3>
            {isRecentlyImported() && (
              <NewNodeBadge
                nodeId={node.id}
                importedAt={node.importedAt!}
                sourceFile={node.sourceFile}
                onDismiss={() => setBadgeDismissed(true)}
                className="flex-shrink-0"
              />
            )}
          </div>
          <span className="text-2xl font-mono font-bold text-lab-cyan ml-2 flex-shrink-0">
            {Math.round(node.nodeStrength)}%
          </span>
        </div>

        {/* Status bar */}
        <div className="mb-3">
          <div className="h-2 bg-lab-card border border-lab-border overflow-hidden" style={{ borderRadius: '1px' }}>
            <div
              className={`h-full ${status.barColor} transition-all duration-500`}
              style={{ width: `${node.nodeStrength}%` }}
            />
          </div>
        </div>

        {/* Status label + due cards */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-mono font-bold uppercase px-2 py-1 ${status.color} text-white`}
            style={{ borderRadius: '2px' }}
          >
            {status.label}
          </span>

          {/* Due cards indicator */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {node.dueCount !== undefined && node.dueCount > 0 && (
              <span className="text-lab-alert font-bold">
                {node.dueCount} DUE
              </span>
            )}
            {node._count?.cards !== undefined && (
              <span className="text-lab-text-tertiary">
                {node._count.cards} cards
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
