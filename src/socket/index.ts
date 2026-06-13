import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://smartbin-mu9a.onrender.com';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[SmartBin] Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('[SmartBin] Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const onEvent = (event: string, callback: (...args: unknown[]) => void): void => {
  socket?.on(event, callback);
};

export const offEvent = (event: string, callback?: (...args: unknown[]) => void): void => {
  socket?.off(event, callback);
};

export const emitEvent = (event: string, data: unknown): void => {
  socket?.emit(event, data);
};
