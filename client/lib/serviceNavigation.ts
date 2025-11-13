/**
 * Service navigation structure for Thumbtack-style categorized menu
 * Organized by major categories (Interior, Exterior, More Services)
 */

export interface ServiceLink {
  id: string;
  name: string;
  slug: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  services: ServiceLink[];
}

export const SERVICE_NAVIGATION: ServiceCategory[] = [
  {
    id: 'interior',
    name: 'Interior',
    services: [
      { id: 'home-repairs', name: 'Home Repairs & Maintenance', slug: 'home-repairs-maintenance' },
      { id: 'cleaning', name: 'Cleaning & Organization', slug: 'cleaning-organization' },
      { id: 'renovations', name: 'Renovations & Upgrades', slug: 'renovations-upgrades' },
    ],
  },
  {
    id: 'exterior',
    name: 'Exterior',
    services: [
      { id: 'exterior-care', name: 'Exterior Home Care', slug: 'exterior-home-care' },
      { id: 'landscaping', name: 'Landscaping & Outdoor Services', slug: 'landscaping-outdoor' },
    ],
  },
  {
    id: 'more-services',
    name: 'More Services',
    services: [
      { id: 'moving', name: 'Moving', slug: 'moving' },
      { id: 'installation', name: 'Installation & Assembly', slug: 'installation-assembly' },
      { id: 'pest-control', name: 'Pest Control', slug: 'pest-control' },
      { id: 'trending', name: 'Trending Services', slug: 'trending-services' },
      { id: 'events', name: 'Events', slug: 'events' },
      { id: 'health-wellness', name: 'Health & Wellness', slug: 'health-wellness' },
    ],
  },
];

// Helper to get category URL
export function getCategoryUrl(slug: string): string {
  return `/categories/${slug}`;
}

