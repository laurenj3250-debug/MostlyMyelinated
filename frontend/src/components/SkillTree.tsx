import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Node } from '../types';
import HeatMapBar from './HeatMapBar';
import DraggableNodeCard from './DraggableNodeCard';
import EditableNodeName from './EditableNodeName';

interface SkillTreeProps {
  nodes: Node[];
  onNodeClick?: (nodeId: string) => void;
  onNodesChange?: () => void; // Callback to refresh nodes after changes
}

interface TreeNode {
  node: Node;
  children: TreeNode[];
  depth: number;
}

export default function SkillTree({ nodes, onNodeClick, onNodesChange }: SkillTreeProps) {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  const handleNodeClick = (nodeId: string) => {
    if (onNodeClick) {
      onNodeClick(nodeId);
    } else {
      navigate(`/nodes/${nodeId}`);
    }
  };

  // Handle drag-and-drop
  const handleNodeDrop = async (draggedNodeId: string, targetNodeId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/nodes/${draggedNodeId}/parent`,
        { parentId: targetNodeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh nodes
      if (onNodesChange) {
        onNodesChange();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to move node');
    }
  };

  // Handle name save
  const handleNameSave = (_nodeId: string, _newName: string) => {
    // Refresh nodes after name change
    if (onNodesChange) {
      onNodesChange();
    }
  };

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

  const getNodeStyle = (strength: number) => {
    // Critical - Brain-dead
    if (strength < 20) return {
      bg: 'bg-lab-bg-card',
      border: 'border-purple-600',
      text: 'text-lab-text-primary',
      glow: 'shadow-glow-alert',
      alert: true
    };
    // Weak - LMN tetraplegic
    if (strength < 40) return {
      bg: 'bg-lab-bg-card',
      border: 'border-blue-600',
      text: 'text-lab-text-primary',
      glow: 'shadow-glow-alert',
      alert: true
    };
    // Moderate - Non-ambulatory ataxic
    if (strength < 60) return {
      bg: 'bg-lab-bg-card',
      border: 'border-teal-500',
      text: 'text-lab-text-primary',
      glow: '',
      alert: false
    };
    // Good - Ambulatory ataxic
    if (strength < 75) return {
      bg: 'bg-lab-bg-card',
      border: 'border-orange-500',
      text: 'text-lab-text-primary',
      glow: '',
      alert: false
    };
    // Strong - Mild paresis
    if (strength < 85) return {
      bg: 'bg-lab-bg-card',
      border: 'border-yellow-500',
      text: 'text-lab-text-primary',
      glow: '',
      alert: false
    };
    // Very Strong - BAR
    if (strength < 95) return {
      bg: 'bg-lab-bg-card',
      border: 'border-green-500',
      text: 'text-lab-text-primary',
      glow: 'shadow-glow-mint',
      alert: false
    };
    // Mastered - Hyperreflexic
    return {
      bg: 'bg-lab-bg-card',
      border: 'border-lab-cyan',
      text: 'text-lab-text-primary',
      glow: 'shadow-glow-cyan',
      alert: false
    };
  };

  const renderNode = (treeNode: TreeNode) => {
    const { node, children, depth } = treeNode;
    const hasChildren = children.length > 0;
    const style = getNodeStyle(node.nodeStrength);

    return (
      <div key={node.id} className="mb-4 animate-fade-in">
        {/* Node Card */}
        <div
          className={`flex items-center gap-3`}
          style={{ marginLeft: `${depth * 2.5}rem` }}
        >
          {/* Connection line */}
          {depth > 0 && (
            <div className={`w-10 h-0.5 ${style.border} opacity-50`}></div>
          )}

          {/* Draggable Node */}
          <DraggableNodeCard
            nodeId={node.id}
            nodeName={node.name}
            currentParentId={node.parentId}
            allNodes={nodes.map(n => ({ id: n.id, name: n.name, parentName: nodes.find(p => p.id === n.parentId)?.name }))}
            onDrop={handleNodeDrop}
            className="flex-1"
          >
            <div
              onClick={() => handleNodeClick(node.id)}
              className={`p-4 border-2 cursor-pointer
                         ${style.bg} ${style.border} ${style.text}
                         hover:border-lab-cyan hover:shadow-glow-sm hover:translate-x-1
                         transition-all duration-300
                         ${style.glow}
                         ${style.alert ? 'animate-pulse-glow' : ''}
                         group`}
              style={{ borderRadius: '2px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {/* Editable Name */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditableNodeName
                      nodeId={node.id}
                      initialName={node.name}
                      onSave={handleNameSave}
                      className="font-mono font-bold text-lg mb-2 uppercase tracking-wide group-hover:text-lab-cyan transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono text-lab-text-secondary">
                    <span>{node._count?.cards || 0} CARDS</span>
                    <span>•</span>
                    <span className="font-bold text-lab-cyan">{node.nodeStrength.toFixed(1)}%</span>
                  </div>
                </div>
                {node.strengthLabel && (
                  <div className="text-3xl group-hover:scale-110 transition-transform">
                    {node.strengthLabel.emoji}
                  </div>
                )}
              </div>

              {/* Heat Map Progress Bar */}
              <div className="mt-3">
                <HeatMapBar
                  strength={node.nodeStrength}
                  showPercentage={false}
                  size="small"
                  animate={true}
                />
              </div>
            </div>
          </DraggableNodeCard>
        </div>

        {/* Render children */}
        {hasChildren && (
          <div className="mt-3 ml-4 border-l border-lab-cyan/30 pl-2">
            {children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (nodes.length === 0) {
    return (
      <div className="bg-lab-bg-card border border-lab-border p-12 text-center" style={{ borderRadius: '2px' }}>
        <p className="font-mono text-lab-text-secondary">NO NODES AVAILABLE FOR TREE VIEW</p>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="bg-lab-bg-card border border-lab-border p-12 text-center" style={{ borderRadius: '2px' }}>
        <p className="font-mono text-lab-text-secondary">BUILDING NEURAL TREE STRUCTURE...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-black border border-lab-cyan/30 p-4" style={{ borderRadius: '2px' }}>
        <h3 className="font-mono font-bold text-sm mb-2 text-lab-cyan uppercase tracking-wider">NEURAL HIERARCHY VIEW</h3>
        <p className="font-mono text-xs text-lab-text-secondary leading-relaxed">
          Hierarchical node structure. Colors indicate strength: Purple/Blue (critical) → Teal (moderate) → Orange/Yellow (strong) → Green/Cyan (mastered).
        </p>
      </div>

      <div className="bg-lab-bg-card border border-lab-border p-6" style={{ borderRadius: '2px' }}>
        {treeData.map((root) => renderNode(root))}
      </div>
    </div>
  );
}
