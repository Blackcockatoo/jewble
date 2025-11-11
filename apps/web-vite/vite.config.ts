import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@metapet/core': path.resolve(__dirname, '../../packages/core/src'),
    },
  },
});
