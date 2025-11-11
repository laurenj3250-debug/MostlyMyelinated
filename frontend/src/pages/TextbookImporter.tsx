import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader2, BookOpen, CheckCircle, XCircle, Sparkles, FileCheck, Info } from 'lucide-react';
import axios from 'axios';
import EditableNodeName from '../components/EditableNodeName';
import DraggableNodeCard from '../components/DraggableNodeCard';

interface ExtractedNode {
  name: string;
  parentName?: string;
  summary: string;
  facts: string[];
  suggestedTags: string[];
  selected: boolean;
}

interface FileMetadata {
  fileName: string;
  fileSize: number;
  textLength: number;
  chunksProcessed: number;
  estimatedChunks: number;
}

export default function TextbookImporter() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedNodes, setExtractedNodes] = useState<ExtractedNode[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (mode === 'upload' && !file) {
      alert('Please select a PDF file');
      return;
    }
    if (mode === 'text' && !textInput.trim()) {
      alert('Please enter some text');
      return;
    }

    setLoading(true);
    setProcessingStatus('Uploading and analyzing...');

    try {
      const token = localStorage.getItem('token');
      let response;

      if (mode === 'upload' && file) {
        const formData = new FormData();
        formData.append('file', file);

        setProcessingStatus(`Processing ${file.name}...`);

        response = await axios.post(
          '/api/ai/extract-nodes',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        setProcessingStatus('Analyzing text content...');

        response = await axios.post(
          '/api/ai/extract-nodes',
          { text: textInput },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const nodes = response.data.nodes.map((node: any) => ({
        ...node,
        selected: true, // All selected by default
      }));

      setExtractedNodes(nodes);

      // Store metadata if available
      if (response.data.metadata) {
        setFileMetadata(response.data.metadata);
      }

      setProcessingStatus('');
    } catch (error: any) {
      console.error('Extraction error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to extract nodes from content';
      alert(errorMessage);
      setProcessingStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    const selectedNodes = extractedNodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) {
      alert('Please select at least one node to import');
      return;
    }

    setImporting(true);
    try {
      // Generate a batch ID to group these nodes together
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/ai/import-nodes',
        {
          nodes: selectedNodes,
          fileName: fileMetadata?.fileName || file?.name,
          batchId, // Pass batch ID for tracking
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chapterInfo = response.data.chapterTag
        ? ` (tagged as ${response.data.chapterTag})`
        : '';
      alert(`Successfully imported ${response.data.nodesCreated} nodes!${chapterInfo}\n\nBatch ID: ${response.data.batchId}`);
      navigate('/');
    } catch (error: any) {
      console.error('Import error:', error);
      alert(error.response?.data?.error || 'Failed to import nodes');
    } finally {
      setImporting(false);
    }
  };

  const toggleNode = (index: number) => {
    setExtractedNodes((prev) =>
      prev.map((node, i) => (i === index ? { ...node, selected: !node.selected } : node))
    );
  };

  const updateNodeParent = (index: number, newParentName: string | undefined) => {
    setExtractedNodes((prev) =>
      prev.map((node, i) => (i === index ? { ...node, parentName: newParentName } : node))
    );
  };

  // Handle drag-and-drop parent change
  const handleNodeDrop = async (draggedNodeId: string, targetNodeId: string) => {
    // Find the dragged and target nodes by their temporary IDs
    const draggedIndex = parseInt(draggedNodeId.replace('temp-', ''));
    const targetIndex = parseInt(targetNodeId.replace('temp-', ''));

    const draggedNode = extractedNodes[draggedIndex];
    const targetNode = extractedNodes[targetIndex];

    if (!draggedNode || !targetNode) {
      throw new Error('Node not found');
    }

    // Update the parent relationship
    updateNodeParent(draggedIndex, targetNode.name);
  };

  // Organize nodes hierarchically for display
  const organizeNodesHierarchically = () => {
    const nodeMap = new Map(extractedNodes.map((node, idx) => [node.name, { node, idx, depth: 0 }]));

    // Calculate depth for each node
    const calculateDepth = (nodeName: string, visited = new Set<string>()): number => {
      if (visited.has(nodeName)) return 0; // Circular reference protection
      visited.add(nodeName);

      const nodeData = nodeMap.get(nodeName);
      if (!nodeData || !nodeData.node.parentName) return 0;

      return 1 + calculateDepth(nodeData.node.parentName, visited);
    };

    extractedNodes.forEach((node) => {
      const nodeData = nodeMap.get(node.name);
      if (nodeData) {
        nodeData.depth = calculateDepth(node.name);
      }
    });

    // Sort: parents first, then children
    return [...nodeMap.values()].sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.idx - b.idx;
    });
  };

  const hierarchicalNodes = extractedNodes.length > 0 ? organizeNodesHierarchically() : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 page-enter">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BookOpen className="w-10 h-10 text-white" />
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  Textbook Importer
                </h1>
                <p className="text-blue-100 mt-2">
                  AI-powered knowledge extraction from textbooks
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-semibold
                        transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {extractedNodes.length === 0 ? (
          /* Upload/Input Section */
          <div className="max-w-3xl mx-auto">
            <div className="card-gradient animate-scale-in">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold">Upload Textbook Content</h2>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 bg-gray-200 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    mode === 'upload'
                      ? 'bg-white shadow-lg text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-5 h-5 inline mr-2" />
                  Upload PDF
                </button>
                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    mode === 'text'
                      ? 'bg-white shadow-lg text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-5 h-5 inline mr-2" />
                  Paste Text
                </button>
              </div>

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="space-y-4 animate-fade-in">
                  <label
                    className="flex flex-col items-center justify-center w-full h-64
                              border-4 border-dashed border-blue-300 rounded-2xl
                              cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50
                              hover:from-blue-100 hover:to-purple-100 transition-all duration-300
                              group"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-16 h-16 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                      <p className="mb-2 text-lg font-semibold text-gray-700">
                        {file ? file.name : 'Click to upload PDF'}
                      </p>
                      <p className="text-sm text-gray-500">Max file size: 50MB</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* File Info Display */}
                  {file && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <FileCheck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-2">File Ready</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Name:</span>
                              <span className="ml-2 font-semibold text-gray-900">{file.name}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Size:</span>
                              <span className="ml-2 font-semibold text-gray-900">{formatFileSize(file.size)}</span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-600 italic">
                                AI will automatically analyze and extract knowledge structure
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Text Mode */}
              {mode === 'text' && (
                <div className="space-y-4 animate-fade-in">
                  <label className="label">Paste textbook content:</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="input min-h-[300px] font-mono text-sm"
                    placeholder="Paste your textbook chapter or notes here..."
                  />
                  <p className="text-sm text-gray-600">
                    Minimum 100 characters. The AI will analyze the content and extract knowledge nodes.
                  </p>
                </div>
              )}

              {/* Extract Button */}
              <button
                onClick={handleExtract}
                disabled={loading || (mode === 'upload' && !file) || (mode === 'text' && !textInput.trim())}
                className="mt-6 w-full btn btn-primary py-4 text-lg font-bold
                          disabled:opacity-50 disabled:cursor-not-allowed
                          shadow-xl hover:shadow-2xl"
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center">
                      <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
                      Analyzing with AI...
                    </div>
                    {processingStatus && (
                      <div className="text-sm font-normal opacity-90">
                        {processingStatus}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 inline mr-2" />
                    Extract Knowledge Nodes
                  </>
                )}
              </button>

              {/* Processing Info */}
              {loading && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700">
                      <p className="font-semibold mb-1">Processing in progress...</p>
                      <p>Large PDFs are automatically split into intelligent chunks (~15-20 pages each). This may take a few minutes.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Preview & Import Section */
          <div className="animate-slide-in">
            {/* File Metadata Display */}
            {fileMetadata && (
              <div className="card-gradient mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <FileCheck className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Processing Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">File Name</div>
                        <div className="font-semibold text-gray-900">{fileMetadata.fileName}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">File Size</div>
                        <div className="font-semibold text-gray-900">{formatFileSize(fileMetadata.fileSize)}</div>
                      </div>
                      <div className="bg-cyan-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Text Length</div>
                        <div className="font-semibold text-gray-900">{fileMetadata.textLength.toLocaleString()} chars</div>
                      </div>
                    </div>

                    {/* Chunking Info */}
                    {fileMetadata.chunksProcessed > 1 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Auto-chunking completed: {fileMetadata.chunksProcessed} chunks processed
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          This large PDF was automatically split into {fileMetadata.chunksProcessed} intelligent chunks
                          for optimal AI processing. Duplicate nodes were merged automatically.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="card-gradient mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gradient-blue mb-2">
                    Extracted Nodes ({extractedNodes.filter((n) => n.selected).length} selected)
                  </h2>
                  <p className="text-gray-600">
                    Review and select the nodes you want to import to your knowledge base.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setExtractedNodes([]);
                    setFile(null);
                    setTextInput('');
                    setFileMetadata(null);
                  }}
                  className="btn btn-secondary"
                >
                  Start Over
                </button>
              </div>

              <button
                onClick={handleImport}
                disabled={importing || extractedNodes.filter((n) => n.selected).length === 0}
                className="w-full btn bg-gradient-to-r from-green-600 to-emerald-600 text-white
                          hover:from-green-700 hover:to-emerald-700 py-4 text-lg font-bold
                          shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-6 h-6 inline mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 inline mr-2" />
                    Import Selected Nodes ({extractedNodes.filter((n) => n.selected).length})
                  </>
                )}
              </button>
            </div>

            {/* Node List with Hierarchy */}
            <div className="space-y-4">
              {hierarchicalNodes.map(({ node, idx, depth }) => (
                <div key={idx} style={{ marginLeft: `${depth * 2.5}rem` }}>
                  <DraggableNodeCard
                    nodeId={`temp-${idx}`}
                    nodeName={node.name}
                    currentParentId={node.parentName ? `temp-${extractedNodes.findIndex(n => n.name === node.parentName)}` : undefined}
                    allNodes={extractedNodes.map((n, i) => ({ id: `temp-${i}`, name: n.name, parentName: n.parentName }))}
                    onDrop={handleNodeDrop}
                    className={`card-gradient transition-all duration-300
                              ${node.selected ? 'ring-4 ring-green-300' : 'opacity-60 hover:opacity-80'}`}
                  >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1 cursor-pointer" onClick={() => toggleNode(idx)}>
                      {node.selected ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="mb-2">
                          <EditableNodeName
                            nodeId={`temp-${idx}`}
                            initialName={node.name}
                            onSave={(_, newName) => {
                              setExtractedNodes((prev) =>
                                prev.map((n, i) => (i === idx ? { ...n, name: newName } : n))
                              );
                            }}
                            readonly={false}
                            className="text-2xl font-bold text-gray-900"
                          />
                        </div>

                        {/* Depth Indicator */}
                        {depth > 0 && (
                          <p className="text-sm text-purple-600 flex items-center gap-2 mb-2 font-semibold">
                            <span>{'└─'.repeat(depth)}</span>
                            Level {depth} node
                          </p>
                        )}

                        {/* Parent Selector */}
                        <div className="mb-2">
                          <label className="text-sm font-semibold text-gray-600 block mb-1">
                            Parent:
                          </label>
                          <select
                            value={node.parentName || ''}
                            onChange={(e) => updateNodeParent(idx, e.target.value || undefined)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          >
                            <option value="">(None - Top Level)</option>
                            {extractedNodes
                              .filter((n) => n.name !== node.name)
                              .map((n, nIdx) => (
                                <option key={nIdx} value={n.name}>
                                  {n.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-4">{node.summary}</p>

                      {node.suggestedTags && node.suggestedTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {node.suggestedTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </DraggableNodeCard>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
