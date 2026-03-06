'use client';

import * as d3 from 'd3';
import { useRef, useState } from 'react';
import { useD3 } from '../hooks/useD3';
import { drawHexagons, updateHexagonPositions, type HexagonData } from '../lib/hexagon';
import { createForceSimulation, drawLinks, updateLinkPositions, type ModuleLink } from '../lib/forceLayout';
import Tooltip from './Tooltip';

interface HexagonMapProps {
  data: HexagonData[];
  links?: ModuleLink[];
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
  links = [],
  width = 900,
  height = 700,
  onHexagonClick,
}: HexagonMapProps) {
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgRefD3 = useRef<d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> | null>(null);

  const svgRef = useD3(
    (svg) => {
      if (!svg.node()) return;

      // Clear previous content
      svg.selectAll('*').remove();

      // Create main group for zoom
      const g = svg.append('g').attr('class', 'zoom-group');

      // Create links layer (behind hexagons)
      const linksGroup = g.append('g').attr('class', 'links-group');

      // Initialize positions if not already set
      const nodesWithPos = data.map((d) => ({
        ...d,
        x: d.x || (width / 2 + Math.random() * 100 - 50),
        y: d.y || (height / 2 + Math.random() * 100 - 50),
      }));

      // Create force simulation with links
      const simulation = createForceSimulation(nodesWithPos, links, width, height);

      // Draw links (lines connecting modules)
      const linkLines = drawLinks(linksGroup, links);

      // Draw hexagons on top
      const hexagons = drawHexagons(g, nodesWithPos, onHexagonClick);

      // Add tooltip on hover
      hexagons
        .on('mouseenter', function (this: any, _event: any, d: HexagonData) {
          const bbox = (this as SVGElement).getBoundingClientRect();
          setTooltip({
            visible: true,
            content: `${d.name} • ${d.progress}%`,
            x: bbox.left + bbox.width / 2,
            y: bbox.top,
          });
        })
        .on('mouseleave', () => {
          setTooltip({ visible: false, content: '', x: 0, y: 0 });
        });

      // Update positions on simulation tick
      simulation.on('tick', () => {
        updateLinkPositions(linkLines);
        updateHexagonPositions(g.selectAll('.hexagon'));
      });

      // Zoom behavior with limits (0.5x to 3x)
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      zoomRef.current = zoom;
      svgRefD3.current = svg;
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
    [data, links, width, height, onHexagonClick]
  );

  const handleResetZoom = () => {
    if (zoomRef.current && svgRefD3.current) {
      svgRefD3.current
        .transition()
        .duration(750)
        .call(zoomRef.current.transform as any, d3.zoomIdentity.translate(0, 0).scale(1));
    }
  };

  return (
    <>
      <Tooltip
        content={tooltip.content}
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
      />
      <div className="relative w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Mapa de Módulos</h3>
            <p className="text-sm text-gray-600 mt-1">
              🔍 Scroll para zoom | 👆 Arraste para mover | 🖱️ Clique para selecionar | 🔄 Duplo-clique para reset
            </p>
          </div>
          <button
            onClick={handleResetZoom}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-colors text-sm font-medium whitespace-nowrap ml-4"
            title="Resetar zoom para 1x (Atalho: Duplo-clique)"
          >
            🔄 Reset Zoom
          </button>
        </div>
        <svg
          ref={svgRef}
          width={width}
          height={height}
          style={{ display: 'block', backgroundColor: '#fafafa' }}
        />
      </div>
    </>
  );
}
