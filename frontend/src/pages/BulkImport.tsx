import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import { nodes } from '../services/api';

type MatchStatus = 'EXACT' | 'STRONG' | 'WEAK' | 'NONE';

interface NodePreview {
  parent: string;
  node: string;
  summary: string;
  tags: string[];
  matchStatus: MatchStatus;
  matchedNode?: {
    id: string;
    name: string;
    similarity: number;
    parentName?: string;
  };
  willCreateParent: boolean;
  parentId?: string;
  parentMismatch?: boolean;
  willCreate: boolean; // User's decision (can override)
}

interface ParentPreview {
  name: string;
  exists: boolean;
  nodeId?: string;
}

interface PreviewStats {
  total: number;
  willCreate: number;
  willSkip: number;
  newParents: number;
}

const CHATGPT_PROMPT = `Generate a CSV list of veterinary neurology nodes for spaced repetition learning.

Format: parent,node,summary,tags

Rules:
- parent: High-level category (e.g., "Cranial Nerves", "LMN Signs")
- node: Specific concept (e.g., "CN III Palsy", "Schiff-Sherrington")
- summary: One-sentence clinical description (< 100 chars)
- tags: Comma-separated (optional, e.g., "exam,lesion-localization")

Example:
Cranial Nerves,CN III Palsy,Mydriasis with ventrolateral strabismus; ptosis if severe,exam,cranial-nerve
Cranial Nerves,CN VII Palsy,Facial nerve paralysis; loss of blink/palpebral; ear droop,exam,cranial-nerve
LMN Signs,Hyporeflexia,Reduced/absent spinal reflexes; indicates LMN lesion,exam,lesion-localization

Generate 20 nodes for [YOUR TOPIC HERE].`;

