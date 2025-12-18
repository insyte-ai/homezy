import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger';

let io: SocketIOServer | null = null;

/**
 * Store the Socket.io instance for use across the application
 */
export const setIO = (socketIO: SocketIOServer): void => {
  io = socketIO;
  logger.info('Socket.io instance stored');
};

/**
 * Get the Socket.io instance
 * @throws Error if io has not been initialized
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};

/**
 * Emit an event to a specific user's room
 * Uses the /messaging namespace where users join their personal rooms
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  try {
    const socketIO = getIO();
    const room = `user:${userId}`;
    const socketsInRoom = socketIO.of('/messaging').adapter.rooms.get(room);
    logger.info('Emitting event to user', {
      userId,
      event,
      room,
      socketsInRoom: socketsInRoom ? socketsInRoom.size : 0
    });
    socketIO.of('/messaging').to(room).emit(event, data);
  } catch (error) {
    logger.error('Failed to emit to user', { userId, event, error });
  }
};

/**
 * Emit an event to multiple users
 */
export const emitToUsers = (userIds: string[], event: string, data: any): void => {
  userIds.forEach((userId) => {
    emitToUser(userId, event, data);
  });
};
