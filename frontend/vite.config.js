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
});
