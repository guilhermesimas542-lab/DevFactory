/**
 * Color palette for hierarchies in the hexagon map
 */
export const HIERARCHY_COLORS = {
  critico: {
    main: '#ef4444',      // Red 500
    light: '#fee2e2',     // Red 100
    dark: '#991b1b',      // Red 900
    hover: '#dc2626',     // Red 600
  },
  importante: {
    main: '#f97316',      // Orange 500
    light: '#fed7aa',     // Orange 100
    dark: '#92400e',      // Orange 900
    hover: '#ea580c',     // Orange 600
  },
  necessario: {
    main: '#3b82f6',      // Blue 500
    light: '#dbeafe',     // Blue 100
    dark: '#1e3a8a',      // Blue 900
    hover: '#2563eb',     // Blue 600
  },
  desejavel: {
    main: '#22c55e',      // Green 500
    light: '#dcfce7',     // Green 100
    dark: '#15803d',      // Green 900
    hover: '#16a34a',     // Green 600
  },
  opcional: {
    main: '#9ca3af',      // Gray 400
    light: '#f3f4f6',     // Gray 100
    dark: '#374151',      // Gray 700
    hover: '#6b7280',     // Gray 500
  },
} as const;

export type HierarchyType = keyof typeof HIERARCHY_COLORS;

/**
 * Get color for a hierarchy level
 */
export function getHierarchyColor(hierarchy: HierarchyType, variant: 'main' | 'light' | 'dark' | 'hover' = 'main') {
  return HIERARCHY_COLORS[hierarchy]?.[variant] || HIERARCHY_COLORS.opcional[variant];
}
