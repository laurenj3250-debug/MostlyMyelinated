import { useState } from 'react';
import EditableNodeName from './EditableNodeName';
import DraggableNodeCard from './DraggableNodeCard';
import { X } from 'lucide-react';

interface OrgChartNode {
  name: string;
  parentName?: string;
  summary?: string;
  suggestedTags?: string[];
}

interface OrgChartTreeProps {
  nodes: OrgChartNode[];
  onNodeChange: (index: number, field: string, value: any) => void;
  onNodeDelete: (index: number) => void;
  onNodeDrop?: (draggedIndex: number, targetIndex: number) => void | Promise<void>;
}

interface TreeNode {
  node: OrgChartNode;
  index: number;
  children: TreeNode[];
  depth: number;
}

export default function OrgChartTree({ nodes, onNodeChange, onNodeDelete, onNodeDrop }: OrgChartTreeProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Build tree structure
  const buildTree = (): TreeNode[] => {
    const rootNodes = nodes
      .map((node, index) => ({ node, index }))
      .filter(({ node }) => !node.parentName);

    const buildSubtree = (nodeData: { node: OrgChartNode; index: number }, depth: number = 0): TreeNode => {
      const children = nodes
        .map((n, i) => ({ node: n, index: i }))
        .filter(({ node }) => node.parentName === nodeData.node.name)
        .map((child) => buildSubtree(child, depth + 1));

      return {
        node: nodeData.node,
        index: nodeData.index,
        children,
        depth,
      };
    };

    return rootNodes.map((root) => buildSubtree(root));
  };

  const treeData = buildTree();

  // Handle drag and drop
  const handleDrop = async (draggedNodeId: string, targetNodeId: string) => {
    const draggedIndex = parseInt(draggedNodeId.replace('temp-', ''));
    const targetIndex = parseInt(targetNodeId.replace('temp-', ''));

    if (onNodeDrop) {
      await onNodeDrop(draggedIndex, targetIndex);
    }
  };

  // Render a single node box
  const renderNodeBox = (treeNode: TreeNode) => {
    const { node, index, children } = treeNode;
    const hasChildren = children.length > 0;

    return (
      <div key={index} className="flex flex-col items-center">
        {/* Node Box */}
        <div className="relative">
          <DraggableNodeCard
            nodeId={`temp-${index}`}
            nodeName={node.name}
            currentParentId={
              node.parentName
                ? `temp-${nodes.findIndex((n) => n.name === node.parentName)}`
                : undefined
            }
            allNodes={nodes.map((n, i) => ({
              id: `temp-${i}`,
              name: n.name,
              parentName: n.parentName,
            }))}
            onDrop={handleDrop}
          >
            <div
              className="relative min-w-[200px] p-4 border-2 border-orange-500 bg-white rounded-lg shadow-md hover:shadow-xl transition-all"
              onMouseEnter={() => setHoveredNode(index)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Delete button */}
              <button
                onClick={() => onNodeDelete(index)}
                className={`absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-opacity ${
                  hoveredNode === index ? 'opacity-100' : 'opacity-0'
                }`}
                title="Delete node"
              >
                <X size={16} />
              </button>

              {/* Editable Name */}
              <div onClick={(e) => e.stopPropagation()}>
                <EditableNodeName
                  nodeId={`temp-${index}`}
                  initialName={node.name}
                  onSave={(_, newName) => onNodeChange(index, 'name', newName)}
                  className="font-display font-bold text-center"
                />
              </div>

              {/* Summary preview */}
              {node.summary && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2 text-center">
                  {node.summary}
                </p>
              )}
            </div>
          </DraggableNodeCard>

          {/* Vertical line down to children */}
          {hasChildren && (
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-orange-500 h-8" />
          )}
        </div>

        {/* Children container */}
        {hasChildren && (
          <div className="relative">
            {/* Horizontal line across children */}
            {children.length > 1 && (
              <div
                className="absolute top-0 bg-orange-500 h-0.5"
                style={{
                  left: '50%',
                  right: '50%',
                  width: `calc(${(children.length - 1) * 100}%)`,
                  transform: 'translateX(-50%)',
                }}
              />
            )}

            {/* Render children horizontally */}
            <div className="flex gap-8 pt-8">
              {children.map((child) => renderNodeBox(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (nodes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No nodes extracted yet. Upload a PDF or paste text to begin.</p>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Building tree structure...</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto p-8 bg-gray-50 rounded-lg">
      <div className="flex gap-12 justify-center items-start min-w-max">
        {treeData.map((root) => renderNodeBox(root))}
      </div>
    </div>
  );
}
