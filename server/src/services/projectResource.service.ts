// @ts-nocheck - Temporary: disable type checking for initial implementation
import { ProjectResource, IProjectResource } from '../models/ProjectResource.model';
import { HomeProject } from '../models/HomeProject.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import type {
  CreateProjectResourceInput,
  UpdateProjectResourceInput,
  ResourceType,
} from '@homezy/shared';

/**
 * Check if user can access a project (owner or accepted collaborator)
 */
async function canAccessProject(projectId: string, userId: string): Promise<boolean> {
  const project = await HomeProject.findById(projectId);
  if (!project) return false;

  if (project.homeownerId === userId) return true;

  const collaborator = project.collaborators.find(
    c => c.userId === userId && c.status === 'accepted'
  );

  return !!collaborator;
}

/**
 * Create a new project resource
 */
export async function createProjectResource(
  homeProjectId: string,
  homeownerId: string,
  input: CreateProjectResourceInput
): Promise<IProjectResource | null> {
  // Verify access to project
  if (!await canAccessProject(homeProjectId, homeownerId)) {
    return null;
  }

  const resource = new ProjectResource({
    homeProjectId,
    homeownerId,
    type: input.type,
    title: input.title,
    notes: input.notes,
    tags: input.tags || [],
    isFavorite: input.isFavorite || false,
    // Type-specific data
    idea: input.idea,
    pro: input.pro,
    product: input.product,
    vendor: input.vendor,
    document: input.document,
    estimate: input.estimate,
    link: input.link,
  });

  await resource.save();
  return resource;
}

/**
 * Get a resource by ID
 */
