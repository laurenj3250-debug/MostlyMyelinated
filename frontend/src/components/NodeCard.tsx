import { useState, useEffect } from 'react';
import { Node } from '../types';
import NeuroLabel from './NeuroLabel';
import HeatMapBar from './HeatMapBar';
import ScanlineOverlay from './ScanlineOverlay';
import { Brain, Calendar, FileText, CreditCard } from 'lucide-react';
import { nodes } from '../services/api';

interface Props {
  node: Node;
  onClick: () => void;
}

/**
 * CLINICAL NODE INTERFACE CARD
 * Brain scan result style with metadata and heat map visualization
 */
export default function NodeCard({ node, onClick }: Props) {
  const [sparklineData, setSparklineData] = useState<Array<{ date: string; strength: number }>>([]);

  useEffect(() => {
    loadSparkline();
  }, [node.id]);

  const loadSparkline = async () => {
    try {
      const res = await nodes.getStrengthHistory(node.id, 7);
      setSparklineData(res.data.history);
    } catch (error) {
      console.error('Failed to load sparkline:', error);
    }
  };

  // Generate fake node ID for clinical look
  const nodeId = `NODE-${String(node.id).padStart(4, '0')}`;
  const scanDate = node.lastReviewed
    ? new Date(node.lastReviewed).toISOString().replace('T', ' ').slice(0, 19)
    : new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Calculate stability score (fake metric for aesthetics)
  const stability = ((node.nodeStrength / 100) * 0.8 + Math.random() * 0.2).toFixed(2);

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden bg-lab-bg-card border border-lab-cyan/20 p-5
                 cursor-pointer transition-all duration-300
                 hover:border-lab-cyan/60 hover:shadow-glow-sm hover:translate-y-[-2px]
                 group"
      style={{ borderRadius: '2px' }}
    >
      {/* Scan line overlay */}
      <ScanlineOverlay intensity="light" speed="slow" />

      {/* Alert indicator for low strength */}
      {node.nodeStrength < 60 && (
        <div className="absolute top-2 right-2 z-20">
          <div className="w-2 h-2 bg-lab-alert rounded-full animate-pulse shadow-glow-alert" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header - Clinical Label Style */}
        <div className="border-b border-lab-cyan/20 pb-3 mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-lab-cyan" />
              <span className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider">
                {nodeId}
              </span>
            </div>
            <div className="text-xs font-mono text-lab-text-tertiary">
              STABILITY: {stability}
            </div>
          </div>

          <h3 className="text-lg font-bold text-lab-text-primary uppercase tracking-wide group-hover:text-lab-cyan transition-colors">
            {node.name}
          </h3>

          {node.summary && (
            <p className="text-lab-text-secondary text-sm leading-relaxed mt-2 line-clamp-2">
              {node.summary}
            </p>
          )}
        </div>

        {/* Tags */}
        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono bg-lab-bg-elevated text-lab-text-secondary
                           px-2 py-1 border border-lab-border uppercase tracking-wider"
                style={{ borderRadius: '2px' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Heat Map Strength Bar */}
        <div className="mb-4">
          <div className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider mb-2">
            NEURAL STRENGTH
          </div>
          <HeatMapBar value={node.nodeStrength} height="h-8" />
        </div>

        {/* Neuro Label Badge */}
        {node.strengthLabel && (
          <div className="mb-3">
            <NeuroLabel
              strength={node.strengthLabel.strength}
              label={node.strengthLabel.label}
              emoji={node.strengthLabel.emoji}
              size="sm"
            />
          </div>
        )}

        {/* 7-Day History Mini Heatmap */}
        {sparklineData.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-mono text-lab-cyan/70 uppercase tracking-wider mb-2">
              7-DAY ACTIVITY
            </div>
            <div className="flex gap-1">
              {sparklineData.map((day, i) => {
                const height = Math.max((day.strength / 100) * 24, 4);
                const getColor = (strength: number) => {
                  if (strength < 20) return 'bg-heatmap-critical';
                  if (strength < 40) return 'bg-heatmap-weak';
                  if (strength < 60) return 'bg-heatmap-moderate';
                  if (strength < 80) return 'bg-heatmap-good';
                  if (strength < 95) return 'bg-heatmap-strong';
                  return 'bg-heatmap-mastered';
                };
                return (
                  <div
                    key={i}
                    className="flex-1 flex items-end"
                    style={{ height: '24px' }}
                  >
                    <div
                      className={`w-full ${getColor(day.strength)} transition-all`}
                      style={{ height: `${height}px`, borderRadius: '1px' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clinical Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {node._count && (
            <>
              <div className="bg-lab-bg-elevated border border-lab-border p-2" style={{ borderRadius: '2px' }}>
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-lab-cyan" />
                  <span className="text-xs font-mono text-lab-text-tertiary uppercase">Facts</span>
                </div>
                <div className="text-lg font-mono font-bold text-lab-cyan">
                  {node._count.facts}
                </div>
              </div>
              <div className="bg-lab-bg-elevated border border-lab-border p-2" style={{ borderRadius: '2px' }}>
                <div className="flex items-center gap-1 mb-1">
                  <CreditCard className="w-3 h-3 text-lab-cyan" />
                  <span className="text-xs font-mono text-lab-text-tertiary uppercase">Cards</span>
                </div>
                <div className="text-lg font-mono font-bold text-lab-cyan">
                  {node._count.cards}
                </div>
              </div>
              <div className="bg-lab-bg-elevated border border-lab-border p-2" style={{ borderRadius: '2px' }}>
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-lab-cyan" />
                  <span className="text-xs font-mono text-lab-text-tertiary uppercase">Rvws</span>
                </div>
                <div className="text-lg font-mono font-bold text-lab-cyan">
                  {node._count?.cards || 0}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="border-t border-lab-cyan/20 pt-2">
          <div className="text-xs font-mono text-lab-text-tertiary">
            <div className="flex justify-between">
              <span>LAST SCAN: {scanDate} UTC</span>
              <span className={node.nodeStrength < 60 ? 'text-lab-alert' : 'text-lab-mint'}>
                {node.nodeStrength < 60 ? 'ATTN REQ' : 'NOMINAL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}