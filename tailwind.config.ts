import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        canvas: '#f8fafc',
        accent: '#2563eb',
      },
      boxShadow: {
        soft: '0 20px 45px -15px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
