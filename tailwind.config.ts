import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lumyn: {
          50: '#f7f7fb',
          100: '#ececf5',
          300: '#a89bfd',
          400: '#8a7bfd',
          500: '#6d5dfc',
          700: '#4535c7',
          950: '#11101d'
        },
        surface: {
          100: '#1c1a2e',
          200: '#161428',
          300: '#100f20',
          400: '#0b0a18',
          500: '#070610',
          card: '#201e3a',
          border: '#2f2b52',
          hover: '#28254a'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 16, 29, 0.08)',
        'glow-sm': '0 0 12px rgba(109, 93, 252, 0.25)',
        'glow-md': '0 0 24px rgba(109, 93, 252, 0.3)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out'
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
