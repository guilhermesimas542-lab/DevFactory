import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Custom hook to manage D3 visualizations
 * Handles SVG rendering and lifecycle management
 *
 * @param renderFn - Function that receives D3 selection and renders visualization
 * @param dependencies - Dependencies array to re-run render when changed
 * @returns Ref to attach to SVG element
 */
export function useD3(
  renderFn: (svg: any) => void,
  dependencies: unknown[] = []
) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Select SVG element and apply render function
    const svg = d3.select(svgRef.current);
    renderFn(svg);
  }, dependencies);

  return svgRef;
}
