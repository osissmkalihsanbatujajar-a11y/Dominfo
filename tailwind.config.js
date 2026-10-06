/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        ink: {
          950: '#0d0e14', 900: '#13141b', 850: '#181a23', 800: '#1e202b', 700: '#2a2d3b',
          600: '#3a3e52', 500: '#555a75', 400: '#80859f', 300: '#a9adc4', 200: '#cfd2e2', 100: '#e9eaf3',
        },
        iris: { 300: '#b4b6fb', 400: '#8f90f8', 500: '#6f6ef2', 600: '#5a55e4' },
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(0,0,0,.55)',
        pop: '0 24px 60px -20px rgba(0,0,0,.75)',
        glow: '0 6px 20px -8px rgba(111,110,242,.7)',
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
};
