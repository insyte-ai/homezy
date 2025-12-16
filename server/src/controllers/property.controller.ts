import { Request, Response, NextFunction } from 'express';
import * as propertyService from '../services/property.service';
import { BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler.middleware';

/**
 * Create a new property
 * POST /api/properties
 */
export async function createProperty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const property = await propertyService.createProperty(userId, req.body);

    res.status(201).json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all properties for the authenticated user
 * GET /api/properties
 */
export async function getMyProperties(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { limit, offset } = req.query;

    const result = await propertyService.getHomeownerProperties(userId, {
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        properties: result.properties,
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
 * Get a property by ID
 * GET /api/properties/:id
 */
export async function getPropertyById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await propertyService.getPropertyById(id);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Check ownership
    if (property.homeownerId !== userId) {
      throw new ForbiddenError('You do not have access to this property');
    }

    res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a property
 * PATCH /api/properties/:id
 */
export async function updateProperty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await propertyService.updateProperty(id, userId, req.body);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a property
 * DELETE /api/properties/:id
 */
export async function deleteProperty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await propertyService.deleteProperty(id, userId);

    if (!deleted) {
      throw new NotFoundError('Property not found');
    }

    res.json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add a room to a property
 * POST /api/properties/:id/rooms
 */
export async function addRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await propertyService.addRoom(id, userId, req.body);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    res.status(201).json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a room in a property
 * PATCH /api/properties/:id/rooms/:roomId
 */
export async function updateRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, roomId } = req.params;

    const property = await propertyService.updateRoom(id, userId, roomId, req.body);

    if (!property) {
      throw new NotFoundError('Property or room not found');
    }

    res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a room from a property
 * DELETE /api/properties/:id/rooms/:roomId
 */
export async function deleteRoom(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id, roomId } = req.params;

    const property = await propertyService.deleteRoom(id, userId, roomId);

    if (!property) {
      throw new NotFoundError('Property or room not found');
    }

    res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Set a property as primary
 * POST /api/properties/:id/set-primary
 */
export async function setPrimaryProperty(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const property = await propertyService.setPrimaryProperty(id, userId);

    if (!property) {
      throw new NotFoundError('Property not found');
    }

    res.json({
      success: true,
      data: {
        property,
      },
    });
  } catch (error) {
    next(error);
  }
}
