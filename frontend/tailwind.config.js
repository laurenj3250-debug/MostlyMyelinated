/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'strength-black': '#000000',
        'strength-darkred': '#8B0000',
        'strength-red': '#DC2626',
        'strength-orange': '#F59E0B',
        'strength-yellow': '#EAB308',
        'strength-green': '#10B981',
        'strength-blue': '#3B82F6',
      },
    },
  },
  plugins: [],
}
