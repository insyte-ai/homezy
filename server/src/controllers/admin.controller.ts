import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { Lead, LeadClaim } from '../models/Lead.model';
import { CreditTransaction } from '../models/Credit.model';
import { Quote } from '../models/Quote.model';
import { logger } from '../utils/logger';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.middleware';
import { KnowledgeBaseService } from '../services/tools/knowledge-base.service';

// Singleton instance of knowledge base service
const knowledgeBaseService = new KnowledgeBaseService();

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
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
      User.countDocuments({ role: 'pro', 'proProfile.verificationStatus': 'approved' }),
      User.countDocuments({ role: 'pro', 'proProfile.verificationStatus': 'pending' }),
      User.countDocuments({ role: 'homeowner' }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: { $in: ['open', 'full'] } }),
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
        .select('firstName lastName email phone proProfile proOnboardingCompleted createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Transform to flatten proProfile fields
    const transformedProfessionals = professionals.map((pro: any) => ({
      id: pro._id.toString(),
      firstName: pro.firstName,
      lastName: pro.lastName,
      email: pro.email,
      phoneNumber: pro.phone,
      businessName: pro.proProfile?.businessName,
      serviceCategories: pro.proProfile?.serviceCategories || [],
      verificationStatus: pro.proProfile?.verificationStatus || 'pending',
      onboardingCompleted: pro.proOnboardingCompleted || false,
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

    const user = await User.findOne({ _id: id, role: 'pro' }).lean();

    if (!user) {
      throw new NotFoundError('Professional not found');
    }

    // Get additional stats
    const [quotesCount, activeProjectsCount] = await Promise.all([
      Quote.countDocuments({ professionalId: id }),
      Quote.countDocuments({ professionalId: id, status: 'accepted' }),
    ]);

    // Extract nested proProfile fields to match frontend expectations
    const proProfile = (user as any).proProfile || {};
    const verificationDocs = proProfile.verificationDocuments || [];
    const tradeLicenseDoc = verificationDocs.find((doc: any) => doc.type === 'license');
    const vatDoc = verificationDocs.find((doc: any) => doc.type === 'vat');

    // Build response matching frontend interface
    const responseData = {
      id: (user as any)._id.toString(),
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      email: (user as any).email,
      phoneNumber: (user as any).phone,
      profilePhoto: (user as any).profilePhoto,
      businessName: proProfile.businessName,
      businessType: proProfile.businessType,
      serviceCategories: proProfile.categories || [],
      serviceAreas: proProfile.serviceAreas || [],
      yearsInBusiness: proProfile.yearsInBusiness,
      teamSize: proProfile.teamSize,
      languages: proProfile.languages || [],
      verificationStatus: proProfile.verificationStatus || 'pending',
      onboardingCompleted: (user as any).proOnboardingCompleted || false,
      tradeLicense: {
        number: proProfile.tradeLicenseNumber,
        documentUrl: tradeLicenseDoc?.url,
        status: tradeLicenseDoc?.status || 'pending',
      },
      vatNumber: proProfile.vatNumber,
      vatDocument: {
        url: vatDoc?.url,
        status: vatDoc?.status || 'pending',
      },
      verificationDocuments: verificationDocs,
      portfolio: proProfile.portfolio || [],
      hourlyRateMin: proProfile.hourlyRateMin,
      hourlyRateMax: proProfile.hourlyRateMax,
      rating: proProfile.rating || 0,
      reviewCount: proProfile.reviewCount || 0,
      projectsCompleted: proProfile.projectsCompleted || 0,
      responseTimeHours: proProfile.responseTimeHours || 24,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
      stats: {
        quotesCount,
        activeProjectsCount,
      },
    };

    res.json({
      success: true,
      data: responseData,
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
    const { notes } = req.body;

    const professional = await User.findOne({ _id: id, role: 'pro' });

    if (!professional) {
      throw new NotFoundError('Professional not found');
    }

    if (!professional.proProfile) {
      throw new BadRequestError('User is not a professional');
    }

    // Check if onboarding is completed
    if (!professional.proOnboardingCompleted) {
      throw new BadRequestError('Cannot approve professional. Onboarding is not complete.');
    }

    // Build update object for verification status and documents
    const updateData: Record<string, unknown> = {
      'proProfile.verificationStatus': 'approved',
    };

    // Update verification documents status
    if (professional.proProfile.verificationDocuments?.length) {
      const updatedDocs = professional.proProfile.verificationDocuments.map((doc) => {
        const docObj = {
          type: doc.type,
          url: doc.url,
          status: doc.status,
          uploadedAt: doc.uploadedAt,
          reviewedAt: doc.reviewedAt,
          reviewNotes: doc.reviewNotes,
        };
        if (doc.status === 'pending') {
          return {
            ...docObj,
            status: 'approved',
            reviewedAt: new Date(),
            reviewNotes: notes || 'Approved by admin',
          };
        }
        return docObj;
      });
      updateData['proProfile.verificationDocuments'] = updatedDocs;
    }

    // Use updateOne to update only verification fields
    await User.updateOne({ _id: id }, { $set: updateData });

    logger.info(`Professional ${id} approved`);

    // Fetch updated professional for response
    const updatedProfessional = await User.findById(id);

    res.json({
      success: true,
      message: 'Professional approved successfully',
      data: updatedProfessional,
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

    // Build update object for verification status and documents
    const updateData: Record<string, unknown> = {
      'proProfile.verificationStatus': 'rejected',
    };

    // Update verification documents status
    if (professional.proProfile.verificationDocuments?.length) {
      const updatedDocs = professional.proProfile.verificationDocuments.map((doc) => {
        const docObj = {
          type: doc.type,
          url: doc.url,
          status: doc.status,
          uploadedAt: doc.uploadedAt,
          reviewedAt: doc.reviewedAt,
          reviewNotes: doc.reviewNotes,
        };
        if (doc.status === 'pending') {
          return {
            ...docObj,
            status: 'rejected',
            reviewedAt: new Date(),
            reviewNotes: reason,
          };
        }
        return docObj;
      });
      updateData['proProfile.verificationDocuments'] = updatedDocs;
    }

    // Use updateOne to update only verification fields
    await User.updateOne({ _id: id }, { $set: updateData });

    logger.info(`Professional ${id} rejected: ${reason}`);

    // Fetch updated professional for response
    const updatedProfessional = await User.findById(id);

    res.json({
      success: true,
      message: 'Professional verification rejected',
      data: updatedProfessional,
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
              $cond: [{ $in: ['$status', ['open', 'full']] }, 1, 0],
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
        id: homeowner._id.toString(),
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
 * Get single homeowner details
 */
export const getHomeownerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, role: 'homeowner' }).lean();

    if (!user) {
      throw new NotFoundError('Homeowner not found');
    }

    // Get leads submitted by this homeowner
    const leads = await Lead.find({ homeownerId: id })
      .select('title category status createdAt claims')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const totalLeadsSubmitted = leads.length;
    const activeLeads = leads.filter((l: any) => ['open', 'full'].includes(l.status)).length;

    // Transform leads
    const transformedLeads = leads.map((lead: any) => ({
      id: lead._id.toString(),
      title: lead.title,
      category: lead.category,
      status: lead.status,
      createdAt: lead.createdAt,
      claimsCount: lead.claims?.length || 0,
    }));

    const responseData = {
      id: (user as any)._id.toString(),
      firstName: (user as any).firstName,
      lastName: (user as any).lastName,
      email: (user as any).email,
      phoneNumber: (user as any).phone,
      createdAt: (user as any).createdAt,
      totalLeadsSubmitted,
      activeLeads,
      address: (user as any).homeownerProfile?.address,
      leads: transformedLeads,
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    logger.error('Error fetching homeowner:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch homeowner',
      });
    }
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
      id: lead._id.toString(),
      title: lead.title,
      description: lead.description,
      category: lead.category,
      budgetBracket: lead.budgetBracket || 'Not specified',
      urgency: lead.urgency,
      status: lead.status,
      homeowner: {
        id: lead.homeownerId?._id?.toString(),
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
      claims: (lead.claims || []).map((claim: any) => ({
        id: claim._id?.toString(),
        professional: {
          id: claim.professional?._id?.toString(),
          firstName: claim.professional?.firstName,
          lastName: claim.professional?.lastName,
          businessName: claim.professional?.businessName,
        },
        claimedAt: claim.claimedAt,
        creditsUsed: claim.creditsUsed,
      })),
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
 * Get single lead details
 */
export const getLeadById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get lead and homeowner info
    const lead = await Lead.findById(id).lean();

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Get homeowner details
    const homeowner = await User.findById((lead as any).homeownerId)
      .select('firstName lastName email phone')
      .lean();

    // Get claims from LeadClaim collection
    const claims = await LeadClaim.find({ leadId: id }).lean();

    // Get professional details for each claim
    const professionalIds = claims.map((c: any) => c.professionalId);
    const professionals = await User.find({ _id: { $in: professionalIds } })
      .select('firstName lastName proProfile.businessName')
      .lean();

    const professionalsMap = new Map(
      professionals.map((p: any) => [p._id.toString(), p])
    );

    const responseData = {
      id: (lead as any)._id.toString(),
      title: (lead as any).title,
      description: (lead as any).description,
      category: (lead as any).category,
      budgetBracket: (lead as any).budgetBracket || 'Not specified',
      urgency: (lead as any).urgency,
      status: (lead as any).status,
      homeowner: {
        id: (homeowner as any)?._id?.toString(),
        firstName: (homeowner as any)?.firstName || 'Unknown',
        lastName: (homeowner as any)?.lastName || '',
        email: (homeowner as any)?.email || '',
        phoneNumber: (homeowner as any)?.phone,
      },
      location: {
        emirate: (lead as any).location?.emirate || 'Not specified',
        city: (lead as any).location?.neighborhood || (lead as any).location?.emirate || 'Not specified',
      },
      claimsCount: (lead as any).claimCount || 0,
      maxClaimsAllowed: (lead as any).maxClaims || 5,
      creditsRequired: 1, // Default credit cost
      createdAt: (lead as any).createdAt,
      expiresAt: (lead as any).expiresAt,
      claims: claims.map((claim: any) => {
        const pro = professionalsMap.get(claim.professionalId);
        return {
          id: claim._id?.toString(),
          professional: {
            id: claim.professionalId,
            firstName: (pro as any)?.firstName || 'Unknown',
            lastName: (pro as any)?.lastName || '',
            businessName: (pro as any)?.proProfile?.businessName,
          },
          claimedAt: claim.claimedAt,
          creditsUsed: claim.creditsCost || 1,
        };
      }),
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    logger.error('Error fetching lead:', error);
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lead',
      });
    }
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
      id: txn._id.toString(),
      user: {
        id: (txn.professionalId?._id || txn.professionalId)?.toString(),
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

/**
 * Get knowledge base statistics
 */
export const getKnowledgeBaseStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articleCount = knowledgeBaseService.getArticleCount();
    const categories = knowledgeBaseService.getCategories();
    const isSemanticSearchAvailable = knowledgeBaseService.isSemanticSearchAvailable();

    res.json({
      success: true,
      data: {
        totalArticles: articleCount,
        categories,
        semanticSearchEnabled: isSemanticSearchAvailable,
        searchMethod: isSemanticSearchAvailable ? 'semantic' : 'keyword',
      },
    });
  } catch (error) {
    logger.error('Error fetching knowledge base stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch knowledge base statistics',
    });
  }
};

/**
 * Reload knowledge base articles from TOML files
 */
export const reloadKnowledgeBase = async (_req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Admin requested knowledge base reload');

    await knowledgeBaseService.reloadArticles();

    const articleCount = knowledgeBaseService.getArticleCount();
    const isSemanticSearchAvailable = knowledgeBaseService.isSemanticSearchAvailable();

    logger.info('Knowledge base reloaded successfully', { articleCount, isSemanticSearchAvailable });

    res.json({
      success: true,
      message: 'Knowledge base reloaded successfully',
      data: {
        totalArticles: articleCount,
        semanticSearchEnabled: isSemanticSearchAvailable,
      },
    });
  } catch (error) {
    logger.error('Error reloading knowledge base:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reload knowledge base',
    });
  }
};
