import { useState, DragEvent, ReactNode } from 'react';
import { useToast } from './ToastContainer';

interface DraggableNodeCardProps {
  nodeId: string;
  nodeName: string;
  currentParentId?: string;
  allNodes: Array<{ id?: string; name: string; parentName?: string }>;
  onDrop: (draggedNodeId: string, targetNodeId: string) => Promise<void>;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

type DragState = 'idle' | 'dragging' | 'drag-over-valid' | 'drag-over-invalid';

export default function DraggableNodeCard({
  nodeId,
  nodeName,
  currentParentId,
  allNodes,
  onDrop,
  children,
  disabled = false,
  className = '',
}: DraggableNodeCardProps) {
  const [dragState, setDragState] = useState<DragState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const { addToast } = useToast();

  // Check if dropping nodeA onto nodeB would create a circular reference
  const wouldCreateCircularReference = (draggedId: string, targetId: string): boolean => {
    if (draggedId === targetId) return true; // Can't drop on self

    // Walk up from target to see if we hit the dragged node
    const visited = new Set<string>();
    let currentId: string | undefined = targetId;

    while (currentId) {
      if (currentId === draggedId) return true; // Found circular reference!
      if (visited.has(currentId)) break; // Prevent infinite loop
      visited.add(currentId);

      // Find parent of current node
      const node = allNodes.find(n => n.id === currentId || n.name === currentId);
      if (!node) break;

      currentId = node.parentName ?
        allNodes.find(n => n.name === node.parentName)?.id :
        undefined;
    }

    return false;
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('nodeId', nodeId);
    e.dataTransfer.setData('nodeName', nodeName);
    e.dataTransfer.setData('currentParentId', currentParentId || '');

    setIsDragging(true);
    setDragState('dragging');

    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setDragState('idle');

    // Restore opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (disabled || isDragging) return;

    e.preventDefault(); // Required to allow drop
    e.dataTransfer.dropEffect = 'move';

    const draggedNodeId = e.dataTransfer.getData('nodeId');

    // Validate if this is a valid drop target
    const isValid = !wouldCreateCircularReference(draggedNodeId, nodeId);

    setDragState(isValid ? 'drag-over-valid' : 'drag-over-invalid');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only reset if we're actually leaving (not entering a child)
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragState('idle');
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedNodeId = e.dataTransfer.getData('nodeId');
    const draggedNodeName = e.dataTransfer.getData('nodeName');
    const draggedCurrentParentId = e.dataTransfer.getData('currentParentId');

    setDragState('idle');

    // Validate
    if (draggedNodeId === nodeId) {
      addToast({ message: 'Cannot nest a node inside itself', type: 'error' });
      return;
    }

    if (wouldCreateCircularReference(draggedNodeId, nodeId)) {
      addToast({
        message: `Cannot create circular reference: "${draggedNodeName}" is an ancestor of "${nodeName}"`,
        type: 'error'
      });
      return;
    }

    // Check if already the parent
    if (draggedCurrentParentId === nodeId) {
      addToast({ message: 'Node already has this parent', type: 'info' });
      return;
    }

    // Execute the drop
    try {
      await onDrop(draggedNodeId, nodeId);
      addToast({
        message: `Moved "${draggedNodeName}" under "${nodeName}"`,
        type: 'success'
      });
    } catch (error: any) {
      addToast({
        message: error.message || 'Failed to move node',
        type: 'error'
      });
    }
  };

  // Visual state classes
  const getStateClasses = (): string => {
    switch (dragState) {
      case 'dragging':
        return 'opacity-50 scale-105 rotate-2 cursor-grabbing';
      case 'drag-over-valid':
        return 'ring-4 ring-neon-cyan shadow-cyan-glow animate-pulse-subtle';
      case 'drag-over-invalid':
        return 'ring-4 ring-red-500 shadow-red-glow animate-shake';
      default:
        return '';
    }
  };

  const getCursorClass = (): string => {
    if (disabled) return 'cursor-default';
    if (isDragging) return 'cursor-grabbing';
    if (dragState === 'drag-over-invalid') return 'cursor-not-allowed';
    return 'cursor-grab';
  };

  return (
    <>
      <div
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all duration-200 ${getStateClasses()} ${getCursorClass()} ${className}`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {children}

        {/* Drop zone indicator */}
        {dragState === 'drag-over-valid' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl border-4 border-dashed border-neon-cyan"
            style={{
              background: 'rgba(0, 234, 255, 0.05)',
              boxShadow: 'inset 0 0 30px rgba(0, 234, 255, 0.2)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-display font-bold text-sm uppercase tracking-wider"
              style={{
                background: 'rgba(0, 234, 255, 0.9)',
                color: '#000000',
                boxShadow: '0 0 20px rgba(0, 234, 255, 0.6)',
              }}
            >
              Drop here to nest
            </div>
          </div>
        )}

        {/* Invalid drop indicator */}
        {dragState === 'drag-over-invalid' && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xl border-4 border-dashed border-red-500"
            style={{
              background: 'rgba(255, 51, 102, 0.05)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-display font-bold text-sm uppercase tracking-wider"
              style={{
                background: 'rgba(255, 51, 102, 0.9)',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(255, 51, 102, 0.6)',
              }}
            >
              ⚠️ Invalid Drop
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 1.5s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .shadow-cyan-glow {
          box-shadow: 0 0 30px rgba(0, 234, 255, 0.6), 0 0 60px rgba(0, 234, 255, 0.3);
        }

        .shadow-red-glow {
          box-shadow: 0 0 30px rgba(255, 51, 102, 0.6), 0 0 60px rgba(255, 51, 102, 0.3);
        }
      `}</style>
    </>
  );
}
