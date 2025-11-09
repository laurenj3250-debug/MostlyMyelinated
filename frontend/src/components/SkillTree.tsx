import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Node } from '../types';

interface SkillTreeProps {
  nodes: Node[];
}

interface TreeNode {
  node: Node;
  children: TreeNode[];
  depth: number;
}

export default function SkillTree({ nodes }: SkillTreeProps) {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    buildTree();
  }, [nodes]);

  const buildTree = () => {
    // Build a map of node ID to node
    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    // Find root nodes (nodes with no parent)
    const rootNodes = nodes.filter((node) => !node.parentId);

    // Recursively build tree structure
    const buildSubtree = (node: Node, depth: number = 0): TreeNode => {
      const children = nodes
        .filter((n) => n.parentId === node.id)
        .map((child) => buildSubtree(child, depth + 1));

      return {
        node,
        children,
        depth,
      };
    };

    const tree = rootNodes.map((root) => buildSubtree(root));
    setTreeData(tree);
  };

  const getNodeGradient = (strength: number) => {
    if (strength < 20) return {
      gradient: 'from-gray-900 to-gray-800',
      border: 'border-gray-900',
      text: 'text-white',
      glow: ''
    };
    if (strength < 40) return {
      gradient: 'from-red-900 to-red-800',
      border: 'border-red-900',
      text: 'text-white',
      glow: ''
    };
    if (strength < 60) return {
      gradient: 'from-red-600 to-red-500',
      border: 'border-red-600',
      text: 'text-white',
      glow: 'shadow-glow-red'
    };
    if (strength < 75) return {
      gradient: 'from-orange-500 to-yellow-500',
      border: 'border-orange-500',
      text: 'text-white',
      glow: ''
    };
    if (strength < 85) return {
      gradient: 'from-yellow-500 to-green-500',
      border: 'border-yellow-500',
      text: 'text-gray-900',
      glow: ''
    };
    if (strength < 95) return {
      gradient: 'from-green-600 to-green-500',
      border: 'border-green-600',
      text: 'text-white',
      glow: 'shadow-glow-green'
    };
    return {
      gradient: 'from-blue-600 to-cyan-500',
      border: 'border-blue-500',
      text: 'text-white',
      glow: 'shadow-glow-md'
    };
  };

  const renderNode = (treeNode: TreeNode) => {
    const { node, children, depth } = treeNode;
    const hasChildren = children.length > 0;
    const colorScheme = getNodeGradient(node.nodeStrength);

    return (
      <div key={node.id} className="mb-4 animate-slide-in">
        {/* Node Card */}
        <div
          className={`flex items-center gap-3`}
          style={{ marginLeft: `${depth * 2.5}rem` }}
        >
          {/* Connection line */}
          {depth > 0 && (
            <div className={`w-10 h-1 rounded-full bg-gradient-to-r ${colorScheme.gradient} opacity-50`}></div>
          )}

          {/* Node */}
          <div
            onClick={() => navigate(`/nodes/${node.id}`)}
            className={`flex-1 p-5 rounded-2xl border-2 cursor-pointer
                       bg-gradient-to-r ${colorScheme.gradient} ${colorScheme.border} ${colorScheme.text}
                       hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
                       ${colorScheme.glow}
                       ${node.nodeStrength < 60 ? 'animate-pulse-glow' : ''}
                       group`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 group-hover:scale-105 transition-transform">
                  {node.name}
                </h3>
                <div className="flex items-center gap-4 text-sm opacity-90 font-medium">
                  <span>{node._count?.cards || 0} cards</span>
                  <span>•</span>
                  <span className="font-bold">{node.nodeStrength}%</span>
                </div>
              </div>
              {node.strengthLabel && (
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {node.strengthLabel.emoji}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 transition-all duration-500"
                style={{ width: `${node.nodeStrength}%` }}
              />
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="mt-3 ml-4 border-l-2 border-gray-300 pl-2">
            {children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (nodes.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No nodes yet. Create some to see the skill tree!</p>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Building skill tree...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card-gradient bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <h3 className="font-bold text-2xl mb-3 text-gradient-blue">Knowledge Tree</h3>
        <p className="text-gray-600 leading-relaxed">
          Click any node to view details. Colors represent mastery levels - from weak (red) to mastered (blue).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        {treeData.map((root) => renderNode(root))}
      </div>
    </div>
  );
}
