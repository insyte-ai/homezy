import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { Lead } from '../models/Lead.model';
import { Quote } from '../models/Quote.model';
import { CreditBalance, CreditTransaction } from '../models/Credit.model';
import { AppError } from '../middleware/errorHandler.middleware';
import logger from '../utils/logger';
import { calculateProfileCompleteness } from '../utils/profileCompleteness';
import { notificationService } from '../services/notification.service';

/**
 * Pro Profile Controller
 * Handles all pro profile management operations
 */

/**
 * @route   POST /api/v1/pros/agreement
 * @desc    Accept pro agreement during onboarding
 * @access  Private (Pro only)
 */
export const acceptAgreement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const { accepted, version } = req.body;

    if (!accepted) {
      throw new AppError('You must accept the agreement to continue', 400);
    }

    if (!version) {
      throw new AppError('Agreement version is required', 400);
    }

    // Get client IP address
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'proProfile.agreement': {
            accepted: true,
            version,
            acceptedAt: new Date(),
            ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    logger.info('Pro agreement accepted', {
      userId,
      version,
      acceptedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Agreement accepted successfully',
      data: {
        agreement: user.proProfile?.agreement,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/pros/onboarding
 * @desc    Complete pro onboarding and save initial profile data
 * @access  Private (Pro only)
 */
export const completeOnboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const {
      firstName,
      lastName,
      phone,
      businessEmail,
      businessName,
      brandName,
      businessType,
      tradeLicenseNumber,
      vatNumber,
      categories,
      primaryEmirate,
      serviceRadius,
      agreementAccepted,
      agreementVersion,
    } = req.body;

    // Validate agreement acceptance
    if (!agreementAccepted) {
      throw new AppError('You must accept the Pro Agreement to continue', 400);
    }

    // Get client IP address for audit trail
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    // Build service area from onboarding data
    const serviceArea = {
      emirate: primaryEmirate,
      neighborhoods: [],
      serviceRadius: serviceRadius || 50,
      willingToTravelOutside: false,
    };

    // Update user and profile with onboarding data
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName,
          lastName,
          phone,
          proOnboardingCompleted: true,
          'proProfile.businessName': businessName,
          'proProfile.brandName': brandName || undefined,
          'proProfile.businessEmail': businessEmail || undefined,
          'proProfile.businessType': businessType,
          'proProfile.tradeLicenseNumber': tradeLicenseNumber,
          'proProfile.vatNumber': vatNumber,
          'proProfile.categories': categories,
          'proProfile.serviceAreas': [serviceArea],
          'proProfile.verificationStatus': 'pending',
          'proProfile.agreement': {
            accepted: true,
            version: agreementVersion,
            acceptedAt: new Date(),
            ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    // Generate and save slug
    const { generateProSlug } = await import('../utils/slugify.js');
    const slug = generateProSlug(businessName, primaryEmirate);

    await User.findByIdAndUpdate(userId, {
      $set: { 'proProfile.slug': slug },
    });

    if (user.proProfile) {
      user.proProfile.slug = slug;
    }

    logger.info('Pro onboarding completed', {
      userId,
      businessName,
      businessType,
      categoriesCount: categories.length,
      agreementVersion,
      agreementAcceptedAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        proProfile: user.proProfile,
        slug,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    // Calculate profile completeness
    const completeness = user.proProfile
      ? calculateProfileCompleteness(user.proProfile)
      : { percentage: 0, completedSections: [], missingSections: [] };

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          profilePhoto: user.profilePhoto,
          role: user.role,
          proProfile: user.proProfile,
        },
        completeness: {
          percentage: completeness.percentage,
          completedSections: completeness.completedSections,
          missingSections: completeness.missingSections,
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
/**
 * @route   GET /api/v1/pros/me/preview
 * @desc    Preview own profile (shows what public will see, regardless of verification)
 * @access  Private (Pro only)
 */
export const previewMyProfile = async (
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

    // Return profile in same format as public profile
    res.status(200).json({
      success: true,
      data: {
        professional: {
          id: user.id,
          businessName: user.proProfile?.businessName || '',
          slug: user.proProfile?.slug,
          profilePhoto: user.profilePhoto,
          proProfile: user.proProfile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new AppError('Pro not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('User is not a pro', 400);
    }

    // Only show verified pros to public
    if (user.proProfile?.verificationStatus === 'pending' ||
        user.proProfile?.verificationStatus === 'rejected') {
      throw new AppError('Pro profile not available', 403);
    }

    // Fetch projects from the new Project model
    const { listPublicProjects } = await import('../services/project.service.js');
    const projects = await listPublicProjects(id, { limit: 20 });

    // Return public profile data (hide sensitive information)
    res.status(200).json({
      success: true,
      data: {
        professional: {
          id: user.id,
          businessName: user.proProfile?.businessName || '',
          slug: user.proProfile?.slug,
          profilePhoto: user.profilePhoto,
          proProfile: user.proProfile,
        },
        projects,
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

    // Extract update data from validated request body
    const updateData = req.body;

    // Build update object with dot notation for nested fields
    const updateObject: any = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        updateObject[`proProfile.${key}`] = updateData[key];
      }
    });

    // Use findByIdAndUpdate to update only specific fields
    // This bypasses full document validation and only validates changed fields
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      {
        new: true, // Return updated document
        runValidators: true, // Run validators on updated fields only
      }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'pro') {
      throw new AppError('Only pros can access this endpoint', 403);
    }

    // Generate/update slug if business name changed
    if (updateData.businessName && user.proProfile) {
      const { generateProSlug } = await import('../utils/slugify.js');
      const primaryEmirate = user.proProfile.serviceAreas?.[0]?.emirate;
      const newSlug = generateProSlug(updateData.businessName, primaryEmirate);

      // Update slug separately
      await User.findByIdAndUpdate(userId, {
        $set: { 'proProfile.slug': newSlug },
      });

      if (user.proProfile) {
        user.proProfile.slug = newSlug;
      }
    }

    logger.info(`Pro profile updated for user ${userId}`, {
      userId,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        proProfile: user.proProfile,
        slug: user.proProfile?.slug,
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

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const { type } = req.body;

    if (!type || !['license', 'vat', 'insurance', 'id', 'reference'].includes(type)) {
      throw new AppError(
        'Invalid document type. Must be one of: license, vat, insurance, id, reference',
        400
      );
    }

    // Upload document to Cloudinary or local storage
    const { uploadDocument: uploadDocumentHelper } = await import('../utils/uploadHelper.js');
    const url = await uploadDocumentHelper(
      req.file.buffer,
      'verification-documents',
      req.file.mimetype
    );

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

    // Notify admins about the new verification document
    const proName = `${user.firstName} ${user.lastName}`.trim() || 'A professional';
    notificationService.notifyAdminsVerificationUploaded(userId, proName, type);

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

    // Build query - only show verified pros
    const query: any = {
      role: 'pro',
      'proProfile.verificationStatus': 'approved',
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
        professionals: pros.map((pro) => ({
          id: pro._id,
          businessName: pro.proProfile?.businessName,
          slug: pro.proProfile?.slug,
          profilePhoto: pro.profilePhoto,
          proProfile: {
            businessName: pro.proProfile?.businessName,
            slug: pro.proProfile?.slug,
            tagline: pro.proProfile?.tagline,
            categories: pro.proProfile?.categories,
            serviceAreas: pro.proProfile?.serviceAreas,
            verificationStatus: pro.proProfile?.verificationStatus,
            rating: pro.proProfile?.rating || 0,
            reviewCount: pro.proProfile?.reviewCount || 0,
            projectsCompleted: pro.proProfile?.projectsCompleted || 0,
            responseTimeHours: pro.proProfile?.responseTimeHours || 0,
            quoteAcceptanceRate: pro.proProfile?.quoteAcceptanceRate || 0,
            yearsInBusiness: pro.proProfile?.yearsInBusiness,
            hourlyRateMin: pro.proProfile?.hourlyRateMin,
            hourlyRateMax: pro.proProfile?.hourlyRateMax,
          },
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

/**
 * @route   GET /api/v1/pros/me/analytics
 * @desc    Get professional's analytics and stats
 * @access  Private (Pro only)
 */
export const getProAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get date range for period comparison (last 7 and 30 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all analytics data in parallel
    const [
      claimedLeads,
      claimedLeadsLast7Days,
      quotes,
      quotesLast7Days,
      acceptedQuotes,
      creditBalance,
      recentTransactions,
    ] = await Promise.all([
      // Total claimed leads
      Lead.countDocuments({ claimedBy: userId }),
      // Claimed leads in last 7 days
      Lead.countDocuments({
        claimedBy: userId,
        claimDate: { $gte: last7Days }
      }),
      // All quotes
      Quote.find({ professionalId: userId }).select('status createdAt totalPrice'),
      // Quotes in last 7 days
      Quote.find({
        professionalId: userId,
        createdAt: { $gte: last7Days }
      }).select('status'),
      // Accepted quotes
      Quote.find({
        professionalId: userId,
        status: 'accepted'
      }).select('totalPrice createdAt'),
      // Credit balance
      CreditBalance.findOne({ professionalId: userId }).select('totalBalance paidCredits freeCredits'),
      // Recent credit transactions
      CreditTransaction.find({ professionalId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    // Calculate quote statistics
    const totalQuotes = quotes.length;
    const pendingQuotes = quotes.filter((q: any) => q.status === 'pending').length;
    const respondedQuotes = quotes.filter((q: any) => q.status !== 'pending').length;
    const acceptedQuotesCount = acceptedQuotes.length;
    const rejectedQuotes = quotes.filter((q: any) => q.status === 'rejected').length;

    // Calculate acceptance rate (accepted / responded quotes)
    const quoteAcceptanceRate = respondedQuotes > 0
      ? Math.round((acceptedQuotesCount / respondedQuotes) * 100)
      : 0;

    // Calculate total revenue from accepted quotes
    const totalRevenue = acceptedQuotes.reduce((sum: number, quote: any) => {
      return sum + (quote.totalPrice || 0);
    }, 0);

    // Revenue in last 30 days
    const revenueLastMonth = acceptedQuotes
      .filter((quote: any) => new Date(quote.createdAt) >= last30Days)
      .reduce((sum: number, quote: any) => sum + (quote.totalPrice || 0), 0);

    // Calculate average quote value
    const avgQuoteValue = totalQuotes > 0
      ? Math.round(quotes.reduce((sum: number, q: any) => sum + (q.totalPrice || 0), 0) / totalQuotes)
      : 0;

    // Response and completion metrics
    const responseTimeHours = user.proProfile?.responseTimeHours || 0;
    const projectsCompleted = user.proProfile?.projectsCompleted || 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          claimedLeads: {
            total: claimedLeads,
            last7Days: claimedLeadsLast7Days,
            change: claimedLeads > 0
              ? Math.round((claimedLeadsLast7Days / claimedLeads) * 100)
              : 0,
          },
          creditBalance: {
            total: creditBalance?.totalBalance || 0,
            paid: creditBalance?.paidCredits || 0,
            free: creditBalance?.freeCredits || 0,
          },
          activeQuotes: pendingQuotes,
          projectsCompleted,
        },
        quotes: {
          total: totalQuotes,
          pending: pendingQuotes,
          accepted: acceptedQuotesCount,
          rejected: rejectedQuotes,
          acceptanceRate: quoteAcceptanceRate,
          avgValue: avgQuoteValue,
          last7Days: quotesLast7Days.length,
        },
        revenue: {
          total: totalRevenue,
          lastMonth: revenueLastMonth,
          change: totalRevenue > 0
            ? Math.round((revenueLastMonth / totalRevenue) * 100)
            : 0,
        },
        performance: {
          responseTimeHours,
          projectsCompleted,
          rating: user.proProfile?.rating || 0,
          reviewCount: user.proProfile?.reviewCount || 0,
        },
        recentActivity: {
          transactions: recentTransactions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get matching professionals for a lead
 * @route GET /api/v1/pros/matching
 * @access Public
 */
export const getMatchingPros = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, emirate, limit = 10 } = req.query;

    // Build query
    const query: any = {
      role: 'pro',
      'proProfile.isOnboarded': true,
      'proProfile.isActive': true,
    };

    if (category) {
      query['proProfile.services'] = category;
    }

    if (emirate) {
      query['proProfile.serviceAreas.emirates'] = emirate;
    }

    // Find matching professionals
    const professionals = await User.find(query)
      .select(
        'firstName lastName email phone proProfile.businessName proProfile.avatar proProfile.rating proProfile.reviewCount proProfile.completedJobs proProfile.responseTime proProfile.location proProfile.services proProfile.verified proProfile.topPro proProfile.hourlyRate'
      )
      .sort({
        'proProfile.topPro': -1, // Top pros first
        'proProfile.rating': -1, // Then by rating
        'proProfile.reviewCount': -1, // Then by review count
      })
      .limit(Number(limit))
      .lean();

    // Transform data
    const transformedPros = professionals.map((pro: any) => ({
      _id: pro._id,
      businessName: pro.proProfile?.businessName || `${pro.firstName} ${pro.lastName}`,
      firstName: pro.firstName,
      lastName: pro.lastName,
      email: pro.email,
      phone: pro.phone,
      avatar: pro.proProfile?.avatar,
      rating: pro.proProfile?.rating,
      reviewCount: pro.proProfile?.reviewCount,
      completedJobs: pro.proProfile?.completedJobs,
      responseTime: pro.proProfile?.responseTime,
      location: pro.proProfile?.location,
      services: pro.proProfile?.services || [],
      verified: pro.proProfile?.verified,
      topPro: pro.proProfile?.topPro,
      hourlyRate: pro.proProfile?.hourlyRate,
    }));

    res.status(200).json({
      success: true,
      data: {
        professionals: transformedPros,
        count: transformedPros.length,
      },
    });
  } catch (error: any) {
    logger.error('Failed to get matching professionals', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      message: 'Failed to load professionals',
    });
  }
};