// Sub-category mapping for detailed service pages
export const SERVICE_SUBCATEGORIES: Record<string, ServiceLink[]> = {
  'home-repairs': [
    { id: 'plumbing', name: 'Plumbing', slug: 'plumbing' },
    { id: 'electrical', name: 'Electrical', slug: 'electrical' },
    { id: 'hvac', name: 'HVAC (Air Conditioning)', slug: 'heating-ventilation-air-conditioning' },
    { id: 'handyman', name: 'Handyman Services', slug: 'handyman' },
    { id: 'appliance-repair', name: 'Appliance Repair', slug: 'appliance-repair' },
    { id: 'emergency-plumbing', name: 'Emergency Plumbing', slug: 'emergency-plumbing' },
    { id: 'door-windows', name: 'Doors & Windows', slug: 'door-windows' },
  ],
  'cleaning-organization': [
    { id: 'home-cleaning', name: 'Home Cleaning', slug: 'home-cleaning' },
    { id: 'deep-cleaning', name: 'Deep Cleaning', slug: 'deep-cleaning' },
    { id: 'junk-removal', name: 'Junk Removal', slug: 'junk-removal' },
  ],
  'renovations-upgrades': [
    { id: 'kitchen-remodelling', name: 'Kitchen Remodeling', slug: 'kitchen-remodelling' },
    { id: 'bathroom-remodelling', name: 'Bathroom Remodeling', slug: 'bathroom-remodelling' },
    { id: 'flooring', name: 'Flooring', slug: 'flooring' },
    { id: 'painting', name: 'Interior & Exterior Painting', slug: 'interior-exterior-painting' },
    { id: 'interior-design', name: 'Interior Design', slug: 'interior-design' },
    { id: 'fit-outs', name: 'Fit-Outs', slug: 'fit-outs' },
    { id: 'turnkey-remodelling', name: 'Turnkey Remodeling', slug: 'turnkey-remodelling' },
    { id: 'villa-renovation', name: 'Villa Renovation', slug: 'villa-renovation' },
    { id: 'villa-extension', name: 'Villa Extension', slug: 'villa-extension' },
  ],
  'exterior-home-care': [
    { id: 'roofing', name: 'Roofing', slug: 'roofing' },
    { id: 'waterproofing', name: 'Waterproofing', slug: 'waterproofing' },
    { id: 'masonry', name: 'Masonry', slug: 'masonry' },
  ],
  'landscaping-outdoor': [
    { id: 'landscaping', name: 'Landscaping', slug: 'landscaping' },
    { id: 'landscape-maintenance', name: 'Landscape Maintenance', slug: 'landscape-maintenance' },
    { id: 'pool-construction', name: 'Swimming Pool Construction', slug: 'in-ground-swimming-pool-construction' },
    { id: 'pool-installation', name: 'Pool Installation', slug: 'above-ground-swimming-pool-installation' },
    { id: 'pool-cleaning', name: 'Pool Cleaning & Maintenance', slug: 'swimming-pool-cleaning-maintenance-and-inspection' },
    { id: 'pool-repair', name: 'Pool Repair', slug: 'swimming-pool-repair' },
    { id: 'pergola', name: 'Pergola, Awnings & Shade Sails', slug: 'pergola-awnings-shade-sails' },
  ],
  'moving': [
    { id: 'packers-movers', name: 'Packers & Movers', slug: 'packers-movers' },
  ],
  'installation-assembly': [
    { id: 'home-automation', name: 'Home Automation', slug: 'home-automation' },
    { id: 'security-cameras', name: 'Security Cameras & Alarms', slug: 'security-cameras-and-alarms-install' },
    { id: 'home-theatre', name: 'Home Theatre System', slug: 'home-theatre-system' },
    { id: 'home-audio', name: 'Home Audio', slug: 'home-audio' },
    { id: 'projector', name: 'Projector Installation', slug: 'projector-installation' },
    { id: 'wifi-networking', name: 'Wi-Fi & Networking', slug: 'wi-fi-and-networking' },
    { id: 'audio-video', name: 'Audio/Video Specialists', slug: 'audio-video-specialists' },
  ],
  'pest-control': [
    { id: 'pest-control', name: 'Pest Control Services', slug: 'pest-control' },
  ],
  'trending-services': [
    { id: 'ac-maintenance', name: 'AC Maintenance', slug: 'ac-maintenance' },
    { id: 'amc', name: 'Annual Maintenance Contracts', slug: 'amc' },
    { id: 'water-leak-detection', name: 'Water Leak Detection', slug: 'water-leak-detection' },
    { id: 'renovation-management', name: 'Renovation Project Management', slug: 'renovation-project-management' },
    { id: 'rescue-projects', name: 'Rescue Projects', slug: 'rescue-projects' },
  ],
  'events': [
    { id: 'birthday-party', name: 'Birthday Party Planners', slug: 'birthday-party-planners' },
    { id: 'catering', name: 'Catering', slug: 'catering' },
    { id: 'photo-video', name: 'Photographers & Videographers', slug: 'photo-and-videographers' },
    { id: 'djs', name: 'DJs', slug: 'djs' },
    { id: 'bartenders', name: 'Bartenders', slug: 'bartenders' },
    { id: 'cake-decorators', name: 'Cake Decorators', slug: 'cake-decorators' },
    { id: 'florists', name: 'Florists', slug: 'florists' },
    { id: 'hair-makeup', name: 'Hair & Makeup Artists', slug: 'hair-makeup-artists' },
    { id: 'party-bus', name: 'Party Bus & Limousines', slug: 'party-bus-limousines' },
  ],
  'health-wellness': [
    { id: 'personal-trainers', name: 'Personal Trainers', slug: 'personal-trainers' },
    { id: 'yoga', name: 'Yoga', slug: 'yoga' },
    { id: 'mma-training', name: 'Mixed Martial Arts Training', slug: 'mixed-martial-arts-training' },
    { id: 'personal-dietitian', name: 'Personal Dietitian', slug: 'personal-dietitian' },
    { id: 'dance-lessons', name: 'Dance Lessons', slug: 'dance-lessons' },
    { id: 'music-lessons', name: 'Music Lessons', slug: 'music-lessons' },
    { id: 'language-lessons', name: 'Language Lessons', slug: 'language-lessons' },
    { id: 'home-tutors', name: 'Home Tutors', slug: 'home-tutors' },
    { id: 'dog-training', name: 'Dog Training', slug: 'dog-training' },
    { id: 'dog-walking', name: 'Dog Walking', slug: 'dog-walking' },
    { id: 'pet-sitting', name: 'Pet Sitting', slug: 'pet-sitting' },
    { id: 'overnight-pet-care', name: 'Overnight Pet Care', slug: 'overnight-pet-care' },
  ],
};

// Additional business/professional services
export const ADDITIONAL_SERVICES: ServiceLink[] = [
  { id: 'architecture', name: 'Architecture & Engineering', slug: 'architecture_engineering' },
  { id: 'structural-engineering', name: 'Structural Engineering', slug: 'structural-engineering' },
  { id: 'mep-engineering', name: 'MEP Engineering', slug: 'mep-engineering' },
  { id: 'construction-engineering', name: 'Construction Engineering', slug: 'construction-engineering' },
  { id: 'equipment-supply', name: 'Equipment Supply & Installation', slug: 'equipment-supply-installation' },
  { id: 'office-automation', name: 'Office Automation', slug: 'office-automation' },
  { id: 'property-management', name: 'Property Management', slug: 'property-management' },
  { id: 'real-estate', name: 'Real Estate Agencies', slug: 'real-estate-agencies' },
  { id: 'rental-disputes', name: 'Rental Property Disputes', slug: 'rental-property-disputes' },
  { id: 'accountants', name: 'Accountants', slug: 'accountants' },
  { id: 'business-setup', name: 'Business Setup', slug: 'business-setup' },
  { id: 'digital-marketing', name: 'Digital Marketing', slug: 'digital-marketing' },
  { id: 'website-developers', name: 'Website Developers', slug: 'website-developers' },
  { id: 'loan-mortgage', name: 'Loan & Mortgage Consultants', slug: 'loan-and-mortgage-consultants' },
  { id: 'old-new-restorations', name: 'Old to New Restorations', slug: 'old-new-restorations' },
];
