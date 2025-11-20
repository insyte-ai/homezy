/**
 * JSON Questionnaire Loader
 * Loads service-specific question configurations with in-memory caching
 */

import { ServiceQuestionnaire } from '@/config/questionTypes';

// In-memory cache for loaded questionnaires
const questionnaireCache = new Map<string, ServiceQuestionnaire>();

// Available service IDs with custom questionnaires
// Updated to include all 17 auto-generated configs + 6 original configs
const CUSTOM_SERVICES = [
  // Original configs
  'plumbing',
  'electrical',
  'hvac',
  'kitchen-remodeling',
  'bathroom-remodeling',
  'handyman-services',

  // Auto-generated configs (from data/lead-form-data)
  'business-services',
  'engineering',
  'event-services',
  'home-improvement',
  'home-maintenance',
  'home-remodeling',
  'landscaping',
  'legal-services',
  'personal-training',
  'pet-services',
  'project-management',
  'property-services',
  'smart-home',
  'swimming-pool',
];

/**
 * Load questionnaire for a specific service
 * Uses in-memory cache to avoid repeated file loads
 * Falls back to _generic.json for services without custom questions
 */
export async function loadQuestionnaire(
  serviceId: string
): Promise<ServiceQuestionnaire> {
  // Check cache first
  if (questionnaireCache.has(serviceId)) {
    return questionnaireCache.get(serviceId)!;
  }

  try {
    // Determine which JSON file to load
    const fileName = CUSTOM_SERVICES.includes(serviceId)
      ? serviceId
      : '_generic';

    // Dynamically import the JSON file
    const questionnaire = await import(
      `@/config/services/${fileName}.json`
    );

    // If using generic, override the serviceId and serviceName
    const loadedQuestionnaire: ServiceQuestionnaire = questionnaire.default || questionnaire;

    if (fileName === '_generic' && serviceId !== '_generic') {
      loadedQuestionnaire.serviceId = serviceId;
      // You could also map serviceId to a friendly name here if needed
    }

    // Cache it
    questionnaireCache.set(serviceId, loadedQuestionnaire);

    return loadedQuestionnaire;
  } catch (error) {
    console.error(`Failed to load questionnaire for ${serviceId}:`, error);

    // Ultimate fallback: load generic if it fails
    if (serviceId !== '_generic') {
      return loadQuestionnaire('_generic');
    }

    throw new Error(`Failed to load questionnaire for ${serviceId}`);
  }
}

/**
 * Check if a service has a custom questionnaire
 */
export function hasCustomQuestionnaire(serviceId: string): boolean {
  return CUSTOM_SERVICES.includes(serviceId);
}

/**
 * Get all available service IDs with custom questionnaires
 */
export function getCustomServiceIds(): string[] {
  return [...CUSTOM_SERVICES];
}

/**
 * Preload questionnaires for multiple services
 * Useful for preloading common services on app initialization
 */
export async function preloadQuestionnaires(
  serviceIds: string[]
): Promise<void> {
  await Promise.all(serviceIds.map((id) => loadQuestionnaire(id)));
}

/**
 * Clear the questionnaire cache
 * Useful for testing or when you need to reload configurations
 */
export function clearQuestionnaireCache(): void {
  questionnaireCache.clear();
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): {
  size: number;
  cachedServices: string[];
} {
  return {
    size: questionnaireCache.size,
    cachedServices: Array.from(questionnaireCache.keys()),
  };
}
