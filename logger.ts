import winston from 'winston';
import * as Sentry from '@sentry/node';
import { register, Counter, Histogram } from 'prom-client';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'perena-dashboard' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Prometheus metrics
export const metrics = {
  rpcRequests: new Counter({
    name: 'solana_rpc_requests_total',
    help: 'Total number of Solana RPC requests',
    labelNames: ['endpoint', 'method'],
  }),
  rpcLatency: new Histogram({
    name: 'solana_rpc_latency_seconds',
    help: 'Solana RPC request latency in seconds',
    labelNames: ['endpoint', 'method'],
  }),
  dataUpdateErrors: new Counter({
    name: 'data_update_errors_total',
    help: 'Total number of data update errors',
    labelNames: ['type'],
  }),
};

// Error handling wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    logger.error(`Error in ${context}:`, error);
    Sentry.captureException(error);
    throw error;
  }
};

export { logger, Sentry }; 