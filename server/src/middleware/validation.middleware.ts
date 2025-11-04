import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request body, query, or params using Zod schemas
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the specified source
      const data = req[source];
      const validated = schema.parse(data);

      // Replace the source with validated data
      req[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: errors,
        });
        return;
      }

      logger.error('Validation middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed',
      });
    }
  };
};

/**
 * Validate multiple sources at once
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: any[] = [];

      // Validate body
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                source: 'body',
                field: err.path.join('.'),
                message: err.message,
              }))
            );
          }
        }
      }

      // Validate query
      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                source: 'query',
                field: err.path.join('.'),
                message: err.message,
              }))
            );
          }
        }
      }

      // Validate params
      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof ZodError) {
            errors.push(
              ...error.errors.map((err) => ({
                source: 'params',
                field: err.path.join('.'),
                message: err.message,
              }))
            );
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Multi-validation middleware error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Validation failed',
      });
    }
  };
};

export default {
  validate,
  validateMultiple,
};
