import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, study } from '../services/api';
import { Node, StudyStats } from '../types';
import NodeCard from '../components/NodeCard';
import NeuroLabel from '../components/NeuroLabel';
import RoastMessage from '../components/RoastMessage';
import SkillTree from '../components/SkillTree';
import BadgeDisplay from '../components/BadgeDisplay';
import AchievementBars from '../components/AchievementBars';
import ThemeToggle from '../components/ThemeToggle';

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
    <div className="min-h-screen page-enter dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-colors duration-300">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 shadow-xl dark:from-blue-800 dark:via-blue-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                MostlyMyelinated
              </h1>
              <p className="text-blue-100 mt-2 text-sm md:text-base">
                Neuro-gamified spaced repetition system
              </p>
            </div>
            <div className="flex gap-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/import')}
                className="btn bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl
                          hidden md:flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Import Textbook</span>
              </button>
              <button
                onClick={() => navigate('/study')}
                className="btn bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl
                          disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!stats || stats.dueCount === 0}
              >
                <span className="hidden sm:inline">Study Now</span>
                <span className="sm:hidden">Study</span>
                <span className="ml-2 bg-blue-700 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {stats?.dueCount || 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overall Neuro Score - Hero Section */}
      {overallScore !== null && (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50
                          rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-blue-100
                          transform transition-all duration-500 hover:scale-[1.01]">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply
                            filter blur-3xl opacity-10 animate-float" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply
                            filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '1s' }} />

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Overall Neurologic Status
              </h2>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="flex-shrink-0">
                  <NeuroLabel
                    strength={overallScore}
                    label={getOverallLabel(overallScore).label}
                    emoji={getOverallLabel(overallScore).emoji}
                    size="lg"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="text-6xl md:text-8xl font-black text-gradient-blue mb-2">
                    {overallScore}%
                  </div>
                  <p className="text-gray-600 text-lg">
                    Average knowledge strength across {nodeList.length} nodes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Progress */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AchievementBars />
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="stat-card animate-slide-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-label">Total Cards</div>
              <div className="stat-value text-blue-600">{stats.totalCards}</div>
            </div>
            <div className="stat-card animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="stat-label">Due Today</div>
              <div className={`stat-value ${stats.dueCount > 0 ? 'text-gradient-red' : 'text-gray-400'}`}>
                {stats.dueCount}
              </div>
            </div>
            <div className="stat-card animate-slide-in" style={{ animationDelay: '0.3s' }}>
              <div className="stat-label">Reviewed Today</div>
              <div className="stat-value text-gradient-green">{stats.reviewsToday}</div>
            </div>
            <div className="stat-card animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <div className="stat-label">Day Streak</div>
              <div className="stat-value text-gradient-blue">
                {stats.streak}
                {stats.streak > 0 && <span className="text-2xl ml-2">🔥</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Strongest & Bottom 3 Weakest */}
      {nodeList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Strongest Nodes */}
            <div className="animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold text-gradient-green">
                  Top 3 Strongest Nodes
                </h2>
              </div>
              <div className="space-y-4">
                {strongestNodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50
                              rounded-2xl shadow-lg p-6 cursor-pointer
                              transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                              border-2 border-green-200 group"
                    onClick={() => navigate(`/nodes/${node.id}`)}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-400 rounded-full
                                    mix-blend-multiply filter blur-2xl opacity-20" />
                    <div className="relative flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600
                                      rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-black text-white">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                          {node.name}
                        </h3>
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
            <div className="animate-slide-in" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold text-gradient-red">
                  Bottom 3 Weakest Nodes
                </h2>
              </div>
              <div className="space-y-4">
                {weakestNodes.map((node, index) => (
                  <div key={node.id}>
                    <div
                      className={`relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50
                                rounded-2xl shadow-lg p-6 cursor-pointer
                                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                                border-2 border-red-200 group
                                ${node.nodeStrength < 40 ? 'ring-2 ring-red-400 ring-opacity-50 animate-pulse-glow' : ''}`}
                      onClick={() => navigate(`/nodes/${node.id}`)}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-400 rounded-full
                                      mix-blend-multiply filter blur-2xl opacity-20" />
                      <div className="relative flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600
                                        rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-black text-white">#{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-red-700 transition-colors">
                            {node.name}
                          </h3>
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
                  className="mt-6 w-full btn bg-gradient-to-r from-red-600 to-pink-600 text-white
                            font-bold py-4 px-8 rounded-xl shadow-xl
                            hover:from-red-700 hover:to-pink-700
                            transform hover:scale-105 active:scale-95
                            transition-all duration-200
                            ring-4 ring-red-200 ring-opacity-50
                            animate-pulse-glow"
                >
                  <span className="text-lg">Fix My Disasters</span>
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
