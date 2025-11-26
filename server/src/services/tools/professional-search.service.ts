/**
 * Professional Search Tool Service
 * Allows the AI assistant to search for verified professionals based on user requirements
 */

import { User, IUser } from '../../models/User.model';
import { logger } from '../../utils/logger';
import type { SearchProfessionalsArgs } from '../ai/tools.registry';

interface ProfessionalResult {
  id: string;
  businessName: string;
  tagline?: string;
  categories: string[];
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  responseTimeHours: number;
  yearsInBusiness?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  languages: string[];
  verificationStatus: string;
  slug?: string;
  matchScore: number;
}

/**
 * Search for professionals based on category, location, and other criteria
 * @param args Search criteria from AI conversation
 * @returns Formatted list of matching professionals
 */
export async function searchProfessionalsFromAI(args: SearchProfessionalsArgs): Promise<string> {
  try {
    logger.info('AI searching for professionals', {
      category: args.category,
      emirate: args.emirate,
      minRating: args.minRating,
      urgency: args.urgency,
    });

    // Build query
    const query: any = {
      role: 'pro',
      'proProfile.verificationStatus': 'approved',
    };

    // Category filter
    if (args.category) {
      query['proProfile.categories'] = normalizeCategory(args.category);
    }

    // Emirate filter
    if (args.emirate) {
      query['proProfile.serviceAreas.emirate'] = normalizeEmirate(args.emirate);
    }

    // Minimum rating filter
    const minRating = args.minRating ?? 4.0;
    query['proProfile.rating'] = { $gte: minRating };

    // Query professionals
    const professionals = await User.find(query)
      .select('firstName lastName proProfile profilePhoto')
      .limit(20)
      .lean();

    if (!professionals || professionals.length === 0) {
      return generateNoResultsMessage(args);
    }

    // Score and rank professionals
    const scoredProfessionals = professionals.map((pro) => ({
      pro,
      score: calculateMatchScore(pro, args),
    }));

    // Sort by score descending
    scoredProfessionals.sort((a, b) => b.score - a.score);

    // Take top results
    const limit = args.limit ?? 5;
    const topProfessionals = scoredProfessionals.slice(0, limit);

    // Format results
    const results: ProfessionalResult[] = topProfessionals.map(({ pro, score }) => ({
      id: pro._id.toString(),
      businessName: pro.proProfile?.businessName || `${pro.firstName} ${pro.lastName}`,
      tagline: pro.proProfile?.tagline,
      categories: pro.proProfile?.categories || [],
      rating: pro.proProfile?.rating || 0,
      reviewCount: pro.proProfile?.reviewCount || 0,
      projectsCompleted: pro.proProfile?.projectsCompleted || 0,
      responseTimeHours: pro.proProfile?.responseTimeHours || 24,
      yearsInBusiness: pro.proProfile?.yearsInBusiness,
      hourlyRateMin: pro.proProfile?.hourlyRateMin,
      hourlyRateMax: pro.proProfile?.hourlyRateMax,
      languages: pro.proProfile?.languages || [],
      verificationStatus: pro.proProfile?.verificationStatus || 'pending',
      slug: pro.proProfile?.slug,
      matchScore: score,
    }));

    logger.info('Professional search completed', {
      totalFound: professionals.length,
      returned: results.length,
      category: args.category,
      emirate: args.emirate,
    });

    return formatResults(results, args);
  } catch (error: any) {
    logger.error('Failed to search professionals from AI', {
      error: error.message,
      args,
    });

    return `❌ I apologize, but I encountered an error while searching for professionals: ${error.message}

Please try again or let me know if you need help with something else.`;
  }
}

/**
 * Calculate match score for a professional based on search criteria
 * Higher score = better match
 */
function calculateMatchScore(pro: any, args: SearchProfessionalsArgs): number {
  let score = 0;

  // Category match (30 points)
  if (args.category && pro.proProfile?.categories?.includes(normalizeCategory(args.category))) {
    score += 30;
  }

  // Location match (25 points)
  if (args.emirate) {
    const normalizedEmirate = normalizeEmirate(args.emirate);
    const servesEmirate = pro.proProfile?.serviceAreas?.some(
      (area: any) => area.emirate === normalizedEmirate
    );
    if (servesEmirate) {
      score += 25;
    }
  }

  // Rating score (20 points max - rating × 4)
  const rating = pro.proProfile?.rating || 0;
  score += Math.min(20, rating * 4);

  // Response time score (15 points max)
  const responseTime = pro.proProfile?.responseTimeHours || 24;
  if (args.urgency === 'emergency' || args.urgency === 'urgent') {
    // Favor fast responders for urgent requests
    if (responseTime <= 4) {
      score += 15;
    } else if (responseTime <= 12) {
      score += 12;
    } else if (responseTime <= 24) {
      score += 9;
    } else {
      score += 5;
    }
  } else {
    // Normal priority for response time
    if (responseTime <= 24) {
      score += 10;
    } else {
      score += 5;
    }
  }

  // Experience score (10 points max)
  const yearsInBusiness = pro.proProfile?.yearsInBusiness || 0;
  const projectsCompleted = pro.proProfile?.projectsCompleted || 0;
  score += Math.min(5, yearsInBusiness);
  score += Math.min(5, Math.floor(projectsCompleted / 10));

  return score;
}

/**
 * Format results as a readable message
 */
