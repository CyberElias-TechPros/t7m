import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16151a',
          soft: '#4a4752',
          faint: '#8b8794',
        },
        paper: '#f7f5f2',
        card: '#ffffff',
        line: '#e7e3dc',
        accent: {
          DEFAULT: '#2f5d50',
          dark: '#234539',
          soft: '#e4eeea',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,21,26,0.05), 0 8px 30px rgba(22,21,26,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
