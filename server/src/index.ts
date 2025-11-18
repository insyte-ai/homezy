import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { redisClient, sessionRedis, rateLimitRedis } from './config/redis';
import { logger } from './utils/logger';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupChatSockets } from './sockets/chat.socket';
import { setupMessagingSockets } from './sockets/messaging.socket';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Wait for Redis connections to be ready
    await Promise.all([
      redisClient.ping(),
      sessionRedis.ping(),
      rateLimitRedis.ping(),
    ]);
    logger.info('All Redis connections established');

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Set up chat sockets (AI streaming, function calling, real-time chat)
    setupChatSockets(io);

    // Set up messaging sockets (user-to-user messaging)
    setupMessagingSockets(io);

    // Make io accessible to routes
    app.set('io', io);

    // Start listening
    server.listen(env.PORT, () => {
      logger.info(`Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        apiVersion: env.API_VERSION,
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connections
          await Promise.all([
            redisClient.quit(),
            sessionRedis.quit(),
            rateLimitRedis.quit(),
          ]);
          logger.info('Redis connections closed');

          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Promise Rejection:', reason);
      throw reason;
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