export async function getProjectResourceById(
  resourceId: string,
  userId: string
): Promise<IProjectResource | null> {
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    return null;
  }

  const resource = await ProjectResource.findById(resourceId);
  if (!resource) return null;

  // Verify access
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return null;
  }

  return resource;
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(
  homeProjectId: string,
  userId: string,
  options: {
    type?: ResourceType;
    isFavorite?: boolean;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ resources: IProjectResource[]; total: number }> {
  // Verify access to project
  if (!await canAccessProject(homeProjectId, userId)) {
    return { resources: [], total: 0 };
  }

  const query: any = { homeProjectId };

  if (options.type) query.type = options.type;
  if (options.isFavorite !== undefined) query.isFavorite = options.isFavorite;
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { notes: { $regex: options.search, $options: 'i' } },
    ];
  }

  const [resources, total] = await Promise.all([
    ProjectResource.find(query)
      .sort({ isFavorite: -1, updatedAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    ProjectResource.countDocuments(query),
  ]);

  return { resources, total };
}

/**
 * Get all resources for a user (across all their projects)
 */
export async function getUserResources(
  homeownerId: string,
  options: {
    type?: ResourceType;
    isFavorite?: boolean;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ resources: IProjectResource[]; total: number }> {
  const query: any = { homeownerId };

  if (options.type) query.type = options.type;
  if (options.isFavorite !== undefined) query.isFavorite = options.isFavorite;
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  if (options.search) {
    query.$or = [
      { title: { $regex: options.search, $options: 'i' } },
      { notes: { $regex: options.search, $options: 'i' } },
    ];
  }

  const [resources, total] = await Promise.all([
    ProjectResource.find(query)
      .sort({ isFavorite: -1, updatedAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    ProjectResource.countDocuments(query),
  ]);

  return { resources, total };
}

/**
 * Update a resource
 */
export async function updateProjectResource(
  resourceId: string,
  userId: string,
  input: UpdateProjectResourceInput
): Promise<IProjectResource | null> {
  const resource = await ProjectResource.findById(resourceId);

  if (!resource) {
    return null;
  }

  // Verify access
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return null;
  }

  // Update common fields
  if (input.title !== undefined) resource.title = input.title;
  if (input.notes !== undefined) resource.notes = input.notes;
  if (input.tags !== undefined) resource.tags = input.tags;
  if (input.isFavorite !== undefined) resource.isFavorite = input.isFavorite;

  // Update type-specific data based on resource type
  if (resource.type === 'idea' && input.idea) {
    if (input.idea.images !== undefined) resource.idea!.images = input.idea.images;
    if (input.idea.sourceUrl !== undefined) resource.idea!.sourceUrl = input.idea.sourceUrl;
    if (input.idea.inspiration !== undefined) resource.idea!.inspiration = input.idea.inspiration;
  }

  if (resource.type === 'pro' && input.pro) {
    if (input.pro.professionalId !== undefined) resource.pro!.professionalId = input.pro.professionalId;
    if (input.pro.externalName !== undefined) resource.pro!.externalName = input.pro.externalName;
    if (input.pro.phone !== undefined) resource.pro!.phone = input.pro.phone;
    if (input.pro.email !== undefined) resource.pro!.email = input.pro.email;
    if (input.pro.rating !== undefined) resource.pro!.rating = input.pro.rating;
    if (input.pro.specialty !== undefined) resource.pro!.specialty = input.pro.specialty;
  }

  if (resource.type === 'product' && input.product) {
    if (input.product.name !== undefined) resource.product!.name = input.product.name;
    if (input.product.brand !== undefined) resource.product!.brand = input.product.brand;
    if (input.product.price !== undefined) resource.product!.price = input.product.price;
    if (input.product.currency !== undefined) resource.product!.currency = input.product.currency;
    if (input.product.sourceUrl !== undefined) resource.product!.sourceUrl = input.product.sourceUrl;
    if (input.product.images !== undefined) resource.product!.images = input.product.images;
    if (input.product.specifications !== undefined) resource.product!.specifications = input.product.specifications;
  }

  if (resource.type === 'vendor' && input.vendor) {
    if (input.vendor.name !== undefined) resource.vendor!.name = input.vendor.name;
    if (input.vendor.type !== undefined) resource.vendor!.type = input.vendor.type as any;
    if (input.vendor.phone !== undefined) resource.vendor!.phone = input.vendor.phone;
    if (input.vendor.email !== undefined) resource.vendor!.email = input.vendor.email;
    if (input.vendor.address !== undefined) resource.vendor!.address = input.vendor.address;
    if (input.vendor.website !== undefined) resource.vendor!.website = input.vendor.website;
  }

  if (resource.type === 'document' && input.document) {
    if (input.document.fileUrl !== undefined) resource.document!.fileUrl = input.document.fileUrl;
    if (input.document.fileType !== undefined) resource.document!.fileType = input.document.fileType;
    if (input.document.fileSize !== undefined) resource.document!.fileSize = input.document.fileSize;
    if (input.document.category !== undefined) resource.document!.category = input.document.category as any;
  }

  if (resource.type === 'estimate' && input.estimate) {
    if (input.estimate.amount !== undefined) resource.estimate!.amount = input.estimate.amount;
    if (input.estimate.currency !== undefined) resource.estimate!.currency = input.estimate.currency;
    if (input.estimate.validUntil !== undefined) resource.estimate!.validUntil = input.estimate.validUntil;
    if (input.estimate.fromVendor !== undefined) resource.estimate!.fromVendor = input.estimate.fromVendor;
    if (input.estimate.description !== undefined) resource.estimate!.description = input.estimate.description;
    if (input.estimate.documentUrl !== undefined) resource.estimate!.documentUrl = input.estimate.documentUrl;
  }

  if (resource.type === 'link' && input.link) {
    if (input.link.url !== undefined) resource.link!.url = input.link.url;
    if (input.link.previewImage !== undefined) resource.link!.previewImage = input.link.previewImage;
    if (input.link.description !== undefined) resource.link!.description = input.link.description;
  }

  await resource.save();
  return resource;
}

/**
 * Delete a resource
 */
export async function deleteProjectResource(
  resourceId: string,
  userId: string
): Promise<boolean> {
  const resource = await ProjectResource.findById(resourceId);

  if (!resource) {
    return false;
  }

  // Verify access
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return false;
  }

  await resource.deleteOne();
  return true;
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  resourceId: string,
  userId: string
): Promise<IProjectResource | null> {
  const resource = await ProjectResource.findById(resourceId);

  if (!resource) {
    return null;
  }

  // Verify access
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return null;
  }

  resource.isFavorite = !resource.isFavorite;
  await resource.save();
  return resource;
}

/**
 * Move resource to another project
 */
export async function moveResourceToProject(
  resourceId: string,
  userId: string,
  newProjectId: string
): Promise<IProjectResource | null> {
  const resource = await ProjectResource.findById(resourceId);

  if (!resource) {
    return null;
  }

  // Verify access to both projects
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return null;
  }
  if (!await canAccessProject(newProjectId, userId)) {
    return null;
  }

  resource.homeProjectId = newProjectId;
  await resource.save();
  return resource;
}

/**
 * Copy resource to another project
 */
export async function copyResourceToProject(
  resourceId: string,
  userId: string,
  targetProjectId: string
): Promise<IProjectResource | null> {
  const resource = await ProjectResource.findById(resourceId);

  if (!resource) {
    return null;
  }

  // Verify access to both projects
  if (!await canAccessProject(resource.homeProjectId, userId)) {
    return null;
  }
  if (!await canAccessProject(targetProjectId, userId)) {
    return null;
  }

  // Create a copy
  const resourceData = resource.toObject();
  delete resourceData._id;
  delete resourceData.createdAt;
  delete resourceData.updatedAt;

  const newResource = new ProjectResource({
    ...resourceData,
    homeProjectId: targetProjectId,
    homeownerId: userId,
  });

  await newResource.save();
  return newResource;
}

/**
 * Get resources grouped by type
 */
export async function getResourcesByType(
  homeProjectId: string,
  userId: string
): Promise<Record<ResourceType, number>> {
  // Verify access to project
  if (!await canAccessProject(homeProjectId, userId)) {
    return {} as Record<ResourceType, number>;
  }

  const result = await ProjectResource.aggregate([
    { $match: { homeProjectId } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {};
  for (const item of result) {
    counts[item._id] = item.count;
  }

  return counts as Record<ResourceType, number>;
}
