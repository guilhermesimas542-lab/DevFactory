'use client';

import * as d3 from 'd3';
import { useD3 } from '../hooks/useD3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  value: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

interface D3TestProps {
  nodes?: Node[];
  links?: Link[];
  width?: number;
  height?: number;
}

/**
 * Test component for D3.js force simulation with zoom/pan
 * Renders circles with forces and interactive zoom/pan controls
 */
export default function D3Test({
  nodes = [
    { id: '1', label: 'Node 1', value: 10 },
    { id: '2', label: 'Node 2', value: 15 },
    { id: '3', label: 'Node 3', value: 12 },
    { id: '4', label: 'Node 4', value: 18 },
    { id: '5', label: 'Node 5', value: 14 },
  ],
  links = [
    { source: '1', target: '2' },
    { source: '1', target: '3' },
    { source: '2', target: '4' },
    { source: '3', target: '4' },
    { source: '4', target: '5' },
  ],
  width = 800,
  height = 600,
}: D3TestProps) {
  const svgRef = useD3(
    (svg) => {
      if (!svg.node()) return;

      // Clear previous content
      svg.selectAll('*').remove();

      // Create main group for zoom
      const g = svg.append('g').attr('class', 'zoom-group');

      // Force simulation
      const simulation = d3
        .forceSimulation<Node>(nodes)
        .force(
          'link',
          d3
            .forceLink<Node, Link>(links)
            .id((d: Node) => d.id)
            .distance(60)
        )
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

      // Render links
      const link = g
        .append('g')
        .selectAll('line')
        .data(links as any)
        .join('line')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', 2);

      // Render nodes
      const node = g
        .append('g')
        .selectAll('circle')
        .data(nodes as any)
        .join('circle')
        .attr('r', (d: Node) => Math.sqrt(d.value) * 3)
        .attr('fill', '#4f46e5')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .call(drag(simulation) as any);

      // Add labels
      const label = g
        .append('g')
        .selectAll('text')
        .data(nodes as any)
        .join('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .text((d: Node) => d.label);

      // Update positions on simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => (d.source as any).x)
          .attr('y1', (d: any) => (d.source as any).y)
          .attr('x2', (d: any) => (d.target as any).x)
          .attr('y2', (d: any) => (d.target as any).y);

        node.attr('cx', (d: any) => d.x || 0).attr('cy', (d: any) => d.y || 0);

        label.attr('x', (d: any) => d.x || 0).attr('y', (d: any) => d.y || 0);
      });

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

      svg.call(zoom as any);

      // Initial zoom to fit
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg.call(zoom.transform as any, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
      }
    },
    [nodes, links, width, height]
  );

  // Drag behavior
  function drag(simulation: d3.Simulation<Node, Link>) {
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag<SVGCircleElement, Node>().on('start', dragstarted).on('drag', dragged).on('end', dragended);
  }

  return (
    <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">D3.js Force Simulation Test</h3>
        <p className="text-sm text-gray-600 mt-1">Arraste nós, zoom com mouse, pan com drag no fundo</p>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', margin: 'auto' }}
      />
    </div>
  );
}
