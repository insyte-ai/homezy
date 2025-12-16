// @ts-nocheck - Temporary: disable type checking for initial implementation
import { ServiceReminder, IServiceReminder } from '../models/ServiceReminder.model';
import * as serviceHistoryService from './serviceHistory.service';
import mongoose from 'mongoose';
import type {
  CreateServiceReminderInput,
  UpdateServiceReminderInput,
  HomeServiceCategory,
  ReminderFrequency,
} from '@homezy/shared';
import { DEFAULT_SERVICE_FREQUENCIES } from '@homezy/shared';

/**
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(lastServiceDate: Date, frequency: ReminderFrequency, customIntervalDays?: number): Date {
  const nextDate = new Date(lastServiceDate);

  switch (frequency) {
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'biannual':
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case 'annual':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      if (customIntervalDays) {
        nextDate.setDate(nextDate.getDate() + customIntervalDays);
      }
      break;
  }

  return nextDate;
}

/**
 * Determine frequency from average days between services
 */
function determineFrequencyFromPattern(avgDays: number): ReminderFrequency {
  if (avgDays <= 45) return 'monthly';
  if (avgDays <= 120) return 'quarterly';
  if (avgDays <= 270) return 'biannual';
  return 'annual';
}

/**
 * Create a new service reminder
 */
export async function createServiceReminder(
  homeownerId: string,
  input: CreateServiceReminderInput
): Promise<IServiceReminder> {
  // Calculate next due date
  let nextDueDate: Date;
  if (input.nextDueDate) {
    nextDueDate = input.nextDueDate;
  } else if (input.lastServiceDate) {
    nextDueDate = calculateNextDueDate(
      input.lastServiceDate,
      input.frequency,
      input.customIntervalDays
    );
  } else {
    // Default to calculating from today
    nextDueDate = calculateNextDueDate(new Date(), input.frequency, input.customIntervalDays);
  }

  const reminder = new ServiceReminder({
    homeownerId,
    propertyId: input.propertyId,
    category: input.category,
    title: input.title,
    description: input.description,
    triggerType: input.triggerType || 'custom',
    frequency: input.frequency,
    customIntervalDays: input.customIntervalDays,
    lastServiceDate: input.lastServiceDate,
    nextDueDate,
    reminderLeadDays: input.reminderLeadDays || [30, 7, 1],
    status: 'active',
  });

  await reminder.save();
  return reminder;
}

/**
 * Get a reminder by ID
 */
export async function getServiceReminderById(
  reminderId: string,
  homeownerId: string
): Promise<IServiceReminder | null> {
  if (!mongoose.Types.ObjectId.isValid(reminderId)) {
    return null;
  }
  return ServiceReminder.findOne({ _id: reminderId, homeownerId });
}

/**
 * Get all reminders for a homeowner
 */
