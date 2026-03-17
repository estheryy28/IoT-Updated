// =========================================================================
// Socket.io Client — connects to the backend and subscribes to events
// =========================================================================

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(role: 'admin' | 'driver', vehicleId?: string) {
  if (socket?.connected) return socket;

  socket = io('/', { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
    socket?.emit('join', { role, vehicleId });
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
