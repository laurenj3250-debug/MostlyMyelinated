import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nodes, facts as factsApi, images as imagesApi } from '../services/api';
import { Node, Fact } from '../types';
import Sparkline from '../components/Sparkline';
import QuickAddBar from '../components/QuickAddBar';
import AITextExtractor from '../components/AITextExtractor';
import CardPreviewModal from '../components/CardPreviewModal';
import ImageUploader from '../components/ImageUploader';
import HeatMapBar from '../components/HeatMapBar';

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
  const [sparklineData, setSparklineData] = useState<Array<{ date: string; strength: number }>>([]);

  useEffect(() => {
    if (id) loadNode();
  }, [id]);

  const loadNode = async () => {
    try {
      const [nodeRes, imagesRes, historyRes] = await Promise.all([
        nodes.get(id!),
        imagesApi.getNodeImages(id!),
        nodes.getStrengthHistory(id!, 7),
      ]);
      setNode(nodeRes.data as any);
      setNodeFacts((nodeRes.data as any).facts || []);
      setNodeImages(imagesRes.data as any);
      setSparklineData(historyRes.data.history);
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

  const getStatusLabel = (strength: number): string => {
    if (strength < 20) return 'BRAIN-DEAD';
    if (strength < 40) return 'LMN TETRAPLEGIC';
    if (strength < 60) return 'NON-AMBULATORY ATAXIC';
    if (strength < 75) return 'AMBULATORY ATAXIC';
    if (strength < 85) return 'MILD PARESIS';
    if (strength < 95) return 'BAR (BRIGHT, ALERT, RESPONSIVE)';
    return 'HYPERREFLEXIC PROFESSOR';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-lab-background">
        <div className="text-lg font-mono text-lab-cyan">LOADING NEUROLOGICAL NODE DATA...</div>
      </div>
    );
  }

  if (!node) return null;

  return (
    <div className="min-h-screen bg-lab-background">
      {/* Header */}
      <header className="bg-black border-b-2 border-lab-cyan/30">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-3 text-xs font-mono">
            <button
              onClick={() => navigate('/')}
              className="text-lab-cyan hover:text-lab-mint uppercase transition-colors"
            >
              DASHBOARD
            </button>
            {(node as any).parent && (
              <>
                <span className="text-lab-text-tertiary">›</span>
                <button
                  onClick={() => navigate(`/nodes/${(node as any).parent.id}`)}
                  className="text-lab-cyan hover:text-lab-mint uppercase transition-colors"
                >
                  {(node as any).parent.name.toUpperCase()}
                </button>
              </>
            )}
            <span className="text-lab-text-tertiary">›</span>
            <span className="text-lab-text-primary uppercase">{node.name.toUpperCase()}</span>
          </div>

          {/* Node Title */}
          <h1 className="text-3xl font-mono font-bold text-lab-cyan uppercase mb-2">
            {node.name}
          </h1>

          {/* Summary */}
          {node.summary && (
            <p className="text-sm font-mono text-lab-text-secondary max-w-3xl mb-4">
              {node.summary}
            </p>
          )}

          {/* Strength Display & Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Strength Card */}
            <div className="bg-lab-card border-2 border-lab-cyan/50 p-4" style={{ borderRadius: '2px' }}>
              <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider mb-2">
                CURRENT STRENGTH
              </div>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-mono font-bold text-lab-cyan">
                  {node.nodeStrength.toFixed(1)}
                </div>
                <div className="text-xl font-mono text-lab-text-tertiary mb-1">%</div>
              </div>
              <div className="text-xs font-mono text-lab-mint uppercase mt-2">
                {getStatusLabel(node.nodeStrength)}
              </div>
              <div className="mt-3">
                <HeatMapBar strength={node.nodeStrength} size="medium" showPercentage={false} />
              </div>
            </div>

            {/* 7-Day Trend Card */}
            {sparklineData.length > 0 && (
              <div className="bg-lab-card border border-lab-border p-4" style={{ borderRadius: '2px' }}>
                <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider mb-2">
                  7-DAY STRENGTH TRAJECTORY
                </div>
                <Sparkline
                  data={sparklineData}
                  width="100%"
                  height={80}
                  color="#00d9ff"
                  showGrid={true}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Child Nodes Section */}
      {(node as any).children && (node as any).children.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h2 className="text-lg font-mono uppercase text-lab-cyan mb-4 border-b border-lab-cyan/30 pb-2">
            SUBORDINATE TOPICS ({(node as any).children.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(node as any).children.map((child: any) => (
              <div
                key={child.id}
                onClick={() => navigate(`/nodes/${child.id}`)}
                className="bg-black border-2 border-lab-border hover:border-lab-cyan/50 p-4 cursor-pointer transition-all group"
                style={{ borderRadius: '2px' }}
              >
                <h3 className="font-mono font-bold text-base text-lab-text-primary uppercase mb-3 group-hover:text-lab-cyan transition-colors">
                  {child.name}
                </h3>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-lab-text-tertiary uppercase">
                    STRENGTH:
                  </span>
                  <span className="text-lg font-mono font-bold text-lab-cyan">
                    {child.nodeStrength.toFixed(1)}%
                  </span>
                </div>

                <HeatMapBar
                  strength={child.nodeStrength}
                  size="small"
                  showPercentage={false}
                  animate={false}
                />

                <div className="text-xs font-mono text-lab-text-tertiary mt-2">
                  {child._count?.cards || 0} flashcards
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Drill Hardest Cards */}
          {(node as any)._count && (node as any)._count.cards > 0 && (
            <button
              onClick={() => navigate(`/study?mode=drill&nodeId=${id}`)}
              className="bg-lab-alert/10 border-2 border-lab-alert text-lab-alert hover:bg-lab-alert/20 py-4 px-6 font-mono uppercase font-bold transition-all"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-sm">🚨 EMERGENCY DRILL</div>
              <div className="text-xs opacity-70 mt-1 normal-case">
                {(node as any)._count.cards} cards • Hardest first
              </div>
            </button>
          )}

          {/* Add Fact */}
          <button
            onClick={() => {
              const quickAdd = document.getElementById('quick-add-section');
              quickAdd?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-lab-cyan/10 border-2 border-lab-cyan text-lab-cyan hover:bg-lab-cyan/20 py-4 px-6 font-mono uppercase font-bold transition-all"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-sm">+ ADD FACT</div>
            <div className="text-xs opacity-70 mt-1 normal-case">
              Expand knowledge base
            </div>
          </button>

          {/* Quick Stats */}
          <div className="bg-lab-card border border-lab-border py-4 px-6" style={{ borderRadius: '2px' }}>
            <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">
              TOTAL CARDS
            </div>
            <div className="text-2xl font-mono font-bold text-lab-mint">
              {(node as any)._count?.cards || 0}
            </div>
            <div className="text-xs font-mono text-lab-text-tertiary mt-1">
              {nodeFacts.length} facts recorded
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      <div id="quick-add-section" className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <QuickAddBar onAdd={handleAddFact} isLoading={addingFact} />
      </div>

      {/* AI Text Extractor */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <AITextExtractor nodeId={id!} onExtracted={loadNode} />
      </div>

      {/* Images Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <button
          onClick={() => setShowImages(!showImages)}
          className="text-lg font-mono uppercase text-lab-cyan hover:text-lab-mint mb-4 flex items-center gap-2 transition-all border-b border-lab-cyan/30 pb-2 w-full text-left"
        >
          DIAGNOSTIC IMAGES ({nodeImages.length})
          <span className="text-sm text-lab-text-tertiary ml-auto">
            {showImages ? '▼ COLLAPSE' : '▶ EXPAND'}
          </span>
        </button>

        {showImages && (
          <div className="bg-black border-2 border-lab-border p-6" style={{ borderRadius: '2px' }}>
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
        <h2 className="text-lg font-mono uppercase text-lab-cyan mb-4 border-b border-lab-cyan/30 pb-2">
          KNOWLEDGE BASE ({nodeFacts.length} FACTS)
        </h2>

        {nodeFacts.length === 0 ? (
          /* Empty State */
          <div className="bg-black border-2 border-lab-alert/30 p-12 text-center" style={{ borderRadius: '2px' }}>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-mono uppercase text-lab-alert mb-2">
              KNOWLEDGE BASE EMPTY
            </h3>
            <p className="text-sm font-mono text-lab-text-secondary mb-2">
              No facts recorded for this neural pathway.
            </p>
            <p className="text-xs font-mono text-lab-text-tertiary">
              Use the quick-add bar above to establish baseline knowledge.
            </p>
          </div>
        ) : (
          /* Facts List */
          <div className="space-y-3">
            {nodeFacts.map((fact, index) => (
              <div
                key={fact.id}
                className="bg-black border border-lab-border hover:border-lab-cyan/50 p-4 transition-all"
                style={{ borderRadius: '2px' }}
              >
                {/* Fact Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-lab-text-tertiary">
                      FACT #{String(index + 1).padStart(3, '0')}
                    </span>
                    <span
                      className="text-xs font-mono bg-lab-cyan/20 border border-lab-cyan text-lab-cyan px-2 py-0.5 uppercase"
                      style={{ borderRadius: '2px' }}
                    >
                      {fact.factType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteFact(fact.id)}
                    className="text-xs font-mono text-lab-alert hover:text-lab-alert/80 uppercase border border-lab-alert/30 hover:border-lab-alert px-2 py-0.5 transition-all"
                    style={{ borderRadius: '2px' }}
                  >
                    DELETE
                  </button>
                </div>

                {/* Fact Statement */}
                <div className="bg-lab-card/30 border-l-2 border-lab-cyan/50 p-3 mb-3">
                  <p className="font-mono text-lab-text-primary text-sm leading-relaxed">
                    {fact.statement}
                  </p>
                </div>

                {/* Key Terms */}
                {fact.keyTerms && fact.keyTerms.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs font-mono text-lab-text-tertiary uppercase">
                      KEY TERMS:
                    </span>
                    {fact.keyTerms.map((term: string) => (
                      <span
                        key={term}
                        className="text-xs font-mono bg-lab-mint/20 border border-lab-mint text-lab-mint px-2 py-0.5"
                        style={{ borderRadius: '2px' }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cards Generated */}
                <div className="flex items-center justify-between text-xs font-mono text-lab-text-tertiary">
                  <span>
                    {(fact as any).cards?.length || 0} flashcards generated
                  </span>
                  {(fact as any).cards && (fact as any).cards.length > 0 && (
                    <span className="text-lab-mint">
                      ACTIVE
                    </span>
                  )}
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
