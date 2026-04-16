import { io } from 'socket.io-client';

// Connect to the backend Socket.io server via Vite proxy
// In dev: Vite proxies /socket.io to localhost:5001
// In prod: same origin
const socket = io('http://localhost:5001', {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 10000,
});

socket.on('connect', () => {
  console.log('📡 Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.warn('⚠️ Socket connection error:', error.message);
});

export default socket;
