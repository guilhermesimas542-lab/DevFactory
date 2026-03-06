'use client';

import * as d3 from 'd3';
import { useD3 } from '../hooks/useD3';
import { drawHexagons, updateHexagonPositions, type HexagonData } from '../lib/hexagon';

interface HexagonMapProps {
  data: HexagonData[];
  width?: number;
  height?: number;
  onHexagonClick?: (d: HexagonData) => void;
}

/**
 * Hexagon map component using D3.js
 * Renders hexagons with progress bars, hierarchy colors, and hover effects
 */
export default function HexagonMap({
  data,
  width = 900,
  height = 700,
  onHexagonClick,
}: HexagonMapProps) {
  const svgRef = useD3(
    (svg) => {
      if (!svg.node()) return;

      // Clear previous content
      svg.selectAll('*').remove();

      // Create main group for zoom
      const g = svg.append('g').attr('class', 'zoom-group');

      // Initialize positions if not already set
      const nodesWithPos = data.map((d) => ({
        ...d,
        x: d.x || (width / 2 + Math.random() * 100 - 50),
        y: d.y || (height / 2 + Math.random() * 100 - 50),
      }));

      // Create force simulation for layout
      const simulation = d3
        .forceSimulation<HexagonData>(nodesWithPos)
        .force('charge', d3.forceManyBody().strength(-400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(50))
        .alphaDecay(0.02); // Slower convergence for smoother animation

      // Draw initial hexagons
      drawHexagons(g, nodesWithPos, onHexagonClick);

      // Update hexagon positions on simulation tick
      simulation.on('tick', () => {
        updateHexagonPositions(g.selectAll('.hexagon'));
      });

      // Zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

      svg.call(zoom as any);

      // Reset zoom on double-click
      svg.on('dblclick.zoom', () => {
        svg
          .transition()
          .duration(750)
          .call(zoom.transform as any, d3.zoomIdentity.translate(0, 0).scale(1));
        g.attr('transform', 'translate(0,0)');
      });

      // Cleanup
      return () => {
        simulation.stop();
      };
    },
    [data, width, height, onHexagonClick]
  );

  return (
    <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-white border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Mapa de Módulos</h3>
        <p className="text-sm text-gray-600 mt-1">
          Zoom com scroll | Pan com drag | Clique para selecionar | Duplo-clique para reset
        </p>
      </div>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: 'block', backgroundColor: '#fafafa' }}
      />
    </div>
  );
}
