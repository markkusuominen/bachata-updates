import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // The root directory of the project (where index.html is)
  build: {
    outDir: 'dist',
  },
  publicDir: 'public',
  server: {
    port: 5173,
  },
  // Handle SPA routing properly
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
