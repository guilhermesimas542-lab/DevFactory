import * as d3 from 'd3';
import { HexagonData } from './hexagon';

/**
 * Dependency link between two modules
 */
export interface ModuleLink extends d3.SimulationLinkDatum<HexagonData> {
  source: string | HexagonData;
  target: string | HexagonData;
  strength?: number;
}

/**
 * Create and configure force simulation for hexagon map
 * Includes charge, collision, center, and link forces
 */
export function createForceSimulation(
  nodes: HexagonData[],
  links: ModuleLink[],
  width: number,
  height: number
): d3.Simulation<HexagonData, ModuleLink> {
  return d3
    .forceSimulation<HexagonData>(nodes)
    .force(
      'link',
      d3
        .forceLink<HexagonData, ModuleLink>(links)
        .id((d: HexagonData) => d.id)
        .distance(100)
        .strength(0.3)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(50))
    .alphaDecay(0.15)  // Faster decay: simulation settles quicker
    .alphaMin(0.001);  // Stop when alpha reaches minimum
}

/**
 * Draw links (connections) between modules
 */
export function drawLinks(
  selection: any,
  links: ModuleLink[]
): d3.Selection<SVGLineElement, ModuleLink, SVGGElement, unknown> {
  return selection
    .selectAll('line.module-link')
    .data(links, (d: ModuleLink, i: number) => `${(d.source as any).id || (d.source as string)}-${(d.target as any).id || (d.target as string)}-${i}`)
    .join('line')
    .attr('class', 'module-link')
    .attr('stroke', '#d1d5db')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2);
}

/**
 * Calculate intersection point of a line with a circle (hexagon approximation)
 * This ensures lines connect at the edge of nodes, not through their center
 */
function getLineCircleIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  radius: number,
  fromNode: boolean = true
): { x: number; y: number } {
  // Vector from center to other point
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    return { x: cx, y: cy };
  }

  // Normalize direction vector
  const ux = dx / distance;
  const uy = dy / distance;

  // Calculate intersection point at circle edge
  const intersectX = cx + (fromNode ? 1 : -1) * ux * radius;
  const intersectY = cy + (fromNode ? 1 : -1) * uy * radius;

  return { x: intersectX, y: intersectY };
}

/**
 * Update link positions based on node positions
 * Lines now connect at node edges instead of passing through centers
 */
export function updateLinkPositions(
  links: d3.Selection<SVGLineElement, ModuleLink, SVGGElement, unknown>
) {
  const hexagonRadius = 30; // Must match the radius used in hexagon.ts

  links
    .attr('x1', (d: any) => {
      const source = (d.source as any);
      const target = (d.target as any);
      const intersection = getLineCircleIntersection(
        source.x || 0,
        source.y || 0,
        target.x || 0,
        target.y || 0,
        source.x || 0,
        source.y || 0,
        hexagonRadius,
        true
      );
      return intersection.x;
    })
    .attr('y1', (d: any) => {
      const source = (d.source as any);
      const target = (d.target as any);
      const intersection = getLineCircleIntersection(
        source.x || 0,
        source.y || 0,
        target.x || 0,
        target.y || 0,
        source.x || 0,
        source.y || 0,
        hexagonRadius,
        true
      );
      return intersection.y;
    })
    .attr('x2', (d: any) => {
      const source = (d.source as any);
      const target = (d.target as any);
      const intersection = getLineCircleIntersection(
        source.x || 0,
        source.y || 0,
        target.x || 0,
        target.y || 0,
        target.x || 0,
        target.y || 0,
        hexagonRadius,
        false
      );
      return intersection.x;
    })
    .attr('y2', (d: any) => {
      const source = (d.source as any);
      const target = (d.target as any);
      const intersection = getLineCircleIntersection(
        source.x || 0,
        source.y || 0,
        target.x || 0,
        target.y || 0,
        target.x || 0,
        target.y || 0,
        hexagonRadius,
        false
      );
      return intersection.y;
    });
}

/**
 * Calculate performance metrics
 */
export interface PerformanceMetrics {
  frameTime: number; // ms per frame
  fps: number;
  simulationRunning: boolean;
}

/**
 * Monitor performance of simulation
 */
export function monitorPerformance(): PerformanceMetrics {
  let lastFrameTime = performance.now();
  let frameTime = 0;

  return {
    get frameTime() {
      const now = performance.now();
      frameTime = now - lastFrameTime;
      lastFrameTime = now;
      return frameTime;
    },
    get fps() {
      return frameTime > 0 ? Math.round(1000 / frameTime) : 60;
    },
    simulationRunning: true,
  };
}
