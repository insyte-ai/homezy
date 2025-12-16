import { Request, Response, NextFunction } from 'express';
import * as serviceHistoryService from '../services/serviceHistory.service';
import { NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * Create a new service history entry
 * POST /api/service-history
 */
export async function createServiceHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const serviceHistory = await serviceHistoryService.createServiceHistory(userId, req.body);

    res.status(201).json({
      success: true,
      data: { serviceHistory },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all service history for the authenticated user
 * GET /api/service-history
 */
export async function getMyServiceHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, category, serviceType, providerType, startDate, endDate, limit, offset } = req.query;

    const result = await serviceHistoryService.getHomeownerServiceHistory(userId, {
      propertyId: propertyId as string,
      category: category as any,
      serviceType: serviceType as any,
      providerType: providerType as 'homezy' | 'external',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        services: result.services,
        total: result.total,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a service history entry by ID
 * GET /api/service-history/:id
 */
export async function getServiceHistoryById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const serviceHistory = await serviceHistoryService.getServiceHistoryById(id, userId);

    if (!serviceHistory) {
      throw new NotFoundError('Service history entry not found');
    }

    res.json({
      success: true,
      data: { serviceHistory },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get service timeline (grouped by month)
 * GET /api/service-history/timeline
 */
export async function getServiceTimeline(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, year } = req.query;

    const timeline = await serviceHistoryService.getServiceTimeline(userId, {
      propertyId: propertyId as string,
      year: year ? parseInt(year as string) : undefined,
    });

    res.json({
      success: true,
      data: { timeline },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get service history grouped by category
 * GET /api/service-history/by-category
 */
export async function getServicesByCategory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, year } = req.query;

    const categories = await serviceHistoryService.getServicesByCategory(userId, {
      propertyId: propertyId as string,
      year: year ? parseInt(year as string) : undefined,
    });

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a service history entry
 * PATCH /api/service-history/:id
 */
export async function updateServiceHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const serviceHistory = await serviceHistoryService.updateServiceHistory(id, userId, req.body);

    if (!serviceHistory) {
      throw new NotFoundError('Service history entry not found');
    }

    res.json({
      success: true,
      data: { serviceHistory },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a service history entry
 * DELETE /api/service-history/:id
 */
export async function deleteServiceHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await serviceHistoryService.deleteServiceHistory(id, userId);

    if (!deleted) {
      throw new NotFoundError('Service history entry not found');
    }

    res.json({
      success: true,
      message: 'Service history entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
