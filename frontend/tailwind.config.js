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
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        'strength-black': '#000000',
        'strength-darkred': '#8B0000',
        'strength-red': '#DC2626',
        'strength-orange': '#F59E0B',
        'strength-yellow': '#EAB308',
        'strength-green': '#10B981',
        'strength-blue': '#3B82F6',
        'neuro': {
          'brain-dead': {
            start: '#1f1f1f',
            end: '#4a0e0e',
          },
          'lmn-tetraplegic': {
            start: '#7f1d1d',
            end: '#dc2626',
          },
          'non-ambulatory': {
            start: '#dc2626',
            end: '#f87171',
          },
          'ambulatory-ataxic': {
            start: '#f97316',
            end: '#fbbf24',
          },
          'mild-paresis': {
            start: '#fbbf24',
            end: '#84cc16',
          },
          'bar': {
            start: '#22c55e',
            end: '#10b981',
          },
          'hyperreflexic': {
            start: '#3b82f6',
            end: '#06b6d4',
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
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
          },
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
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.5)',
        'glow-md': '0 0 20px rgba(59, 130, 246, 0.6)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.7)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.6)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.6)',
      },
    },
  },
  plugins: [],
}
