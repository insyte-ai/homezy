import { Request, Response } from 'express';
import ServiceGroup from '../models/Service.model';
import logger from '../utils/logger';

/**
 * Get all service groups with full structure
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await ServiceGroup.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    logger.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
    });
  }
};

/**
 * Get all subservices (flattened list for autocomplete)
 */
export const getAllSubservices = async (req: Request, res: Response) => {
  try {
    const serviceGroups = await ServiceGroup.find({ isActive: true });

    const allSubservices: any[] = [];
    serviceGroups.forEach(group => {
      group.categories.forEach(category => {
        category.subservices.forEach(subservice => {
          allSubservices.push({
            id: subservice.id,
            name: subservice.name,
            slug: subservice.slug,
            category: category.name,
            group: group.name,
            icon: subservice.icon || category.icon,
          });
        });
      });
    });

    res.status(200).json({
      success: true,
      data: allSubservices,
    });
  } catch (error) {
    logger.error('Error fetching subservices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subservices',
    });
  }
};

/**
 * Search services by query
 */
export const searchServices = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const query = q.trim();
    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    // Search using text index
    const serviceGroups = await ServiceGroup.find({
      isActive: true,
      $text: { $search: query }
    }).limit(20);

    // If text search returns nothing, try regex search
    let results = serviceGroups;
    if (results.length === 0) {
      results = await ServiceGroup.find({
        isActive: true,
        $or: [
          { 'categories.subservices.name': { $regex: query, $options: 'i' } },
          { 'categories.subservices.serviceTypes.name': { $regex: query, $options: 'i' } },
        ]
      }).limit(20);
    }

    // Flatten and filter matching subservices
    const matches: any[] = [];
    results.forEach(group => {
      group.categories.forEach(category => {
        category.subservices.forEach(subservice => {
          const nameMatch = subservice.name.toLowerCase().includes(query.toLowerCase());
          const typeMatch = subservice.serviceTypes?.some(type =>
            type.name.toLowerCase().includes(query.toLowerCase())
          );

          if (nameMatch || typeMatch) {
            matches.push({
              id: subservice.id,
              name: subservice.name,
              slug: subservice.slug,
              category: category.name,
              group: group.name,
              icon: subservice.icon || category.icon,
              serviceTypes: subservice.serviceTypes,
            });
          }
        });
      });
    });

    res.status(200).json({
      success: true,
      data: matches,
      count: matches.length,
    });
  } catch (error) {
    logger.error('Error searching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search services',
    });
  }
};

/**
 * Get service by slug
 */
export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const serviceGroup = await ServiceGroup.findOne({
      isActive: true,
      'categories.subservices.slug': slug,
    });

    if (!serviceGroup) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // Find the specific subservice
    let foundSubservice: any = null;
    let foundCategory: any = null;

    for (const category of serviceGroup.categories) {
      const subservice = category.subservices.find(s => s.slug === slug);
      if (subservice) {
        foundSubservice = subservice;
        foundCategory = category;
        break;
      }
    }

    if (!foundSubservice) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...foundSubservice,
        category: foundCategory.name,
        categoryIcon: foundCategory.icon,
        group: serviceGroup.name,
      },
    });
  } catch (error) {
    logger.error('Error fetching service by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
    });
  }
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;

    const serviceGroup = await ServiceGroup.findOne({
      isActive: true,
      'categories.id': categoryId,
    });

    if (!serviceGroup) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const category = serviceGroup.categories.find(cat => cat.id === categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        group: serviceGroup.name,
        subservices: category.subservices,
      },
    });
  } catch (error) {
    logger.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category services',
    });
  }
};
