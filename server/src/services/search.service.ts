import Lead from '../models/Lead.model';
import Quote from '../models/Quote.model';
import User from '../models/User.model';

export interface SearchResult {
  requests: Array<{
    _id: string;
    title: string;
    category: string;
    status: string;
    createdAt: Date;
  }>;
  quotes: Array<{
    _id: string;
    leadId: string;
    leadTitle: string;
    professionalName: string;
    total: number;
    status: string;
    createdAt: Date;
  }>;
  professionals: Array<{
    _id: string;
    businessName: string;
    categories: string[];
    rating: number;
    reviewCount: number;
    profilePhoto?: string;
  }>;
}

/**
 * Search across homeowner's leads, quotes, and public professionals
 */
export const searchAll = async (
  query: string,
  homeownerId: string,
  limit: number = 5
): Promise<SearchResult> => {
  const searchRegex = new RegExp(query, 'i');

  // Search homeowner's leads
  const requests = await Lead.find({
    homeownerId,
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ],
  })
    .select('title category status createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Get all lead IDs for this homeowner to search quotes
  const homeownerLeadIds = await Lead.find({ homeownerId })
    .select('_id title')
    .lean();

  const leadIdToTitle = new Map(
    homeownerLeadIds.map(l => [l._id.toString(), l.title])
  );
  const leadIds = homeownerLeadIds.map(l => l._id.toString());

  // Search quotes for homeowner's leads (by professional name)
  // First, find professionals matching the query
  const matchingPros = await User.find({
    role: 'pro',
    'proProfile.businessName': searchRegex,
  })
    .select('_id proProfile.businessName')
    .lean();

  const matchingProIds = matchingPros.map(p => p._id.toString());

  // Find quotes from matching professionals for homeowner's leads
  const quotesRaw = await Quote.find({
    leadId: { $in: leadIds },
    professionalId: { $in: matchingProIds },
  })
    .select('leadId professionalId total status createdAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Map professional IDs to names
  const proIdToName = new Map(
    matchingPros.map(p => [p._id.toString(), p.proProfile?.businessName || 'Unknown'])
  );

  const quotes = quotesRaw.map((q: any) => ({
    _id: q._id.toString(),
    leadId: q.leadId,
    leadTitle: leadIdToTitle.get(q.leadId) || 'Unknown Request',
    professionalName: proIdToName.get(q.professionalId) || 'Unknown Professional',
    total: q.pricing?.total || 0,
    status: q.status,
    createdAt: q.createdAt,
  }));

  // Search public professionals
  const professionals = await User.find({
    role: 'pro',
    'proProfile.verificationStatus': 'approved',
    $or: [
      { 'proProfile.businessName': searchRegex },
      { 'proProfile.categories': searchRegex },
      { 'proProfile.tagline': searchRegex },
    ],
  })
    .select('proProfile.businessName proProfile.categories proProfile.rating proProfile.reviewCount profilePhoto')
    .sort({ 'proProfile.rating': -1 })
    .limit(limit)
    .lean();

  const formattedProfessionals = professionals.map((p: any) => ({
    _id: p._id.toString(),
    businessName: p.proProfile?.businessName || 'Unknown',
    categories: p.proProfile?.categories || [],
    rating: p.proProfile?.rating || 0,
    reviewCount: p.proProfile?.reviewCount || 0,
    profilePhoto: p.profilePhoto,
  }));

  return {
    requests: requests.map((r: any) => ({
      _id: r._id.toString(),
      title: r.title,
      category: r.category,
      status: r.status,
      createdAt: r.createdAt,
    })),
    quotes,
    professionals: formattedProfessionals,
  };
};
