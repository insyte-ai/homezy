import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import ServiceGroup from '../models/Service.model';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Service structure data (copied from client/data/serviceStructure.ts)
const serviceStructure = [
  {
    id: 'interior',
    name: 'Interior Work',
    categories: [
      {
        id: 'repairs-maintenance',
        name: 'Repairs & Maintenance',
        icon: '🔧',
        subservices: [
          {
            id: 'plumbing',
            name: 'Plumbing',
            slug: 'plumbing',
            icon: '🚿',
            serviceTypes: [
              { id: 'pipe-repair', name: 'Pipe Repair & Replacement' },
              { id: 'leak-fixing', name: 'Leak Detection & Fixing' },
              { id: 'drain-cleaning', name: 'Drain Cleaning' },
              { id: 'water-heater', name: 'Water Heater Installation' },
              { id: 'fixture-installation', name: 'Fixture Installation' },
              { id: 'emergency-plumbing', name: 'Emergency Plumbing' }
            ]
          },
          {
            id: 'electrical',
            name: 'Electrical',
            slug: 'electrical',
            icon: '⚡',
            serviceTypes: [
              { id: 'wiring', name: 'Wiring & Rewiring' },
              { id: 'lighting-installation', name: 'Lighting Installation' },
              { id: 'panel-upgrade', name: 'Electrical Panel Upgrade' },
              { id: 'outlet-switch', name: 'Outlets & Switches' },
              { id: 'ceiling-fan', name: 'Ceiling Fan Installation' },
              { id: 'electrical-troubleshooting', name: 'Troubleshooting' }
            ]
          },
          {
            id: 'hvac',
            name: 'HVAC (Air Conditioning)',
            slug: 'heating-ventilation-air-conditioning',
            icon: '❄️',
            serviceTypes: [
              { id: 'ac-installation', name: 'AC Installation' },
              { id: 'ac-repair', name: 'AC Repair & Maintenance' },
              { id: 'ac-cleaning', name: 'AC Cleaning' },
              { id: 'duct-cleaning', name: 'Duct Cleaning' },
              { id: 'thermostat', name: 'Thermostat Installation' },
              { id: 'ventilation', name: 'Ventilation Services' }
            ]
          },
          {
            id: 'handyman',
            name: 'Handyman Services',
            slug: 'handyman',
            icon: '🔧',
            serviceTypes: [
              { id: 'general-repairs', name: 'General Home Repairs' },
              { id: 'furniture-assembly', name: 'Furniture Assembly' },
              { id: 'shelf-mounting', name: 'Shelf & TV Mounting' },
              { id: 'door-repairs', name: 'Door Repairs' },
              { id: 'minor-fixes', name: 'Minor Fixes' }
            ]
          },
          {
            id: 'appliance-repair',
            name: 'Appliance Repair',
            slug: 'appliance-repair',
            icon: '🔌',
            serviceTypes: [
              { id: 'washing-machine', name: 'Washing Machine Repair' },
              { id: 'refrigerator', name: 'Refrigerator Repair' },
              { id: 'dishwasher', name: 'Dishwasher Repair' },
              { id: 'oven', name: 'Oven & Stove Repair' },
              { id: 'dryer', name: 'Dryer Repair' }
            ]
          },
          {
            id: 'door-windows',
            name: 'Doors & Windows',
            slug: 'door-windows',
            icon: '🚪',
            serviceTypes: [
              { id: 'door-installation', name: 'Door Installation' },
              { id: 'window-installation', name: 'Window Installation' },
              { id: 'door-repair', name: 'Door Repair' },
              { id: 'window-repair', name: 'Window Repair' },
              { id: 'glass-replacement', name: 'Glass Replacement' }
            ]
          }
        ]
      },
      {
        id: 'cleaning-organization',
        name: 'Cleaning & Organization',
        icon: '🧹',
        subservices: [
          {
            id: 'home-cleaning',
            name: 'Home Cleaning',
            slug: 'home-cleaning',
            icon: '🏠',
            serviceTypes: [
              { id: 'regular-cleaning', name: 'Regular House Cleaning' },
              { id: 'move-in-out', name: 'Move-In/Move-Out Cleaning' },
              { id: 'post-construction', name: 'Post-Construction Cleaning' },
              { id: 'vacation-rental', name: 'Vacation Rental Cleaning' }
            ]
          },
          {
            id: 'deep-cleaning',
            name: 'Deep Cleaning',
            slug: 'deep-cleaning',
            icon: '✨',
            serviceTypes: [
              { id: 'kitchen-deep-clean', name: 'Kitchen Deep Cleaning' },
              { id: 'bathroom-deep-clean', name: 'Bathroom Deep Cleaning' },
              { id: 'carpet-cleaning', name: 'Carpet & Upholstery Cleaning' },
              { id: 'window-cleaning', name: 'Window Cleaning' }
            ]
          },
          {
            id: 'specialized-cleaning',
            name: 'Specialized Cleaning',
            slug: 'specialized-cleaning',
            icon: '🧽',
            serviceTypes: [
              { id: 'sofa-cleaning', name: 'Sofa Cleaning' },
              { id: 'mattress-cleaning', name: 'Mattress Cleaning' },
              { id: 'curtain-cleaning', name: 'Curtain Cleaning' },
              { id: 'tile-grout', name: 'Tile & Grout Cleaning' }
            ]
          },
          {
            id: 'junk-removal',
            name: 'Junk Removal',
            slug: 'junk-removal',
            icon: '🗑️',
            serviceTypes: [
              { id: 'furniture-removal', name: 'Furniture Removal' },
              { id: 'appliance-removal', name: 'Appliance Removal' },
              { id: 'general-junk', name: 'General Junk Removal' },
              { id: 'estate-cleanout', name: 'Estate Cleanout' }
            ]
          }
        ]
      },
      {
        id: 'renovations-upgrades',
        name: 'Renovations & Upgrades',
        icon: '🏗️',
        subservices: [
          {
            id: 'kitchen-remodelling',
            name: 'Kitchen Remodeling',
            slug: 'kitchen-remodelling',
            icon: '🍳',
            serviceTypes: [
              { id: 'full-kitchen-remodel', name: 'Full Kitchen Remodel' },
              { id: 'cabinet-installation', name: 'Cabinet Installation' },
              { id: 'countertop-installation', name: 'Countertop Installation' },
              { id: 'kitchen-island', name: 'Kitchen Island Installation' },
              { id: 'backsplash', name: 'Backsplash Installation' }
            ]
          },
          {
            id: 'bathroom-remodelling',
            name: 'Bathroom Remodeling',
            slug: 'bathroom-remodelling',
            icon: '🛁',
            serviceTypes: [
              { id: 'full-bathroom-remodel', name: 'Full Bathroom Remodel' },
              { id: 'shower-installation', name: 'Shower Installation' },
              { id: 'bathtub-installation', name: 'Bathtub Installation' },
              { id: 'vanity-installation', name: 'Vanity Installation' },
              { id: 'tile-work', name: 'Bathroom Tile Work' }
            ]
          },
          {
            id: 'flooring',
            name: 'Flooring',
            slug: 'flooring',
            icon: '🪵',
            serviceTypes: [
              { id: 'hardwood', name: 'Hardwood Flooring' },
              { id: 'laminate', name: 'Laminate Flooring' },
              { id: 'tile-flooring', name: 'Tile Flooring' },
              { id: 'vinyl', name: 'Vinyl Flooring' },
              { id: 'carpet-installation', name: 'Carpet Installation' },
              { id: 'marble', name: 'Marble Flooring' }
            ]
          },
          {
            id: 'painting',
            name: 'Interior Painting',
            slug: 'interior-painting',
            icon: '🎨',
            serviceTypes: [
              { id: 'wall-painting', name: 'Wall Painting' },
              { id: 'ceiling-painting', name: 'Ceiling Painting' },
              { id: 'cabinet-painting', name: 'Cabinet Painting' },
              { id: 'decorative-painting', name: 'Decorative Painting' },
              { id: 'wallpaper', name: 'Wallpaper Installation' }
            ]
          },
          {
            id: 'interior-design',
            name: 'Interior Design',
            slug: 'interior-design',
            icon: '🛋️',
            serviceTypes: [
              { id: 'consultation', name: 'Design Consultation' },
              { id: 'space-planning', name: 'Space Planning' },
              { id: 'color-consultation', name: 'Color Consultation' },
              { id: 'furniture-selection', name: 'Furniture Selection' },
              { id: 'full-design', name: 'Full Interior Design' }
            ]
          },
          {
            id: 'fit-outs',
            name: 'Fit-Outs',
            slug: 'fit-outs',
            icon: '🏗️',
            serviceTypes: [
              { id: 'office-fitout', name: 'Office Fit-Out' },
              { id: 'retail-fitout', name: 'Retail Fit-Out' },
              { id: 'restaurant-fitout', name: 'Restaurant Fit-Out' },
              { id: 'residential-fitout', name: 'Residential Fit-Out' }
            ]
          },
          {
            id: 'villa-renovation',
            name: 'Villa Renovation',
            slug: 'villa-renovation',
            icon: '🏡',
            serviceTypes: [
              { id: 'full-villa-remodel', name: 'Full Villa Remodel' },
              { id: 'partial-renovation', name: 'Partial Renovation' },
              { id: 'modernization', name: 'Villa Modernization' },
              { id: 'luxury-upgrade', name: 'Luxury Upgrades' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'exterior',
    name: 'Exterior Work',
    categories: [
      {
        id: 'exterior-care',
        name: 'Exterior Home Care',
        icon: '🏠',
        subservices: [
          {
            id: 'exterior-painting',
            name: 'Exterior Painting',
            slug: 'exterior-painting',
            icon: '🖌️',
            serviceTypes: [
              { id: 'house-painting', name: 'House Painting' },
              { id: 'fence-painting', name: 'Fence Painting' },
              { id: 'deck-staining', name: 'Deck Staining' },
              { id: 'pressure-washing', name: 'Pressure Washing' }
            ]
          },
          {
            id: 'roofing',
            name: 'Roofing',
            slug: 'roofing',
            icon: '🏠',
            serviceTypes: [
              { id: 'roof-installation', name: 'Roof Installation' },
              { id: 'roof-repair', name: 'Roof Repair' },
              { id: 'roof-inspection', name: 'Roof Inspection' },
              { id: 'gutter-installation', name: 'Gutter Installation' },
              { id: 'gutter-cleaning', name: 'Gutter Cleaning' }
            ]
          },
          {
            id: 'waterproofing',
            name: 'Waterproofing',
            slug: 'waterproofing',
            icon: '💧',
            serviceTypes: [
              { id: 'basement-waterproofing', name: 'Basement Waterproofing' },
              { id: 'roof-waterproofing', name: 'Roof Waterproofing' },
              { id: 'bathroom-waterproofing', name: 'Bathroom Waterproofing' },
              { id: 'balcony-waterproofing', name: 'Balcony Waterproofing' }
            ]
          },
          {
            id: 'masonry',
            name: 'Masonry',
            slug: 'masonry',
            icon: '🧱',
            serviceTypes: [
              { id: 'brick-work', name: 'Brick Work' },
              { id: 'stone-work', name: 'Stone Work' },
              { id: 'concrete-work', name: 'Concrete Work' },
              { id: 'retaining-walls', name: 'Retaining Walls' }
            ]
          },
          {
            id: 'facade-work',
            name: 'Facade Work',
            slug: 'facade-work',
            icon: '🏢',
            serviceTypes: [
              { id: 'facade-cleaning', name: 'Facade Cleaning' },
              { id: 'facade-painting', name: 'Facade Painting' },
              { id: 'facade-repair', name: 'Facade Repair' },
              { id: 'cladding', name: 'Cladding Installation' }
            ]
          }
        ]
      },
      {
        id: 'landscaping-outdoor',
        name: 'Landscaping & Outdoor',
        icon: '🌳',
        subservices: [
          {
            id: 'landscaping',
            name: 'Landscaping Design',
            slug: 'landscaping',
            icon: '🌳',
            serviceTypes: [
              { id: 'landscape-design', name: 'Landscape Design' },
              { id: 'garden-installation', name: 'Garden Installation' },
              { id: 'hardscaping', name: 'Hardscaping' },
              { id: 'irrigation-system', name: 'Irrigation System' }
            ]
          },
          {
            id: 'landscape-maintenance',
            name: 'Landscape Maintenance',
            slug: 'landscape-maintenance',
            icon: '🌿',
            serviceTypes: [
              { id: 'lawn-mowing', name: 'Lawn Mowing' },
              { id: 'tree-trimming', name: 'Tree Trimming & Pruning' },
              { id: 'hedge-trimming', name: 'Hedge Trimming' },
              { id: 'fertilization', name: 'Lawn Fertilization' },
              { id: 'weed-control', name: 'Weed Control' }
            ]
          },
          {
            id: 'pool-construction',
            name: 'Swimming Pool Construction',
            slug: 'in-ground-swimming-pool-construction',
            icon: '🏊',
            serviceTypes: [
              { id: 'inground-pool', name: 'In-Ground Pool Construction' },
              { id: 'pool-design', name: 'Pool Design & Planning' },
              { id: 'pool-excavation', name: 'Pool Excavation' }
            ]
          },
          {
            id: 'pool-services',
            name: 'Pool Services',
            slug: 'swimming-pool-services',
            icon: '🏊‍♂️',
            serviceTypes: [
              { id: 'pool-cleaning', name: 'Pool Cleaning' },
              { id: 'pool-maintenance', name: 'Pool Maintenance' },
              { id: 'pool-repair', name: 'Pool Repair' },
              { id: 'pool-renovation', name: 'Pool Renovation' }
            ]
          },
          {
            id: 'outdoor-structures',
            name: 'Outdoor Structures',
            slug: 'outdoor-structures',
            icon: '🏕️',
            serviceTypes: [
              { id: 'pergola', name: 'Pergola Installation' },
              { id: 'gazebo', name: 'Gazebo Installation' },
              { id: 'deck-building', name: 'Deck Building' },
              { id: 'patio-construction', name: 'Patio Construction' },
              { id: 'awnings', name: 'Awnings & Shade Sails' }
            ]
          },
          {
            id: 'outdoor-lighting',
            name: 'Outdoor Lighting',
            slug: 'outdoor-lighting',
            icon: '💡',
            serviceTypes: [
              { id: 'landscape-lighting', name: 'Landscape Lighting' },
              { id: 'pathway-lights', name: 'Pathway Lights' },
              { id: 'security-lighting', name: 'Security Lighting' },
              { id: 'pool-lighting', name: 'Pool Lighting' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'specialized',
    name: 'Specialized Services',
    categories: [
      {
        id: 'moving-storage',
        name: 'Moving & Storage',
        icon: '📦',
        subservices: [
          {
            id: 'packers-movers',
            name: 'Packers & Movers',
            slug: 'packers-movers',
            icon: '📦',
            serviceTypes: [
              { id: 'local-moving', name: 'Local Moving' },
              { id: 'long-distance', name: 'Long Distance Moving' },
              { id: 'packing-services', name: 'Packing Services' },
              { id: 'unpacking-services', name: 'Unpacking Services' },
              { id: 'furniture-moving', name: 'Furniture Moving' }
            ]
          },
          {
            id: 'storage',
            name: 'Storage Solutions',
            slug: 'storage',
            icon: '🗄️',
            serviceTypes: [
              { id: 'self-storage', name: 'Self Storage' },
              { id: 'climate-controlled', name: 'Climate Controlled Storage' },
              { id: 'mobile-storage', name: 'Mobile Storage' }
            ]
          }
        ]
      },
      {
        id: 'installation-assembly',
        name: 'Installation & Assembly',
        icon: '🔩',
        subservices: [
          {
            id: 'home-automation',
            name: 'Home Automation',
            slug: 'home-automation',
            icon: '🏠',
            serviceTypes: [
              { id: 'smart-home-setup', name: 'Smart Home Setup' },
              { id: 'smart-lighting', name: 'Smart Lighting Installation' },
              { id: 'smart-thermostat', name: 'Smart Thermostat Installation' },
              { id: 'security-system', name: 'Security System Installation' },
              { id: 'home-theater', name: 'Home Theater Setup' }
            ]
          },
          {
            id: 'tv-mounting',
            name: 'TV Mounting',
            slug: 'tv-mounting',
            icon: '📺',
            serviceTypes: [
              { id: 'wall-mount', name: 'Wall Mount Installation' },
              { id: 'ceiling-mount', name: 'Ceiling Mount Installation' },
              { id: 'cable-management', name: 'Cable Management' }
            ]
          },
          {
            id: 'furniture-assembly',
            name: 'Furniture Assembly',
            slug: 'furniture-assembly',
            icon: '🪑',
            serviceTypes: [
              { id: 'ikea-assembly', name: 'IKEA Furniture Assembly' },
              { id: 'office-furniture', name: 'Office Furniture Assembly' },
              { id: 'outdoor-furniture', name: 'Outdoor Furniture Assembly' }
            ]
          }
        ]
      },
      {
        id: 'pest-wellness',
        name: 'Pest Control & Wellness',
        icon: '🐛',
        subservices: [
          {
            id: 'pest-control',
            name: 'Pest Control',
            slug: 'pest-control',
            icon: '🐜',
            serviceTypes: [
              { id: 'general-pest', name: 'General Pest Control' },
              { id: 'termite-control', name: 'Termite Control' },
              { id: 'bed-bug', name: 'Bed Bug Treatment' },
              { id: 'rodent-control', name: 'Rodent Control' },
              { id: 'ant-control', name: 'Ant Control' }
            ]
          },
          {
            id: 'disinfection',
            name: 'Disinfection Services',
            slug: 'disinfection',
            icon: '🧴',
            serviceTypes: [
              { id: 'sanitization', name: 'Home Sanitization' },
              { id: 'covid-disinfection', name: 'COVID-19 Disinfection' },
              { id: 'deep-sanitization', name: 'Deep Sanitization' }
            ]
          },
          {
            id: 'air-quality',
            name: 'Air Quality',
            slug: 'air-quality',
            icon: '🌬️',
            serviceTypes: [
              { id: 'air-duct-cleaning', name: 'Air Duct Cleaning' },
              { id: 'mold-removal', name: 'Mold Removal' },
              { id: 'air-purifier', name: 'Air Purifier Installation' }
            ]
          }
        ]
      },
      {
        id: 'events-lifestyle',
        name: 'Events & Lifestyle',
        icon: '🎉',
        subservices: [
          {
            id: 'event-setup',
            name: 'Event Setup',
            slug: 'event-setup',
            icon: '🎉',
            serviceTypes: [
              { id: 'party-setup', name: 'Party Setup & Decoration' },
              { id: 'tent-rental', name: 'Tent & Canopy Rental' },
              { id: 'furniture-rental', name: 'Event Furniture Rental' }
            ]
          },
          {
            id: 'personal-services',
            name: 'Personal Services',
            slug: 'personal-services',
            icon: '💆',
            serviceTypes: [
              { id: 'personal-training', name: 'Personal Training' },
              { id: 'yoga', name: 'Yoga Classes' },
              { id: 'massage', name: 'Massage Therapy' }
            ]
          }
        ]
      }
    ]
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/homezy';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Clear existing services
    await ServiceGroup.deleteMany({});
    logger.info('Cleared existing services');

    // Insert service structure
    await ServiceGroup.insertMany(serviceStructure);
    logger.info(`✅ Successfully seeded ${serviceStructure.length} service groups`);

    // Log summary
    let totalCategories = 0;
    let totalSubservices = 0;
    let totalServiceTypes = 0;

    serviceStructure.forEach(group => {
      totalCategories += group.categories.length;
      group.categories.forEach(category => {
        totalSubservices += category.subservices.length;
        category.subservices.forEach(subservice => {
          totalServiceTypes += subservice.serviceTypes?.length || 0;
        });
      });
    });

    logger.info('Summary:');
    logger.info(`  - Service Groups: ${serviceStructure.length}`);
    logger.info(`  - Categories: ${totalCategories}`);
    logger.info(`  - Subservices: ${totalSubservices}`);
    logger.info(`  - Service Types: ${totalServiceTypes}`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding services:', error);
    process.exit(1);
  }
}

// Run the seed function
seedServices();
