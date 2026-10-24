/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Netral kebiruan gelap (latar, kartu, teks)
        ink: {
          50: '#f6f7fb',
          100: '#eceef5',
          200: '#d2d5e1',
          300: '#b0b4c6',
          400: '#8a8fa6',
          500: '#646a82',
          600: '#3a3e52',
          700: '#2b2e3f',
          800: '#232634',
          850: '#1e212d',
          900: '#181a23',
          950: '#0e0f15',
        },
        // Aksen utama (indigo)
        iris: {
          50: '#f0f0ff',
          100: '#e1e1fe',
          200: '#c5c6fd',
          300: '#8f90f8',
          400: '#6f6ef2',
          500: '#5a55e4',
          600: '#4a44c8',
          700: '#3c37a3',
          800: '#322f80',
          900: '#2b2a66',
        },
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(0, 0, 0, 0.5)',
        pop: '0 20px 50px -12px rgba(0, 0, 0, 0.65)',
        glow: '0 0 0 1px rgba(111, 110, 242, 0.3), 0 8px 24px -8px rgba(90, 85, 228, 0.55)',
      },
    },
  },
  plugins: [],
};
