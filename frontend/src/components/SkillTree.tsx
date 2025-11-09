import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Node } from '../types';
import NeuroLabel from './NeuroLabel';

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

  const getNodeColor = (strength: number) => {
    if (strength < 20) return 'bg-gray-900 border-gray-900 text-white';
    if (strength < 40) return 'bg-red-900 border-red-900 text-white';
    if (strength < 60) return 'bg-red-600 border-red-600 text-white';
    if (strength < 75) return 'bg-orange-500 border-orange-500 text-white';
    if (strength < 85) return 'bg-yellow-500 border-yellow-500 text-black';
    if (strength < 95) return 'bg-green-600 border-green-600 text-white';
    return 'bg-blue-500 border-blue-500 text-white';
  };

  const renderNode = (treeNode: TreeNode) => {
    const { node, children, depth } = treeNode;
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} className="mb-4">
        {/* Node Card */}
        <div
          className={`flex items-center gap-2`}
          style={{ marginLeft: `${depth * 2}rem` }}
        >
          {/* Connection line */}
          {depth > 0 && (
            <div className="w-8 h-0.5 bg-gray-300"></div>
          )}

          {/* Node */}
          <div
            onClick={() => navigate(`/nodes/${node.id}`)}
            className={`flex-1 p-4 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${getNodeColor(
              node.nodeStrength
            )}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{node.name}</h3>
                <div className="text-sm opacity-90">
                  {node._count?.cards || 0} cards • {node.nodeStrength}%
                </div>
              </div>
              {node.strengthLabel && (
                <div className="text-2xl">
                  {node.strengthLabel.emoji}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="mt-2">
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
    <div className="space-y-4">
      <div className="card bg-blue-50 border-2 border-blue-300">
        <h3 className="font-bold text-lg mb-2">Knowledge Tree</h3>
        <p className="text-sm text-gray-600">
          Click any node to view details. Colors indicate mastery level.
        </p>
      </div>

      <div className="bg-white rounded-lg p-6">
        {treeData.map((root) => renderNode(root))}
      </div>
    </div>
  );
}
