import { logger } from '../../utils/logger';

/**
 * Timeline Estimator Service
 *
 * Estimates realistic project timelines considering UAE-specific factors:
 * - Weather (summer heat, rain)
 * - Permit delays
 * - Labor availability
 * - Seasonal considerations
 */

export interface TimelineEstimate {
  estimatedDays: number;
  startDateRecommendation: string;
  phases: {
    name: string;
    duration: number;
    startOffset: number;
    description: string;
  }[];
  considerations: string[];
  criticalPath: string[];
}

export interface TimelineEstimateInput {
  projectType: string;
  scopeDescription: string;
  urgency?: 'emergency' | 'urgent' | 'normal' | 'flexible';
  seasonalConsiderations?: boolean;
  requiresPermits?: boolean;
}

export class TimelineEstimatorService {
  // Base duration data
  private timelineData = {
    // Base durations in days by project type and size
    base_durations: {
      kitchen_remodel: { small: 14, medium: 21, large: 45 },
      bathroom_remodel: { small: 7, medium: 14, large: 21 },
      painting: { small: 2, medium: 5, large: 10 },
      flooring: { small: 3, medium: 7, large: 14 },
      hvac: { small: 2, medium: 4, large: 7 },
      plumbing: { small: 2, medium: 5, large: 10 },
      electrical: { small: 2, medium: 5, large: 10 },
      roofing: { small: 5, medium: 10, large: 21 },
      landscaping: { small: 5, medium: 10, large: 21 },
      general_renovation: { small: 14, medium: 30, large: 60 },
      carpentry: { small: 3, medium: 7, large: 14 },
      tiling: { small: 3, medium: 7, large: 14 },
      waterproofing: { small: 2, medium: 5, large: 10 },
    },

    // Permit delays by type
    permit_delays: {
      structural: 7, // Major renovations, structural changes
      standard: 3, // Electrical, plumbing
      minor: 1, // Small modifications
      none: 0,
    },

    // Seasonal factors
    seasonal_factors: {
      summer_outdoor: 1.3, // 30% longer for outdoor work in summer (Jun-Sep)
      winter_ideal: 1.0, // Ideal conditions (Oct-May)
      rainy_season: 1.1, // 10% longer during occasional rain
    },

    // Urgency multipliers
    urgency_multipliers: {
      emergency: 0.5, // Rush job, overtime, higher costs
      urgent: 0.7, // Expedited schedule
      normal: 1.0, // Standard timeline
      flexible: 1.2, // Can optimize for best schedule/price
    },
  };

  /**
   * Estimate timeline for a project
   */
  async estimateTimeline(input: TimelineEstimateInput): Promise<TimelineEstimate> {
    const { projectType, scopeDescription, urgency, seasonalConsiderations, requiresPermits } =
      input;

    logger.info('Estimating project timeline', {
      projectType,
      urgency,
      requiresPermits,
    });

    // Determine project size
    const size = this.inferProjectSize(scopeDescription);

    // Get base duration
    let baseDays = this.getBaseDuration(projectType, size);

    // Apply urgency multiplier
    const urgencyMultiplier = this.timelineData.urgency_multipliers[urgency || 'normal'];
    baseDays = Math.round(baseDays * urgencyMultiplier);

    // Add permit time
    const permitDays = requiresPermits ? this.estimatePermitDelay(projectType) : 0;

    // Apply seasonal adjustment
    let seasonalMultiplier = 1.0;
    if (seasonalConsiderations && this.isOutdoorWork(projectType)) {
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 5 && currentMonth <= 8) {
        // June-September (summer)
        seasonalMultiplier = this.timelineData.seasonal_factors.summer_outdoor;
      }
    }

    const adjustedDays = Math.round(baseDays * seasonalMultiplier);
    const totalDays = adjustedDays + permitDays;

    // Generate phases
    const phases = this.generatePhases(projectType, adjustedDays, permitDays);

    // Build considerations
    const considerations = this.buildConsiderations(
      projectType,
      urgency,
      seasonalConsiderations,
      requiresPermits
    );

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(projectType);

    // Start date recommendation
    const startDateRecommendation = this.recommendStartDate(seasonalConsiderations, projectType);

    const estimate: TimelineEstimate = {
      estimatedDays: totalDays,
      startDateRecommendation,
      phases,
      considerations,
      criticalPath,
    };

    logger.info('Timeline estimate calculated', {
      totalDays,
      permitDays,
      projectSize: size,
    });

