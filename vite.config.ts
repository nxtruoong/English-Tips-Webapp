import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the build works at any URL path (root, GitHub Pages sub-path, file share).
// The app routes with location.hash, so the page itself is always index.html.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
