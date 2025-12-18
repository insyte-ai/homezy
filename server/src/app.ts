import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, isDevelopment } from './config/env';
import { logger, httpLoggerStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import proRoutes from './routes/pro.routes';
import creditRoutes from './routes/credit.routes';
import chatRoutes from './routes/chat.routes';
import messagingRoutes from './routes/messaging.routes';
import leadRoutes from './routes/lead.routes';
import quoteRoutes, { leadQuoteRouter } from './routes/quote.routes';
import uploadRoutes from './routes/upload.routes';
import adminRoutes from './routes/admin.routes';
import serviceRoutes from './routes/service.routes';
import sitemapRoutes from './routes/sitemap.routes';
import searchRoutes from './routes/search.routes';
import reviewRoutes from './routes/review.routes';
import jobRoutes from './routes/job.routes';
import resourceRoutes from './routes/resource.routes';
import notificationRoutes from './routes/notification.routes';

// Home management routes
import propertyRoutes from './routes/property.routes';
import homeProjectRoutes from './routes/homeProject.routes';
import serviceHistoryRoutes from './routes/serviceHistory.routes';
import serviceReminderRoutes from './routes/serviceReminder.routes';
import expenseRoutes from './routes/expense.routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
  }));

  // CORS configuration - support multiple origins (www and non-www)
  const allowedOrigins = [
    env.CORS_ORIGIN,
    env.CORS_ORIGIN.replace('https://', 'https://www.'),
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Stripe webhook needs raw body for signature verification
  // Must be registered BEFORE JSON body parser middleware
  app.post(
    `/api/${env.API_VERSION}/credits/webhook`,
    express.raw({ type: 'application/json' }),
    async (req, res, next) => {
      // @ts-expect-error - Dynamic import to avoid circular dependency
      const { handleWebhook } = await import('./controllers/credit.controller');
      return handleWebhook(req, res).catch(next);
    }
  );

  // Body parsing middleware (for all other routes)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser(env.COOKIE_SECRET));

  // HTTP request logging
  if (isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', { stream: httpLoggerStream }));
  }

  // Serve static files from uploads directory (for development)
  // Add CORS headers for uploaded files
  app.use('/uploads', (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  app.use('/uploads', express.static('uploads'));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'Homezy API',
      version: env.API_VERSION,
      documentation: '/api/docs',
    });
  });

  // Sitemap and robots.txt routes (served from root)
  app.use(sitemapRoutes);

  // API Routes
  app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
  app.use(`/api/${env.API_VERSION}/users`, userRoutes);
  app.use(`/api/${env.API_VERSION}/pros`, proRoutes);
  app.use(`/api/${env.API_VERSION}/credits`, creditRoutes);
  app.use(`/api/${env.API_VERSION}/chat`, chatRoutes);
  app.use(`/api/${env.API_VERSION}/messages`, messagingRoutes);
  app.use(`/api/${env.API_VERSION}/leads`, leadRoutes);
  app.use(`/api/${env.API_VERSION}/quotes`, quoteRoutes);
  app.use(`/api/${env.API_VERSION}/upload`, uploadRoutes);
  app.use(`/api/${env.API_VERSION}/admin`, adminRoutes);
  app.use(`/api/${env.API_VERSION}/services`, serviceRoutes);
  app.use(`/api/${env.API_VERSION}/search`, searchRoutes);
  app.use(`/api/${env.API_VERSION}/reviews`, reviewRoutes);
  app.use(`/api/${env.API_VERSION}/jobs`, jobRoutes);
  app.use(`/api/${env.API_VERSION}/resources`, resourceRoutes);
  app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);

  // Home management routes
  app.use(`/api/${env.API_VERSION}/properties`, propertyRoutes);
  app.use(`/api/${env.API_VERSION}/home-projects`, homeProjectRoutes);
  app.use(`/api/${env.API_VERSION}/service-history`, serviceHistoryRoutes);
  app.use(`/api/${env.API_VERSION}/service-reminders`, serviceReminderRoutes);
  app.use(`/api/${env.API_VERSION}/expenses`, expenseRoutes);

  // Nested route: /leads/:leadId/quotes
  app.use(`/api/${env.API_VERSION}/leads/:leadId/quotes`, leadQuoteRouter);

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
