// @ts-nocheck - Temporary: disable type checking for initial implementation
import { ServiceHistory, IServiceHistory } from '../models/ServiceHistory.model';
import mongoose from 'mongoose';
import type {
  CreateServiceHistoryInput,
  UpdateServiceHistoryInput,
  HomeServiceCategory,
  HomeServiceType,
} from '@homezy/shared';

/**
 * Create a new service history entry
 */
export async function createServiceHistory(
  homeownerId: string,
  input: CreateServiceHistoryInput
): Promise<IServiceHistory> {
  const serviceHistory = new ServiceHistory({
    homeownerId,
    propertyId: input.propertyId,
    homeProjectId: input.homeProjectId,
    projectId: input.projectId,
    quoteId: input.quoteId,
    title: input.title,
    description: input.description,
    category: input.category,
    serviceType: input.serviceType,
    providerType: input.providerType,
    providerName: input.providerName,
    professionalId: input.professionalId,
    cost: input.cost,
    currency: 'AED',
    completedAt: input.completedAt || new Date(),
    documents: input.documents || [],
    photos: input.photos || [],
    rating: input.rating,
    notes: input.notes,
  });

  await serviceHistory.save();
  return serviceHistory;
}

/**
 * Get a service history entry by ID
 */
export async function getServiceHistoryById(
  serviceHistoryId: string,
  homeownerId: string
): Promise<IServiceHistory | null> {
  if (!mongoose.Types.ObjectId.isValid(serviceHistoryId)) {
    return null;
  }
  return ServiceHistory.findOne({ _id: serviceHistoryId, homeownerId });
}

/**
 * Get all service history for a homeowner
 */
export async function getHomeownerServiceHistory(
  homeownerId: string,
  options: {
    propertyId?: string;
    category?: HomeServiceCategory;
    serviceType?: HomeServiceType;
    providerType?: 'homezy' | 'external';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ services: IServiceHistory[]; total: number }> {
  const query: any = { homeownerId };

  if (options.propertyId) query.propertyId = options.propertyId;
  if (options.category) query.category = options.category;
  if (options.serviceType) query.serviceType = options.serviceType;
  if (options.providerType) query.providerType = options.providerType;
  if (options.startDate || options.endDate) {
    query.completedAt = {};
    if (options.startDate) query.completedAt.$gte = options.startDate;
    if (options.endDate) query.completedAt.$lte = options.endDate;
  }

  const [services, total] = await Promise.all([
    ServiceHistory.find(query)
      .sort({ completedAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    ServiceHistory.countDocuments(query),
  ]);

  return { services, total };
}

/**
 * Get service history timeline (grouped by month)
 */
export async function getServiceTimeline(
  homeownerId: string,
  options: {
    propertyId?: string;
    year?: number;
  } = {}
): Promise<{ month: string; year: number; services: IServiceHistory[] }[]> {
  const query: any = { homeownerId };

  if (options.propertyId) query.propertyId = options.propertyId;
  if (options.year) {
    query.completedAt = {
      $gte: new Date(options.year, 0, 1),
      $lt: new Date(options.year + 1, 0, 1),
    };
  }

  const services = await ServiceHistory.find(query).sort({ completedAt: -1 });

  // Group by month
  const timeline: Map<string, IServiceHistory[]> = new Map();

  for (const service of services) {
    const date = new Date(service.completedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!timeline.has(key)) {
      timeline.set(key, []);
    }
    timeline.get(key)!.push(service);
  }

  return Array.from(timeline.entries()).map(([key, services]) => {
    const [year, month] = key.split('-');
    return {
      month: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
      year: parseInt(year),
      services,
    };
  });
}

/**
 * Get service history by category (for analytics)
 */
export async function getServicesByCategory(
  homeownerId: string,
  options: {
    propertyId?: string;
    year?: number;
  } = {}
): Promise<{ category: string; count: number; totalCost: number }[]> {
  const match: any = { homeownerId };

  if (options.propertyId) match.propertyId = options.propertyId;
  if (options.year) {
    match.completedAt = {
      $gte: new Date(options.year, 0, 1),
      $lt: new Date(options.year + 1, 0, 1),
    };
  }

  const result = await ServiceHistory.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' },
      },
    },
    { $sort: { totalCost: -1 } },
  ]);

  return result.map(item => ({
    category: item._id,
    count: item.count,
    totalCost: item.totalCost,
  }));
}

