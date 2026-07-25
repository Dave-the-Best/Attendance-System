import { io } from 'socket.io-client';

// In production the frontend is served from the backend (same origin), so we
// connect to the current origin by default. Set VITE_API_URL to override when
// the API is hosted separately. In local dev, Vite proxies /socket.io to the
// backend (see vite.config.js).
const API_URL = import.meta.env.VITE_API_URL || undefined;

let socket = null;

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (socket) socket.disconnect();
  socket = io(API_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};