    return estimate;
  }

  /**
   * Get base duration for project
   */
  private getBaseDuration(projectType: string, size: string): number {
    const durations = this.timelineData.base_durations[projectType as keyof typeof this.timelineData.base_durations];

    if (!durations) {
      return { small: 7, medium: 14, large: 30 }[size as keyof { small: number; medium: number; large: number }];
    }

    return durations[size as keyof typeof durations];
  }

  /**
   * Estimate permit delay
   */
  private estimatePermitDelay(projectType: string): number {
    const requiresStructural = [
      'kitchen_remodel',
      'bathroom_remodel',
      'general_renovation',
      'roofing',
    ];
    const requiresStandard = ['electrical', 'plumbing', 'hvac'];

    if (requiresStructural.includes(projectType)) {
      return this.timelineData.permit_delays.structural;
    } else if (requiresStandard.includes(projectType)) {
      return this.timelineData.permit_delays.standard;
    }

    return this.timelineData.permit_delays.minor;
  }

  /**
   * Check if project involves outdoor work
   */
  private isOutdoorWork(projectType: string): boolean {
    return ['roofing', 'landscaping', 'painting', 'waterproofing'].includes(projectType);
  }

  /**
   * Generate project phases
   */
  private generatePhases(
    projectType: string,
    baseDays: number,
    permitDays: number
  ): TimelineEstimate['phases'] {
    const phases: TimelineEstimate['phases'] = [];

    // Permits phase (if applicable)
    if (permitDays > 0) {
      phases.push({
        name: 'Permits & Approvals',
        duration: permitDays,
        startOffset: 0,
        description:
          'Obtain necessary permits from Dubai Municipality or local authorities. Submit drawings and documentation.',
      });
    }

    // Preparation phase (15% of project)
    const prepDuration = Math.max(1, Math.ceil(baseDays * 0.15));
    phases.push({
      name: 'Preparation & Planning',
      duration: prepDuration,
      startOffset: permitDays,
      description:
        'Site preparation, material procurement, contractor mobilization, and final planning.',
    });

    // Execution phase (70% of project)
    const execDuration = Math.ceil(baseDays * 0.7);
    phases.push({
      name: 'Execution',
      duration: execDuration,
      startOffset: permitDays + prepDuration,
      description:
        'Main construction, installation, or renovation work. Primary tradespeople on site daily.',
    });

    // Finishing phase (15% of project)
    const finishDuration = Math.max(1, baseDays - prepDuration - execDuration);
    phases.push({
      name: 'Finishing & Inspection',
      duration: finishDuration,
      startOffset: permitDays + prepDuration + execDuration,
      description:
        'Final touches, cleanup, quality inspection, and final approval. Snag list resolution.',
    });

    return phases;
  }

  /**
   * Infer project size from description
   */
  private inferProjectSize(description: string): 'small' | 'medium' | 'large' {
    const lowerDesc = description.toLowerCase();

    const largeKeywords = ['entire', 'whole', 'complete', 'full', 'villa', 'large', 'extensive'];
    const smallKeywords = ['single', 'one', 'small', 'minor', 'simple', 'apartment'];

    if (largeKeywords.some((keyword) => lowerDesc.includes(keyword))) {
      return 'large';
    } else if (smallKeywords.some((keyword) => lowerDesc.includes(keyword))) {
      return 'small';
    }

    return 'medium';
  }

  /**
   * Build considerations array
   */
  private buildConsiderations(
    projectType: string,
    urgency: string | undefined,
    seasonal: boolean | undefined,
    permits: boolean | undefined
  ): string[] {
    const considerations: string[] = [];

    if (permits) {
      considerations.push(
        'Dubai Municipality permits typically take 5-7 business days',
        'NOC from landlord required if renting (can take 3-5 additional days)'
      );
    }

    if (seasonal && this.isOutdoorWork(projectType)) {
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 5 && currentMonth <= 8) {
        considerations.push(
          'UAE summer heat (Jun-Sep) may extend outdoor work by 30%',
          'Consider scheduling outdoor work for October-April for optimal conditions'
        );
      } else {
        considerations.push('Current season is ideal for outdoor work in UAE');
      }
    }

    if (urgency === 'emergency') {
      considerations.push(
        'Rush job may incur 50-100% premium on labor costs',
        'Limited contractor availability for emergency work'
      );
    } else if (urgency === 'flexible') {
      considerations.push(
        'Flexible timeline allows for better contractor rates',
        'Can schedule during off-peak season for cost savings'
      );
    }

    considerations.push(
      'Material availability may affect timeline (imported materials take 1-2 weeks)',
      'Multiple tradespeople required - scheduling coordination is critical',
      'Buffer time included for unexpected delays or issues'
    );

    if (['kitchen_remodel', 'bathroom_remodel'].includes(projectType)) {
      considerations.push('Room will be unusable during renovation - plan accordingly');
    }

    return considerations;
  }

  /**
   * Identify critical path items
   */
  private identifyCriticalPath(projectType: string): string[] {
    const criticalPaths: Record<string, string[]> = {
      kitchen_remodel: [
        'Demolition of old cabinets and fixtures',
        'Plumbing rough-in',
        'Electrical rough-in',
        'Wall preparation and repairs',
        'Cabinet installation (longest lead time)',
        'Countertop fabrication and installation',
        'Backsplash tiling',
        'Final plumbing and electrical connections',
      ],
      bathroom_remodel: [
        'Demolition',
        'Waterproofing (critical - must cure properly)',
        'Plumbing installation',
        'Tiling (walls then floor)',
        'Fixture installation',
        'Final grouting and sealing',
      ],
      painting: [
        'Surface preparation and repairs',
        'Primer application and drying',
        'First coat application',
        'Second coat application',
        'Touch-ups and cleanup',
      ],
      roofing: [
        'Old roof removal',
        'Structural inspection and repairs',
        'Waterproofing membrane installation',
        'New roofing installation',
        'Final waterproofing and sealing',
      ],
    };

    return (
      criticalPaths[projectType] || [
        'Planning and design',
        'Preparation work',
        'Primary execution',
        'Final inspection and completion',
      ]
    );
  }

  /**
   * Recommend start date based on conditions
   */
  private recommendStartDate(seasonal: boolean | undefined, projectType: string): string {
    if (seasonal && this.isOutdoorWork(projectType)) {
      const month = new Date().getMonth();

      if (month >= 5 && month <= 8) {
        // Summer months
        return 'Consider starting in October-April for outdoor work to avoid extreme heat. If urgent, expect 30% longer duration.';
      } else {
        return 'Current season is ideal for outdoor work in UAE. Can start immediately upon permit approval.';
      }
    }

    return 'Can start immediately upon permit approval and contractor availability.';
  }
}
