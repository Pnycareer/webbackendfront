import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // ✅ Correct for web deployment
  plugins: [react()],
  build: {
    outDir: 'dist',    // Default Vite output dir
    emptyOutDir: true, // Clears 'dist' before each build
  },
});
