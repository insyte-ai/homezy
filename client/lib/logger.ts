/**
 * Frontend Logger Utility
 * Logs errors, API failures, and user actions
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log message with timestamp and context
   */
  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatLog('info', message, context));
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatLog('warn', message, context));
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorContext = {
      ...context,
      ...(error && {
        errorMessage: error.message || error,
        errorStack: error.stack,
        errorName: error.name,
      }),
    };

    console.error(this.formatLog('error', message, errorContext));

    // In production, you could send this to a logging service like Sentry
    // this.sendToRemoteLogger('error', message, errorContext);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatLog('debug', message, context));
    }
  }

  /**
   * Log API error with details
   */
  apiError(endpoint: string, error: any, requestData?: any): void {
    const context: LogContext = {
      endpoint,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      requestData,
      responseData: error.response?.data,
      errorMessage: error.message,
    };

    this.error(`API Error: ${endpoint}`, error, context);
  }

  /**
   * Log user action for analytics
   */
  userAction(action: string, details?: LogContext): void {
    this.info(`User Action: ${action}`, details);

    // In production, you could send this to analytics service
    // this.sendToAnalytics(action, details);
  }

  /**
   * Log validation error
   */
  validationError(field: string, message: string, context?: LogContext): void {
    this.warn(`Validation Error: ${field}`, {
      field,
      message,
      ...context,
    });
  }

  /**
   * Log authentication event
   */
  authEvent(event: 'login' | 'logout' | 'register' | 'token_refresh', details?: LogContext): void {
    this.info(`Auth Event: ${event}`, details);
  }

  /**
   * Send to remote logging service (placeholder for production)
   */
  private sendToRemoteLogger(level: LogLevel, message: string, context?: LogContext): void {
    // TODO: Implement remote logging service integration
    // Example: Sentry, LogRocket, Datadog, etc.
  }

  /**
   * Send to analytics service (placeholder for production)
   */
  private sendToAnalytics(action: string, details?: LogContext): void {
    // TODO: Implement analytics service integration
    // Example: Google Analytics, Mixpanel, Segment, etc.
  }
}

// Export singleton instance
export const logger = new Logger();
