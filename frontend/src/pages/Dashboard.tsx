import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, study } from '../services/api';
import { Node, StudyStats } from '../types';
import NodeCard from '../components/NodeCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [nodeList, setNodeList] = useState<Node[]>([]);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeSummary, setNewNodeSummary] = useState('');

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

      {/* Nodes */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Nodes</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + Create Node
          </button>
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
