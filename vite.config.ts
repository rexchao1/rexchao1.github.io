import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `vite build` makes one self-contained index.html (scripts, styles and images inlined) for the preview artifact.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: { port: 8740 },
  build: { target: 'safari16', chunkSizeWarningLimit: 8000, assetsInlineLimit: 100_000_000 },
});
