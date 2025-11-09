import { Node } from '../types';
import NeuroLabel from './NeuroLabel';
import { Brain, Calendar, FileText, CreditCard } from 'lucide-react';

interface Props {
  node: Node;
  onClick: () => void;
}

export default function NodeCard({ node, onClick }: Props) {
  // Get gradient background based on strength
  const getGradientBackground = () => {
    const strength = node.nodeStrength;
    if (strength < 20) return 'from-gray-900/5 to-red-900/5';
    if (strength < 40) return 'from-red-900/5 to-red-600/10';
    if (strength < 60) return 'from-red-600/5 to-red-400/10';
    if (strength < 75) return 'from-orange-500/5 to-yellow-500/10';
    if (strength < 85) return 'from-yellow-500/5 to-green-500/10';
    if (strength < 95) return 'from-green-600/5 to-green-400/10';
    return 'from-blue-500/5 to-cyan-500/10';
  };

  // Get border accent color
  const getBorderAccent = () => {
    const strength = node.nodeStrength;
    if (strength < 20) return 'border-l-gray-900';
    if (strength < 40) return 'border-l-red-900';
    if (strength < 60) return 'border-l-red-600';
    if (strength < 75) return 'border-l-orange-500';
    if (strength < 85) return 'border-l-yellow-500';
    if (strength < 95) return 'border-l-green-600';
    return 'border-l-blue-500';
  };

  const isPoor = node.nodeStrength < 60;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${getGradientBackground()}
        rounded-2xl shadow-lg p-6
        cursor-pointer
        transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1
        border-l-4 ${getBorderAccent()}
        border border-gray-100
        ${isPoor ? 'ring-2 ring-red-200 ring-opacity-50' : ''}
        group
      `}
    >
      {/* Subtle background pattern for high performers */}
      {node.nodeStrength >= 95 && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500" />
        </div>
      )}

      <div className="relative">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {node.name}
              </h3>
            </div>
            {node.summary && (
              <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2">
                {node.summary}
              </p>
            )}
          </div>
        </div>

        {/* Tags */}
        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/80 text-gray-700 px-2.5 py-1 rounded-full
                          border border-gray-200 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Strength Badge */}
        <div className="mb-4">
          {node.strengthLabel && (
            <NeuroLabel
              strength={node.strengthLabel.strength}
              label={node.strengthLabel.label}
              emoji={node.strengthLabel.emoji}
              size="sm"
            />
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                node.nodeStrength < 20
                  ? 'from-gray-900 to-red-900'
                  : node.nodeStrength < 40
                  ? 'from-red-900 to-red-600'
                  : node.nodeStrength < 60
                  ? 'from-red-600 to-red-400'
                  : node.nodeStrength < 75
                  ? 'from-orange-500 to-yellow-500'
                  : node.nodeStrength < 85
                  ? 'from-yellow-500 to-green-500'
                  : node.nodeStrength < 95
                  ? 'from-green-600 to-green-400'
                  : 'from-blue-500 to-cyan-500'
              } transition-all duration-500`}
              style={{ width: `${node.nodeStrength}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {node._count && (
            <>
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span className="font-medium">{node._count.facts}</span>
                <span>facts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">{node._count.cards}</span>
                <span>cards</span>
              </div>
            </>
          )}
          {node.lastReviewed && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">
                {new Date(node.lastReviewed).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
