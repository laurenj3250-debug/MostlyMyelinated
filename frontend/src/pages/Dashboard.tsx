import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NeuroStatusHero from '../components/NeuroStatusHero';
import CriticalNodesPanel from '../components/CriticalNodesPanel';
import AchievementSummary from '../components/AchievementSummary';
import NodeStatusCard from '../components/NodeStatusCard';
import NodeSheet from '../components/NodeSheet';
import XPBar from '../components/XPBar';
import SkillTree from '../components/SkillTree';
import GraphView from '../components/GraphView';
import { nodes as nodesApi, study as studyApi } from '../services/api';
import type { Node } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [neuroStatus, setNeuroStatus] = useState<any>(null);
  const [criticalNodes, setCriticalNodes] = useState<any[]>([]);
  const [allNodes, setAllNodes] = useState<Node[]>([]);
  const [studyStats, setStudyStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'graph'>('list');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [nodeSheetOpen, setNodeSheetOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [allRelationships, setAllRelationships] = useState<any[]>([]);

  const openNodeSheet = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setNodeSheetOpen(true);
  };

  const closeNodeSheet = () => {
    setNodeSheetOpen(false);
    setSelectedNodeId(null);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        neuroStatusRes,
        criticalNodesRes,
        allNodesRes,
        statsRes,
        achievementsRes,
        levelRes
      ] = await Promise.all([
        studyApi.getNeuroStatus().catch(() => null),
        nodesApi.getCritical(5).catch(() => ({ data: { nodes: [], totalNodes: 0 } })),
        nodesApi.getAll().catch(() => ({ data: [] })),
        studyApi.getStats().catch(() => null),
        studyApi.getAchievements().catch(() => ({ data: { achievements: [] } })),
        studyApi.getLevelProgress().catch(() => null)
      ]);

      // Set data with fallbacks
      setNeuroStatus(neuroStatusRes?.data || {
        overallScore: 0,
        statusLabel: 'UNKNOWN',
        nodeDistribution: {
          brainDead: 0,
          lmnTetraplegic: 0,
          nonAmbulatoryAtaxic: 0,
          ambulatoryAtaxic: 0,
          mildParesis: 0,
          bar: 0,
          hyperreflexic: 0
        },
        dueCards: 0,
        newCards: 0,
        weakNodeCount: 0,
        totalNodes: 0
      });
      setCriticalNodes(criticalNodesRes?.data?.nodes || []);
      setAllNodes(allNodesRes?.data || []);

      // Fetch relationships for all nodes
      if (allNodesRes?.data && allNodesRes.data.length > 0) {
        const relationshipsPromises = allNodesRes.data.map((node: Node) =>
          nodesApi.getRelationships(node.id).catch(() => ({ data: { outgoing: [], incoming: [] } }))
        );
        const relationshipsResults = await Promise.all(relationshipsPromises);

        // Flatten all relationships (only outgoing to avoid duplicates)
        const flatRelationships = relationshipsResults.flatMap(res => res.data.outgoing || []);
        setAllRelationships(flatRelationships);
      }

      setStudyStats(statsRes?.data || {
        reviewsToday: 0,
        newCardsToday: 0,
        xpToday: 0
      });
      setAchievements(achievementsRes?.data?.achievements || []);
      setUserLevel(levelRes?.data || {
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        title: 'Intern',
        totalXpEarned: 0,
        streak: 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default values on complete failure
      setNeuroStatus({
        overallScore: 0,
        statusLabel: 'UNKNOWN',
        nodeDistribution: {
          brainDead: 0,
          lmnTetraplegic: 0,
          nonAmbulatoryAtaxic: 0,
          ambulatoryAtaxic: 0,
          mildParesis: 0,
          bar: 0,
          hyperreflexic: 0
        },
        dueCards: 0,
        newCards: 0,
        weakNodeCount: 0,
        totalNodes: 0
      });
      setUserLevel({
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        title: 'Intern',
        totalXpEarned: 0,
        streak: 0
      });
      setStudyStats({
        reviewsToday: 0,
        newCardsToday: 0,
        xpToday: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lab-bg-primary p-6 flex items-center justify-center">
        <div className="text-holographic font-display text-2xl font-extrabold uppercase tracking-wider animate-pulse-glow-neon">
          INITIALIZING NEURAL SCAN...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lab-bg-primary">
      {/* HUD Bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 backdrop-blur-xl border-b-2"
        style={{
          height: '80px',
          background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
          borderColor: 'rgba(255, 156, 255, 0.3)',
          boxShadow: '0 0 20px rgba(255, 90, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* App Title */}
        <div>
          <h1 className="text-holographic font-display text-2xl font-extrabold tracking-[0.2em] uppercase">
            MOSTLYMYELINATED
          </h1>
        </div>

        {/* Status Group */}
        <div className="flex items-center gap-4">
          {/* Overall Status Chip */}
          {neuroStatus && (
            <div
              className="flex items-center gap-2 px-6 py-2.5 rounded-pill border-medium text-sm font-bold font-display uppercase tracking-wider"
              style={{
                background: neuroStatus.overallScore < 40
                  ? 'linear-gradient(135deg, rgba(139, 75, 255, 0.15), rgba(139, 75, 255, 0.08))'
                  : neuroStatus.overallScore < 60
                  ? 'linear-gradient(135deg, rgba(0, 168, 255, 0.15), rgba(0, 168, 255, 0.08))'
                  : neuroStatus.overallScore < 75
                  ? 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(255, 170, 0, 0.08))'
                  : 'linear-gradient(135deg, rgba(0, 234, 255, 0.15), rgba(0, 234, 255, 0.08))',
                borderColor: neuroStatus.overallScore < 40
                  ? '#8b4bff'
                  : neuroStatus.overallScore < 60
                  ? '#00a8ff'
                  : neuroStatus.overallScore < 75
                  ? '#ffaa00'
                  : '#00eaff',
                color: neuroStatus.overallScore < 40
                  ? '#a34bff'
                  : neuroStatus.overallScore < 60
                  ? '#00d9ff'
                  : neuroStatus.overallScore < 75
                  ? '#ffd700'
                  : '#00eaff',
                boxShadow: neuroStatus.overallScore < 40
                  ? '0 0 12px rgba(139, 75, 255, 0.4), 0 0 24px rgba(139, 75, 255, 0.2)'
                  : neuroStatus.overallScore < 60
                  ? '0 0 12px rgba(0, 168, 255, 0.4), 0 0 24px rgba(0, 168, 255, 0.2)'
                  : neuroStatus.overallScore < 75
                  ? '0 0 12px rgba(255, 170, 0, 0.4), 0 0 24px rgba(255, 170, 0, 0.2)'
                  : '0 0 12px rgba(0, 234, 255, 0.4), 0 0 24px rgba(0, 234, 255, 0.2)',
                fontSize: '13px'
              }}
            >
              <span>{neuroStatus.statusLabel}</span>
              <span className="opacity-50">●</span>
              <span>{Math.round(neuroStatus.overallScore)}%</span>
            </div>
          )}

          {/* Streak Indicator */}
          {userLevel && userLevel.streak > 0 && (
            <div
              className="flex items-center gap-2 px-6 py-2.5 rounded-pill border-medium text-sm font-bold font-display uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.15), rgba(255, 94, 205, 0.08))',
                borderColor: '#ff5ecd',
                color: '#ff9cff',
                boxShadow: '0 0 12px rgba(255, 94, 205, 0.4), 0 0 24px rgba(255, 94, 205, 0.2)'
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: '1' }}>▲</span>
              <span>{userLevel.streak} DAY STREAK</span>
            </div>
          )}

          {/* Start Session Button */}
          <button
            onClick={() => navigate('/study')}
            className="relative overflow-hidden px-10 py-3.5 font-extrabold text-base tracking-[0.15em] uppercase rounded-pill border-none cursor-pointer transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 90, 255, 0.7), 0 0 60px rgba(255, 90, 255, 0.4), 0 8px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3)';
            }}
          >
            <span className="relative z-10">START SESSION</span>
            <div
              className="absolute inset-0 w-1/2 h-full animate-light-sweep"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                pointerEvents: 'none'
              }}
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* XP Bar */}
        <XPBar
          level={userLevel?.level || 1}
          xp={userLevel?.xp || 0}
          xpToNextLevel={userLevel?.xpToNextLevel || 100}
          title={userLevel?.title || 'Intern'}
          totalXpEarned={userLevel?.totalXpEarned || 0}
        />

        {/* Hero - Neuro Status */}
        <NeuroStatusHero
          overallScore={neuroStatus?.overallScore || 0}
          nodeDistribution={neuroStatus?.nodeDistribution || {
            brainDead: 0,
            lmnTetraplegic: 0,
            nonAmbulatoryAtaxic: 0,
            ambulatoryAtaxic: 0,
            mildParesis: 0,
            bar: 0,
            hyperreflexic: 0
          }}
          dueCards={neuroStatus?.dueCards || 0}
          newCards={neuroStatus?.newCards || 0}
          weakNodeCount={neuroStatus?.weakNodeCount || 0}
          totalNodes={neuroStatus?.totalNodes || 0}
        />

        {/* Critical Nodes Panel */}
        {neuroStatus && neuroStatus.totalNodes > 0 && (
          <CriticalNodesPanel
            nodes={criticalNodes}
            totalNodes={neuroStatus.totalNodes}
            onNodeClick={openNodeSheet}
          />
        )}

        {/* Neural Pathway Status Section */}
        <div
          className="p-8 rounded-xl backdrop-blur-md border-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.05) 0%, rgba(163, 75, 255, 0.05) 50%, rgba(0, 234, 255, 0.05) 100%)',
            borderColor: 'rgba(255, 156, 255, 0.2)',
            boxShadow: '0 0 30px rgba(255, 90, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-display font-extrabold uppercase tracking-wider text-holographic">
              NEURAL PATHWAY STATUS ({allNodes.length})
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('list')}
                className={`px-5 py-2.5 font-display font-bold text-sm uppercase tracking-wider rounded-pill border-thin transition-all ${
                  viewMode === 'list'
                    ? 'border-neon-cyan text-neon-cyan'
                    : 'border-lab-border text-lab-text-muted hover:border-neon-cyan/50'
                }`}
                style={
                  viewMode === 'list'
                    ? {
                        background: 'rgba(0, 234, 255, 0.15)',
                        boxShadow: '0 0 16px rgba(0, 234, 255, 0.4)'
                      }
                    : {}
                }
              >
                STATUS
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-5 py-2.5 font-display font-bold text-sm uppercase tracking-wider rounded-pill border-thin transition-all ${
                  viewMode === 'tree'
                    ? 'border-neon-cyan text-neon-cyan'
                    : 'border-lab-border text-lab-text-muted hover:border-neon-cyan/50'
                }`}
                style={
                  viewMode === 'tree'
                    ? {
                        background: 'rgba(0, 234, 255, 0.15)',
                        boxShadow: '0 0 16px rgba(0, 234, 255, 0.4)'
                      }
                    : {}
                }
              >
                TREE
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-5 py-2.5 font-display font-bold text-sm uppercase tracking-wider rounded-pill border-thin transition-all ${
                  viewMode === 'graph'
                    ? 'border-neon-cyan text-neon-cyan'
                    : 'border-lab-border text-lab-text-muted hover:border-neon-cyan/50'
                }`}
                style={
                  viewMode === 'graph'
                    ? {
                        background: 'rgba(0, 234, 255, 0.15)',
                        boxShadow: '0 0 16px rgba(0, 234, 255, 0.4)'
                      }
                    : {}
                }
              >
                GRAPH
              </button>
              <button
                onClick={() => navigate('/nodes/new')}
                className="relative overflow-hidden px-6 py-2.5 font-display font-extrabold text-sm uppercase tracking-wider rounded-pill border-none transition-all ml-2"
                style={{
                  background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 94, 205, 0.6), 0 0 48px rgba(255, 94, 205, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.2)';
                }}
              >
                + CREATE NODE
              </button>
              <button
                onClick={() => navigate('/quick-notes')}
                className="relative overflow-hidden px-6 py-2.5 font-display font-extrabold text-sm uppercase tracking-wider rounded-pill border-none transition-all ml-2"
                style={{
                  background: 'linear-gradient(135deg, #00eaff 0%, #a34bff 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 234, 255, 0.6), 0 0 48px rgba(0, 234, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.2)';
                }}
              >
                ⚡ QUICK NOTES
              </button>
              <button
                onClick={() => navigate('/import')}
                className="relative overflow-hidden px-6 py-2.5 font-display font-extrabold text-sm uppercase tracking-wider rounded-pill border-none transition-all ml-2"
                style={{
                  background: 'linear-gradient(135deg, #ff3366 0%, #ff8c42 100%)',
                  color: '#000000',
                  boxShadow: '0 0 20px rgba(255, 51, 102, 0.4), 0 0 40px rgba(255, 51, 102, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 51, 102, 0.6), 0 0 48px rgba(255, 51, 102, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.4), 0 0 40px rgba(255, 51, 102, 0.2)';
                }}
              >
                📚 AI EXTRACT
              </button>
              <button
                onClick={() => navigate('/nodes/bulk-import')}
                className="relative overflow-hidden px-6 py-2.5 font-display font-extrabold text-sm uppercase tracking-wider rounded-pill border-none transition-all ml-2"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00eaff 100%)',
                  color: '#000000',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.6), 0 0 48px rgba(0, 255, 136, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.4), 0 0 40px rgba(0, 255, 136, 0.2)';
                }}
              >
                📦 BULK IMPORT
              </button>
            </div>
          </div>

          {allNodes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-pulse-glow-neon" style={{ filter: 'drop-shadow(0 0 20px rgba(255, 94, 205, 0.6))' }}>◆</div>
              <p className="text-2xl font-display font-extrabold text-neon-pink mb-3 uppercase tracking-wider">
                NEURAL PATHWAYS UNINITIALIZED
              </p>
              <p className="text-base font-sans text-lab-text-muted mb-8 max-w-md mx-auto">
                Create your first node to begin mapping concepts
              </p>
              <button
                onClick={() => navigate('/nodes/new')}
                className="relative overflow-hidden px-8 py-4 font-display font-extrabold text-base uppercase tracking-wider rounded-pill border-none transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 90, 255, 0.7), 0 0 60px rgba(255, 90, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)';
                }}
              >
                + CREATE NODE
              </button>
              <p className="text-sm font-sans text-lab-text-dim mt-6 italic">
                Tip: Start with a concept you're currently studying
              </p>
            </div>
          ) : viewMode === 'tree' ? (
            <SkillTree nodes={allNodes} onNodeClick={openNodeSheet} />
          ) : viewMode === 'graph' ? (
            <div className="h-[800px]">
              <GraphView
                nodes={allNodes}
                relationships={allRelationships}
                onNodeClick={openNodeSheet}
              />
            </div>
          ) : (
            <>
              {/* Module filter */}
              <div className="flex flex-wrap gap-3 mb-6">
                {['All', 'Spinal', 'Brainstem', 'Cerebrum', 'CSF', 'Clinical', 'Other'].map(module => (
                  <button
                    key={module}
                    onClick={() => setModuleFilter(module)}
                    className={`px-4 py-2 text-xs font-display font-bold uppercase tracking-wider rounded-pill border-thin transition-all ${
                      moduleFilter === module
                        ? 'border-neon-purple text-neon-fuchsia'
                        : 'border-lab-border text-lab-text-muted hover:border-neon-purple/50'
                    }`}
                    style={
                      moduleFilter === module
                        ? {
                            background: 'rgba(163, 75, 255, 0.15)',
                            boxShadow: '0 0 12px rgba(163, 75, 255, 0.3)'
                          }
                        : {}
                    }
                  >
                    {module}
                  </button>
                ))}
              </div>

              {/* Status cards grid - sorted by weakness */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allNodes
                  .filter(node => moduleFilter === 'All' || node.module === moduleFilter || (!node.module && moduleFilter === 'Other'))
                  .sort((a, b) => a.nodeStrength - b.nodeStrength) // Weakest first
                  .map(node => (
                    <NodeStatusCard
                      key={node.id}
                      node={node}
                      onClick={() => openNodeSheet(node.id)}
                    />
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Achievement Summary */}
        <AchievementSummary
          reviewsToday={studyStats?.reviewsToday || 0}
          reviewsGoal={50}
          newCardsToday={studyStats?.newCardsToday || 0}
          newCardsGoal={10}
          xpToday={studyStats?.xpToday || 0}
          achievements={achievements || []}
        />
      </div>

      {/* Node Sheet Modal */}
      <NodeSheet
        isOpen={nodeSheetOpen}
        onClose={closeNodeSheet}
        nodeId={selectedNodeId}
      />
    </div>
  );
}
