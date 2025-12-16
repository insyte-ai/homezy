/**
 * JSON Questionnaire Loader
 * Loads service-specific question configurations with in-memory caching
 */

import { ServiceQuestionnaire } from '@/config/questionTypes';
import serviceMapping from '@/data/lead-form-data/service-mapping.json';

// In-memory cache for loaded questionnaires
const questionnaireCache = new Map<string, ServiceQuestionnaire>();

// Available config files in config/services/ directory
const CONFIG_FILES = [
  // Core home services
  'plumbing',
  'electrical',
  'hvac',
  'handyman',
  'handyman-services',
  'appliance-repair',

  // Remodeling & renovation
  'kitchen-remodeling',
  'bathroom-remodeling',
  'flooring',
  'painting',
  'interior-design',
  'fit-outs',
  'villa-renovation',
  'home-improvement',
  'home-remodeling',

  // Doors, windows & structural
  'doors-windows',
  'roofing',
  'waterproofing',
  'masonry',

  // Outdoor & landscaping
  'outdoor',
  'landscaping',
  'swimming-pool',

  // Cleaning & maintenance
  'cleaning',
  'junk-removal',
  'pest-control',
  'home-maintenance',

  // Smart home & assembly
  'smart-home',
  'assembly',

  // Moving & storage
  'moving-storage',

  // Lessons & education
  'music-lessons',
  'sports-lessons',
  'tutoring',

  // Wellness & personal services
  'wellness',
  'personal-training',
  'pet-services',

  // Auto services
  'auto-services',

  // Business & professional services
  'business-services',
  'creative-services',
  'engineering',
  'event-services',
  'legal-services',
  'project-management',
  'property-services',
];

// Cast service mapping to allow string indexing
const serviceMappingData = serviceMapping as Record<string, string>;

/**
 * Map a service ID to its config file name
 * Uses service-mapping.json to handle variations in service names
 */
function getConfigFileName(serviceId: string): string | null {
  // First check if serviceId directly matches a config file
  if (CONFIG_FILES.includes(serviceId)) {
    return serviceId;
  }

  // Then check the service mapping for a translation
  const mappedName = serviceMappingData[serviceId];
  if (mappedName && CONFIG_FILES.includes(mappedName)) {
    return mappedName;
  }

  return null;
}

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
    // Determine which JSON file to load using the mapping
    const configFileName = getConfigFileName(serviceId);
    const fileName = configFileName || '_generic';

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
  return getConfigFileName(serviceId) !== null;
}

/**
 * Get all available config file names with custom questionnaires
 */
export function getCustomServiceIds(): string[] {
  return [...CONFIG_FILES];
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
