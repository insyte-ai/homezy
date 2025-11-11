import { logger } from '../../utils/logger';

/**
 * Budget Estimator Service
 *
 * Calculates accurate budget estimates for home improvement projects in UAE
 * Based on real UAE market data with emirate-specific pricing
 */

export interface BudgetEstimate {
  total: number;
  breakdown: {
    labor: number;
    materials: number;
    permits: number;
    contingency: number;
    vat: number;
  };
  currency: 'AED';
  confidence: 'low' | 'medium' | 'high';
  notes: string[];
  projectSize: string;
  estimatedDuration: string;
}

export interface BudgetEstimateInput {
  projectType: string;
  scopeDescription: string;
  materialsQuality: 'economy' | 'standard' | 'premium';
  emirate?: string;
  projectSize?: 'small' | 'medium' | 'large';
}

export class BudgetEstimatorService {
  // UAE market pricing data
  private pricingData = {
    // Labor rates per day by emirate
    labor_rates: {
      Dubai: { skilled: 80, standard: 50, helper: 30 },
      'Abu Dhabi': { skilled: 75, standard: 45, helper: 28 },
      Sharjah: { skilled: 60, standard: 40, helper: 25 },
      Ajman: { skilled: 55, standard: 38, helper: 23 },
      RAK: { skilled: 55, standard: 38, helper: 23 },
      Fujairah: { skilled: 55, standard: 38, helper: 23 },
      UAQ: { skilled: 55, standard: 38, helper: 23 },
    },

    // Material quality multipliers
    material_multipliers: {
      economy: 0.7,
      standard: 1.0,
      premium: 1.5,
    },

    // Base costs by project type and size (AED)
    project_base_costs: {
      kitchen_remodel: { small: 30000, medium: 70000, large: 150000 },
      bathroom_remodel: { small: 15000, medium: 35000, large: 70000 },
      painting: { small: 2000, medium: 5000, large: 12000 },
      flooring: { small: 8000, medium: 18000, large: 40000 },
      hvac: { small: 5000, medium: 12000, large: 25000 },
      plumbing: { small: 3000, medium: 8000, large: 18000 },
      electrical: { small: 3000, medium: 8000, large: 18000 },
      roofing: { small: 10000, medium: 25000, large: 60000 },
      landscaping: { small: 8000, medium: 20000, large: 50000 },
      general_renovation: { small: 20000, medium: 50000, large: 120000 },
      carpentry: { small: 5000, medium: 12000, large: 30000 },
      tiling: { small: 6000, medium: 15000, large: 35000 },
      waterproofing: { small: 4000, medium: 10000, large: 25000 },
    },

    // Permit costs
    permit_costs: {
      structural: 2000,
      electrical: 500,
      plumbing: 500,
      standard: 1000,
      none: 0,
    },

    // VAT rate in UAE
    vat_rate: 0.05, // 5%
  };

  /**
   * Calculate budget estimate for a project
   */
  async calculateBudget(input: BudgetEstimateInput): Promise<BudgetEstimate> {
    const { projectType, scopeDescription, materialsQuality, emirate, projectSize } = input;

    logger.info('Calculating budget estimate', {
      projectType,
      materialsQuality,
      emirate,
      projectSize,
    });

    // Determine project size if not specified
    const size = projectSize || this.inferProjectSize(scopeDescription);

    // Get base cost
    const baseCost = this.getBaseCost(projectType, size);

    // Apply material quality multiplier
    const materialMultiplier = this.pricingData.material_multipliers[materialsQuality];
    const materialCost = baseCost * materialMultiplier;

    // Calculate labor cost
    const laborRate = this.getLaborRate(emirate || 'Dubai');
    const estimatedDays = this.estimateDays(projectType, size);
    const laborCost = laborRate * estimatedDays * 8; // 8 hours per day

    // Permit costs
    const permitCost = this.estimatePermitCost(projectType);

    // Subtotal
    const subtotal = laborCost + materialCost + permitCost;

    // Contingency (15% buffer for unexpected costs)
    const contingency = subtotal * 0.15;

    // VAT (5%)
    const vat = subtotal * this.pricingData.vat_rate;

    // Total
    const total = Math.round(subtotal + contingency + vat);

    // Assess confidence based on description detail
    const confidence = this.assessConfidence(scopeDescription);

    // Build notes
    const notes = this.buildNotes(emirate, materialsQuality, projectType, permitCost > 0);

    const estimate: BudgetEstimate = {
      total,
      breakdown: {
        labor: Math.round(laborCost),
        materials: Math.round(materialCost),
        permits: permitCost,
        contingency: Math.round(contingency),
        vat: Math.round(vat),
      },
      currency: 'AED',
      confidence,
      notes,
      projectSize: size,
      estimatedDuration: `${estimatedDays} days`,
    };

    logger.info('Budget estimate calculated', {
      total: estimate.total,
      confidence: estimate.confidence,
      projectSize: size,
    });

    return estimate;
  }

