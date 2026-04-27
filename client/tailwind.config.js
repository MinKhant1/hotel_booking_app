/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ink: { 950: '#0c1222', 900: '#121a2e', 800: '#1c2740' },
        sand: { 50: '#faf8f5', 100: '#f0ebe3', 200: '#e3d9cc' },
        accent: { DEFAULT: '#c45c3e', hover: '#a84d33' },
        sea: { DEFAULT: '#2d6a6f', muted: '#3d8a90' },
      },
    },
  },
  plugins: [],
};
