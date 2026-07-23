import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lumyn: {
          50: '#f7f7fb',
          100: '#ececf5',
          500: '#6d5dfc',
          700: '#4535c7',
          950: '#11101d'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 16, 29, 0.08)'
      }
    },
  },
  plugins: [],
} satisfies Config;
