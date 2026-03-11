import * as d3 from 'd3';
import { getHierarchyColor, HierarchyType } from '../constants/colors';

/**
 * Hexagon data structure
 */
export interface HexagonData {
  id: string;
  name: string;
  hierarchy: HierarchyType;
  progress: number; // 0-100
  x?: number;
  y?: number;
  description?: string;
}

/**
 * Generate hexagon path for SVG
 * @param cx - Center X coordinate
 * @param cy - Center Y coordinate
 * @param radius - Hexagon radius (center to vertex)
 * @returns SVG path string
 */
export function generateHexagonPath(cx: number, cy: number, radius: number): string {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M${points.join('L')}Z`;
}

/**
 * Draw hexagons on D3 selection
 * @param selection - D3 selection containing nodes
 * @param data - Array of hexagon data
 * @param onHexagonClick - Callback for click events
 */
export function drawHexagons(
  selection: any,
  data: HexagonData[],
  onHexagonClick?: (d: HexagonData) => void
) {
  const hexagonRadius = 30;
  const progressBarHeight = 4;
  const progressBarWidth = hexagonRadius * 1.5;

  // Create hexagon groups
  const hexagons = selection
    .selectAll('.hexagon')
    .data(data, (d: HexagonData) => d.id)
    .join(
      (enter: any) =>
        enter
          .append('g')
          .attr('class', 'hexagon')
          .attr('transform', (d: HexagonData) => `translate(${d.x || 0},${d.y || 0})`),
      (update: any) => update,
      (exit: any) => exit.remove()
    )
    .style('cursor', 'pointer')
    .on('click', (_event: any, d: HexagonData) => {
      if (onHexagonClick) {
        onHexagonClick(d);
      }
    });

  // Draw hexagon shape
  hexagons
    .selectAll('.hexagon-shape')
    .data((_d: HexagonData) => [_d])
    .join((enter: any) =>
      enter.append('path').attr('class', 'hexagon-shape').attr('d', (_d: HexagonData) =>
        generateHexagonPath(0, 0, hexagonRadius)
      )
    )
    .attr('fill', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'main'))
    .attr('stroke', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'dark'))
    .attr('stroke-width', 2)
    .transition()
    .duration(300)
    .attr('fill', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'main'));

  // Add hover effect (opacity change for now)
  hexagons
    .selectAll('.hexagon-shape')
    .on('mouseenter', function (this: any) {
      d3.select(this).attr('opacity', 0.8);
    })
    .on('mouseleave', function (this: any) {
      d3.select(this).attr('opacity', 1);
    });

  // Draw progress bar background
  hexagons
    .selectAll('.progress-bg')
    .data((_d: HexagonData) => [_d])
    .join((enter: any) =>
      enter.append('rect').attr('class', 'progress-bg').attr('x', -progressBarWidth / 2).attr('y', hexagonRadius - 8)
    )
    .attr('width', progressBarWidth)
    .attr('height', progressBarHeight)
    .attr('fill', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'light'))
    .attr('rx', 2);

  // Draw progress bar fill
  hexagons
    .selectAll('.progress-fill')
    .data((_d: HexagonData) => [_d])
    .join((enter: any) =>
      enter.append('rect').attr('class', 'progress-fill').attr('x', -progressBarWidth / 2).attr('y', hexagonRadius - 8)
    )
    .attr('height', progressBarHeight)
    .attr('fill', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'main'))
    .attr('rx', 2)
    .transition()
    .duration(500)
    .attr('width', (d: HexagonData) => (progressBarWidth * Math.max(0, Math.min(100, d.progress))) / 100);

  // Draw label text
  hexagons
    .selectAll('.hexagon-label')
    .data((_d: HexagonData) => [_d])
    .join((enter: any) =>
      enter
        .append('text')
        .attr('class', 'hexagon-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', -8)
    )
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('fill', '#fff')
    .attr('pointer-events', 'none')
    .text((d: HexagonData) => d.name.substring(0, 10));

  // Draw progress text
  hexagons
    .selectAll('.progress-label')
    .data((_d: HexagonData) => [_d])
    .join((enter: any) =>
      enter
        .append('text')
        .attr('class', 'progress-label')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('y', hexagonRadius + 12)
    )
    .attr('font-size', '11px')
    .attr('fill', (d: HexagonData) => getHierarchyColor(d.hierarchy, 'dark'))
    .attr('pointer-events', 'none')
    .text((d: HexagonData) => `${Math.round(d.progress)}%`);

  return hexagons;
}

/**
 * Update hexagon positions (for force simulation)
 */
export function updateHexagonPositions(selection: any) {
  selection.attr('transform', (d: HexagonData) => `translate(${d.x || 0},${d.y || 0})`);
}
