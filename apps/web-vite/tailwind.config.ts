import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        auric: '#F4B942',
        vigil: '#FF6B35',
        resonance: '#4ECDC4',
      },
    },
  },
  plugins: [],
} satisfies Config;