export default function BulkImport() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [pastedData, setPastedData] = useState('');
  const [autoCreateParents, setAutoCreateParents] = useState(true);
  const [previews, setPreviews] = useState<NodePreview[]>([]);
  const [parents, setParents] = useState<ParentPreview[]>([]);
  const [stats, setStats] = useState<PreviewStats | null>(null);
  const [format, setFormat] = useState<string>('');
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const copyPrompt = () => {
    navigator.clipboard.writeText(CHATGPT_PROMPT);
    addToast({ message: 'Prompt copied to clipboard!', type: 'success' });
  };

  const handlePreview = async () => {
    if (!pastedData.trim()) {
      addToast({ message: 'Please paste some data', type: 'error' });
      return;
    }

    setLoading(true);
    setPreviews([]);
    setParents([]);
    setStats(null);
    setParseErrors([]);

    try {
      const response = await nodes.bulkPreview({ data: pastedData });
      const data = response.data;

      // Initialize willCreate based on matchStatus
      const previewsWithDecision = data.nodes.map((node: NodePreview) => ({
        ...node,
        willCreate: node.matchStatus !== 'EXACT', // Default: create unless exact match
      }));

      setPreviews(previewsWithDecision);
      setParents(data.parents || []);
      setStats(data.stats);
      setFormat(data.format);
      setParseErrors(data.parseErrors || []);

      addToast({ message: `Parsed ${data.nodes.length} nodes!`, type: 'success' });
    } catch (error: any) {
      console.error('Preview error:', error);
      addToast({
        message: error.response?.data?.error || 'Failed to generate preview',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const nodesToCreate = previews.filter(p => p.willCreate);

    if (nodesToCreate.length === 0) {
      addToast({ message: 'No nodes selected to create', type: 'error' });
      return;
    }

    setCreating(true);
    setProgress(0);

    try {
      // Simulate progress (real creation is atomic, but show progress for UX)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await nodes.bulkCreate({
        nodes: nodesToCreate.map(n => ({
          parent: n.parent,
          node: n.node,
          summary: n.summary,
          tags: n.tags,
          forceCreate: n.matchStatus === 'EXACT' ? false : true,
        })),
        autoCreateParents,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = response.data;
      addToast({
        message: `Created ${result.created} nodes${result.parentsCreated > 0 ? ` and ${result.parentsCreated} parents` : ''}!`,
        type: 'success',
      });

      // Navigate to nodes page after brief delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Create error:', error);
      addToast({
        message: error.response?.data?.error || 'Failed to create nodes',
        type: 'error',
      });
      setCreating(false);
      setProgress(0);
    }
  };

  const toggleNodeCreate = (index: number) => {
    setPreviews(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], willCreate: !updated[index].willCreate };
      return updated;
    });
  };

  const getMatchChip = (preview: NodePreview) => {
    if (preview.matchStatus === 'EXACT') {
      return (
        <div className="px-3 py-1 rounded-pill text-xs font-bold uppercase" style={{
          background: 'rgba(255, 51, 102, 0.15)',
          border: '1px solid #ff3366',
          color: '#ff5577',
        }}>
          EXISTS
        </div>
      );
    }

    if (preview.matchStatus === 'STRONG' && preview.matchedNode) {
      return (
        <div className="px-3 py-1 rounded-pill text-xs font-bold uppercase" style={{
          background: 'rgba(255, 170, 0, 0.15)',
          border: '1px solid #ffaa00',
          color: '#ffd700',
        }}>
          SIMILAR TO: {preview.matchedNode.name} ({preview.matchedNode.similarity}%)
        </div>
      );
    }

    if (preview.matchStatus === 'WEAK' && preview.matchedNode) {
      return (
        <div className="px-3 py-1 rounded-pill text-xs" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#9ca3af',
        }}>
          ~ Similar to {preview.matchedNode.name}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-lab-bg-primary p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all mb-6"
          style={{
            background: 'rgba(0, 234, 255, 0.12)',
            borderColor: '#00eaff',
            color: '#00eaff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 234, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ← BACK TO DASHBOARD
        </button>

        <h1 className="text-holographic font-display text-5xl font-extrabold uppercase tracking-wider mb-4"
            style={{ textDecoration: 'underline', textDecorationColor: '#00eaff', textDecorationThickness: '3px', textUnderlineOffset: '8px' }}>
          BULK NODE IMPORT
        </h1>
        <p className="text-lg font-sans text-lab-text-muted">
          Paste CSV or JSON from ChatGPT/Claude to create multiple nodes at once
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Copy Prompt Button */}
        <div className="mb-6">
          <button
            onClick={copyPrompt}
            className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2"
            style={{
              background: 'rgba(0, 234, 255, 0.08)',
              borderColor: 'rgba(0, 234, 255, 0.3)',
              color: '#00eaff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00eaff';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 234, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📋 COPY CHATGPT PROMPT
          </button>
        </div>

        {/* Input Section */}
        <div
          className="p-10 rounded-xl border-fat backdrop-blur-md mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.05) 0%, rgba(163, 75, 255, 0.05) 100%)',
            borderColor: 'rgba(0, 234, 255, 0.3)',
            boxShadow: '0 0 30px rgba(0, 234, 255, 0.1)',
          }}
        >
          <label className="block text-sm font-display font-bold uppercase tracking-wider text-neon-cyan mb-3"
                 style={{ textShadow: '0 0 8px rgba(0, 234, 255, 0.6)' }}>
            Paste Data (CSV or JSON)
          </label>

          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder={`Paste CSV or JSON here...\n\nCSV Example:\nCranial Nerves,CN III Palsy,Mydriasis with ventrolateral strabismus,exam\nCranial Nerves,CN VII Palsy,Facial nerve paralysis; loss of blink,exam`}
            rows={12}
            className="w-full px-6 py-4 rounded-lg border-medium font-mono text-sm transition-all resize-none mb-4"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'rgba(0, 234, 255, 0.3)',
              color: '#00eaff',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#00eaff';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 234, 255, 0.5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          {/* Options */}
          <div className="mb-6 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateParents}
                onChange={(e) => setAutoCreateParents(e.target.checked)}
                className="w-5 h-5"
                style={{ accentColor: '#00eaff' }}
              />
              <span className="text-sm font-sans text-lab-text-primary">
                Auto-create missing parents
              </span>
            </label>
            <div className="text-xs text-lab-text-dim italic">
              (If a parent doesn't exist, it'll be created automatically)
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={handlePreview}
            disabled={loading}
            className="w-full px-12 py-5 rounded-pill border-none font-display font-extrabold text-lg uppercase tracking-wider transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #00eaff 0%, #a34bff 100%)',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(0, 234, 255, 0.5)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 234, 255, 0.7)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 234, 255, 0.5)';
            }}
          >
            {loading ? 'DEMYELINATING DUPLICATES...' : 'PREVIEW IMPORT'}
          </button>
        </div>

        {/* Parse Errors */}
        {parseErrors.length > 0 && (
          <div className="mb-6 p-4 rounded-lg" style={{
            background: 'rgba(255, 170, 0, 0.1)',
            border: '1px solid rgba(255, 170, 0, 0.3)',
          }}>
            <div className="text-sm font-bold text-yellow-400 mb-2">PARSE WARNINGS:</div>
            {parseErrors.map((err, idx) => (
              <div key={idx} className="text-xs text-lab-text-muted">
                Row {err.row}: {err.message}
              </div>
            ))}
          </div>
        )}

        {/* Preview Table */}
        {previews.length > 0 && stats && (
          <>
            {/* Parent Preview Section */}
            {parents.length > 0 && (
              <div className="mb-6 p-6 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.05) 0%, rgba(163, 75, 255, 0.05) 100%)',
                border: '2px solid rgba(0, 234, 255, 0.25)',
                boxShadow: '0 0 20px rgba(0, 234, 255, 0.1)',
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-lg font-display font-extrabold uppercase tracking-wider text-neon-cyan"
                       style={{ textShadow: '0 0 10px rgba(0, 234, 255, 0.8)' }}>
                    PARENT NODES DETECTED
                  </div>
                  <div className="px-3 py-1 rounded-pill text-xs font-mono font-bold" style={{
                    background: 'rgba(0, 234, 255, 0.15)',
                    border: '1px solid #00eaff',
                    color: '#00eaff',
                  }}>
                    {parents.length} TOTAL
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {parents.map((parent, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-3 rounded-lg flex items-center justify-between"
                      style={{
                        background: parent.exists
                          ? 'rgba(0, 255, 136, 0.08)'
                          : 'rgba(0, 234, 255, 0.08)',
                        border: `1px solid ${parent.exists ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 234, 255, 0.3)'}`,
                      }}
                    >
                      <div className="text-sm font-sans text-lab-text-primary font-semibold truncate flex-1">
                        {parent.name}
                      </div>
                      <div className="ml-3 px-2 py-1 rounded text-xs font-bold uppercase whitespace-nowrap" style={{
                        background: parent.exists
                          ? 'rgba(0, 255, 136, 0.15)'
                          : 'rgba(255, 170, 0, 0.15)',
                        color: parent.exists ? '#00ff88' : '#ffaa00',
                      }}>
                        {parent.exists ? '✓ EXISTS' : '+ NEW'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Stats - Enhanced */}
            <div className="mb-6 p-5 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.1) 0%, rgba(163, 75, 255, 0.1) 100%)',
              border: '2px solid rgba(0, 234, 255, 0.3)',
              boxShadow: '0 0 25px rgba(0, 234, 255, 0.15)',
            }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs font-display font-bold uppercase tracking-wider text-neon-cyan opacity-80">
                  IMPORT SUMMARY
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {/* Format */}
                <div className="px-4 py-2 rounded-pill" style={{
                  background: 'rgba(163, 75, 255, 0.15)',
                  border: '1px solid rgba(163, 75, 255, 0.4)',
                }}>
                  <span className="text-xs font-mono uppercase text-lab-text-dim">Format: </span>
                  <span className="text-sm font-mono font-bold text-purple-400">{format.toUpperCase()}</span>
                </div>

                {/* Total */}
                <div className="px-4 py-2 rounded-pill" style={{
                  background: 'rgba(0, 234, 255, 0.15)',
                  border: '1px solid rgba(0, 234, 255, 0.4)',
                }}>
                  <span className="text-xs font-mono uppercase text-lab-text-dim">Total: </span>
                  <span className="text-sm font-mono font-bold text-neon-cyan">{stats.total}</span>
                </div>

                {/* Will Create */}
                <div className="px-4 py-2 rounded-pill" style={{
                  background: 'rgba(0, 255, 136, 0.15)',
                  border: '1px solid rgba(0, 255, 136, 0.4)',
                }}>
                  <span className="text-xs font-mono uppercase text-lab-text-dim">Will Create: </span>
                  <span className="text-sm font-mono font-bold text-green-400">{previews.filter(p => p.willCreate).length}</span>
                </div>

                {/* Will Skip */}
                <div className="px-4 py-2 rounded-pill" style={{
                  background: 'rgba(255, 51, 102, 0.15)',
                  border: '1px solid rgba(255, 51, 102, 0.4)',
                }}>
                  <span className="text-xs font-mono uppercase text-lab-text-dim">Will Skip: </span>
                  <span className="text-sm font-mono font-bold text-pink-400">{previews.filter(p => !p.willCreate).length}</span>
                </div>

                {/* New Parents */}
                {stats.newParents > 0 && (
                  <div className="px-4 py-2 rounded-pill" style={{
                    background: 'rgba(255, 170, 0, 0.15)',
                    border: '1px solid rgba(255, 170, 0, 0.4)',
                  }}>
                    <span className="text-xs font-mono uppercase text-lab-text-dim">New Parents: </span>
                    <span className="text-sm font-mono font-bold text-yellow-400">{stats.newParents}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto mb-6 rounded-xl" style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(0, 234, 255, 0.2)',
            }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0, 234, 255, 0.3)' }}>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Create?</th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Parent</th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Node</th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Summary</th>
                    <th className="px-4 py-3 text-left text-xs font-mono font-bold text-neon-cyan uppercase">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {previews.map((preview, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: !preview.willCreate ? 'rgba(255, 255, 255, 0.02)' : undefined,
                        borderLeft: preview.matchStatus === 'STRONG' ? '4px solid #ffaa00' : undefined,
                      }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={preview.willCreate}
                          onChange={() => toggleNodeCreate(idx)}
                          className="w-5 h-5"
                          style={{ accentColor: '#00eaff' }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {getMatchChip(preview)}
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-lab-text-primary">
                        {preview.parent}
                        {preview.willCreateParent && (
                          <span className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{
                            background: 'rgba(0, 234, 255, 0.15)',
                            color: '#00eaff',
                          }}>
                            (new)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-sans text-lab-text-primary font-semibold">
                        <div className="flex items-center gap-2">
                          {preview.node}
                          {preview.parentMismatch && preview.matchedNode && (
                            <div
                              className="group relative inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase cursor-help"
                              style={{
                                background: 'rgba(255, 170, 0, 0.2)',
                                border: '1px solid #ffaa00',
                                color: '#ffaa00',
                              }}
                            >
                              ⚠ PARENT MISMATCH
                              <div
                                className="absolute left-0 top-full mt-2 px-3 py-2 rounded-lg text-xs font-sans normal-case whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                style={{
                                  background: 'rgba(0, 0, 0, 0.95)',
                                  border: '1px solid #ffaa00',
                                  color: '#ffaa00',
                                  boxShadow: '0 0 20px rgba(255, 170, 0, 0.5)',
                                }}
                              >
                                Existing node "{preview.matchedNode.name}" has parent: {preview.matchedNode.parentName}
                                <br />
                                New import specifies parent: {preview.parent}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-sans text-lab-text-muted">{preview.summary || '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-lab-text-dim">
                        {preview.tags.length > 0 ? preview.tags.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={creating || previews.filter(p => p.willCreate).length === 0}
              className="w-full px-12 py-5 rounded-pill border-none font-display font-extrabold text-lg uppercase tracking-wider transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00eaff 100%)',
                color: '#000000',
                boxShadow: '0 0 24px rgba(0, 255, 136, 0.5)',
              }}
              onMouseEnter={(e) => {
                if (!creating && previews.filter(p => p.willCreate).length > 0) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 255, 136, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.5)';
              }}
            >
              {creating ? 'CREATING NODES...' : `CREATE ${previews.filter(p => p.willCreate).length} NODES`}
            </button>
          </>
        )}

        {/* Progress Modal */}
        {creating && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="p-10 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.1) 0%, rgba(163, 75, 255, 0.1) 100%)',
              border: '2px solid rgba(0, 234, 255, 0.4)',
              boxShadow: '0 0 40px rgba(0, 234, 255, 0.3)',
              minWidth: '400px',
            }}>
              <div className="text-center mb-6">
                <div className="text-2xl font-display font-extrabold text-neon-cyan uppercase mb-2">
                  Creating Nodes...
                </div>
                <div className="text-sm font-mono text-lab-text-muted">
                  {previews.filter(p => p.willCreate).length} nodes
                </div>
              </div>

              <div className="w-full h-6 rounded-pill overflow-hidden" style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 234, 255, 0.3)',
              }}>
                <div
                  className="h-full transition-all duration-200"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #00eaff 0%, #00ff88 100%)',
                    boxShadow: '0 0 10px rgba(0, 234, 255, 0.6)',
                  }}
                />
              </div>

              <div className="text-center mt-4 text-sm font-mono text-neon-cyan">
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
