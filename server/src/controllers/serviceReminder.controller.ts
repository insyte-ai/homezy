import { Request, Response, NextFunction } from 'express';
import * as serviceReminderService from '../services/serviceReminder.service';
import { NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * Create a new service reminder
 * POST /api/service-reminders
 */
export async function createServiceReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const reminder = await serviceReminderService.createServiceReminder(userId, req.body);

    res.status(201).json({
      success: true,
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all reminders for the authenticated user
 * GET /api/service-reminders
 */
export async function getMyReminders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, category, status, limit, offset } = req.query;

    const result = await serviceReminderService.getHomeownerReminders(userId, {
      propertyId: propertyId as string,
      category: category as any,
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      data: {
        reminders: result.reminders,
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
 * Get a reminder by ID
 * GET /api/service-reminders/:id
 */
export async function getServiceReminderById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await serviceReminderService.getServiceReminderById(id, userId);

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get upcoming reminders
 * GET /api/service-reminders/upcoming
 */
export async function getUpcomingReminders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, daysAhead, limit } = req.query;

    const reminders = await serviceReminderService.getUpcomingReminders(userId, {
      propertyId: propertyId as string,
      daysAhead: daysAhead ? parseInt(daysAhead as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: { reminders },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get overdue reminders
 * GET /api/service-reminders/overdue
 */
export async function getOverdueReminders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId, limit } = req.query;

    const reminders = await serviceReminderService.getOverdueReminders(userId, {
      propertyId: propertyId as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      data: { reminders },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a reminder
 * PATCH /api/service-reminders/:id
 */
export async function updateServiceReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await serviceReminderService.updateServiceReminder(id, userId, req.body);

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Snooze a reminder
 * POST /api/service-reminders/:id/snooze
 */
export async function snoozeReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { days } = req.body;

    const reminder = await serviceReminderService.snoozeReminder(id, userId, days);

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
      message: `Reminder snoozed for ${days} days`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Pause a reminder
 * POST /api/service-reminders/:id/pause
 */
export async function pauseReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await serviceReminderService.pauseReminder(id, userId);

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
      message: 'Reminder paused',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Resume a paused reminder
 * POST /api/service-reminders/:id/resume
 */
export async function resumeReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const reminder = await serviceReminderService.resumeReminder(id, userId);

    if (!reminder) {
      throw new NotFoundError('Reminder not found or not paused');
    }

    res.json({
      success: true,
      data: { reminder },
      message: 'Reminder resumed',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark reminder as completed (service done)
 * POST /api/service-reminders/:id/complete
 */
export async function completeReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { serviceDate } = req.body;

    const reminder = await serviceReminderService.completeReminder(
      id,
      userId,
      serviceDate ? new Date(serviceDate) : undefined
    );

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
      message: 'Service marked as completed. Next reminder scheduled.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Convert reminder to quote request
 * POST /api/service-reminders/:id/request-quote
 */
export async function convertToQuote(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { leadId } = req.body;

    const reminder = await serviceReminderService.convertToQuote(id, userId, leadId);

    if (!reminder) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      data: { reminder },
      message: 'Quote request created',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a reminder
 * DELETE /api/service-reminders/:id
 */
export async function deleteServiceReminder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await serviceReminderService.deleteServiceReminder(id, userId);

    if (!deleted) {
      throw new NotFoundError('Reminder not found');
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Sync reminders from service history (manual trigger)
 * POST /api/service-reminders/sync
 */
export async function syncReminders(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { propertyId } = req.body;

    const result = await serviceReminderService.syncRemindersFromServiceHistory(userId, propertyId);

    res.json({
      success: true,
      data: result,
      message: `Created ${result.created} new reminders, updated ${result.updated} existing reminders`,
    });
  } catch (error) {
    next(error);
  }
}