export async function getHomeownerReminders(
  homeownerId: string,
  options: {
    propertyId?: string;
    category?: HomeServiceCategory;
    status?: 'active' | 'snoozed' | 'paused' | 'converted-to-quote';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ reminders: IServiceReminder[]; total: number }> {
  const query: any = { homeownerId };

  if (options.propertyId) query.propertyId = options.propertyId;
  if (options.category) query.category = options.category;
  if (options.status) query.status = options.status;

  const [reminders, total] = await Promise.all([
    ServiceReminder.find(query)
      .sort({ nextDueDate: 1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    ServiceReminder.countDocuments(query),
  ]);

  return { reminders, total };
}

/**
 * Get upcoming reminders (due within specified days)
 */
export async function getUpcomingReminders(
  homeownerId: string,
  options: {
    propertyId?: string;
    daysAhead?: number;
    limit?: number;
  } = {}
): Promise<IServiceReminder[]> {
  const daysAhead = options.daysAhead || 30;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const query: any = {
    homeownerId,
    status: { $in: ['active', 'snoozed'] },
    nextDueDate: { $lte: futureDate },
  };

  // Include snoozed reminders that are past snooze date
  query.$or = [
    { status: 'active' },
    { status: 'snoozed', snoozeUntil: { $lte: new Date() } },
  ];

  if (options.propertyId) query.propertyId = options.propertyId;

  return ServiceReminder.find(query)
    .sort({ nextDueDate: 1 })
    .limit(options.limit || 10);
}

/**
 * Get overdue reminders
 */
export async function getOverdueReminders(
  homeownerId: string,
  options: {
    propertyId?: string;
    limit?: number;
  } = {}
): Promise<IServiceReminder[]> {
  const query: any = {
    homeownerId,
    status: { $in: ['active', 'snoozed'] },
    nextDueDate: { $lt: new Date() },
  };

  if (options.propertyId) query.propertyId = options.propertyId;

  return ServiceReminder.find(query)
    .sort({ nextDueDate: 1 })
    .limit(options.limit || 10);
}

/**
 * Update a reminder
 */
export async function updateServiceReminder(
  reminderId: string,
  homeownerId: string,
  input: UpdateServiceReminderInput
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder) {
    return null;
  }

  if (input.title !== undefined) reminder.title = input.title;
  if (input.description !== undefined) reminder.description = input.description;
  if (input.frequency !== undefined) reminder.frequency = input.frequency as any;
  if (input.customIntervalDays !== undefined) reminder.customIntervalDays = input.customIntervalDays;
  if (input.reminderLeadDays !== undefined) reminder.reminderLeadDays = input.reminderLeadDays;
  if (input.nextDueDate !== undefined) reminder.nextDueDate = input.nextDueDate;

  // Recalculate next due date if frequency changed
  if (input.frequency && reminder.lastServiceDate) {
    reminder.nextDueDate = calculateNextDueDate(
      reminder.lastServiceDate,
      input.frequency as ReminderFrequency,
      input.customIntervalDays || reminder.customIntervalDays
    );
  }

  await reminder.save();
  return reminder;
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  reminderId: string,
  homeownerId: string,
  snoozeDays: number
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder) {
    return null;
  }

  const snoozeUntil = new Date();
  snoozeUntil.setDate(snoozeUntil.getDate() + snoozeDays);

  reminder.status = 'snoozed';
  reminder.snoozeUntil = snoozeUntil;
  await reminder.save();
  return reminder;
}

/**
 * Pause a reminder
 */
export async function pauseReminder(
  reminderId: string,
  homeownerId: string
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder) {
    return null;
  }

  reminder.status = 'paused';
  await reminder.save();
  return reminder;
}

/**
 * Resume a paused reminder
 */
export async function resumeReminder(
  reminderId: string,
  homeownerId: string
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder || reminder.status !== 'paused') {
    return null;
  }

  reminder.status = 'active';
  await reminder.save();
  return reminder;
}

/**
 * Mark reminder as completed (service done) - advances to next due date
 */
export async function completeReminder(
  reminderId: string,
  homeownerId: string,
  serviceDate?: Date
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder) {
    return null;
  }

  const completionDate = serviceDate || new Date();
  reminder.lastServiceDate = completionDate;
  reminder.nextDueDate = calculateNextDueDate(
    completionDate,
    reminder.frequency as ReminderFrequency,
    reminder.customIntervalDays
  );
  reminder.status = 'active';
  reminder.snoozeUntil = undefined;
  reminder.remindersSent = [];
  await reminder.save();
  return reminder;
}

/**
 * Convert reminder to quote request
 */
export async function convertToQuote(
  reminderId: string,
  homeownerId: string,
  leadId: string
): Promise<IServiceReminder | null> {
  const reminder = await ServiceReminder.findOne({ _id: reminderId, homeownerId });

  if (!reminder) {
    return null;
  }

  reminder.status = 'converted-to-quote';
  reminder.leadId = leadId;
  await reminder.save();
  return reminder;
}

/**
 * Delete a reminder
 */
export async function deleteServiceReminder(
  reminderId: string,
  homeownerId: string
): Promise<boolean> {
  const result = await ServiceReminder.deleteOne({ _id: reminderId, homeownerId });
  return result.deletedCount > 0;
}

/**
 * Create or update reminders based on service history patterns
 * This is called by the pattern analysis job
 */
