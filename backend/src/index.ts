/// <reference path="./types/express.d.ts" />
import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import { config } from './config/env';
import { configurePassport } from './config/passport';
import { redis } from './config/redis';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/error.middleware';
import { verifyAccessToken } from './utils/jwt';

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import orgRoutes from './routes/org.routes';

const app = express();
const httpServer = http.createServer(app);

// Socket.io
export const io = new SocketServer(httpServer, {
  cors: { origin: config.CLIENT_URL, credentials: true },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const payload = verifyAccessToken(token);
    (socket as any).user = payload;
    socket.join(`org:${payload.orgId}`);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;
  logger.debug(`Socket connected: ${user.userId}`);

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${user.userId}`);
  });
});

// Middleware
app.use(helmet());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many requests' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Passport
configurePassport();
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/org', orgRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: config.NODE_ENV }));

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(config.PORT);

httpServer.listen(PORT, async () => {
  try {
    await redis.connect();
  } catch {
    logger.warn('Redis not available, continuing without cache');
  }
  logger.info(`🚀 Server running on port ${PORT}`);
});

export default app;
