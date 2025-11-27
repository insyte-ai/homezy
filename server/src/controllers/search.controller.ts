import { Request, Response } from 'express';
import { searchAll } from '../services/search.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Search across requests, quotes, and professionals
 * GET /api/v1/search?q=<query>&limit=5
 */
export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, limit = '5' } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters',
    });
  }

  const userId = req.user!._id.toString();
  const parsedLimit = Math.min(parseInt(limit as string, 10) || 5, 10);

  const results = await searchAll(q.trim(), userId, parsedLimit);

  res.json({
    success: true,
    data: results,
  });
});
