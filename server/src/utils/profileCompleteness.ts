/**
 * Profile Completeness Calculation Utility
 * Calculates how complete a professional's profile is
 */

import type { ProProfile, Availability, WeeklySchedule } from '@homezy/shared';

export interface ProfileCompletenessResult {
  percentage: number;
  completedSections: string[];
  missingSections: string[];
  sectionDetails: {
    [key: string]: {
      completed: boolean;
      weight: number;
      items?: string[];
    };
  };
}

/**
 * Section weights (must sum to 100)
 */
const SECTION_WEIGHTS = {
  basicInfo: 20, // Business name, tagline, bio
  services: 15, // Categories, service areas
  pricing: 10, // Hourly rates or minimum project size
  portfolio: 20, // At least 5 portfolio items
  verification: 25, // Basic or comprehensive verification
  availability: 5, // Has availability schedule set
  additional: 5, // Years in business, team size, languages
};

/**
 * Calculate profile completeness percentage and details
 * @param profile - Professional profile to evaluate
 * @returns Completeness result with percentage and details
 */
export function calculateProfileCompleteness(
  profile: ProProfile
): ProfileCompletenessResult {
  const sectionDetails: ProfileCompletenessResult['sectionDetails'] = {};
  let totalWeight = 0;
  let completedWeight = 0;

  // 1. Basic Info (20 points)
  const hasBasicInfo =
    Boolean(profile.businessName) &&
    Boolean(profile.tagline?.trim()) &&
    Boolean(profile.bio?.trim() && profile.bio.length >= 50);

  sectionDetails.basicInfo = {
    completed: hasBasicInfo,
    weight: SECTION_WEIGHTS.basicInfo,
    items: [
      profile.businessName ? '✓ Business name' : '✗ Business name',
      profile.tagline?.trim() ? '✓ Tagline' : '✗ Tagline',
      profile.bio?.trim() && profile.bio.length >= 50
        ? '✓ Bio (50+ characters)'
        : '✗ Bio (50+ characters)',
    ],
  };
  totalWeight += SECTION_WEIGHTS.basicInfo;
  if (hasBasicInfo) completedWeight += SECTION_WEIGHTS.basicInfo;

  // 2. Services (15 points)
  const hasServices =
    profile.categories.length > 0 && profile.serviceAreas.length > 0;

  sectionDetails.services = {
    completed: hasServices,
    weight: SECTION_WEIGHTS.services,
    items: [
      profile.categories.length > 0
        ? `✓ Service categories (${profile.categories.length})`
        : '✗ Service categories',
      profile.serviceAreas.length > 0
        ? `✓ Service areas (${profile.serviceAreas.length})`
        : '✗ Service areas',
    ],
  };
  totalWeight += SECTION_WEIGHTS.services;
  if (hasServices) completedWeight += SECTION_WEIGHTS.services;

  // 3. Pricing (10 points)
  const hasPricing =
    (profile.hourlyRateMin !== undefined && profile.hourlyRateMin > 0) ||
    (profile.minimumProjectSize !== undefined && profile.minimumProjectSize > 0);

  sectionDetails.pricing = {
    completed: hasPricing,
    weight: SECTION_WEIGHTS.pricing,
    items: [
      profile.hourlyRateMin || profile.hourlyRateMax
        ? `✓ Hourly rates (${profile.hourlyRateMin || 0} - ${profile.hourlyRateMax || 0} AED)`
        : '✗ Hourly rates',
      profile.minimumProjectSize
        ? `✓ Minimum project size (${profile.minimumProjectSize} AED)`
        : '✗ Minimum project size',
    ],
  };
  totalWeight += SECTION_WEIGHTS.pricing;
  if (hasPricing) completedWeight += SECTION_WEIGHTS.pricing;

  // 4. Portfolio (20 points)
  const portfolioCount = profile.portfolio?.length || 0;
  const hasPortfolio = portfolioCount >= 5;
  const hasFeatured = (profile.featuredProjects?.length || 0) >= 3;

  sectionDetails.portfolio = {
    completed: hasPortfolio,
    weight: SECTION_WEIGHTS.portfolio,
    items: [
      portfolioCount >= 5
        ? `✓ Portfolio items (${portfolioCount}/5+)`
        : `✗ Portfolio items (${portfolioCount}/5+)`,
      hasFeatured
        ? `✓ Featured projects (${profile.featuredProjects?.length || 0}/3+)`
        : `✗ Featured projects (${profile.featuredProjects?.length || 0}/3+)`,
    ],
  };
  totalWeight += SECTION_WEIGHTS.portfolio;
  if (hasPortfolio) completedWeight += SECTION_WEIGHTS.portfolio;

  // 5. Verification (25 points) - Most important!
  const isVerified =
    profile.verificationStatus === 'basic' ||
    profile.verificationStatus === 'comprehensive';
  const hasDocuments = (profile.verificationDocuments?.length || 0) >= 2;

  sectionDetails.verification = {
    completed: isVerified,
    weight: SECTION_WEIGHTS.verification,
    items: [
      isVerified
        ? `✓ Verified (${profile.verificationStatus})`
        : `✗ Not verified (${profile.verificationStatus})`,
      hasDocuments
        ? `✓ Documents uploaded (${profile.verificationDocuments?.length || 0})`
        : `✗ Documents uploaded (${profile.verificationDocuments?.length || 0}/2+)`,
    ],
  };
  totalWeight += SECTION_WEIGHTS.verification;
  if (isVerified) completedWeight += SECTION_WEIGHTS.verification;

  // 6. Availability (5 points)
  const hasAvailability = profile.availability && hasAnyAvailableDay(profile.availability);

  sectionDetails.availability = {
    completed: hasAvailability,
    weight: SECTION_WEIGHTS.availability,
    items: [
      hasAvailability
        ? '✓ Availability schedule set'
        : '✗ Availability schedule not set',
    ],
  };
  totalWeight += SECTION_WEIGHTS.availability;
  if (hasAvailability) completedWeight += SECTION_WEIGHTS.availability;

  // 7. Additional Info (5 points)
  const hasAdditional =
    (profile.yearsInBusiness !== undefined && profile.yearsInBusiness > 0) &&
    (profile.teamSize !== undefined && profile.teamSize > 0) &&
    (profile.languages?.length || 0) > 0;

  sectionDetails.additional = {
    completed: hasAdditional,
    weight: SECTION_WEIGHTS.additional,
    items: [
      profile.yearsInBusiness
        ? `✓ Years in business (${profile.yearsInBusiness})`
        : '✗ Years in business',
      profile.teamSize ? `✓ Team size (${profile.teamSize})` : '✗ Team size',
      profile.languages?.length
        ? `✓ Languages (${profile.languages.join(', ')})`
        : '✗ Languages',
    ],
  };
  totalWeight += SECTION_WEIGHTS.additional;
  if (hasAdditional) completedWeight += SECTION_WEIGHTS.additional;

  // Calculate percentage
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Determine completed and missing sections
  const completedSections: string[] = [];
  const missingSections: string[] = [];

  Object.entries(sectionDetails).forEach(([key, details]) => {
    const sectionName = formatSectionName(key);
    if (details.completed) {
      completedSections.push(sectionName);
    } else {
      missingSections.push(sectionName);
    }
  });

  return {
    percentage,
    completedSections,
    missingSections,
    sectionDetails,
  };
}

