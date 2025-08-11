import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // ✅ Ensures relative asset paths for Electron (file://)
  plugins: [react()],
  build: {
    outDir: 'dist',       // ✅ Ensure Vite outputs to 'dist' (Electron expects this)
    emptyOutDir: true,    // 🔁 Optional: Clears 'dist' before each build
  },
});
