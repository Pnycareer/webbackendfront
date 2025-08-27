import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // ✅ Correct for web deployment
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Default Vite output dir
    emptyOutDir: true, // Clears 'dist' before each build
  },
});
