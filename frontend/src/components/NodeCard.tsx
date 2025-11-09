import { Node } from '../types';
import NeuroLabel from './NeuroLabel';

interface Props {
  node: Node;
  onClick: () => void;
}

export default function NodeCard({ node, onClick }: Props) {
  // Get border color based on strength
  const getBorderColor = () => {
    const strength = node.nodeStrength;
    if (strength < 20) return 'border-gray-900';
    if (strength < 40) return 'border-red-900';
    if (strength < 60) return 'border-red-600';
    if (strength < 75) return 'border-orange-500';
    if (strength < 85) return 'border-yellow-500';
    if (strength < 95) return 'border-green-600';
    return 'border-blue-500';
  };

  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getBorderColor()}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{node.name}</h3>
          {node.summary && (
            <p className="text-gray-600 text-sm mb-3">{node.summary}</p>
          )}
          {node.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {node.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mb-3">
            {node.strengthLabel && (
              <NeuroLabel
                strength={node.strengthLabel.strength}
                label={node.strengthLabel.label}
                emoji={node.strengthLabel.emoji}
                size="sm"
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {node._count && (
              <>
                <span>{node._count.facts} facts</span>
                <span>{node._count.cards} cards</span>
              </>
            )}
            {node.lastReviewed && (
              <span>
                Last: {new Date(node.lastReviewed).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
