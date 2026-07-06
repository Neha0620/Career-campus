import type { Config } from 'tailwindcss';

// Design language: "night navigation" — the app is a compass for a career
// journey, so the palette reads like a chart room at dusk: deep indigo
// ground, brass/amber waypoint marks, a muted signal-teal for progress.
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        chart: {
          bg: '#101826',      // deep indigo — the "ground"
          panel: '#16202F',   // slightly raised surface
          line: '#26364B',    // hairline dividers, grid
          paper: '#F4EFE6',   // light-mode ground, warm chart paper
        },
        brass: {
          DEFAULT: '#E3A64F', // waypoint marker / primary accent
          dim: '#B98333',
        },
        signal: {
          DEFAULT: '#4FA88C', // progress / success / growth
          dim: '#356B5A',
        },
        ink: {
          DEFAULT: '#EDEBE3', // primary text on dark
          dim: '#9AA5B4',     // secondary text on dark
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jbmono)', 'monospace'],
      },
      backgroundImage: {
        'grid-chart':
          'linear-gradient(#26364B 1px, transparent 1px), linear-gradient(90deg, #26364B 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-lg': '48px 48px',
      },
    },
  },
  plugins: [],
};

export default config;
