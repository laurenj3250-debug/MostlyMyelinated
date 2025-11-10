import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node } from '../types';

interface GraphViewProps {
  nodes: Node[];
  relationships: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    relationshipType: string;
    notes?: string;
  }>;
  onNodeClick?: (nodeId: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  strength: number;
  module?: string;
  cardCount: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id: string;
  relationshipType: string;
  notes?: string;
}

export default function GraphView({ nodes, relationships, onNodeClick }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['prerequisite', 'compare', 'part_of', 'related', 'pathway'])
  );
  const [highlightWeak, setHighlightWeak] = useState(true);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create graph data
    const graphNodes: GraphNode[] = nodes.map(node => ({
      id: node.id,
      name: node.name,
      strength: node.nodeStrength,
      module: node.module,
      cardCount: node._count?.cards || 0,
    }));

    const graphLinks: GraphLink[] = relationships
      .filter(rel => selectedTypes.has(rel.relationshipType))
      .map(rel => ({
        id: rel.id,
        source: rel.sourceNodeId,
        target: rel.targetNodeId,
        relationshipType: rel.relationshipType,
        notes: rel.notes,
      }));

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Add zoom behavior
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(graphNodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graphLinks)
        .id(d => d.id)
        .distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(graphLinks)
      .enter()
      .append('line')
      .attr('stroke', d => getRelationshipColor(d.relationshipType))
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', d => `url(#arrow-${d.relationshipType})`);

    // Create link labels
    const linkLabel = g.append('g')
      .selectAll('text')
      .data(graphLinks)
      .enter()
      .append('text')
      .attr('font-size', 10)
      .attr('font-family', 'monospace')
      .attr('fill', '#00d9ff')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .text(d => d.relationshipType.toUpperCase());

    // Create arrow markers
    const defs = svg.append('defs');
    const relationshipTypes = ['prerequisite', 'compare', 'part_of', 'related', 'pathway'];
    relationshipTypes.forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getRelationshipColor(type));
    });

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(graphNodes)
      .enter()
      .append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any);

    // Add circles
    node.append('circle')
      .attr('r', d => Math.max(15, Math.min(30, d.cardCount * 2 + 10)))
      .attr('fill', d => getNodeColor(d.strength))
      .attr('stroke', d => {
        if (highlightWeak && d.strength < 40) return '#ff3366';
        return getNodeBorderColor(d.strength);
      })
      .attr('stroke-width', d => {
        if (highlightWeak && d.strength < 40) return 3;
        return 2;
      })
      .style('filter', d => {
        if (d.strength >= 95) return 'drop-shadow(0 0 8px #00d9ff)';
        if (highlightWeak && d.strength < 40) return 'drop-shadow(0 0 8px #ff3366)';
        return 'none';
      });

    // Add labels
    node.append('text')
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', '#e8eef5')
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name);

    // Add strength labels
    node.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('fill', '#00d9ff')
      .text(d => `${Math.round(d.strength)}%`);

    // Click handler
    node.on('click', (event, d) => {
      event.stopPropagation();
      if (onNodeClick) {
        onNodeClick(d.id);
      }
    });

    // Hover effects
    node.on('mouseenter', function(_event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', Math.max(15, Math.min(30, d.cardCount * 2 + 10)) * 1.2)
        .attr('stroke-width', 4);
    });

    node.on('mouseleave', function(_event, d) {
      d3.select(this).select('circle')
        .transition()
        .duration(200)
        .attr('r', Math.max(15, Math.min(30, d.cardCount * 2 + 10)))
        .attr('stroke-width', highlightWeak && d.strength < 40 ? 3 : 2);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      linkLabel
        .attr('x', d => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr('y', d => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragStarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, relationships, selectedTypes, highlightWeak, onNodeClick]);

  const getNodeColor = (strength: number): string => {
    if (strength < 20) return '#6b21a8'; // Purple (brain-dead)
    if (strength < 40) return '#1e40af'; // Blue (weak)
    if (strength < 60) return '#0891b2'; // Teal (moderate)
    if (strength < 75) return '#ea580c'; // Orange (good)
    if (strength < 85) return '#eab308'; // Yellow (strong)
    if (strength < 95) return '#16a34a'; // Green (very strong)
    return '#00d9ff'; // Cyan (mastered)
  };

  const getNodeBorderColor = (strength: number): string => {
    if (strength < 20) return '#a855f7';
    if (strength < 40) return '#3b82f6';
    if (strength < 60) return '#06b6d4';
    if (strength < 75) return '#f97316';
    if (strength < 85) return '#facc15';
    if (strength < 95) return '#22c55e';
    return '#00d9ff';
  };

  const getRelationshipColor = (type: string): string => {
    switch (type) {
      case 'prerequisite': return '#ff3366'; // Alert (critical path)
      case 'compare': return '#eab308'; // Yellow (comparison)
      case 'part_of': return '#00ff88'; // Mint (hierarchy)
      case 'related': return '#06b6d4'; // Teal (association)
      case 'pathway': return '#a855f7'; // Purple (clinical flow)
      default: return '#00d9ff';
    }
  };

  const toggleType = (type: string) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const relationshipTypes = [
    { key: 'prerequisite', label: 'PREREQUISITE', color: '#ff3366' },
    { key: 'compare', label: 'COMPARE', color: '#eab308' },
    { key: 'part_of', label: 'PART OF', color: '#00ff88' },
    { key: 'related', label: 'RELATED', color: '#06b6d4' },
    { key: 'pathway', label: 'PATHWAY', color: '#a855f7' },
  ];

  return (
    <div className="relative w-full h-full">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black border-2 border-lab-cyan/30 p-4" style={{ borderRadius: '2px' }}>
        <h3 className="text-xs font-mono font-bold uppercase text-lab-cyan mb-3">
          GRAPH CONTROLS
        </h3>

        {/* Relationship type filters */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-2">
            Relationship Types:
          </div>
          {relationshipTypes.map(type => (
            <label
              key={type.key}
              className="flex items-center gap-2 cursor-pointer text-xs font-mono"
            >
              <input
                type="checkbox"
                checked={selectedTypes.has(type.key)}
                onChange={() => toggleType(type.key)}
                className="form-checkbox"
              />
              <span
                className="w-3 h-3 inline-block"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-lab-text-primary">{type.label}</span>
            </label>
          ))}
        </div>

        {/* Highlight weak toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-mono">
          <input
            type="checkbox"
            checked={highlightWeak}
            onChange={(e) => setHighlightWeak(e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-lab-text-primary">HIGHLIGHT WEAK NODES</span>
        </label>

        {/* Instructions */}
        <div className="mt-4 pt-4 border-t border-lab-border/30 text-xs font-mono text-lab-text-tertiary">
          <div className="space-y-1">
            <div>• Click node to open sheet</div>
            <div>• Drag nodes to reposition</div>
            <div>• Scroll to zoom</div>
            <div>• Drag canvas to pan</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-black border-2 border-lab-cyan/30 p-4" style={{ borderRadius: '2px' }}>
        <h3 className="text-xs font-mono font-bold uppercase text-lab-cyan mb-3">
          NODE STATUS
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6b21a8' }} />
            <span className="text-lab-text-tertiary">0-20% Brain-dead</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#1e40af' }} />
            <span className="text-lab-text-tertiary">20-40% Weak</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0891b2' }} />
            <span className="text-lab-text-tertiary">40-60% Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }} />
            <span className="text-lab-text-tertiary">60-75% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }} />
            <span className="text-lab-text-tertiary">75-85% Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#16a34a' }} />
            <span className="text-lab-text-tertiary">85-95% V.Strong</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#00d9ff' }} />
            <span className="text-lab-text-tertiary">95-100% Mastered</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full bg-lab-background"
        style={{ minHeight: '600px' }}
      />

      {/* Empty state */}
      {relationships.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-black border-2 border-lab-border p-8" style={{ borderRadius: '2px' }}>
            <p className="text-lab-text-primary font-mono mb-2">NO RELATIONSHIPS FOUND</p>
            <p className="text-xs text-lab-text-tertiary font-mono">
              Create relationships between nodes to visualize the graph
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
