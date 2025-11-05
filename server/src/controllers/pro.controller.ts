import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler.middleware';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pro Profile Controller
 * Handles all pro profile management operations
 */

/**
 * @route   GET /api/v1/pros/me
 * @desc    Get current pro's profile
 * @access  Private (Pro only)
 */
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId).select('+proProfile');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    res.status(200).json({
      success: true,
      data: {
        profile: user.proProfile,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/pros/:id
 * @desc    Get public pro profile
 * @access  Public
 */
export const getProProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('+proProfile');

    if (!user) {
      throw new AppError('Pro not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('User is not a pro', 400);
    }

    // Only show verified pros to public
    if (user.proProfile?.verificationStatus === 'unverified' ||
        user.proProfile?.verificationStatus === 'pending' ||
        user.proProfile?.verificationStatus === 'rejected') {
      throw new AppError('Pro profile not available', 403);
    }

    // Return public profile data (hide sensitive information)
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        role: user.role,
        proProfile: {
          businessName: user.proProfile?.businessName,
          tagline: user.proProfile?.tagline,
          bio: user.proProfile?.bio,
          categories: user.proProfile?.categories,
          serviceAreas: user.proProfile?.serviceAreas,
          yearsInBusiness: user.proProfile?.yearsInBusiness,
          teamSize: user.proProfile?.teamSize,
          languages: user.proProfile?.languages,
          verificationStatus: user.proProfile?.verificationStatus,
          portfolio: user.proProfile?.portfolio,
          featuredProjects: user.proProfile?.featuredProjects,
          hourlyRateMin: user.proProfile?.hourlyRateMin,
          hourlyRateMax: user.proProfile?.hourlyRateMax,
          minimumProjectSize: user.proProfile?.minimumProjectSize,
          rating: user.proProfile?.rating,
          reviewCount: user.proProfile?.reviewCount,
          projectsCompleted: user.proProfile?.projectsCompleted,
          responseTimeHours: user.proProfile?.responseTimeHours,
          quoteAcceptanceRate: user.proProfile?.quoteAcceptanceRate,
          availability: user.proProfile?.availability,
          businessType: user.proProfile?.businessType,
        },
        createdAt: (user as any).createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/pros/me
 * @desc    Update pro profile
 * @access  Private (Pro only)
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    // Extract update data from validated request body
    const updateData = req.body;

    // Initialize proProfile if it doesn't exist
    if (!user.proProfile) {
      user.proProfile = {} as any;
    }

    // Update only provided fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && user.proProfile) {
        (user.proProfile as any)[key] = updateData[key];
      }
    });

    await user.save();

    logger.info(`Pro profile updated for user ${userId}`, {
      userId,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: user.proProfile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/pros/me/portfolio
 * @desc    Add portfolio item
 * @access  Private (Pro only)
 */
export const addPortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    if (!user.proProfile) {
      throw new AppError('Pro profile not found', 404);
    }

    // Check portfolio limit
    if (user.proProfile.portfolio && user.proProfile.portfolio.length >= 50) {
      throw new AppError('Maximum portfolio limit (50 items) reached', 400);
    }

    // Create portfolio item with generated ID
    const portfolioItem = {
      id: uuidv4(),
      ...req.body,
    };

    // Initialize portfolio array if it doesn't exist
    if (!user.proProfile.portfolio) {
      user.proProfile.portfolio = [];
    }

    user.proProfile.portfolio.push(portfolioItem);
    await user.save();

    logger.info(`Portfolio item added for user ${userId}`, {
      userId,
      portfolioItemId: portfolioItem.id,
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio item added successfully',
      data: {
        portfolioItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/pros/me/portfolio/:itemId
 * @desc    Update portfolio item
 * @access  Private (Pro only)
 */
export const updatePortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.proProfile?.portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    // Find portfolio item
    const itemIndex = user.proProfile.portfolio.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex === -1) {
      throw new AppError('Portfolio item not found', 404);
    }

    // Update portfolio item
    const updateData = req.body;
    user.proProfile.portfolio[itemIndex] = {
      ...user.proProfile.portfolio[itemIndex],
      ...updateData,
      id: itemId, // Ensure ID doesn't change
    };

    await user.save();

    logger.info(`Portfolio item updated for user ${userId}`, {
      userId,
      portfolioItemId: itemId,
    });

    res.status(200).json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: {
        portfolioItem: user.proProfile.portfolio[itemIndex],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/pros/me/portfolio/:itemId
 * @desc    Delete portfolio item
 * @access  Private (Pro only)
 */
export const deletePortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { itemId } = req.params;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.proProfile?.portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    // Find and remove portfolio item
    const itemIndex = user.proProfile.portfolio.findIndex(
      (item) => item.id === itemId
    );

    if (itemIndex === -1) {
      throw new AppError('Portfolio item not found', 404);
    }

    user.proProfile.portfolio.splice(itemIndex, 1);

    // Remove from featured projects if present
    if (user.proProfile.featuredProjects) {
      user.proProfile.featuredProjects =
        user.proProfile.featuredProjects.filter((id) => id !== itemId);
    }

    await user.save();

    logger.info(`Portfolio item deleted for user ${userId}`, {
      userId,
      portfolioItemId: itemId,
    });

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/pros/me/featured-projects
 * @desc    Update featured projects (up to 6)
 * @access  Private (Pro only)
 */
export const updateFeaturedProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { featuredProjects } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.proProfile) {
      throw new AppError('Pro profile not found', 404);
    }

    // Verify all featured project IDs exist in portfolio
    const portfolioIds = user.proProfile.portfolio?.map((item) => item.id) || [];
    const invalidIds = featuredProjects.filter((id: string) => !portfolioIds.includes(id));

    if (invalidIds.length > 0) {
      throw new AppError(
        `Invalid portfolio IDs: ${invalidIds.join(', ')}`,
        400
      );
    }

    user.proProfile.featuredProjects = featuredProjects;
    await user.save();

    logger.info(`Featured projects updated for user ${userId}`, {
      userId,
      featuredCount: featuredProjects.length,
    });

    res.status(200).json({
      success: true,
      message: 'Featured projects updated successfully',
      data: {
        featuredProjects: user.proProfile.featuredProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/pros/me/verification/upload
 * @desc    Upload verification document
 * @access  Private (Pro only)
 */
export const uploadVerificationDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type, url } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.proProfile) {
      user.proProfile = {} as any;
    }

    // Type assertion after null check
    const proProfile = user.proProfile!;

    // Initialize verification documents array if it doesn't exist
    if (!proProfile.verificationDocuments) {
      proProfile.verificationDocuments = [];
    }

    // Check if document type already exists (replace if so)
    const existingIndex = proProfile.verificationDocuments.findIndex(
      (doc) => doc.type === type
    );

    const document = {
      type,
      url,
      status: 'pending' as const,
      uploadedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Replace existing document
      proProfile.verificationDocuments[existingIndex] = document;
    } else {
      // Add new document
      proProfile.verificationDocuments.push(document);
    }

    await user.save();

    logger.info(`Verification document uploaded for user ${userId}`, {
      userId,
      documentType: type,
    });

    res.status(201).json({
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/pros/search
 * @desc    Search pros (with filters)
 * @access  Public
 */
export const searchPros = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      emirate,
      minRating,
      verificationStatus,
      page = 1,
      limit = 20,
      sort = '-rating',
    } = req.query;

    // Build query - only show verified pros (basic or comprehensive)
    const query: any = {
      role: 'pro',
      'proProfile.verificationStatus': { $in: ['basic', 'comprehensive'] },
    };

    if (category) {
      query['proProfile.categories'] = category;
    }

    if (emirate) {
      query['proProfile.serviceAreas.emirate'] = emirate;
    }

    if (minRating) {
      query['proProfile.rating'] = { $gte: Number(minRating) };
    }

    // Allow filtering by specific verification status if provided
    if (verificationStatus) {
      query['proProfile.verificationStatus'] = verificationStatus;
    }

    // Parse pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [pros, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName profilePhoto proProfile createdAt')
        .sort(sort as string)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pros: pros.map((pro) => ({
          id: pro._id,
          firstName: pro.firstName,
          lastName: pro.lastName,
          profilePhoto: pro.profilePhoto,
          businessName: pro.proProfile?.businessName,
          tagline: pro.proProfile?.tagline,
          categories: pro.proProfile?.categories,
          serviceAreas: pro.proProfile?.serviceAreas,
          verificationStatus: pro.proProfile?.verificationStatus,
          rating: pro.proProfile?.rating,
          reviewCount: pro.proProfile?.reviewCount,
          responseTimeHours: pro.proProfile?.responseTimeHours,
          quoteAcceptanceRate: pro.proProfile?.quoteAcceptanceRate,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
