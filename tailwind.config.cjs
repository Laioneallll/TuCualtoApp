/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#dbe9ff',
          200: '#bfd6ff',
          300: '#94b8ff',
          400: '#648fff',
          500: '#3f69ff',
          600: '#2b4de6',
          700: '#223fba',
          800: '#223996',
          900: '#213379'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.2), 0 8px 30px rgba(2,6,23,0.6)'
      }
    }
  },
  plugins: []
}