/**
 * Get last service date for a category (for reminder pattern detection)
 */
export async function getLastServiceByCategory(
  homeownerId: string,
  category: HomeServiceCategory,
  propertyId?: string
): Promise<IServiceHistory | null> {
  const query: any = { homeownerId, category };
  if (propertyId) query.propertyId = propertyId;

  return ServiceHistory.findOne(query).sort({ completedAt: -1 });
}

/**
 * Detect service frequency pattern for a category
 */
export async function detectServicePattern(
  homeownerId: string,
  category: HomeServiceCategory,
  propertyId?: string
): Promise<{ frequencyDays: number | null; serviceCount: number }> {
  const query: any = { homeownerId, category };
  if (propertyId) query.propertyId = propertyId;

  const services = await ServiceHistory.find(query)
    .sort({ completedAt: -1 })
    .limit(10);

  if (services.length < 2) {
    return { frequencyDays: null, serviceCount: services.length };
  }

  // Calculate average days between services
  const intervals: number[] = [];
  for (let i = 0; i < services.length - 1; i++) {
    const diff = services[i].completedAt.getTime() - services[i + 1].completedAt.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    intervals.push(days);
  }

  const avgDays = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);

  return { frequencyDays: avgDays, serviceCount: services.length };
}

/**
 * Update a service history entry
 */
export async function updateServiceHistory(
  serviceHistoryId: string,
  homeownerId: string,
  input: UpdateServiceHistoryInput
): Promise<IServiceHistory | null> {
  const serviceHistory = await ServiceHistory.findOne({
    _id: serviceHistoryId,
    homeownerId,
  });

  if (!serviceHistory) {
    return null;
  }

  if (input.title !== undefined) serviceHistory.title = input.title;
  if (input.description !== undefined) serviceHistory.description = input.description;
  if (input.category !== undefined) serviceHistory.category = input.category as any;
  if (input.serviceType !== undefined) serviceHistory.serviceType = input.serviceType as any;
  if (input.providerType !== undefined) serviceHistory.providerType = input.providerType as any;
  if (input.providerName !== undefined) serviceHistory.providerName = input.providerName;
  if (input.professionalId !== undefined) serviceHistory.professionalId = input.professionalId;
  if (input.cost !== undefined) serviceHistory.cost = input.cost;
  if (input.completedAt !== undefined) serviceHistory.completedAt = input.completedAt;
  if (input.documents !== undefined) serviceHistory.documents = input.documents;
  if (input.photos !== undefined) serviceHistory.photos = input.photos;
  if (input.rating !== undefined) serviceHistory.rating = input.rating;
  if (input.notes !== undefined) serviceHistory.notes = input.notes;

  await serviceHistory.save();
  return serviceHistory;
}

/**
 * Delete a service history entry
 */
export async function deleteServiceHistory(
  serviceHistoryId: string,
  homeownerId: string
): Promise<boolean> {
  const result = await ServiceHistory.deleteOne({
    _id: serviceHistoryId,
    homeownerId,
  });
  return result.deletedCount > 0;
}

/**
 * Create service history from completed Homezy project
 * (Called when a project is marked as completed)
 */
export async function createFromCompletedProject(
  homeownerId: string,
  projectData: {
    projectId: string;
    quoteId?: string;
    title: string;
    description?: string;
    category: HomeServiceCategory;
    serviceType: HomeServiceType;
    professionalId?: string;
    providerName: string;
    cost: number;
    completedAt: Date;
    propertyId?: string;
    homeProjectId?: string;
  }
): Promise<IServiceHistory> {
  return createServiceHistory(homeownerId, {
    propertyId: projectData.propertyId,
    homeProjectId: projectData.homeProjectId,
    projectId: projectData.projectId,
    quoteId: projectData.quoteId,
    title: projectData.title,
    description: projectData.description,
    category: projectData.category,
    serviceType: projectData.serviceType,
    providerType: 'homezy',
    providerName: projectData.providerName,
    professionalId: projectData.professionalId,
    cost: projectData.cost,
    completedAt: projectData.completedAt,
  });
}