export async function syncRemindersFromServiceHistory(
  homeownerId: string,
  propertyId?: string
): Promise<{ created: number; updated: number }> {
  const categories = Object.keys(DEFAULT_SERVICE_FREQUENCIES) as HomeServiceCategory[];
  let created = 0;
  let updated = 0;

  for (const category of categories) {
    // Get service pattern for this category
    const pattern = await serviceHistoryService.detectServicePattern(
      homeownerId,
      category,
      propertyId
    );

    // Need at least 2 services to detect a pattern
    if (pattern.serviceCount < 2 || !pattern.frequencyDays) {
      continue;
    }

    // Get the last service for this category
    const lastService = await serviceHistoryService.getLastServiceByCategory(
      homeownerId,
      category,
      propertyId
    );

    if (!lastService) continue;

    // Check if reminder already exists for this category/property
    const existingReminder = await ServiceReminder.findOne({
      homeownerId,
      category,
      propertyId: propertyId || { $exists: false },
      triggerType: 'pattern-based',
    });

    const frequency = determineFrequencyFromPattern(pattern.frequencyDays);
    const nextDueDate = calculateNextDueDate(lastService.completedAt, frequency);

    if (existingReminder) {
      // Update existing reminder
      existingReminder.lastServiceDate = lastService.completedAt;
      existingReminder.frequency = frequency;
      existingReminder.nextDueDate = nextDueDate;
      await existingReminder.save();
      updated++;
    } else {
      // Create new reminder
      await ServiceReminder.create({
        homeownerId,
        propertyId,
        category,
        title: `${category} Service`,
        description: `Based on your service history, it's time for your ${frequency} ${category.toLowerCase()} service.`,
        triggerType: 'pattern-based',
        frequency,
        lastServiceDate: lastService.completedAt,
        nextDueDate,
        reminderLeadDays: [30, 7, 1],
        status: 'active',
      });
      created++;
    }
  }

  return { created, updated };
}

/**
 * Create seasonal reminders for UAE
 * This is called by the seasonal reminder job
 */
export async function createSeasonalReminders(
  homeownerId: string,
  propertyId?: string,
  month?: number
): Promise<number> {
  const currentMonth = month ?? new Date().getMonth() + 1;
  let created = 0;

  // UAE seasonal maintenance suggestions
  const seasonalReminders: Record<number, { category: HomeServiceCategory; title: string; description: string }[]> = {
    // March-April: Pre-summer prep
    3: [
      {
        category: 'hvac',
        title: 'Pre-Summer AC Checkup',
        description: 'Summer is coming! Schedule your AC maintenance before the heat hits.',
      },
    ],
    4: [
      {
        category: 'hvac',
        title: 'AC Service Reminder',
        description: 'Get your AC serviced before summer temperatures peak.',
      },
    ],
    // September-October: Post-summer
    9: [
      {
        category: 'hvac',
        title: 'Post-Summer AC Service',
        description: 'Your AC worked hard this summer. Time for a service check.',
      },
    ],
    // November-December: Water heater season
    11: [
      {
        category: 'plumbing',
        title: 'Water Heater Check',
        description: 'Winter is approaching. Make sure your water heater is working properly.',
      },
    ],
  };

  const remindersForMonth = seasonalReminders[currentMonth];
  if (!remindersForMonth) return 0;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  for (const reminder of remindersForMonth) {
    // Check if similar reminder already exists
    const existing = await ServiceReminder.findOne({
      homeownerId,
      category: reminder.category,
      triggerType: 'seasonal',
      nextDueDate: {
        $gte: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
        $lt: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1),
      },
    });

    if (!existing) {
      await ServiceReminder.create({
        homeownerId,
        propertyId,
        category: reminder.category,
        title: reminder.title,
        description: reminder.description,
        triggerType: 'seasonal',
        frequency: 'annual',
        nextDueDate: nextMonth,
        reminderLeadDays: [14, 7, 1],
        status: 'active',
      });
      created++;
    }
  }

  return created;
}

/**
 * Record that a reminder notification was sent
 */
export async function recordReminderSent(
  reminderId: string,
  channel: 'email' | 'push' | 'sms',
  daysBeforeDue: number
): Promise<void> {
  await ServiceReminder.findByIdAndUpdate(reminderId, {
    $push: {
      remindersSent: {
        sentAt: new Date(),
        channel,
        daysBeforeDue,
      },
    },
  });
}

/**
 * Get reminders that need notifications sent
 */
export async function getRemindersNeedingNotification(
  daysBeforeDue: number
): Promise<IServiceReminder[]> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBeforeDue);

  // Find reminders due on the target date that haven't been notified for this lead time
  return ServiceReminder.find({
    status: 'active',
    nextDueDate: {
      $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
      $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
    },
    reminderLeadDays: daysBeforeDue,
    'remindersSent.daysBeforeDue': { $ne: daysBeforeDue },
  }).populate('homeownerId', 'email firstName lastName');
}
