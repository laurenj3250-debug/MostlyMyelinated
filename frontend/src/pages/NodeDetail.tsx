import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nodes, facts as factsApi } from '../services/api';
import { Node, Fact } from '../types';
import StrengthBadge from '../components/StrengthBadge';
import QuickAddBar from '../components/QuickAddBar';

export default function NodeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [node, setNode] = useState<Node | null>(null);
  const [nodeFacts, setNodeFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFact, setAddingFact] = useState(false);

  useEffect(() => {
    if (id) loadNode();
  }, [id]);

  const loadNode = async () => {
    try {
      const res = await nodes.get(id!);
      setNode(res.data as any);
      setNodeFacts((res.data as any).facts || []);
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

      // Generate cards from fact
      await factsApi.generateCards(factRes.data.id);

      // Reload node
      await loadNode();
    } catch (error) {
      console.error('Failed to add fact:', error);
      alert('Failed to add fact');
    } finally {
      setAddingFact(false);
    }
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
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
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

      {/* Quick Add */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <QuickAddBar onAdd={handleAddFact} isLoading={addingFact} />
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
    </div>
  );
}
