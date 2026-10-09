import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 8740 },
  build: { target: 'safari16', chunkSizeWarningLimit: 8000 },
});
