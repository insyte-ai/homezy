import { Request, Response } from 'express';
import Resource, { ResourceStatus } from '../models/Resource.model';
import { logger } from '../utils/logger';

export const resourceController = {
  // Get all resources with filters
  async getResources(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        type,
        tags,
        search,
        featured,
        popular,
        targetAudience,
        status,
        limit = 20,
        offset = 0,
      } = req.query;

      // Build query - public endpoint only shows published resources
      const query: Record<string, unknown> = { status: status || ResourceStatus.PUBLISHED };

      // Category filter
      if (category) {
        query.category = category;
      }

      // Type filter
      if (type) {
        query.type = type;
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query['tags.slug'] = { $in: tagArray };
      }

      // Audience filter
      if (targetAudience) {
        query.targetAudience = { $in: [targetAudience, 'both'] };
      }

      // Featured filter
      if (featured === 'true') {
        query.featured = true;
      }

      // Popular filter
      if (popular === 'true') {
        query.popular = true;
      }

      // Search filter - uses text index
      if (search) {
        query.$text = { $search: search as string };
      }

      // Execute query
      const total = await Resource.countDocuments(query);
      const resources = await Resource.find(query)
        .sort(search ? { score: { $meta: 'textScore' } } : { publishedAt: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .select('-content.body') // Exclude body content in list view for performance
        .lean();

      res.json({
        success: true,
        data: {
          resources,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: total > Number(offset) + Number(limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching resources',
      });
    }
  },

  // Get single resource by slug
  async getResourceBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const resource = await Resource.findOne({
        slug,
        status: ResourceStatus.PUBLISHED,
      });

      if (!resource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
        return;
      }

      // Increment view count
      resource.viewCount = (resource.viewCount || 0) + 1;
      await resource.save();

      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      logger.error('Error fetching resource:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching resource',
      });
    }
  },

  // Get resource by ID (admin use - includes drafts)
  async getResourceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const resource = await Resource.findById(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
        return;
      }

      res.json({
        success: true,
        data: resource,
      });
    } catch (error) {
      logger.error('Error fetching resource:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching resource',
      });
    }
  },

  // Get featured resources
  async getFeaturedResources(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 3, targetAudience } = req.query;

      const query: Record<string, unknown> = {
        status: ResourceStatus.PUBLISHED,
        featured: true,
      };

      if (targetAudience) {
        query.targetAudience = { $in: [targetAudience, 'both'] };
      }

      const resources = await Resource.find(query)
        .sort({ publishedAt: -1 })
        .limit(Number(limit))
        .select('-content.body')
        .lean();

      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      logger.error('Error fetching featured resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured resources',
      });
    }
  },

  // Get popular resources
  async getPopularResources(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 5, targetAudience } = req.query;

      const query: Record<string, unknown> = {
        status: ResourceStatus.PUBLISHED,
      };

      if (targetAudience) {
        query.targetAudience = { $in: [targetAudience, 'both'] };
      }

      const resources = await Resource.find(query)
        .sort({ viewCount: -1, publishedAt: -1 })
        .limit(Number(limit))
        .select('-content.body')
        .lean();

      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      logger.error('Error fetching popular resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching popular resources',
      });
    }
  },

  // Get latest resources
  async getLatestResources(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 5, targetAudience } = req.query;

      const query: Record<string, unknown> = {
        status: ResourceStatus.PUBLISHED,
      };

      if (targetAudience) {
        query.targetAudience = { $in: [targetAudience, 'both'] };
      }

      const resources = await Resource.find(query)
        .sort({ publishedAt: -1 })
        .limit(Number(limit))
        .select('-content.body')
        .lean();

      res.json({
        success: true,
        data: resources,
      });
    } catch (error) {
      logger.error('Error fetching latest resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching latest resources',
      });
    }
  },

  // Get related resources
  async getRelatedResources(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const { limit = 3 } = req.query;

      // Find the current resource
      const currentResource = await Resource.findOne({
        slug,
        status: ResourceStatus.PUBLISHED,
      });

      if (!currentResource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
        return;
      }

      // Find related resources based on category and tags
      const relatedResources = await Resource.find({
        _id: { $ne: currentResource._id },
        status: ResourceStatus.PUBLISHED,
        $or: [
          { category: currentResource.category },
          { 'tags.slug': { $in: currentResource.tags.map((t) => t.slug) } },
        ],
      })
        .sort({ publishedAt: -1 })
        .limit(Number(limit))
        .select('-content.body')
        .lean();

      res.json({
        success: true,
        data: relatedResources,
      });
    } catch (error) {
      logger.error('Error fetching related resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching related resources',
      });
    }
  },

  // Get resource statistics
  async getResourceStats(_req: Request, res: Response): Promise<void> {
    try {
      const totalResources = await Resource.countDocuments({
        status: ResourceStatus.PUBLISHED,
      });

      // Category counts
      const categoryCounts = await Resource.aggregate([
        { $match: { status: ResourceStatus.PUBLISHED } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      // Type counts
      const typeCounts = await Resource.aggregate([
        { $match: { status: ResourceStatus.PUBLISHED } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]);

      // Format the counts
      const categoryCountsMap: Record<string, number> = {};
      categoryCounts.forEach((item) => {
        categoryCountsMap[item._id] = item.count;
      });

      const typeCountsMap: Record<string, number> = {};
      typeCounts.forEach((item) => {
        typeCountsMap[item._id] = item.count;
      });

      res.json({
        success: true,
        data: {
          totalResources,
          categoryCounts: categoryCountsMap,
          typeCounts: typeCountsMap,
        },
      });
    } catch (error) {
      logger.error('Error fetching resource stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching resource stats',
      });
    }
  },

  // Admin: Get all resources including drafts
  async getAllResourcesAdmin(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        type,
        status,
        search,
        sort = '-createdAt',
        limit = 50,
        offset = 0,
      } = req.query;

      const query: Record<string, unknown> = {};

      if (category) query.category = category;
      if (type) query.type = type;
      if (status) query.status = status;

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { slug: { $regex: search, $options: 'i' } },
        ];
      }

      const total = await Resource.countDocuments(query);
      const resources = await Resource.find(query)
        .sort(sort as string)
        .skip(Number(offset))
        .limit(Number(limit))
        .select('-content.body')
        .lean();

      res.json({
        success: true,
        data: {
          resources,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: total > Number(offset) + Number(limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error fetching resources (admin):', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching resources',
      });
    }
  },

  // Admin: Create new resource
  async createResource(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      const resourceData = {
        ...req.body,
        createdBy: userId,
      };

      // Validate required fields
      if (!resourceData.title || !resourceData.slug || !resourceData.excerpt) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: title, slug, excerpt',
        });
        return;
      }

      // Check if slug already exists
      const existingResource = await Resource.findOne({
        slug: resourceData.slug,
      });

      if (existingResource) {
        res.status(400).json({
          success: false,
          message: 'A resource with this slug already exists',
        });
        return;
      }

      // Auto-publish if publishedAt is set and status is not specified
      if (resourceData.publishedAt && !resourceData.status) {
        resourceData.status = ResourceStatus.PUBLISHED;
      }

      const resource = new Resource(resourceData);
      await resource.save();

      res.status(201).json({
        success: true,
        data: resource,
        message: 'Resource created successfully',
      });
    } catch (error) {
      logger.error('Error creating resource:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating resource',
      });
    }
  },

  // Admin: Update resource
  async updateResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const resource = await Resource.findById(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
        return;
      }

      // Check if slug is being changed and if it conflicts
      if (req.body.slug && req.body.slug !== resource.slug) {
        const existingResource = await Resource.findOne({
          slug: req.body.slug,
          _id: { $ne: id },
        });

        if (existingResource) {
          res.status(400).json({
            success: false,
            message: 'A resource with this slug already exists',
          });
          return;
        }
      }

      // Update the resource
      Object.assign(resource, req.body);
      await resource.save();

      res.json({
        success: true,
        data: resource,
        message: 'Resource updated successfully',
      });
    } catch (error) {
      logger.error('Error updating resource:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating resource',
      });
    }
  },

  // Admin: Delete resource
  async deleteResource(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const resource = await Resource.findByIdAndDelete(id);

      if (!resource) {
        res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Resource deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting resource:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting resource',
      });
    }
  },

  // Admin: Bulk update resources
  async bulkUpdateResources(req: Request, res: Response): Promise<void> {
    try {
      const { resourceIds, updates } = req.body;

      if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'resourceIds array is required',
        });
        return;
      }

      const result = await Resource.updateMany(
        { _id: { $in: resourceIds } },
        { $set: updates }
      );

      res.json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount,
        },
        message: `${result.modifiedCount} resources updated successfully`,
      });
    } catch (error) {
      logger.error('Error bulk updating resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating resources',
      });
    }
  },

  // Admin: Bulk delete resources
  async bulkDeleteResources(req: Request, res: Response): Promise<void> {
    try {
      const { resourceIds } = req.body;

      if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
        res.status(400).json({
          success: false,
          message: 'resourceIds array is required',
        });
        return;
      }

      const result = await Resource.deleteMany({ _id: { $in: resourceIds } });

      res.json({
        success: true,
        data: {
          deletedCount: result.deletedCount,
        },
        message: `${result.deletedCount} resources deleted successfully`,
      });
    } catch (error) {
      logger.error('Error bulk deleting resources:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting resources',
      });
    }
  },
};

export default resourceController;