  /**
   * Get base cost for project type and size
   */
  private getBaseCost(projectType: string, size: string): number {
    const costs = this.pricingData.project_base_costs[projectType as keyof typeof this.pricingData.project_base_costs];

    if (!costs) {
      // Default for unknown project types
      return { small: 10000, medium: 25000, large: 60000 }[size as keyof { small: number; medium: number; large: number }];
    }

    return costs[size as keyof typeof costs];
  }

  /**
   * Get labor rate for emirate
   */
  private getLaborRate(emirate: string): number {
    const rates = this.pricingData.labor_rates[emirate as keyof typeof this.pricingData.labor_rates];
    return rates ? rates.standard : 50; // Default to 50 AED/hour
  }

  /**
   * Estimate days required for project
   */
  private estimateDays(projectType: string, size: string): number {
    const dayEstimates: Record<string, Record<string, number>> = {
      kitchen_remodel: { small: 10, medium: 21, large: 45 },
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
    };

    const estimates = dayEstimates[projectType];
    return estimates ? estimates[size as keyof typeof estimates] : 7; // Default 7 days
  }

  /**
   * Estimate permit costs
   */
  private estimatePermitCost(projectType: string): number {
    const requiresStructuralPermit = [
      'kitchen_remodel',
      'bathroom_remodel',
      'general_renovation',
      'roofing',
    ];
    const requiresStandardPermit = ['electrical', 'plumbing', 'hvac'];

    if (requiresStructuralPermit.includes(projectType)) {
      return this.pricingData.permit_costs.structural;
    } else if (requiresStandardPermit.includes(projectType)) {
      return this.pricingData.permit_costs.standard;
    }

    return this.pricingData.permit_costs.none;
  }

  /**
   * Infer project size from description
   */
  private inferProjectSize(description: string): 'small' | 'medium' | 'large' {
    const lowerDesc = description.toLowerCase();

    // Keywords for large projects
    const largeKeywords = [
      'entire',
      'whole',
      'complete',
      'full',
      'villa',
      'house',
      'extensive',
      'major',
      'large',
    ];

    // Keywords for small projects
    const smallKeywords = [
      'single',
      'one',
      'small',
      'minor',
      'simple',
      'basic',
      'quick',
      'apartment',
    ];

    if (largeKeywords.some((keyword) => lowerDesc.includes(keyword))) {
      return 'large';
    } else if (smallKeywords.some((keyword) => lowerDesc.includes(keyword))) {
      return 'small';
    }

    return 'medium'; // Default to medium
  }

  /**
   * Assess confidence based on description detail
   */
  private assessConfidence(description: string): 'low' | 'medium' | 'high' {
    const wordCount = description.split(' ').length;

    if (wordCount < 10) return 'low';
    if (wordCount < 30) return 'medium';
    return 'high';
  }

  /**
   * Build notes array
   */
  private buildNotes(
    emirate: string | undefined,
    quality: string,
    projectType: string,
    requiresPermit: boolean
  ): string[] {
    const notes = [];

    notes.push('Includes 5% UAE VAT');
    notes.push('Prices valid for 30 days');
    notes.push('15% contingency included for unexpected costs');

    if (emirate) {
      notes.push(`Based on ${emirate} market rates`);
    } else {
      notes.push('Based on UAE average market rates');
    }

    if (quality === 'premium') {
      notes.push('Premium materials: European/high-end brands');
    } else if (quality === 'economy') {
      notes.push('Economy materials: Basic functional quality');
    } else {
      notes.push('Standard materials: Good quality, reliable brands');
    }

    if (requiresPermit) {
      notes.push('Permit costs included - may vary by location');
    }

    notes.push('Get 3-5 quotes from professionals for comparison');

    return notes;
  }
}