/**
 * Check if availability schedule has any available days
 */
function hasAnyAvailableDay(availability: Availability): boolean {
  if (!availability?.schedule) return false;

  const schedule: WeeklySchedule = availability.schedule;
  const days: (keyof WeeklySchedule)[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  return days.some((day) => schedule[day]?.isAvailable === true);
}

/**
 * Format section name for display
 */
function formatSectionName(key: string): string {
  const names: { [key: string]: string } = {
    basicInfo: 'Basic Information',
    services: 'Services & Areas',
    pricing: 'Pricing',
    portfolio: 'Portfolio',
    verification: 'Verification',
    availability: 'Availability',
    additional: 'Additional Info',
  };

  return names[key] || key;
}

/**
 * Get next steps to complete profile
 * @param profile - Professional profile
 * @returns Array of next steps with priority
 */
export function getProfileNextSteps(
  profile: ProProfile
): Array<{ priority: number; section: string; action: string; link: string }> {
  const completeness = calculateProfileCompleteness(profile);
  const steps: Array<{ priority: number; section: string; action: string; link: string }> =
    [];

  // Priority order: Verification > Portfolio > Basic Info > Services > Pricing > Availability > Additional
  if (!completeness.sectionDetails.verification.completed) {
    steps.push({
      priority: 1,
      section: 'Verification',
      action: 'Upload verification documents (license & insurance)',
      link: '/pro/dashboard/verification',
    });
  }

  if (!completeness.sectionDetails.portfolio.completed) {
    steps.push({
      priority: 2,
      section: 'Portfolio',
      action: 'Add at least 5 portfolio photos',
      link: '/pro/dashboard/portfolio',
    });
  }

  if (!completeness.sectionDetails.basicInfo.completed) {
    steps.push({
      priority: 3,
      section: 'Basic Information',
      action: 'Complete tagline and bio (50+ characters)',
      link: '/pro/dashboard/profile',
    });
  }

  if (!completeness.sectionDetails.services.completed) {
    steps.push({
      priority: 4,
      section: 'Services',
      action: 'Add service areas and categories',
      link: '/pro/dashboard/profile#services',
    });
  }

  if (!completeness.sectionDetails.pricing.completed) {
    steps.push({
      priority: 5,
      section: 'Pricing',
      action: 'Set hourly rates or minimum project size',
      link: '/pro/dashboard/profile#pricing',
    });
  }

  if (!completeness.sectionDetails.availability.completed) {
    steps.push({
      priority: 6,
      section: 'Availability',
      action: 'Set your availability schedule',
      link: '/pro/dashboard/profile#availability',
    });
  }

  if (!completeness.sectionDetails.additional.completed) {
    steps.push({
      priority: 7,
      section: 'Additional Info',
      action: 'Add years in business, team size, and languages',
      link: '/pro/dashboard/profile#additional',
    });
  }

  return steps;
}

export default {
  calculateProfileCompleteness,
  getProfileNextSteps,
};
