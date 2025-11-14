import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Lead } from '../models/Lead.model';
import { CreditTransaction } from '../models/Credit.model';
import { Quote } from '../models/Quote.model';
import { logger } from '../utils/logger';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.middleware';

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get counts
    const [
      totalProfessionals,
      activeProfessionals,
      pendingVerification,
      totalHomeowners,
      totalLeads,
      activeLeads,
      totalCreditsIssued,
      totalCreditsUsed,
    ] = await Promise.all([
      User.countDocuments({ role: 'pro' }),
      User.countDocuments({ role: 'pro', 'proProfile.verificationStatus': { $in: ['basic', 'comprehensive'] } }),
      User.countDocuments({ role: 'pro', 'proProfile.verificationStatus': 'pending' }),
      User.countDocuments({ role: 'homeowner' }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: { $in: ['open', 'quoted'] } }),
      CreditTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).then(result => result[0]?.total || 0),
      CreditTransaction.countDocuments({ type: 'spend' }),
    ]);

    res.json({
      success: true,
      data: {
        totalProfessionals,
        activeProfessionals,
        pendingVerification,
        totalHomeowners,
        totalLeads,
        activeLeads,
        totalCreditsIssued,
        totalCreditsUsed,
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * Get recent activity for dashboard
 */
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent users (last 7 days)
    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select('firstName lastName email role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Get recent leads (last 7 days)
    const recentLeads = await Lead.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .select('title status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Combine and format activities
    const activities = [
      ...recentUsers.map((user: any) => ({
        id: `user_${user._id}`,
        type: 'user_registered',
        description: `${user.firstName} ${user.lastName} registered as ${user.role}`,
        timestamp: user.createdAt,
        data: { userId: user._id, email: user.email, role: user.role },
      })),
      ...recentLeads.map((lead: any) => ({
        id: `lead_${lead._id}`,
        type: 'lead_created',
        description: `New lead: ${lead.title}`,
        timestamp: lead.createdAt,
        data: { leadId: lead._id, status: lead.status },
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
    });
  }
};

/**
 * Get all professionals with pagination and filters
 */
export const getProfessionals = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const verificationStatus = req.query.verificationStatus as string;
    const search = req.query.search as string;

    const query: any = { role: 'pro' };

    if (verificationStatus) {
      query['proProfile.verificationStatus'] = verificationStatus;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'proProfile.businessName': { $regex: search, $options: 'i' } },
      ];
    }

    const [professionals, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName email phone proProfile createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Transform to flatten proProfile fields
    const transformedProfessionals = professionals.map((pro: any) => ({
      _id: pro._id,
      firstName: pro.firstName,
      lastName: pro.lastName,
      email: pro.email,
      phoneNumber: pro.phone,
      businessName: pro.proProfile?.businessName,
      serviceCategories: pro.proProfile?.serviceCategories || [],
      verificationStatus: pro.proProfile?.verificationStatus || 'pending',
      isActive: pro.proProfile?.isActive || false,
      createdAt: pro.createdAt,
      totalLeadsClaimed: 0, // TODO: Calculate from leads
      totalJobsCompleted: 0, // TODO: Calculate from completed quotes
      rating: pro.proProfile?.rating,
    }));

    res.json({
      success: true,
      data: {
        items: transformedProfessionals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching professionals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch professionals',
    });
  }
};

/**
 * Get single professional details
 */
export const getProfessionalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const professional = await User.findOne({ _id: id, role: 'pro' }).lean();

    if (!professional) {
      throw new NotFoundError('Professional not found');
    }

    // Get additional stats
    const [quotesCount, activeProjectsCount] = await Promise.all([
      Quote.countDocuments({ professionalId: id }),
      Quote.countDocuments({ professionalId: id, status: 'accepted' }),
    ]);

    res.json({
      success: true,
      data: {
        ...professional,
        stats: {
          quotesCount,
          activeProjectsCount,
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching professional:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch professional',
      });
    }
  }
};

/**
 * Approve professional verification
 */
export const approveProfessional = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { verificationLevel, notes } = req.body;

    if (!verificationLevel || !['basic', 'comprehensive'].includes(verificationLevel)) {
      throw new BadRequestError('Invalid verification level');
    }

    const professional = await User.findOne({ _id: id, role: 'pro' });

    if (!professional) {
      throw new NotFoundError('Professional not found');
    }

    if (!professional.proProfile) {
      throw new BadRequestError('User is not a professional');
    }

    // Update verification status
    professional.proProfile.verificationStatus = verificationLevel;

    // Update verification documents status
    if (professional.proProfile.verificationDocuments) {
      professional.proProfile.verificationDocuments.forEach((doc) => {
        if (doc.status === 'pending') {
          doc.status = 'approved';
          doc.reviewedAt = new Date();
          doc.reviewNotes = notes || 'Approved by admin';
        }
      });
    }

    await professional.save();

    logger.info(`Professional ${id} approved with ${verificationLevel} verification`);

    res.json({
      success: true,
      message: 'Professional approved successfully',
      data: professional,
    });
  } catch (error) {
    logger.error('Error approving professional:', error);
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to approve professional',
      });
    }
  }
};

