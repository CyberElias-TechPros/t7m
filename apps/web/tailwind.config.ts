import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // THE SEVENTH MAN palette — from the mood board
        violet: {
          DEFAULT: '#5921b5', // #5921b5
          bright: '#7c3aed',
          electric: '#8b5cf6',
          soft: '#a78bfa',
        },
        void: {
          DEFAULT: '#160238', // #160238
          deep: '#0a0413',
          black: '#06020e',
        },
        ink: {
          DEFAULT: '#f4f1fb',
          soft: '#b9aed4',
          faint: '#8b7ea6',
        },
        line: {
          DEFAULT: 'rgba(167,139,250,0.18)',
          strong: 'rgba(167,139,250,0.4)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(124,58,237,0.45), 0 0 90px rgba(124,58,237,0.2)',
        'glow-sm': '0 0 20px rgba(124,58,237,0.35)',
        card: '0 20px 60px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      backgroundImage: {
        'radial-violet':
          'radial-gradient(circle at 70% 20%, rgba(124,58,237,0.35), transparent 55%), radial-gradient(circle at 10% 90%, rgba(89,33,181,0.25), transparent 50%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
