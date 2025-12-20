/**
 * Questionnaire Loader Service
 * Loads service-specific questionnaires for the lead creation flow
 */

import { ServiceQuestionnaire } from '../store/leadFormStore';

// Import questionnaire JSON files
import genericQuestionnaire from '../data/questionnaires/_generic.json';
import plumbingQuestionnaire from '../data/questionnaires/plumbing.json';
import electricalQuestionnaire from '../data/questionnaires/electrical.json';
import hvacQuestionnaire from '../data/questionnaires/hvac.json';
import handymanQuestionnaire from '../data/questionnaires/handyman.json';
import cleaningQuestionnaire from '../data/questionnaires/cleaning.json';
import paintingQuestionnaire from '../data/questionnaires/painting.json';
import landscapingQuestionnaire from '../data/questionnaires/landscaping.json';
import flooringQuestionnaire from '../data/questionnaires/flooring.json';
import kitchenRemodelingQuestionnaire from '../data/questionnaires/kitchen-remodeling.json';
import bathroomRemodelingQuestionnaire from '../data/questionnaires/bathroom-remodeling.json';

// Questionnaire registry
const questionnaires: Record<string, ServiceQuestionnaire> = {
  '_generic': genericQuestionnaire as ServiceQuestionnaire,
  'plumbing': plumbingQuestionnaire as ServiceQuestionnaire,
  'electrical': electricalQuestionnaire as ServiceQuestionnaire,
  'hvac': hvacQuestionnaire as ServiceQuestionnaire,
  'handyman': handymanQuestionnaire as ServiceQuestionnaire,
  'cleaning': cleaningQuestionnaire as ServiceQuestionnaire,
  'painting': paintingQuestionnaire as ServiceQuestionnaire,
  'landscaping': landscapingQuestionnaire as ServiceQuestionnaire,
  'flooring': flooringQuestionnaire as ServiceQuestionnaire,
  'kitchen-remodeling': kitchenRemodelingQuestionnaire as ServiceQuestionnaire,
  'bathroom-remodeling': bathroomRemodelingQuestionnaire as ServiceQuestionnaire,
};

// Service name/slug to questionnaire file mapping
const serviceMapping: Record<string, string> = {
  // Plumbing
  'plumbing': 'plumbing',
  'Plumbing': 'plumbing',
  'plumbing-pipe-repair': 'plumbing',
  'plumbing-drain-repair': 'plumbing',
  'emergency-plumbing': 'plumbing',
  'water-leak-detection': 'plumbing',

  // Electrical
  'electrical': 'electrical',
  'Electrical': 'electrical',
  'electrical-installation': 'electrical',
  'electrical-repair': 'electrical',

  // HVAC
  'hvac': 'hvac',
  'HVAC': 'hvac',
  'air-conditioning': 'hvac',
  'ac-repair': 'hvac',
  'ac-installation': 'hvac',
  'ac-maintenance': 'hvac',

  // Handyman
  'handyman': 'handyman',
  'handyman-services': 'handyman',
  'general-repairs': 'handyman',

  // Cleaning
  'cleaning': 'cleaning',
  'home-cleaning': 'cleaning',
  'deep-cleaning': 'cleaning',
  'specialized-cleaning': 'cleaning',

  // Painting
  'painting': 'painting',
  'interior-painting': 'painting',
  'exterior-painting': 'painting',

  // Landscaping
  'landscaping': 'landscaping',
  'landscape-design': 'landscaping',
  'landscape-maintenance': 'landscaping',
  'garden-maintenance': 'landscaping',

  // Flooring
  'flooring': 'flooring',
  'flooring-installation': 'flooring',
  'tile-installation': 'flooring',

  // Kitchen Remodeling
  'kitchen-remodeling': 'kitchen-remodeling',
  'kitchen-remodelling': 'kitchen-remodeling',
  'kitchen-renovation': 'kitchen-remodeling',

  // Bathroom Remodeling
  'bathroom-remodeling': 'bathroom-remodeling',
  'bathroom-remodelling': 'bathroom-remodeling',
  'bathroom-renovation': 'bathroom-remodeling',
};

/**
 * Normalize service identifier (slug or name) to lowercase with hyphens
 */
function normalizeServiceId(serviceId: string): string {
  return serviceId
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Load questionnaire for a given service
 * Returns the service-specific questionnaire or generic fallback
 */
export function loadQuestionnaire(serviceIdOrSlug: string): ServiceQuestionnaire {
  // Try direct lookup first
  if (questionnaires[serviceIdOrSlug]) {
    return questionnaires[serviceIdOrSlug];
  }

  // Try service mapping
  const mappedId = serviceMapping[serviceIdOrSlug];
  if (mappedId && questionnaires[mappedId]) {
    return questionnaires[mappedId];
  }

  // Try normalized version
  const normalized = normalizeServiceId(serviceIdOrSlug);
  if (questionnaires[normalized]) {
    return questionnaires[normalized];
  }

  // Check mapping with normalized version
  const normalizedMapped = serviceMapping[normalized];
  if (normalizedMapped && questionnaires[normalizedMapped]) {
    return questionnaires[normalizedMapped];
  }

  // Try partial matching
  for (const [key, value] of Object.entries(serviceMapping)) {
    if (normalized.includes(normalizeServiceId(key)) ||
        normalizeServiceId(key).includes(normalized)) {
      if (questionnaires[value]) {
        return questionnaires[value];
      }
    }
  }

  // Fallback to generic questionnaire
  return questionnaires['_generic'];
}

/**
 * Check if a service has a custom questionnaire (not generic)
 */
export function hasCustomQuestionnaire(serviceIdOrSlug: string): boolean {
  const questionnaire = loadQuestionnaire(serviceIdOrSlug);
  return questionnaire.serviceId !== '_generic';
}

/**
 * Get list of available questionnaire service IDs
 */
export function getAvailableQuestionnaires(): string[] {
  return Object.keys(questionnaires).filter(id => id !== '_generic');
}
