/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Roboto Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        // Neuroscience Lab Theme Primary Colors (using design tokens)
        'lab': {
          // Backgrounds
          'background': '#0a0e1a',      // var(--bg-void)
          'bg-primary': '#0a0e1a',      // var(--bg-void) - backwards compat
          'card': '#151b2e',            // var(--bg-surface)
          'bg-card': '#151b2e',         // var(--bg-surface) - backwards compat
          'surface': '#151b2e',         // var(--bg-surface)
          'elevated': '#1a2238',        // var(--bg-surface-elevated)
          'bg-elevated': '#1a2238',     // backwards compat

          // Primary colors
          'cyan': '#00d9ff',            // var(--cyan-primary)
          'mint': '#00ff88',            // var(--mint-secondary)
          'alert': '#ff3366',           // var(--pink-alert)

          // Borders
          'border': 'rgba(139, 149, 168, 0.2)',  // var(--border-default)
          'border-hover': 'rgba(0, 217, 255, 0.4)', // var(--border-hover)

          // Text colors
          'text-primary': '#e8eef5',    // var(--text-clinical)
          'text-clinical': '#e8eef5',   // var(--text-clinical)
          'text-secondary': '#8b95a8',  // var(--text-muted)
          'text-muted': '#8b95a8',      // var(--text-muted)
          'text-tertiary': '#4a5568',   // var(--text-dim)
          'text-dim': '#4a5568',        // var(--text-dim)
        },
        // Neuro status bands (design system)
        'band': {
          'braindead': '#5b21b6',       // var(--band-braindead)
          'lmn': '#3b82f6',             // var(--band-lmn)
          'nonamb': '#14b8a6',          // var(--band-nonamb)
          'amb': '#f97316',             // var(--band-amb)
          'paresis': '#fbbf24',         // var(--band-paresis)
          'bar': '#22c55e',             // var(--band-bar)
          'hyper': '#00d9ff',           // var(--band-hyper)
        },
        // Heat Map Colors (PET scan style)
        'heatmap': {
          'critical': {
            start: '#1a0033',
            end: '#4d0099',
          },
          'weak': {
            start: '#000066',
            end: '#0099ff',
          },
          'moderate': {
            start: '#006666',
            end: '#00cccc',
          },
          'good': {
            start: '#ffaa00',
            end: '#ff6600',
          },
          'strong': {
            start: '#ff3300',
            end: '#ff0000',
          },
          'mastered': {
            start: '#ff0066',
            end: '#ffff00',
          },
        },
        // Keep old neuro colors for compatibility
        'neuro': {
          'brain-dead': {
            start: '#1a0033',
            end: '#4d0099',
          },
          'lmn-tetraplegic': {
            start: '#000066',
            end: '#0099ff',
          },
          'non-ambulatory': {
            start: '#006666',
            end: '#00cccc',
          },
          'ambulatory-ataxic': {
            start: '#ffaa00',
            end: '#ff6600',
          },
          'mild-paresis': {
            start: '#ff6600',
            end: '#ff3300',
          },
          'bar': {
            start: '#ff3300',
            end: '#ff0000',
          },
          'hyperreflexic': {
            start: '#ff0066',
            end: '#ffff00',
          },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'pulse-cyan': 'pulse-cyan 1.5s ease-in-out infinite',
        'data-flicker': 'data-flicker 0.1s ease-in-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 10px rgba(0, 217, 255, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.8)',
          },
        },
        'pulse-cyan': {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 217, 255, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.9)',
          },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'data-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 217, 255, 0.5)',
        'glow-md': '0 0 20px rgba(0, 217, 255, 0.6)',
        'glow-lg': '0 0 30px rgba(0, 217, 255, 0.7)',
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.6)',
        'glow-mint': '0 0 20px rgba(0, 255, 136, 0.6)',
        'glow-alert': '0 0 20px rgba(255, 51, 102, 0.6)',
        'inner-cyan': 'inset 0 0 10px rgba(0, 217, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
