import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Target } from 'lucide-react';
import { nodes as nodesApi } from '../services/api';
import type { Node, Fact } from '../types';

interface NodeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string | null;
}

export default function NodeSheet({ isOpen, onClose, nodeId }: NodeSheetProps) {
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [relationships, setRelationships] = useState<{
    outgoing: any[];
    incoming: any[];
  }>({ outgoing: [], incoming: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && nodeId) {
      loadNodeSheet();
    }
  }, [isOpen, nodeId]);

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const loadNodeSheet = async () => {
    if (!nodeId) return;

    setLoading(true);
    try {
      const [nodeRes, relationshipsRes] = await Promise.all([
        nodesApi.get(nodeId),
        nodesApi.getRelationships(nodeId).catch(() => ({ data: { outgoing: [], incoming: [] } }))
      ]);

      const nodeData = nodeRes.data as any; // Node response includes facts

      setNode(nodeData);
      setFacts(nodeData.facts || []);
      setRelationships(relationshipsRes.data);
    } catch (error) {
      console.error('Error loading node sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (strength: number) => {
    if (strength < 20)
      return {
        label: 'BRAIN-DEAD',
        color: 'bg-gray-600',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-600'
      };
    if (strength < 40)
      return {
        label: 'LMN TETRAPLEGIC',
        color: 'bg-red-900',
        textColor: 'text-red-500',
        borderColor: 'border-red-900'
      };
    if (strength < 60)
      return {
        label: 'NON-AMBULATORY ATAXIC',
        color: 'bg-red-600',
        textColor: 'text-red-400',
        borderColor: 'border-red-600'
      };
    if (strength < 75)
      return {
        label: 'AMBULATORY ATAXIC',
        color: 'bg-orange-500',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500'
      };
    if (strength < 85)
      return {
        label: 'MILD PARESIS',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500'
      };
    if (strength < 95)
      return {
        label: 'BAR',
        color: 'bg-green-500',
        textColor: 'text-green-400',
        borderColor: 'border-green-500'
      };
    return {
      label: 'HYPERREFLEXIC PROFESSOR',
      color: 'bg-lab-cyan',
      textColor: 'text-lab-cyan',
      borderColor: 'border-lab-cyan'
    };
  };

  const startDrillSession = () => {
    if (!node) return;
    navigate(`/study?nodeId=${node.id}`);
    onClose();
  };

  if (!isOpen || !nodeId) return null;

  const status = node ? getStatusInfo(node.nodeStrength) : null;

  // Group facts by type
  const factsByType: { [key: string]: Fact[] } = {};
  facts.forEach(fact => {
    if (!factsByType[fact.factType]) {
      factsByType[fact.factType] = [];
    }
    factsByType[fact.factType].push(fact);
  });

  const factTypeLabels: { [key: string]: string } = {
    definition: 'DEFINITIONS',
    association: 'ASSOCIATIONS',
    localization: 'LOCALIZATION',
    comparison: 'COMPARISONS',
    clinical: 'CLINICAL',
    simple: 'KEY FACTS'
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border-2 border-lab-cyan max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,217,255,0.3)]"
        style={{ borderRadius: '2px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-12 text-center">
            <div className="text-lab-cyan font-mono animate-pulse">LOADING NODE DATA...</div>
          </div>
        ) : !node ? (
          <div className="p-12 text-center">
            <div className="text-lab-alert font-mono">NODE NOT FOUND</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b-2 border-lab-cyan/30 p-6 bg-lab-card/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Module tag */}
                  {node.module && (
                    <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-2">
                      {node.module}
                    </div>
                  )}

                  {/* Node name */}
                  <h2 className="text-2xl font-mono font-bold text-lab-cyan mb-3">
                    {node.name}
                  </h2>

                  {/* Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-sm font-mono font-bold uppercase px-3 py-1 ${status?.color} text-white`}
                      style={{ borderRadius: '2px' }}
                    >
                      {status?.label}
                    </span>
                    <span className="text-3xl font-mono font-bold text-lab-cyan">
                      {Math.round(node.nodeStrength)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-lab-card border border-lab-border overflow-hidden mb-3" style={{ borderRadius: '1px' }}>
                    <div
                      className={`h-full ${status?.color} transition-all duration-500`}
                      style={{ width: `${node.nodeStrength}%` }}
                    />
                  </div>

                  {/* Summary */}
                  {node.summary && (
                    <div className="bg-lab-card/30 border-l-2 border-lab-mint/50 pl-3 py-2">
                      <p className="text-sm font-mono text-lab-text-secondary leading-relaxed">
                        {node.summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-lab-alert/20 border border-lab-border hover:border-lab-alert text-lab-text-tertiary hover:text-lab-alert transition-all ml-4"
                  style={{ borderRadius: '2px' }}
                  title="Close (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-lab-background/50">
              {facts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚠️</div>
                  <p className="text-sm font-mono text-lab-text-tertiary uppercase">
                    NO KNOWLEDGE BASE DATA
                  </p>
                  <p className="text-xs font-mono text-lab-text-tertiary mt-2">
                    Add facts to this node to see them here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-mono font-bold uppercase text-lab-cyan border-b border-lab-border/30 pb-2">
                    KNOWLEDGE BASE ({facts.length} FACTS)
                  </h3>

                  {/* Facts grouped by type */}
                  {Object.entries(factsByType).map(([factType, typeFacts]) => (
                    <div key={factType} className="bg-lab-card/30 border-l-2 border-lab-mint/50 p-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-lab-mint mb-3">
                        {factTypeLabels[factType] || factType.toUpperCase()}
                      </h4>
                      <ul className="space-y-2">
                        {typeFacts.map(fact => (
                          <li key={fact.id} className="text-sm font-mono text-lab-text-primary flex items-start gap-2">
                            <span className="text-lab-mint flex-shrink-0 mt-1">→</span>
                            <span className="flex-1">{fact.statement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Card count info */}
                  {node._count && (
                    <div className="bg-lab-card/30 border border-lab-border/30 p-3 flex items-center justify-between">
                      <span className="text-xs font-mono text-lab-text-tertiary uppercase">
                        Total flashcards in this node
                      </span>
                      <span className="text-lg font-mono font-bold text-lab-cyan">
                        {node._count.cards}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Relationships Section */}
              {(relationships.outgoing.length > 0 || relationships.incoming.length > 0) && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-mono font-bold uppercase text-lab-cyan border-b border-lab-border/30 pb-2">
                    NEURAL CONNECTIONS
                  </h3>

                  {/* Outgoing Relationships */}
                  {relationships.outgoing.length > 0 && (
                    <div className="bg-lab-card/30 border-l-2 border-lab-mint/50 p-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-lab-mint mb-3">
                        CONNECTIONS FROM THIS NODE
                      </h4>
                      <div className="space-y-2">
                        {relationships.outgoing.map((rel) => (
                          <div
                            key={rel.id}
                            className="text-sm font-mono flex items-start gap-2 hover:bg-lab-card/50 p-2 cursor-pointer transition-all"
                            onClick={() => {
                              navigate(`/nodes/${rel.targetNode.id}`);
                              onClose();
                            }}
                          >
                            <span className="text-lab-mint flex-shrink-0 mt-1">→</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs uppercase px-2 py-0.5 bg-lab-mint/20 text-lab-mint border border-lab-mint/30">
                                  {rel.relationshipType}
                                </span>
                                <span className="text-lab-text-primary font-bold">
                                  {rel.targetNode.name}
                                </span>
                              </div>
                              {rel.notes && (
                                <p className="text-xs text-lab-text-tertiary ml-0 mt-1">
                                  {rel.notes}
                                </p>
                              )}
                              <div className="text-xs text-lab-text-tertiary mt-1">
                                Strength: {Math.round(rel.targetNode.nodeStrength)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Incoming Relationships */}
                  {relationships.incoming.length > 0 && (
                    <div className="bg-lab-card/30 border-l-2 border-lab-cyan/50 p-4">
                      <h4 className="text-xs font-mono font-bold uppercase text-lab-cyan mb-3">
                        CONNECTIONS TO THIS NODE
                      </h4>
                      <div className="space-y-2">
                        {relationships.incoming.map((rel) => (
                          <div
                            key={rel.id}
                            className="text-sm font-mono flex items-start gap-2 hover:bg-lab-card/50 p-2 cursor-pointer transition-all"
                            onClick={() => {
                              navigate(`/nodes/${rel.sourceNode.id}`);
                              onClose();
                            }}
                          >
                            <span className="text-lab-cyan flex-shrink-0 mt-1">←</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs uppercase px-2 py-0.5 bg-lab-cyan/20 text-lab-cyan border border-lab-cyan/30">
                                  {rel.relationshipType}
                                </span>
                                <span className="text-lab-text-primary font-bold">
                                  {rel.sourceNode.name}
                                </span>
                              </div>
                              {rel.notes && (
                                <p className="text-xs text-lab-text-tertiary ml-0 mt-1">
                                  {rel.notes}
                                </p>
                              )}
                              <div className="text-xs text-lab-text-tertiary mt-1">
                                Strength: {Math.round(rel.sourceNode.nodeStrength)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t-2 border-lab-cyan/30 p-4 bg-lab-card/30 flex gap-3">
              <button
                onClick={() => {
                  navigate(`/nodes/${node.id}`);
                  onClose();
                }}
                className="flex-1 px-4 py-2 border-2 border-lab-border text-lab-text-primary hover:border-lab-cyan hover:text-lab-cyan font-mono uppercase transition-all flex items-center justify-center gap-2"
                style={{ borderRadius: '2px' }}
              >
                <ExternalLink className="w-4 h-4" />
                FULL NODE VIEW
              </button>
              <button
                onClick={startDrillSession}
                className="flex-1 px-4 py-2 bg-lab-mint border-2 border-lab-mint text-black hover:bg-lab-mint/80 font-mono uppercase font-bold transition-all flex items-center justify-center gap-2"
                style={{ borderRadius: '2px' }}
              >
                <Target className="w-4 h-4" />
                DRILL THIS NODE
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
