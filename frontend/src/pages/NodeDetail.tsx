import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nodes, facts as factsApi, images as imagesApi } from '../services/api';
import { Node, Fact } from '../types';
import StrengthBadge from '../components/StrengthBadge';
import QuickAddBar from '../components/QuickAddBar';
import AITextExtractor from '../components/AITextExtractor';
import CardPreviewModal from '../components/CardPreviewModal';
import ImageUploader from '../components/ImageUploader';

export default function NodeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [nodeFacts, setNodeFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFact, setAddingFact] = useState(false);
  const [previewCards, setPreviewCards] = useState<any[]>([]);
  const [previewFactId, setPreviewFactId] = useState<string | null>(null);
  const [previewFactStatement, setPreviewFactStatement] = useState<string>('');
  const [nodeImages, setNodeImages] = useState<any[]>([]);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    if (id) loadNode();
  }, [id]);

  const loadNode = async () => {
    try {
      const [nodeRes, imagesRes] = await Promise.all([
        nodes.get(id!),
        imagesApi.getNodeImages(id!),
      ]);
      setNode(nodeRes.data as any);
      setNodeFacts((nodeRes.data as any).facts || []);
      setNodeImages(imagesRes.data as any);
    } catch (error) {
      console.error('Failed to load node:', error);
      alert('Failed to load node');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFact = async (statement: string, factType: string) => {
    setAddingFact(true);
    try {
      // Create fact
      const factRes = await factsApi.create({
        nodeId: id!,
        statement,
        factType,
      });

      // Preview cards before saving
      const previewRes = await factsApi.previewCards(factRes.data.id);
      setPreviewCards(previewRes.data.templates);
      setPreviewFactId(factRes.data.id);
      setPreviewFactStatement(statement);
    } catch (error) {
      console.error('Failed to add fact:', error);
      alert('Failed to add fact');
    } finally {
      setAddingFact(false);
    }
  };

  const handleSaveCards = async (cards: any[]) => {
    if (!previewFactId) return;

    try {
      // Generate cards with edited templates
      await factsApi.generateCards(previewFactId, cards);

      // Close modal and reset
      setPreviewCards([]);
      setPreviewFactId(null);
      setPreviewFactStatement('');

      // Reload node
      await loadNode();
    } catch (error) {
      console.error('Failed to save cards:', error);
      alert('Failed to save cards');
    }
  };

  const handleClosePreview = async () => {
    // If user closes without saving, delete the fact
    if (previewFactId) {
      try {
        await factsApi.delete(previewFactId);
      } catch (error) {
        console.error('Failed to delete fact:', error);
      }
    }

    setPreviewCards([]);
    setPreviewFactId(null);
    setPreviewFactStatement('');
  };

  const handleDeleteFact = async (factId: string) => {
    if (!confirm('Delete this fact and all its cards?')) return;

    try {
      await factsApi.delete(factId);
      await loadNode();
    } catch (error) {
      console.error('Failed to delete fact:', error);
      alert('Failed to delete fact');
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      await imagesApi.uploadNodeImage(id!, file);
      // Reload images
      const imagesRes = await imagesApi.getNodeImages(id!);
      setNodeImages(imagesRes.data as any);
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  const handleImageDelete = async (imageId: string) => {
    try {
      await imagesApi.deleteNodeImage(imageId);
      // Reload images
      const imagesRes = await imagesApi.getNodeImages(id!);
      setNodeImages(imagesRes.data as any);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  };

  const handleImageAnnotate = async (imageId: string, annotatedDataUrl: string) => {
    try {
      await imagesApi.saveAnnotated(imageId, annotatedDataUrl);
      // Reload images
      const imagesRes = await imagesApi.getNodeImages(id!);
      setNodeImages(imagesRes.data as any);
    } catch (error) {
      console.error('Failed to save annotation:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!node) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-2 text-sm">
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Dashboard
                </button>
                {(node as any).parent && (
                  <>
                    <span className="text-gray-400">›</span>
                    <button
                      onClick={() => navigate(`/nodes/${(node as any).parent.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {(node as any).parent.name}
                    </button>
                  </>
                )}
                <span className="text-gray-400">›</span>
                <span className="text-gray-700">{node.name}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900">{node.name}</h1>
              {node.summary && (
                <p className="text-gray-600 mt-2">{node.summary}</p>
              )}
            </div>
            <div>
              {node.strengthLabel && (
                <StrengthBadge
                  strength={node.strengthLabel.strength}
                  label={node.strengthLabel.label}
                  emoji={node.strengthLabel.emoji}
                  size="lg"
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Child Nodes Section */}
      {(node as any).children && (node as any).children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-4">Child Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(node as any).children.map((child: any) => (
              <div
                key={child.id}
                onClick={() => navigate(`/nodes/${child.id}`)}
                className="card cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="font-bold text-lg mb-2">{child.name}</h3>
                <div className="text-sm text-gray-600">
                  Strength: {child.nodeStrength}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <QuickAddBar onAdd={handleAddFact} isLoading={addingFact} />
      </div>

      {/* AI Text Extractor */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AITextExtractor nodeId={id!} onExtracted={loadNode} />
      </div>

      {/* Images Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <button
            onClick={() => setShowImages(!showImages)}
            className="text-2xl font-bold hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            Images ({nodeImages.length})
            <span className="text-sm text-gray-500">
              {showImages ? '▼' : '▶'}
            </span>
          </button>
        </div>

        {showImages && (
          <div className="card">
            <ImageUploader
              onUpload={handleImageUpload}
              currentImages={nodeImages}
              onDeleteImage={handleImageDelete}
              onAnnotate={handleImageAnnotate}
            />
          </div>
        )}
      </div>

      {/* Facts */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-4">
          Facts ({nodeFacts.length})
        </h2>

        {nodeFacts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">
              No facts yet. Use the quick-add bar above to create your first fact!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {nodeFacts.map((fact) => (
              <div key={fact.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {fact.factType}
                      </span>
                      {fact.keyTerms.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {fact.keyTerms.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-lg">{fact.statement}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {(fact as any).cards?.length || 0} cards generated
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFact(fact.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Preview Modal */}
      <CardPreviewModal
        isOpen={previewCards.length > 0}
        onClose={handleClosePreview}
        cards={previewCards}
        onSave={handleSaveCards}
        factStatement={previewFactStatement}
      />
    </div>
  );
}
