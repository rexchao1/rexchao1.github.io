// The site reuses Animus's scene and Wren straight from the local Animus checkout (alias `@`, which is what
// Animus's own imports use). node_modules is a symlink to Animus's, so there is one copy of three and React.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ANIMUS = '/Users/rexchao/Projects/Animus/src';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': ANIMUS }, dedupe: ['three', 'react', 'react-dom', '@react-three/fiber'] },
  server: { port: 8740, fs: { allow: ['..', '/Users/rexchao/Projects/Animus'] } },
  build: { target: 'safari16', chunkSizeWarningLimit: 8000 },
});
