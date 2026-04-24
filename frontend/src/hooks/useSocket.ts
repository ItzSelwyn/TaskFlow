import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';

let socket: Socket | null = null;

export const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const qc = useQueryClient();
  const connected = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || connected.current) return;

    socket = io('/', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => { connected.current = true; });

    socket.on('task:created', () => qc.invalidateQueries({ queryKey: ['tasks'] }));
    socket.on('task:updated', () => qc.invalidateQueries({ queryKey: ['tasks'] }));
    socket.on('task:deleted', () => qc.invalidateQueries({ queryKey: ['tasks'] }));

    socket.on('disconnect', () => { connected.current = false; });

    return () => {
      socket?.disconnect();
      socket = null;
      connected.current = false;
    };
  }, [isAuthenticated, accessToken]);

  return socket;
};

export const emitTaskEvent = (event: string, data?: unknown) => {
  socket?.emit(event, data);
};
