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
    .alphaDecay(0.02);
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
 * Update link positions based on node positions
 */
export function updateLinkPositions(
  links: d3.Selection<SVGLineElement, ModuleLink, SVGGElement, unknown>
) {
  links
    .attr('x1', (d: any) => (d.source as any).x || 0)
    .attr('y1', (d: any) => (d.source as any).y || 0)
    .attr('x2', (d: any) => (d.target as any).x || 0)
    .attr('y2', (d: any) => (d.target as any).y || 0);
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
