import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NeuroStatusHero from '../components/NeuroStatusHero';
import CriticalNodesPanel from '../components/CriticalNodesPanel';
import AchievementSummary from '../components/AchievementSummary';
import NodeCard from '../components/NodeCard';
import StreakFlame from '../components/StreakFlame';
import XPBar from '../components/XPBar';
import SkillTree from '../components/SkillTree';
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
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

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
        studyApi.getNeuroStatus(),
        nodesApi.getCritical(5),
        nodesApi.getAll(),
        studyApi.getStats(),
        studyApi.getAchievements(),
        studyApi.getLevelProgress()
      ]);

      setNeuroStatus(neuroStatusRes.data);
      setCriticalNodes(criticalNodesRes.data.nodes || []);
      setAllNodes(allNodesRes.data);
      setStudyStats(statsRes.data);
      setAchievements(achievementsRes.data.achievements || []);
      setUserLevel(levelRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
    <div className="min-h-screen bg-lab-background">
      {/* Header */}
      <header className="bg-black border-b-2 border-lab-cyan/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-mono font-bold text-lab-cyan">
              MOSTLYMYELINATED
            </h1>
            <p className="text-xs font-mono text-lab-text-tertiary">
              Neurological Assessment Interface
            </p>
          </div>
          <div className="flex items-center gap-4">
            {userLevel && (
              <StreakFlame streak={userLevel.streak || 0} size="small" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* XP Bar */}
        {userLevel && (
          <XPBar
            level={userLevel.level}
            xp={userLevel.xp}
            xpToNextLevel={userLevel.xpToNextLevel}
            title={userLevel.title}
            totalXpEarned={userLevel.totalXpEarned}
          />
        )}

        {/* Hero - Neuro Status */}
        {neuroStatus && (
          <NeuroStatusHero
            overallScore={neuroStatus.overallScore}
            statusLabel={neuroStatus.statusLabel}
            nodeDistribution={neuroStatus.nodeDistribution}
            dueCards={neuroStatus.dueCards}
            newCards={neuroStatus.newCards}
            weakNodeCount={neuroStatus.weakNodeCount}
            totalNodes={neuroStatus.totalNodes}
          />
        )}

        {/* Critical Nodes Panel */}
        {neuroStatus && neuroStatus.totalNodes > 0 && (
          <CriticalNodesPanel
            nodes={criticalNodes}
            totalNodes={neuroStatus.totalNodes}
          />
        )}

        {/* All Nodes Section */}
        <div className="bg-black border-2 border-lab-border p-6" style={{ borderRadius: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-mono uppercase text-lab-cyan">
              ALL NODES ({allNodes.length})
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
                LIST
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
              <p className="text-lg font-mono text-lab-text-primary mb-2">
                No nodes created yet.
              </p>
              <p className="text-sm font-mono text-lab-text-tertiary mb-6">
                Create your first node to begin mapping neural pathways.
              </p>
              <button
                onClick={() => navigate('/nodes/new')}
                className="px-6 py-3 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all"
                style={{ borderRadius: '2px' }}
              >
                + CREATE FIRST NODE
              </button>
            </div>
          ) : viewMode === 'tree' ? (
            <SkillTree nodes={allNodes} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allNodes.map(node => (
                <NodeCard key={node.id} node={node} onClick={() => navigate(`/nodes/${node.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* Achievement Summary */}
        {studyStats && (
          <AchievementSummary
            reviewsToday={studyStats.reviewsToday || 0}
            reviewsGoal={50}
            newCardsToday={studyStats.newCardsToday || 0}
            newCardsGoal={10}
            xpToday={studyStats.xpToday || 0}
            achievements={achievements}
          />
        )}
      </div>
    </div>
  );
}