function formatResults(results: ProfessionalResult[], args: SearchProfessionalsArgs): string {
  const categoryDisplay = args.category ? formatCategory(args.category) : 'home services';
  const emirateDisplay = args.emirate ? formatEmirate(args.emirate) : 'UAE';

  let message = `🔍 **Found ${results.length} Verified Professional${results.length !== 1 ? 's' : ''} for ${categoryDisplay} in ${emirateDisplay}**\n\n`;

  results.forEach((pro, index) => {
    const stars = '⭐'.repeat(Math.round(pro.rating));
    const responseTimeDisplay = formatResponseTime(pro.responseTimeHours);

    message += `**${index + 1}. ${pro.businessName}**`;
    if (pro.verificationStatus === 'approved') {
      message += ' ✓ Verified';
    }
    message += '\n';

    if (pro.tagline) {
      message += `   _${pro.tagline}_\n`;
    }

    message += `   ${stars} ${pro.rating.toFixed(1)} (${pro.reviewCount} reviews)\n`;
    message += `   📍 ${formatCategories(pro.categories)} | ⏱️ ${responseTimeDisplay}\n`;

    if (pro.projectsCompleted > 0) {
      message += `   ✅ ${pro.projectsCompleted} projects completed`;
      if (pro.yearsInBusiness) {
        message += ` | ${pro.yearsInBusiness} years in business`;
      }
      message += '\n';
    }

    if (pro.hourlyRateMin && pro.hourlyRateMax) {
      message += `   💰 AED ${pro.hourlyRateMin} - ${pro.hourlyRateMax}/hr\n`;
    }

    if (pro.slug) {
      message += `   🔗 [View Profile](/professionals/${pro.slug})\n`;
    }

    message += '\n';
  });

  message += `---\n\n`;
  message += `💡 **Want to get quotes?** I can help you post your project and these professionals (plus others) can send you detailed quotes with pricing and timelines.\n\n`;
  message += `Would you like me to create a lead for your project?`;

  return message;
}

/**
 * Generate message when no results found
 */
function generateNoResultsMessage(args: SearchProfessionalsArgs): string {
  const categoryDisplay = args.category ? formatCategory(args.category) : 'home services';
  const emirateDisplay = args.emirate ? formatEmirate(args.emirate) : 'the UAE';

  let message = `🔍 I couldn't find verified professionals for **${categoryDisplay}** in **${emirateDisplay}** matching your criteria.\n\n`;

  message += `**Here's what I can do:**\n`;
  message += `1. **Expand the search** - I can look for professionals in nearby emirates\n`;
  message += `2. **Lower rating requirements** - Include professionals with slightly lower ratings\n`;
  message += `3. **Post your project** - Create a lead and let professionals come to you\n\n`;

  message += `The third option often works best! When you post a lead, professionals who match your needs can claim it and send you quotes.\n\n`;

  message += `Would you like me to help you post your project to the marketplace?`;

  return message;
}

/**
 * Format response time for display
 */
function formatResponseTime(hours: number): string {
  if (hours <= 1) return 'Usually responds within 1 hour';
  if (hours <= 4) return 'Usually responds within 4 hours';
  if (hours <= 12) return 'Usually responds within 12 hours';
  if (hours <= 24) return 'Usually responds within 24 hours';
  return `Usually responds within ${Math.ceil(hours / 24)} days`;
}

/**
 * Format categories for display
 */
function formatCategories(categories: string[]): string {
  if (!categories || categories.length === 0) return 'General Services';
  return categories.slice(0, 3).map(formatCategory).join(', ');
}

/**
 * Normalize category to match database format
 */
function normalizeCategory(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Normalize emirate to match database format
 */
function normalizeEmirate(emirate: string): string {
  const emirateMap: Record<string, string> = {
    dubai: 'dubai',
    'abu dhabi': 'abu-dhabi',
    'abu-dhabi': 'abu-dhabi',
    abudhabi: 'abu-dhabi',
    sharjah: 'sharjah',
    ajman: 'ajman',
    rak: 'rak',
    'ras al khaimah': 'rak',
    fujairah: 'fujairah',
    uaq: 'uaq',
    'umm al quwain': 'uaq',
  };
  return emirateMap[emirate.toLowerCase()] || emirate.toLowerCase();
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    painting: 'Painting',
    carpentry: 'Carpentry',
    hvac: 'HVAC / AC',
    flooring: 'Flooring',
    roofing: 'Roofing',
    landscaping: 'Landscaping',
    'home-cleaning': 'Home Cleaning',
    'pest-control': 'Pest Control',
    handyman: 'Handyman',
    'interior-design': 'Interior Design',
    tiling: 'Tiling',
    waterproofing: 'Waterproofing',
    masonry: 'Masonry',
    'glass-aluminum': 'Glass & Aluminum',
    renovation: 'Renovation',
  };
  return categoryMap[category] || category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Format emirate for display
 */
function formatEmirate(emirate: string): string {
  const emirateMap: Record<string, string> = {
    dubai: 'Dubai',
    'abu-dhabi': 'Abu Dhabi',
    sharjah: 'Sharjah',
    ajman: 'Ajman',
    rak: 'Ras Al Khaimah',
    fujairah: 'Fujairah',
    uaq: 'Umm Al Quwain',
  };
  return emirateMap[emirate.toLowerCase()] || emirate;
}
