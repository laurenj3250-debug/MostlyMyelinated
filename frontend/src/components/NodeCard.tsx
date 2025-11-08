import { Node } from '../types';
import StrengthBadge from './StrengthBadge';

interface Props {
  node: Node;
  onClick: () => void;
}

export default function NodeCard({ node, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="card cursor-pointer hover:shadow-lg transition-shadow"
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
        <div>
          {node.strengthLabel && (
            <StrengthBadge
              strength={node.strengthLabel.strength}
              emoji={node.strengthLabel.emoji}
            />
          )}
        </div>
      </div>
    </div>
  );
}
