import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy API + websocket traffic to the backend during local dev so the app
    // can use same-origin relative paths (which is how it runs in production).
    proxy: {
      '/graphql': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true },
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