/**
 * Reject professional verification
 */
export const rejectProfessional = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new BadRequestError('Rejection reason is required');
    }

    const professional = await User.findOne({ _id: id, role: 'pro' });

    if (!professional) {
      throw new NotFoundError('Professional not found');
    }

    if (!professional.proProfile) {
      throw new BadRequestError('User is not a professional');
    }

    // Update verification status
    professional.proProfile.verificationStatus = 'rejected';

    // Update verification documents status
    if (professional.proProfile.verificationDocuments) {
      professional.proProfile.verificationDocuments.forEach((doc) => {
        if (doc.status === 'pending') {
          doc.status = 'rejected';
          doc.reviewedAt = new Date();
          doc.reviewNotes = reason;
        }
      });
    }

    await professional.save();

    logger.info(`Professional ${id} rejected: ${reason}`);

    res.json({
      success: true,
      message: 'Professional verification rejected',
      data: professional,
    });
  } catch (error) {
    logger.error('Error rejecting professional:', error);
    if (error instanceof NotFoundError || error instanceof BadRequestError) {
      res.status(error instanceof NotFoundError ? 404 : 400).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to reject professional',
      });
    }
  }
};

/**
 * Get all homeowners with pagination
 */
export const getHomeowners = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const query: any = { role: 'homeowner' };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [homeowners, total] = await Promise.all([
      User.find(query)
        .select('firstName lastName email phone createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Get lead stats for each homeowner
    const homeownerIds = homeowners.map((h: any) => h._id);
    const leadStats = await Lead.aggregate([
      { $match: { homeownerId: { $in: homeownerIds } } },
      {
        $group: {
          _id: '$homeownerId',
          totalLeads: { $sum: 1 },
          activeLeads: {
            $sum: {
              $cond: [{ $in: ['$status', ['open', 'quoted']] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = new Map(leadStats.map((s: any) => [s._id.toString(), s]));

    // Transform homeowners with stats
    const transformedHomeowners = homeowners.map((homeowner: any) => {
      const stats = statsMap.get(homeowner._id.toString()) || { totalLeads: 0, activeLeads: 0 };
      return {
        _id: homeowner._id,
        firstName: homeowner.firstName,
        lastName: homeowner.lastName,
        email: homeowner.email,
        phoneNumber: homeowner.phone,
        totalLeadsSubmitted: stats.totalLeads,
        activeLeads: stats.activeLeads,
        createdAt: homeowner.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        items: transformedHomeowners,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching homeowners:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch homeowners',
    });
  }
};

/**
 * Get all leads with pagination and filters
 */
export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('homeownerId', 'firstName lastName email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    // Transform leads to match frontend interface
    const transformedLeads = leads.map((lead: any) => ({
      _id: lead._id,
      title: lead.title,
      description: lead.description,
      category: lead.category,
      budgetBracket: lead.budgetBracket || 'Not specified',
      urgency: lead.urgency,
      status: lead.status,
      homeowner: {
        _id: lead.homeownerId?._id,
        firstName: lead.homeownerId?.firstName || 'Unknown',
        lastName: lead.homeownerId?.lastName || '',
        email: lead.homeownerId?.email || '',
        phoneNumber: lead.homeownerId?.phone,
      },
      location: {
        emirate: lead.location?.emirate || 'Not specified',
        city: lead.location?.city || 'Not specified',
      },
      claimsCount: lead.claims?.length || 0,
      maxClaimsAllowed: lead.maxClaims || 5,
      creditsRequired: lead.creditsRequired || 1,
      createdAt: lead.createdAt,
      expiresAt: lead.expiresAt,
      claims: lead.claims || [],
    }));

    res.json({
      success: true,
      data: {
        items: transformedLeads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads',
    });
  }
};

/**
 * Get all credit transactions with pagination
 */
export const getCreditTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;

    const query: any = {};

    if (type) {
      query.type = type;
    }

    const [transactions, total] = await Promise.all([
      CreditTransaction.find(query)
        .populate('professionalId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CreditTransaction.countDocuments(query),
    ]);

    // Transform transactions to match frontend interface
    const transformedTransactions = transactions.map((txn: any) => ({
      _id: txn._id,
      user: {
        _id: txn.professionalId?._id || txn.professionalId,
        firstName: txn.professionalId?.firstName || 'Unknown',
        lastName: txn.professionalId?.lastName || '',
        email: txn.professionalId?.email || '',
      },
      type: txn.type,
      amount: txn.amount,
      balance: {
        before: txn.balanceBefore,
        after: txn.balanceAfter,
      },
      description: txn.description,
      stripeTransactionId: txn.metadata?.stripePaymentIntentId,
      createdAt: txn.createdAt,
    }));

    res.json({
      success: true,
      data: {
        items: transformedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching credit transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credit transactions',
    });
  }
};
