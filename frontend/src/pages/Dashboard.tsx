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
      <div className="min-h-screen bg-lab-background p-6 flex items-center justify-center">
        <div className="text-lab-cyan font-mono text-lg">LOADING NEUROLOGICAL ASSESSMENT...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-diagnostic-grid">
      {/* HUD Bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 bg-lab-card/80 backdrop-blur-xl border-b border-lab-border/50"
        style={{
          height: '72px',
          boxShadow: 'inset 0 1px 0 rgba(0, 217, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* App Title */}
        <div>
          <h1
            className="font-display text-xl font-extrabold tracking-[0.15em] text-lab-cyan uppercase"
            style={{ textShadow: '0 0 12px rgba(0, 217, 255, 0.5)' }}
          >
            MOSTLYMYELINATED
          </h1>
        </div>

        {/* Status Group */}
        <div className="flex items-center gap-4">
          {/* Overall Status Chip */}
          {neuroStatus && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold font-mono uppercase tracking-wide"
              style={{
                background: `rgba(${neuroStatus.overallScore < 40 ? '59, 130, 246' : neuroStatus.overallScore < 60 ? '20, 184, 166' : neuroStatus.overallScore < 75 ? '249, 115, 22' : '0, 217, 255'}, 0.12)`,
                borderColor: `rgba(${neuroStatus.overallScore < 40 ? '59, 130, 246' : neuroStatus.overallScore < 60 ? '20, 184, 166' : neuroStatus.overallScore < 75 ? '249, 115, 22' : '0, 217, 255'}, 0.3)`,
                color: neuroStatus.overallScore < 40 ? '#3b82f6' : neuroStatus.overallScore < 60 ? '#14b8a6' : neuroStatus.overallScore < 75 ? '#f97316' : '#00d9ff',
                boxShadow: `0 0 8px rgba(${neuroStatus.overallScore < 40 ? '59, 130, 246' : neuroStatus.overallScore < 60 ? '20, 184, 166' : neuroStatus.overallScore < 75 ? '249, 115, 22' : '0, 217, 255'}, 0.15)`,
                fontSize: '13px'
              }}
            >
              <span>{neuroStatus.statusLabel}</span>
              <span>•</span>
              <span>{Math.round(neuroStatus.overallScore)}%</span>
            </div>
          )}

          {/* Streak Indicator */}
          {userLevel && userLevel.streak > 0 && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-lab-mint/20 text-sm font-semibold font-mono"
              style={{
                background: 'rgba(0, 255, 136, 0.08)',
                color: '#00ff88'
              }}
            >
              <span
                className="text-base"
                style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.6))' }}
              >
                🔥
              </span>
              <span>{userLevel.streak}</span>
            </div>
          )}

          {/* Start Session Button */}
          <button
            onClick={() => navigate('/study')}
            className="px-8 py-3 font-extrabold text-sm tracking-[0.12em] uppercase rounded-full border-none cursor-pointer transition-all duration-250"
            style={{
              background: 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)',
              color: '#0a0e1a',
              boxShadow: '0 0 16px rgba(0, 217, 255, 0.4), 0 0 32px rgba(0, 255, 136, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.6), 0 0 40px rgba(0, 255, 136, 0.3), 0 4px 12px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 217, 255, 0.4), 0 0 32px rgba(0, 255, 136, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
            }}
          >
            START SESSION
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
        <div className="bg-black border-2 border-lab-border p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-mono uppercase text-lab-cyan">
              NEURAL PATHWAY STATUS ({allNodes.length})
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 font-mono text-sm ${
                  viewMode === 'list'
                    ? 'bg-lab-cyan text-black'
                    : 'bg-lab-card text-lab-text-tertiary border border-lab-border'
                }`}
                style={{ borderRadius: '2px' }}
              >
                STATUS
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 font-mono text-sm ${
                  viewMode === 'tree'
                    ? 'bg-lab-cyan text-black'
                    : 'bg-lab-card text-lab-text-tertiary border border-lab-border'
                }`}
                style={{ borderRadius: '2px' }}
              >
                TREE
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1 font-mono text-sm ${
                  viewMode === 'graph'
                    ? 'bg-lab-cyan text-black'
                    : 'bg-lab-card text-lab-text-tertiary border border-lab-border'
                }`}
                style={{ borderRadius: '2px' }}
              >
                GRAPH
              </button>
              <button
                onClick={() => navigate('/nodes/new')}
                className="px-4 py-2 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all ml-2"
                style={{ borderRadius: '2px' }}
              >
                + CREATE NODE
              </button>
            </div>
          </div>

          {allNodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg font-mono text-lab-text-primary mb-2 uppercase">
                NEURAL PATHWAYS UNINITIALIZED
              </p>
              <p className="text-sm font-mono text-lab-text-tertiary mb-6">
                Create your first node to begin mapping concepts
              </p>
              <button
                onClick={() => navigate('/nodes/new')}
                className="px-6 py-3 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all"
                style={{ borderRadius: '2px' }}
              >
                + CREATE NODE
              </button>
              <p className="text-xs font-mono text-lab-text-tertiary mt-4">
                Tip: Start with a concept you're currently studying (e.g., "C6-T2 lesions")
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
              <div className="flex flex-wrap gap-2 mb-4">
                {['All', 'Spinal', 'Brainstem', 'Cerebrum', 'CSF', 'Clinical', 'Other'].map(module => (
                  <button
                    key={module}
                    onClick={() => setModuleFilter(module)}
                    className={`px-3 py-1 text-xs font-mono border transition-all ${
                      moduleFilter === module
                        ? 'border-lab-cyan text-lab-cyan bg-lab-cyan/10'
                        : 'border-lab-border text-lab-text-tertiary hover:border-lab-cyan/50'
                    }`}
                    style={{ borderRadius: '2px' }}
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
