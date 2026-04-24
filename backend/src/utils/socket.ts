import { io } from '../index';

export const emitToOrg = (orgId: string, event: string, data: any) => {
  io.to(`org:${orgId}`).emit(event, data);
};

export const broadcastToAll = (event: string, data: any) => {
  io.emit(event, data);
};
