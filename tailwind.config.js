/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2b7cee',
        'primary-dark': '#1a5bb8',
        'background-light': '#f6f7f8',
        'background-dark': '#101822',
        'surface-light': '#ffffff',
        'surface-dark': '#1e293b',
        'line-red': '#ef4444',
        'line-green': '#22c55e',
        'line-blue': '#3b82f6',
        'line-yellow': '#eab308',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
