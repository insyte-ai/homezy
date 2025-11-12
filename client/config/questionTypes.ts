/**
 * TypeScript types for service question JSON schema
 * Used for both homeowner lead creation and pro service profile setup
 */

export type QuestionType = 'single-choice' | 'multiple-choice' | 'text' | 'number';

/**
 * How an answer should be matched against pro capabilities
 * - direct: Exact match required (e.g., pro does emergency work, lead needs emergency)
 * - partial: Partial credit if related (e.g., pro does kitchen, lead is in bathroom - both plumbing)
 * - flexible: Any answer is acceptable (e.g., timeline preferences)
 */
export type MatchType = 'direct' | 'partial' | 'flexible';

/**
 * Tags for categorizing answers and enabling smart matching
 */
export type AnswerTag =
  | 'emergency'
  | 'urgent'
  | 'high_priority'
  | 'high_value'
  | 'complex'
  | 'simple'
  | 'repair'
  | 'installation'
  | 'inspection'
  | 'maintenance'
  | 'common'
  | 'specialized';

/**
 * Individual answer option for choice-type questions
 */
export interface QuestionOption {
  /** Unique value for this option */
  value: string;
  /** Display label for the user */
  label: string;
  /** Optional icon (emoji or icon name) */
  icon?: string;
  /** Weight of this answer's importance (0-1, default 0.5) */
  weight?: number;
  /** Tags for smart matching and categorization */
  tags?: AnswerTag[];
  /** How this answer should be matched */
  matchType?: MatchType;
  /** Optional help text explaining this option */
  helpText?: string;
}

/**
 * A single question in a service questionnaire
 */
export interface ServiceQuestion {
  /** Unique ID for this question */
  id: string;
  /** The question text shown to the user */
  question: string;
  /** Type of input for this question */
  type: QuestionType;
  /** Whether this question must be answered */
  required: boolean;
  /** Overall weight of this question for matching (0-1) */
  weight: number;
  /** Answer options (for choice types) */
  options?: QuestionOption[];
  /** Placeholder text (for text/number types) */
  placeholder?: string;
  /** Help text explaining the question */
  helpText?: string;
  /** Minimum value (for number type) */
  min?: number;
  /** Maximum value (for number type) */
  max?: number;
  /** Minimum length (for text type) */
  minLength?: number;
  /** Maximum length (for text type) */
  maxLength?: number;
}

/**
 * Complete service questionnaire
 */
export interface ServiceQuestionnaire {
  /** Service category ID (e.g., 'plumbing') */
  serviceId: string;
  /** Display name of the service */
  serviceName: string;
  /** Description of what this service covers */
  description?: string;
  /** Array of questions for this service */
  questions: ServiceQuestion[];
  /** Metadata about when this questionnaire was created/updated */
  metadata?: {
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
  };
}

/**
 * User's answers to service questions
 * Used in both Lead and ProProfile documents
 */
export interface ServiceAnswers {
  /** Service category ID */
  serviceId: string;
  /** Map of question ID to answer value(s) */
  answers: {
    [questionId: string]: string | string[] | number;
  };
  /** When these answers were provided */
  answeredAt: Date;
  /** When these answers were last updated */
  updatedAt?: Date;
}

/**
 * Lead matching result
 */
export interface LeadMatchResult {
  /** Overall match percentage (0-100) */
  matchPercentage: number;
  /** Breakdown by question */
  questionMatches: {
    questionId: string;
    question: string;
    leadAnswer: string | string[];
    proAnswer: string | string[];
    matched: boolean;
    partialMatch: boolean;
    weight: number;
    score: number;
  }[];
  /** Key reasons for match/mismatch */
  insights: {
    strengths: string[]; // e.g., ["Perfect match for emergency work", "Same location experience"]
    gaps: string[]; // e.g., ["Pro doesn't handle full remodels", "No experience with this fixture type"]
  };
  /** Match quality tier */
  tier: 'perfect' | 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Helper to determine match tier from percentage
 */
export function getMatchTier(percentage: number): LeadMatchResult['tier'] {
  if (percentage >= 90) return 'perfect';
  if (percentage >= 75) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'fair';
  return 'poor';
}

/**
 * Color mapping for match tiers
 */
export const MATCH_TIER_COLORS: Record<LeadMatchResult['tier'], string> = {
  perfect: 'green',
  excellent: 'teal',
  good: 'blue',
  fair: 'yellow',
  poor: 'gray',
};

/**
 * Badge text for match tiers
 */
export const MATCH_TIER_LABELS: Record<LeadMatchResult['tier'], string> = {
  perfect: '🎯 Perfect Match',
  excellent: '⭐ Excellent Match',
  good: '👍 Good Match',
  fair: '🤔 Fair Match',
  poor: '❌ Low Match',
};
