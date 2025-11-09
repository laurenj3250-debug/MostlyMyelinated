import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, study } from '../services/api';
import { Node, StudyStats } from '../types';
import NodeCard from '../components/NodeCard';
import NeuroLabel from '../components/NeuroLabel';
import RoastMessage from '../components/RoastMessage';
import SkillTree from '../components/SkillTree';
import BadgeDisplay from '../components/BadgeDisplay';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nodeList, setNodeList] = useState<Node[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeSummary, setNewNodeSummary] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nodesRes, statsRes] = await Promise.all([
        nodes.list(),
        study.getStats(),
      ]);
      setNodeList(nodesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    try {
      await nodes.create({
        name: newNodeName,
        summary: newNodeSummary || undefined,
      });
      setNewNodeName('');
      setNewNodeSummary('');
      setShowCreateModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to create node:', error);
      alert('Failed to create node');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Calculate overall neuro score
  const getOverallNeuroScore = () => {
    if (nodeList.length === 0) return null;
    const avgStrength = nodeList.reduce((sum, node) => sum + node.nodeStrength, 0) / nodeList.length;
    return Math.round(avgStrength);
  };

  const getOverallLabel = (strength: number) => {
    if (strength < 20) return { label: 'Brain-dead', emoji: '⚫' };
    if (strength < 40) return { label: 'LMN tetraplegic', emoji: '🟥' };
    if (strength < 60) return { label: 'Non-ambulatory ataxic', emoji: '🔴' };
    if (strength < 75) return { label: 'Ambulatory ataxic', emoji: '🟠' };
    if (strength < 85) return { label: 'Mild paresis, compensating', emoji: '🟡' };
    if (strength < 95) return { label: 'BAR, subtle deficits only', emoji: '🟢' };
    return { label: 'Hyperreflexic professor', emoji: '💠' };
  };

  const overallScore = getOverallNeuroScore();
  const strongestNodes = [...nodeList].sort((a, b) => b.nodeStrength - a.nodeStrength).slice(0, 3);
  const weakestNodes = [...nodeList].sort((a, b) => a.nodeStrength - b.nodeStrength).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              MostlyMyelinated
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/study')}
                className="btn btn-primary"
                disabled={!stats || stats.dueCount === 0}
              >
                Study ({stats?.dueCount || 0} due)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overall Neuro Score */}
      {overallScore !== null && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <h2 className="text-xl font-bold mb-3">Overall Neurologic Status</h2>
            <div className="flex items-center gap-4">
              <NeuroLabel
                strength={overallScore}
                label={getOverallLabel(overallScore).label}
                emoji={getOverallLabel(overallScore).emoji}
                size="lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-gray-600">Total Cards</div>
              <div className="text-3xl font-bold">{stats.totalCards}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Due Today</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.dueCount}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Reviewed Today</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.reviewsToday}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600">Day Streak</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.streak}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Strongest & Bottom 3 Weakest */}
      {nodeList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strongest Nodes */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-700">Top 3 Strongest Nodes</h2>
              <div className="space-y-3">
                {strongestNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="card bg-green-50 border-2 border-green-300 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/nodes/${node.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold text-green-700">#{index + 1}</span>
                          <h3 className="font-bold text-lg">{node.name}</h3>
                        </div>
                        {node.strengthLabel && (
                          <NeuroLabel
                            strength={node.strengthLabel.strength}
                            label={node.strengthLabel.label}
                            emoji={node.strengthLabel.emoji}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weakest Nodes */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-red-700">Bottom 3 Weakest Nodes</h2>
              <div className="space-y-3">
                {weakestNodes.map((node, index) => (
                  <div key={node.id}>
                    <div
                      className="card bg-red-50 border-2 border-red-300 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/nodes/${node.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold text-red-700">#{index + 1}</span>
                            <h3 className="font-bold text-lg">{node.name}</h3>
                          </div>
                          {node.strengthLabel && (
                            <NeuroLabel
                              strength={node.strengthLabel.strength}
                              label={node.strengthLabel.label}
                              emoji={node.strengthLabel.emoji}
                              size="sm"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Show roast for weak nodes */}
                    {node.nodeStrength < 60 && (
                      <div className="mt-2">
                        <RoastMessage nodeName={node.name} strength={node.nodeStrength} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Fix My Disasters Button */}
              {weakestNodes.some(n => n.nodeStrength < 60) && (
                <button
                  onClick={() => navigate('/study?mode=disasters')}
                  className="mt-4 w-full btn bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
                >
                  Fix My Disasters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badges Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <BadgeDisplay />
      </div>

      {/* Nodes */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Nodes</h2>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white font-semibold shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white font-semibold shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tree
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              + Create Node
            </button>
          </div>
        </div>

        {nodeList.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No nodes yet. Create one to get started!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Your First Node
            </button>
          </div>
        ) : viewMode === 'tree' ? (
          <SkillTree nodes={nodeList} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodeList.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                onClick={() => navigate(`/nodes/${node.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Node</h2>
            <form onSubmit={handleCreateNode}>
              <div className="mb-4">
                <label className="label">Name *</label>
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="input"
                  placeholder="e.g., Spinal Cord Anatomy"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="label">Summary</label>
                <textarea
                  value={newNodeSummary}
                  onChange={(e) => setNewNodeSummary(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
