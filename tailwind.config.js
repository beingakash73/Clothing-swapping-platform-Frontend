/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#072b17',
        },
        sage: {
          50: '#f6f7f6',
          100: '#e3e8e4',
          200: '#c8d3ca',
          300: '#a3b6a6',
          400: '#7d9882',
          500: '#5f7c65',
          600: '#4a6350',
          700: '#3c4f41',
          800: '#324036',
          900: '#2a362e',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4efe6',
          200: '#ebdccb',
          300: '#debe9f',
          400: '#ce9c71',
          500: '#b97b4c',
          600: '#9e5e3a',
          700: '#7d472e',
          800: '#643928',
          900: '#523023',
        },
        terracotta: {
          500: '#e05a47',
          600: '#c74431',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'float': '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'glow': '0 0 25px -5px rgba(22, 101, 52, 0.25)',
      }
    },
  },
  plugins: [],
}
