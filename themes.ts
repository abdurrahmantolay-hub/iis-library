
export interface Theme {
  name: string;
  colors: {
    '--color-primary': string;
    '--color-secondary': string;
    '--color-accent': string;
    '--color-gradient-start': string;
    '--color-gradient-end': string;
    '--color-content-bg': string;
    '--color-text-primary': string;
    '--color-text-secondary': string;
    '--color-text-accent': string;
    '--color-text-inverted': string;
    '--color-border-primary': string;
    '--color-status-available-bg': string;
    '--color-status-available-text': string;
    '--color-status-loaned-bg': string;
    '--color-status-loaned-text': string;
    '--color-accent-1': string;
    '--color-accent-2': string;
    '--color-accent-3': string;
    '--color-accent-4': string;
  };
}

export const themes: Record<string, Theme> = {
  'Default': {
    name: 'Default',
    colors: {
        '--color-primary': '#8b5cf6', // purple-500
        '--color-secondary': '#14b8a6', // teal-500
        '--color-accent': '#ec4899', // pink-500
        '--color-gradient-start': '#14b8a6', // teal-500
        '--color-gradient-end': '#8b5cf6', // purple-500
        '--color-content-bg': '#f8fafc', // slate-50
        '--color-text-primary': '#1e293b', // slate-800
        '--color-text-secondary': '#64748b', // slate-500
        '--color-text-accent': '#8b5cf6', // purple-500
        '--color-text-inverted': '#ffffff',
        '--color-border-primary': '#e2e8f0', // slate-200
        '--color-status-available-bg': '#d1fae5', // emerald-100
        '--color-status-available-text': '#065f46', // emerald-800
        '--color-status-loaned-bg': '#fef3c7', // amber-100
        '--color-status-loaned-text': '#92400e', // amber-800
        '--color-accent-1': '#3b82f6', // blue-500
        '--color-accent-2': '#10b981', // emerald-500
        '--color-accent-3': '#ef4444', // rose-500
        '--color-accent-4': '#f59e0b', // amber-500
    },
  },
  'Ocean Breeze': {
    name: 'Ocean Breeze',
    colors: {
      '--color-primary': '#0ea5e9', // sky-500
      '--color-secondary': '#14b8a6', // teal-500
      '--color-accent': '#22d3ee', // cyan-400
      '--color-gradient-start': '#0ea5e9',
      '--color-gradient-end': '#14b8a6',
      '--color-content-bg': '#f0f9ff', // sky-50
      '--color-text-primary': '#0c4a6e', // sky-900
      '--color-text-secondary': '#38bdf8', // sky-400
      '--color-text-accent': '#0ea5e9',
      '--color-text-inverted': '#ffffff',
      '--color-border-primary': '#bae6fd', // sky-200
      '--color-status-available-bg': '#a7f3d0', // emerald-200
      '--color-status-available-text': '#047857', // emerald-700
      '--color-status-loaned-bg': '#a5f3fc', // cyan-200
      '--color-status-loaned-text': '#0e7490', // cyan-700
      '--color-accent-1': '#0ea5e9', // sky-500
      '--color-accent-2': '#14b8a6', // teal-500
      '--color-accent-3': '#f472b6', // pink-400
      '--color-accent-4': '#67e8f9', // cyan-300
    },
  },
  'Sunset Glow': {
    name: 'Sunset Glow',
    colors: {
      '--color-primary': '#f97316', // orange-500
      '--color-secondary': '#ec4899', // pink-500
      '--color-accent': '#f43f5e', // rose-500
      '--color-gradient-start': '#f97316',
      '--color-gradient-end': '#ec4899',
      '--color-content-bg': '#fff7ed', // orange-50
      '--color-text-primary': '#7c2d12', // orange-900
      '--color-text-secondary': '#fb923c', // orange-400
      '--color-text-accent': '#f97316',
      '--color-text-inverted': '#ffffff',
      '--color-border-primary': '#fed7aa', // orange-200
      '--color-status-available-bg': '#fce7f3', // pink-100
      '--color-status-available-text': '#9d174d', // pink-800
      '--color-status-loaned-bg': '#fee2e2', // rose-100
      '--color-status-loaned-text': '#9f1239', // rose-800
      '--color-accent-1': '#f97316', // orange-500
      '--color-accent-2': '#ec4899', // pink-500
      '--color-accent-3': '#ef4444', // rose-500
      '--color-accent-4': '#f59e0b', // amber-500
    },
  },
  'Forest Canopy': {
    name: 'Forest Canopy',
    colors: {
      '--color-primary': '#16a34a', // green-600
      '--color-secondary': '#ca8a04', // yellow-600
      '--color-accent': '#65a30d', // lime-600
      '--color-gradient-start': '#16a34a',
      '--color-gradient-end': '#65a30d',
      '--color-content-bg': '#f7fee7', // lime-50
      '--color-text-primary': '#1a2e05', // dark green
      '--color-text-secondary': '#3f6212', // lime-800
      '--color-text-accent': '#16a34a',
      '--color-text-inverted': '#ffffff',
      '--color-border-primary': '#d9f99d', // lime-200
      '--color-status-available-bg': '#dcfce7', // green-100
      '--color-status-available-text': '#15803d', // green-700
      '--color-status-loaned-bg': '#fef9c3', // yellow-100
      '--color-status-loaned-text': '#a16207', // yellow-700
      '--color-accent-1': '#16a34a', // green-600
      '--color-accent-2': '#65a30d', // lime-600
      '--color-accent-3': '#eab308', // yellow-500
      '--color-accent-4': '#84cc16', // lime-500
    },
  },
};
