import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy target. Defaults to a local backend; set VITE_PROXY_TARGET to point
// at a remote (e.g. the Render backend) to preview against live data — the
// browser only ever talks to the same-origin dev server, so there's no CORS.
const PROXY_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API + websocket traffic to the backend during local dev so the app
    // can use same-origin relative paths (which is how it runs in production).
    proxy: {
      '/graphql': { target: PROXY_TARGET, changeOrigin: true },
      '/socket.io': { target: PROXY_TARGET, changeOrigin: true, ws: true },
    },
  },
  build: {
    // Split heavy libraries into their own chunks so the browser can cache them
    // independently of app code (they rarely change between deploys).
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          apollo: ['@apollo/client', 'graphql'],
        },
      },
    },
  },
});
