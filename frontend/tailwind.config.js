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
        display: [
          'Rajdhani',
          'Orbitron',
          'sans-serif',
        ],
      },
      colors: {
        // NEON ROLLER-RINK PALETTE
        'neon': {
          'pink': '#ff5ecd',
          'purple': '#a34bff',
          'cyan': '#00eaff',
          'fuchsia': '#ff9cff',
          'hot': '#ff90ff',
        },
        'accent': {
          'magenta': '#ff5ecd',
          'cyan': '#00e5ff',
          'fuchsia': '#ff9cff',
          'chrome': '#e8e8ff',
        },
        // Backgrounds
        'lab': {
          'background': '#070314',      // Deep violet-navy
          'bg-primary': '#070314',
          'card': '#110627',            // Dark purple haze
          'bg-card': '#110627',
          'surface': '#110627',
          'elevated': '#1a0d3a',        // Richer purple
          'bg-elevated': '#1a0d3a',
          'overlay': 'rgba(7, 3, 20, 0.92)',

          // Legacy cyan/mint (kept for compatibility)
          'cyan': '#00eaff',
          'mint': '#00ff88',
          'alert': '#ff5ecd',           // Now uses neon pink

          // Borders
          'border': 'rgba(255, 156, 255, 0.2)',
          'border-hover': 'rgba(255, 94, 205, 0.5)',

          // Text colors
          'text-primary': '#ffffff',
          'text-clinical': '#ffffff',
          'text-secondary': '#c4b5fd',  // Lavender mist
          'text-muted': '#c4b5fd',
          'text-tertiary': '#8b7fb8',   // Muted purple
          'text-dim': '#8b7fb8',
          'text-chrome': '#f0f0ff',
        },
        // Neuro status bands (neon-ified)
        'band': {
          'braindead': '#8b4bff',       // Deep purple
          'lmn': '#00a8ff',             // Electric blue
          'nonamb': '#00d9c8',          // Teal cyan
          'amb': '#ffaa00',             // Warm orange
          'paresis': '#ffd700',         // Golden yellow
          'bar': '#00ff88',             // Neon green
          'hyper': '#00eaff',           // Bright cyan
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-glow-neon': 'pulse-glow-neon 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-glow': 'fade-in-glow 0.6s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'float-blob': 'float-blob 12s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-sweep': 'shimmer-sweep 2s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'pulse-cyan': 'pulse-cyan 1.5s ease-in-out infinite',
        'data-flicker': 'data-flicker 0.1s ease-in-out',
        'neon-flicker': 'neon-flicker 0.15s infinite',
        'holographic-shimmer': 'holographic-shimmer 3s ease-in-out infinite',
        'light-sweep': 'light-sweep 3s ease-in-out infinite',
        'orb-pulse': 'orb-pulse 4s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 8s ease-in-out infinite',
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
        'pulse-glow-neon': {
          '0%, 100%': {
            filter: 'brightness(1) drop-shadow(0 0 20px currentColor)',
          },
          '50%': {
            filter: 'brightness(1.3) drop-shadow(0 0 30px currentColor)',
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
        'neon-flicker': {
          '0%, 100%': { opacity: '1' },
          '2%': { opacity: '0.9' },
          '4%': { opacity: '1' },
          '8%': { opacity: '0.95' },
          '10%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-glow': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
            filter: 'blur(4px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0)',
          },
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
        'float-blob': {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(-30px, 40px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(30px, -20px) scale(0.9)',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shimmer-sweep': {
          '0%': {
            transform: 'translateX(-100%) skewX(-20deg)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(200%) skewX(-20deg)',
            opacity: '0',
          },
        },
        'light-sweep': {
          '0%': {
            transform: 'translateX(-150%)',
            opacity: '0',
          },
          '10%': {
            opacity: '0.6',
          },
          '50%': {
            opacity: '0.8',
          },
          '90%': {
            opacity: '0.6',
          },
          '100%': {
            transform: 'translateX(150%)',
            opacity: '0',
          },
        },
        'holographic-shimmer': {
          '0%': {
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '50%': {
            filter: 'hue-rotate(10deg)',
          },
          '100%': {
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(0deg)',
          },
        },
        'orb-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.8',
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '1',
          },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 217, 255, 0.5)',
        'glow-md': '0 0 20px rgba(0, 217, 255, 0.6)',
        'glow-lg': '0 0 30px rgba(0, 217, 255, 0.7)',
        'glow-cyan': '0 0 20px rgba(0, 234, 255, 0.6)',
        'glow-mint': '0 0 20px rgba(0, 255, 136, 0.6)',
        'glow-alert': '0 0 20px rgba(255, 94, 205, 0.6)',
        'inner-cyan': 'inset 0 0 10px rgba(0, 234, 255, 0.3)',
        // Neon shadows
        'neon-pink': '0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.4)',
        'neon-purple': '0 0 20px rgba(163, 75, 255, 0.4), 0 0 40px rgba(163, 75, 255, 0.4)',
        'neon-cyan': '0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.4)',
        'neon-hot': '0 0 24px rgba(255, 90, 255, 0.4), 0 0 48px rgba(255, 90, 255, 0.4)',
        // Triple-layer glows
        'triple-pink': '0 0 8px rgba(255, 94, 205, 0.6), 0 0 20px rgba(255, 94, 205, 0.4), 0 0 40px rgba(255, 94, 205, 0.2)',
        'triple-cyan': '0 0 8px rgba(0, 234, 255, 0.6), 0 0 20px rgba(0, 234, 255, 0.4), 0 0 40px rgba(0, 234, 255, 0.2)',
        'triple-purple': '0 0 8px rgba(163, 75, 255, 0.6), 0 0 20px rgba(163, 75, 255, 0.4), 0 0 40px rgba(163, 75, 255, 0.2)',
        // Hero orb
        'hero-orb': '0 0 30px rgba(255, 90, 255, 0.5), 0 0 60px rgba(255, 90, 255, 0.3), 0 0 100px rgba(255, 90, 255, 0.2), inset 0 0 40px rgba(255, 90, 255, 0.15)',
        // Glass panels
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-elevated': '0 12px 48px rgba(0, 0, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
        // Chrome
        'chrome': '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.4), inset 0 -2px 0 rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'sm': '12px',
        'md': '18px',
        'lg': '24px',
        'xl': '32px',
        'pill': '48px',
      },
      borderWidth: {
        'thin': '2px',
        'medium': '3px',
        'fat': '4px',
        'ultra': '6px',
      },
      blur: {
        'light': '8px',
        'medium': '16px',
        'heavy': '24px',
        'extreme': '40px',
      },
    },
  },
  plugins: [],
}
