export interface ServiceType {
  id: string;
  name: string;
}

export interface SubService {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  keywords?: string[];
  serviceTypes?: ServiceType[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  subservices: SubService[];
}

export interface ServiceGroup {
  id: string;
  name: string;
  categories: ServiceCategory[];
}

export const serviceStructure: ServiceGroup[] = [
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
            keywords: [
              'plumber', 'plumber near me', 'emergency plumber', 'licensed plumber',
              'leak repair', 'pipe repair', 'pipe fitting', 'pipe burst',
              'drain cleaning', 'clogged drain', 'blocked drain', 'drain unclogging',
              'water heater', 'geyser repair', 'geyser installation', 'hot water',
              'faucet repair', 'tap repair', 'tap installation', 'sink repair',
              'toilet repair', 'toilet installation', 'commode repair',
              'bathroom plumbing', 'kitchen plumbing', 'water leak', 'pipe leak',
              'sewer repair', 'sewer cleaning', 'septic', 'water pressure',
              'garbage disposal', 'water filtration', 'plumbing contractor'
            ],
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
            keywords: [
              'electrician', 'electrician near me', 'licensed electrician', 'electrical contractor',
              'electrical repair', 'electrical wiring', 'rewiring', 'house wiring',
              'light installation', 'lighting installation', 'light fixture', 'chandelier installation',
              'ceiling fan installation', 'fan installation', 'exhaust fan',
              'switch repair', 'outlet repair', 'socket repair', 'power outlet',
              'circuit breaker', 'fuse box', 'electrical panel', 'MCB',
              'short circuit', 'power failure', 'electrical fault', 'tripping',
              'generator installation', 'inverter installation', 'UPS installation',
              'electrical inspection', 'electrical safety', 'earthing', 'grounding'
            ],
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
            keywords: [
              'AC repair', 'AC installation', 'AC service', 'AC maintenance',
              'air conditioner', 'air conditioning', 'AC technician', 'AC contractor',
              'central AC', 'split AC', 'window AC', 'ductless AC',
              'AC cleaning', 'AC gas refill', 'AC gas charging', 'freon',
              'heating repair', 'heating installation', 'furnace', 'heater repair',
              'HVAC contractor', 'HVAC technician', 'HVAC service',
              'duct cleaning', 'duct installation', 'air duct', 'ventilation',
              'thermostat installation', 'smart thermostat', 'temperature control',
              'cooling system', 'heating system', 'climate control'
            ],
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
            keywords: [
              'handyman', 'handyman near me', 'handyman services', 'odd jobs',
              'home repairs', 'house repairs', 'general repairs', 'fix it',
              'furniture assembly', 'IKEA assembly', 'bed assembly', 'table assembly',
              'TV mounting', 'TV installation', 'picture hanging', 'shelf installation',
              'curtain rod installation', 'blind installation', 'curtain installation',
              'door repair', 'cabinet repair', 'drawer repair', 'hinge repair',
              'caulking', 'grouting', 'sealing', 'weatherstripping',
              'minor repairs', 'small jobs', 'home maintenance', 'property maintenance',
              'jack of all trades', 'maintenance man', 'fix up', 'touch up'
            ],
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
            keywords: [
              'appliance repair', 'appliance service', 'appliance technician', 'appliance fix',
              'washing machine repair', 'washer repair', 'laundry machine repair',
              'dryer repair', 'tumble dryer repair', 'clothes dryer',
              'refrigerator repair', 'fridge repair', 'freezer repair', 'refrigeration',
              'dishwasher repair', 'dishwasher installation', 'dishwasher service',
              'oven repair', 'stove repair', 'cooktop repair', 'range repair',
              'microwave repair', 'microwave installation',
              'garbage disposal repair', 'disposal installation',
              'ice maker repair', 'wine cooler repair',
              'home appliance', 'kitchen appliance', 'major appliance'
            ],
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
            keywords: [
              'door installation', 'door repair', 'door replacement', 'door contractor',
              'window installation', 'window repair', 'window replacement', 'window contractor',
              'glass repair', 'glass replacement', 'broken glass', 'window glass',
              'sliding door', 'french door', 'patio door', 'screen door',
              'front door', 'entry door', 'interior door', 'exterior door',
              'door frame', 'door jamb', 'door hinge', 'door lock',
              'window frame', 'window seal', 'window screen', 'window tinting',
              'double glazing', 'insulated glass', 'energy efficient windows',
              'storm door', 'security door', 'garage door'
            ],
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
            keywords: [
              'house cleaning', 'home cleaning', 'cleaning service', 'maid service',
              'housekeeper', 'housekeeping', 'domestic help', 'cleaning lady',
              'regular cleaning', 'weekly cleaning', 'monthly cleaning', 'recurring cleaning',
              'move in cleaning', 'move out cleaning', 'end of tenancy cleaning',
              'post construction cleaning', 'after renovation cleaning', 'builders clean',
              'vacation rental cleaning', 'Airbnb cleaning', 'short term rental cleaning',
              'apartment cleaning', 'villa cleaning', 'flat cleaning', 'condo cleaning',
              'spring cleaning', 'one time cleaning', 'residential cleaning'
            ],
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
            keywords: [
              'deep cleaning', 'deep clean', 'thorough cleaning', 'intensive cleaning',
              'kitchen cleaning', 'kitchen deep clean', 'oven cleaning', 'appliance cleaning',
              'bathroom cleaning', 'bathroom deep clean', 'toilet cleaning', 'shower cleaning',
              'carpet cleaning', 'carpet shampoo', 'carpet steam cleaning', 'rug cleaning',
              'upholstery cleaning', 'furniture cleaning', 'fabric cleaning',
              'window cleaning', 'window washing', 'glass cleaning',
              'floor cleaning', 'floor scrubbing', 'floor polishing',
              'sanitization', 'disinfection', 'antibacterial cleaning'
            ],
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
            keywords: [
              'sofa cleaning', 'couch cleaning', 'upholstery cleaning', 'furniture cleaning',
              'mattress cleaning', 'bed cleaning', 'mattress sanitization', 'bed bug treatment',
              'curtain cleaning', 'drape cleaning', 'blind cleaning', 'curtain steam cleaning',
              'tile cleaning', 'grout cleaning', 'tile and grout', 'floor tile cleaning',
              'leather cleaning', 'leather sofa cleaning', 'leather conditioning',
              'fabric protection', 'stain removal', 'spot cleaning', 'odor removal',
              'steam cleaning', 'dry cleaning', 'shampooing'
            ],
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
            keywords: [
              'junk removal', 'rubbish removal', 'trash removal', 'garbage removal',
              'furniture removal', 'old furniture disposal', 'furniture hauling',
              'appliance removal', 'appliance disposal', 'appliance hauling',
              'estate cleanout', 'house cleanout', 'property cleanout', 'hoarder cleanout',
              'garage cleanout', 'basement cleanout', 'attic cleanout', 'storage cleanout',
              'debris removal', 'construction debris', 'yard waste removal',
              'dumpster rental', 'skip hire', 'waste disposal',
              'donation pickup', 'charity pickup', 'recycling'
            ],
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
            keywords: [
              'kitchen remodel', 'kitchen remodeling', 'kitchen renovation', 'kitchen makeover',
              'kitchen contractor', 'kitchen designer', 'kitchen fitter',
              'cabinet installation', 'kitchen cabinets', 'cabinet refacing', 'cabinet refinishing',
              'countertop installation', 'granite countertop', 'quartz countertop', 'marble countertop',
              'kitchen island', 'breakfast bar', 'kitchen peninsula',
              'backsplash installation', 'tile backsplash', 'kitchen tiles',
              'kitchen layout', 'kitchen design', 'modular kitchen',
              'sink installation', 'kitchen sink', 'kitchen faucet'
            ],
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
            keywords: [
              'bathroom remodel', 'bathroom remodeling', 'bathroom renovation', 'bathroom makeover',
              'bathroom contractor', 'bathroom fitter', 'bathroom designer',
              'shower installation', 'walk-in shower', 'shower enclosure', 'shower door',
              'bathtub installation', 'tub installation', 'jacuzzi installation', 'soaking tub',
              'vanity installation', 'bathroom vanity', 'bathroom sink', 'bathroom cabinet',
              'bathroom tile', 'bathroom flooring', 'bathroom wall tiles',
              'toilet installation', 'bidet installation', 'bathroom fixtures',
              'bathroom lighting', 'bathroom ventilation', 'exhaust fan'
            ],
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
            keywords: [
              'flooring', 'floor installation', 'flooring contractor', 'floor fitter',
              'hardwood flooring', 'hardwood floor', 'wood flooring', 'parquet flooring',
              'laminate flooring', 'laminate floor', 'floating floor',
              'tile flooring', 'ceramic tile', 'porcelain tile', 'floor tiles',
              'vinyl flooring', 'LVP', 'luxury vinyl plank', 'vinyl plank',
              'carpet installation', 'wall to wall carpet', 'carpet fitting',
              'marble flooring', 'stone flooring', 'natural stone floor',
              'floor refinishing', 'floor sanding', 'floor polishing',
              'epoxy flooring', 'concrete flooring', 'floor coating'
            ],
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
            keywords: [
              'interior painting', 'interior painter', 'house painting', 'home painting',
              'wall painting', 'room painting', 'bedroom painting', 'living room painting',
              'ceiling painting', 'ceiling repair', 'popcorn ceiling removal',
              'cabinet painting', 'cabinet refinishing', 'furniture painting',
              'decorative painting', 'faux finishing', 'accent wall', 'feature wall',
              'wallpaper installation', 'wallpaper removal', 'wallpaper hanging',
              'paint contractor', 'painting contractor', 'residential painter',
              'color consultation', 'paint color', 'interior decorator'
            ],
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
            keywords: [
              'interior design', 'interior designer', 'interior decorator', 'home designer',
              'design consultation', 'home consultation', 'design advice',
              'space planning', 'room layout', 'floor plan', 'furniture arrangement',
              'color consultation', 'color scheme', 'paint consultation',
              'furniture selection', 'furniture sourcing', 'furniture shopping',
              'home staging', 'property staging', 'real estate staging',
              'home decor', 'home styling', 'interior styling',
              'renovation design', 'remodel design', 'design build'
            ],
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
            keywords: [
              'fit out', 'fitout', 'fit-out contractor', 'fitout company',
              'office fit out', 'office fitout', 'office renovation', 'office remodeling',
              'retail fit out', 'shop fit out', 'store renovation', 'retail design',
              'restaurant fit out', 'cafe fit out', 'hospitality fitout',
              'commercial fit out', 'commercial renovation', 'commercial contractor',
              'workspace design', 'office design', 'commercial interior',
              'turnkey fit out', 'design and build', 'tenant improvement'
            ],
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
            keywords: [
              'villa renovation', 'home renovation', 'house renovation', 'home remodeling',
              'house remodeling', 'whole house renovation', 'full home renovation',
              'home renovation contractor', 'renovation contractor', 'general contractor',
              'home improvement', 'house improvement', 'property renovation',
              'modernization', 'home modernization', 'house upgrade',
              'luxury renovation', 'high end renovation', 'custom renovation',
              'structural renovation', 'major renovation', 'complete renovation',
              'residential contractor', 'building contractor', 'construction company'
            ],
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
            keywords: [
              'exterior painting', 'exterior painter', 'outside painting', 'outdoor painting',
              'house painting', 'home exterior', 'building painting', 'facade painting',
              'fence painting', 'fence staining', 'fence sealing',
              'deck staining', 'deck sealing', 'deck refinishing', 'deck painting',
              'pressure washing', 'power washing', 'exterior cleaning',
              'trim painting', 'shutters painting', 'door painting',
              'paint contractor', 'commercial painting', 'residential exterior'
            ],
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
            keywords: [
              'roofing', 'roofer', 'roof contractor', 'roofing company',
              'roof installation', 'roof replacement', 'new roof', 're-roofing',
              'roof repair', 'roof leak', 'roof damage', 'storm damage',
              'roof inspection', 'roof assessment', 'roof survey',
              'gutter installation', 'gutter replacement', 'rain gutter', 'downspout',
              'gutter cleaning', 'gutter repair', 'gutter guard',
              'shingle roof', 'tile roof', 'metal roof', 'flat roof',
              'roof maintenance', 'roof coating', 'roof sealing'
            ],
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
            keywords: [
              'waterproofing', 'water proofing', 'waterproof contractor', 'damp proofing',
              'basement waterproofing', 'basement sealing', 'basement leak', 'wet basement',
              'roof waterproofing', 'terrace waterproofing', 'roof coating',
              'bathroom waterproofing', 'shower waterproofing', 'wet room',
              'balcony waterproofing', 'deck waterproofing', 'exterior waterproofing',
              'foundation waterproofing', 'foundation sealing', 'crawl space',
              'leak repair', 'water damage prevention', 'moisture barrier',
              'sealant', 'membrane', 'water infiltration'
            ],
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
            keywords: [
              'masonry', 'mason', 'masonry contractor', 'stone mason',
              'brick work', 'brick repair', 'brick laying', 'brick pointing',
              'stone work', 'stone installation', 'natural stone', 'stone veneer',
              'concrete work', 'concrete repair', 'concrete contractor', 'cement work',
              'retaining wall', 'garden wall', 'boundary wall', 'compound wall',
              'block work', 'cinder block', 'concrete block',
              'tuck pointing', 'repointing', 'mortar repair',
              'paver installation', 'paving stones', 'driveway pavers'
            ],
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
            keywords: [
              'facade work', 'facade contractor', 'building facade', 'exterior facade',
              'facade cleaning', 'building cleaning', 'exterior cleaning', 'high rise cleaning',
              'facade painting', 'building painting', 'exterior coating',
              'facade repair', 'facade restoration', 'building restoration',
              'cladding installation', 'wall cladding', 'exterior cladding', 'ACP cladding',
              'curtain wall', 'glass facade', 'aluminum cladding',
              'facade maintenance', 'building envelope', 'exterior renovation'
            ],
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
            keywords: [
              'landscaping', 'landscaper', 'landscape designer', 'landscape architect',
              'landscape design', 'garden design', 'outdoor design', 'yard design',
              'garden installation', 'planting', 'flower bed', 'plant installation',
              'hardscaping', 'hardscape design', 'patio design', 'walkway design',
              'irrigation system', 'sprinkler system', 'drip irrigation', 'watering system',
              'outdoor landscaping', 'front yard', 'backyard', 'curb appeal',
              'sod installation', 'lawn installation', 'turf installation',
              'retaining wall', 'landscape construction'
            ],
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
            keywords: [
              'lawn care', 'lawn service', 'lawn maintenance', 'yard maintenance',
              'lawn mowing', 'grass cutting', 'mowing service', 'lawn cutting',
              'tree trimming', 'tree pruning', 'tree service', 'tree cutting',
              'hedge trimming', 'shrub trimming', 'bush trimming', 'topiary',
              'lawn fertilization', 'fertilizing', 'lawn treatment', 'lawn feeding',
              'weed control', 'weed removal', 'weeding', 'herbicide',
              'gardener', 'gardening service', 'garden maintenance',
              'leaf removal', 'yard cleanup', 'seasonal cleanup'
            ],
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
            keywords: [
              'pool construction', 'pool builder', 'pool contractor', 'swimming pool builder',
              'inground pool', 'in-ground pool', 'swimming pool installation',
              'pool design', 'pool planning', 'custom pool', 'pool layout',
              'pool excavation', 'pool digging', 'pool groundwork',
              'concrete pool', 'gunite pool', 'fiberglass pool', 'vinyl pool',
              'infinity pool', 'lap pool', 'plunge pool',
              'pool decking', 'pool surround', 'pool coping'
            ],
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
            keywords: [
              'pool service', 'pool maintenance', 'pool technician', 'pool company',
              'pool cleaning', 'pool cleaner', 'swimming pool cleaning', 'pool vacuuming',
              'pool repair', 'pool equipment repair', 'pool pump repair', 'pool filter',
              'pool renovation', 'pool remodeling', 'pool resurfacing', 'pool replastering',
              'pool chemical', 'pool water treatment', 'pool balancing', 'chlorine',
              'pool opening', 'pool closing', 'winterizing', 'pool startup',
              'hot tub service', 'spa service', 'jacuzzi maintenance'
            ],
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
            keywords: [
              'outdoor structure', 'backyard structure', 'garden structure',
              'pergola', 'pergola installation', 'pergola builder', 'wood pergola',
              'gazebo', 'gazebo installation', 'garden gazebo', 'backyard gazebo',
              'deck building', 'deck construction', 'deck contractor', 'wood deck',
              'patio construction', 'patio installation', 'patio contractor', 'stone patio',
              'awning', 'shade sail', 'canopy', 'outdoor shade',
              'carport', 'covered patio', 'outdoor room', 'screened porch',
              'outdoor kitchen', 'BBQ area', 'fire pit'
            ],
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
            keywords: [
              'outdoor lighting', 'exterior lighting', 'garden lighting', 'yard lighting',
              'landscape lighting', 'landscape lights', 'garden lights', 'accent lighting',
              'pathway lights', 'path lighting', 'walkway lights', 'driveway lights',
              'security lighting', 'motion lights', 'flood lights', 'security lights',
              'pool lighting', 'underwater lights', 'pool lights',
              'string lights', 'patio lights', 'deck lights', 'festoon lights',
              'LED outdoor', 'solar lights', 'low voltage lighting',
              'holiday lights', 'Christmas lights installation'
            ],
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
            keywords: [
              'movers', 'moving company', 'moving service', 'relocation service',
              'packers and movers', 'packing and moving', 'removal company',
              'local moving', 'local movers', 'same city moving', 'residential moving',
              'long distance moving', 'interstate moving', 'cross country moving',
              'packing services', 'packing help', 'professional packing',
              'unpacking services', 'unpacking help', 'move in help',
              'furniture moving', 'heavy lifting', 'furniture movers',
              'office moving', 'commercial moving', 'business relocation',
              'piano moving', 'specialty moving', 'fragile items'
            ],
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
            keywords: [
              'storage', 'storage unit', 'storage facility', 'storage space',
              'self storage', 'mini storage', 'personal storage', 'household storage',
              'climate controlled storage', 'temperature controlled', 'AC storage',
              'mobile storage', 'portable storage', 'storage container', 'pod storage',
              'furniture storage', 'document storage', 'business storage',
              'short term storage', 'long term storage', 'temporary storage',
              'secure storage', 'storage locker', 'warehouse storage'
            ],
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
            keywords: [
              'home automation', 'smart home', 'smart home installation', 'home automation system',
              'smart home setup', 'smart device installation', 'IoT installation',
              'smart lighting', 'smart lights', 'automated lighting', 'Philips Hue',
              'smart thermostat', 'Nest installation', 'Ecobee installation', 'smart AC',
              'security system', 'home security', 'alarm system', 'CCTV installation',
              'home theater', 'home cinema', 'surround sound', 'audio visual',
              'smart lock', 'keyless entry', 'video doorbell', 'Ring installation',
              'voice control', 'Alexa', 'Google Home', 'Apple HomeKit'
            ],
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
            keywords: [
              'TV mounting', 'TV installation', 'TV wall mount', 'television mounting',
              'wall mount installation', 'flat screen mounting', 'LED TV mounting',
              'ceiling mount', 'TV ceiling mount', 'projector mounting',
              'cable management', 'wire concealment', 'cable hiding', 'cord management',
              'TV bracket', 'TV stand', 'swivel mount', 'tilt mount',
              'soundbar installation', 'speaker mounting', 'home entertainment',
              'above fireplace TV', 'outdoor TV mounting'
            ],
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
            keywords: [
              'furniture assembly', 'furniture assembler', 'flatpack assembly', 'flat pack',
              'IKEA assembly', 'IKEA furniture', 'IKEA installation', 'IKEA help',
              'office furniture assembly', 'desk assembly', 'chair assembly', 'cubicle assembly',
              'outdoor furniture assembly', 'patio furniture', 'garden furniture',
              'bed assembly', 'wardrobe assembly', 'closet assembly', 'dresser assembly',
              'bookshelf assembly', 'shelving assembly', 'cabinet assembly',
              'exercise equipment assembly', 'gym equipment', 'treadmill assembly',
              'kids furniture', 'crib assembly', 'bunk bed assembly'
            ],
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
            keywords: [
              'pest control', 'exterminator', 'pest extermination', 'pest management',
              'general pest control', 'residential pest control', 'commercial pest control',
              'termite control', 'termite treatment', 'termite inspection', 'anti termite',
              'bed bug treatment', 'bed bug extermination', 'bed bug removal', 'bedbug',
              'rodent control', 'rat control', 'mouse control', 'mice removal',
              'ant control', 'ant extermination', 'ant removal', 'fire ants',
              'cockroach control', 'roach extermination', 'cockroach treatment',
              'mosquito control', 'fly control', 'spider control', 'wasp removal',
              'fumigation', 'pest spray', 'pest prevention'
            ],
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
            keywords: [
              'disinfection', 'disinfection service', 'sanitization', 'sanitizing service',
              'home sanitization', 'house sanitization', 'residential disinfection',
              'COVID disinfection', 'coronavirus disinfection', 'viral disinfection',
              'deep sanitization', 'commercial sanitization', 'office disinfection',
              'antibacterial treatment', 'antimicrobial treatment', 'germ killing',
              'surface disinfection', 'fogging', 'electrostatic spraying',
              'hospital grade disinfection', 'professional sanitization'
            ],
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
            keywords: [
              'air quality', 'indoor air quality', 'air quality testing', 'IAQ',
              'air duct cleaning', 'duct cleaning', 'HVAC cleaning', 'vent cleaning',
              'mold removal', 'mold remediation', 'mold inspection', 'mold testing',
              'air purifier installation', 'air purification', 'air filtration', 'HEPA filter',
              'air quality improvement', 'allergen removal', 'dust removal',
              'radon testing', 'asbestos testing', 'VOC testing',
              'ventilation improvement', 'fresh air system', 'air exchange'
            ],
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
            keywords: [
              'event setup', 'event services', 'party setup', 'party planning',
              'party decoration', 'event decoration', 'birthday decoration', 'anniversary decoration',
              'tent rental', 'canopy rental', 'marquee rental', 'party tent',
              'furniture rental', 'event furniture', 'table rental', 'chair rental',
              'wedding decoration', 'wedding setup', 'reception setup',
              'corporate event', 'conference setup', 'exhibition setup',
              'balloon decoration', 'flower decoration', 'lighting setup',
              'stage setup', 'backdrop', 'event equipment'
            ],
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
            keywords: [
              'personal services', 'wellness services', 'home wellness',
              'personal training', 'personal trainer', 'fitness trainer', 'home workout',
              'yoga classes', 'yoga instructor', 'private yoga', 'home yoga',
              'massage therapy', 'massage therapist', 'home massage', 'spa at home',
              'pilates', 'pilates instructor', 'home pilates',
              'meditation', 'meditation instructor', 'mindfulness',
              'fitness coaching', 'health coaching', 'wellness coaching',
              'stretching', 'flexibility training', 'rehabilitation'
            ],
            serviceTypes: [
              { id: 'personal-training', name: 'Personal Training' },
              { id: 'yoga', name: 'Yoga Classes' },
              { id: 'massage', name: 'Massage Therapy' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    categories: [
      {
        id: 'pet-care',
        name: 'Pet Care',
        icon: '🐕',
        subservices: [
          {
            id: 'dog-walking',
            name: 'Dog Walking',
            slug: 'dog-walking',
            icon: '🦮',
            keywords: [
              'dog walking', 'dog walker', 'pet walking', 'walk my dog',
              'daily dog walk', 'dog exercise', 'puppy walking',
              'dog walking service', 'professional dog walker'
            ],
            serviceTypes: [
              { id: 'daily-walks', name: 'Daily Dog Walks' },
              { id: 'group-walks', name: 'Group Dog Walks' },
              { id: 'private-walks', name: 'Private Dog Walks' }
            ]
          },
          {
            id: 'pet-sitting',
            name: 'Pet Sitting',
            slug: 'pet-sitting',
            icon: '🏠',
            keywords: [
              'pet sitting', 'pet sitter', 'house sitting with pets', 'in-home pet care',
              'overnight pet sitting', 'cat sitting', 'dog sitting',
              'pet care at home', 'pet minding', 'animal sitting'
            ],
            serviceTypes: [
              { id: 'in-home-sitting', name: 'In-Home Pet Sitting' },
              { id: 'overnight-sitting', name: 'Overnight Pet Sitting' },
              { id: 'drop-in-visits', name: 'Drop-In Visits' }
            ]
          },
          {
            id: 'pet-boarding',
            name: 'Pet Boarding',
            slug: 'pet-boarding',
            icon: '🏨',
            keywords: [
              'pet boarding', 'dog boarding', 'cat boarding', 'pet hotel',
              'dog kennel', 'pet daycare', 'doggy daycare', 'dog day care',
              'overnight boarding', 'pet resort', 'dog hostel'
            ],
            serviceTypes: [
              { id: 'daycare', name: 'Pet Daycare' },
              { id: 'overnight-boarding', name: 'Overnight Boarding' },
              { id: 'extended-boarding', name: 'Extended Stay Boarding' }
            ]
          },
          {
            id: 'dog-training',
            name: 'Dog Training',
            slug: 'dog-training',
            icon: '🎓',
            keywords: [
              'dog training', 'dog trainer', 'puppy training', 'obedience training',
              'behavior training', 'dog obedience', 'pet training',
              'dog behavior modification', 'aggressive dog training', 'service dog training'
            ],
            serviceTypes: [
              { id: 'basic-obedience', name: 'Basic Obedience Training' },
              { id: 'puppy-training', name: 'Puppy Training' },
              { id: 'behavior-modification', name: 'Behavior Modification' },
              { id: 'private-training', name: 'Private Training Sessions' }
            ]
          }
        ]
      },
      {
        id: 'pet-grooming',
        name: 'Pet Grooming',
        icon: '✂️',
        subservices: [
          {
            id: 'dog-grooming',
            name: 'Dog Grooming',
            slug: 'dog-grooming',
            icon: '🐩',
            keywords: [
              'dog grooming', 'dog groomer', 'pet grooming', 'dog bath',
              'dog haircut', 'dog nail trimming', 'mobile dog grooming',
              'puppy grooming', 'dog spa', 'dog wash'
            ],
            serviceTypes: [
              { id: 'full-grooming', name: 'Full Grooming Service' },
              { id: 'bath-brush', name: 'Bath & Brush' },
              { id: 'nail-trimming', name: 'Nail Trimming' },
              { id: 'mobile-grooming', name: 'Mobile Grooming' }
            ]
          },
          {
            id: 'cat-grooming',
            name: 'Cat Grooming',
            slug: 'cat-grooming',
            icon: '🐱',
            keywords: [
              'cat grooming', 'cat groomer', 'cat bath', 'cat haircut',
              'cat nail trimming', 'mobile cat grooming', 'feline grooming',
              'long hair cat grooming', 'cat spa'
            ],
            serviceTypes: [
              { id: 'full-grooming', name: 'Full Grooming Service' },
              { id: 'bath-brush', name: 'Bath & Brush' },
              { id: 'nail-trimming', name: 'Nail Trimming' },
              { id: 'lion-cut', name: 'Lion Cut' }
            ]
          },
          {
            id: 'aquarium-services',
            name: 'Aquarium Services',
            slug: 'aquarium-services',
            icon: '🐠',
            keywords: [
              'aquarium service', 'fish tank maintenance', 'aquarium cleaning',
              'aquarium setup', 'fish tank setup', 'aquarium maintenance',
              'reef tank service', 'saltwater aquarium', 'freshwater aquarium'
            ],
            serviceTypes: [
              { id: 'tank-setup', name: 'Aquarium Setup' },
              { id: 'maintenance', name: 'Regular Maintenance' },
              { id: 'cleaning', name: 'Deep Cleaning' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'lessons',
    name: 'Lessons & Tutoring',
    categories: [
      {
        id: 'music-lessons',
        name: 'Music Lessons',
        icon: '🎵',
        subservices: [
          {
            id: 'piano-lessons',
            name: 'Piano Lessons',
            slug: 'piano-lessons',
            icon: '🎹',
            keywords: [
              'piano lessons', 'piano teacher', 'piano tutor', 'learn piano',
              'keyboard lessons', 'piano instructor', 'piano classes',
              'beginner piano', 'advanced piano', 'classical piano'
            ],
            serviceTypes: [
              { id: 'beginner', name: 'Beginner Lessons' },
              { id: 'intermediate', name: 'Intermediate Lessons' },
              { id: 'advanced', name: 'Advanced Lessons' }
            ]
          },
          {
            id: 'guitar-lessons',
            name: 'Guitar Lessons',
            slug: 'guitar-lessons',
            icon: '🎸',
            keywords: [
              'guitar lessons', 'guitar teacher', 'guitar tutor', 'learn guitar',
              'acoustic guitar', 'electric guitar', 'guitar instructor',
              'bass guitar lessons', 'guitar classes'
            ],
            serviceTypes: [
              { id: 'acoustic', name: 'Acoustic Guitar' },
              { id: 'electric', name: 'Electric Guitar' },
              { id: 'bass', name: 'Bass Guitar' }
            ]
          },
          {
            id: 'singing-lessons',
            name: 'Singing Lessons',
            slug: 'singing-lessons',
            icon: '🎤',
            keywords: [
              'singing lessons', 'vocal lessons', 'voice lessons', 'singing teacher',
              'vocal coach', 'voice training', 'learn to sing',
              'vocal training', 'singing tutor', 'voice teacher'
            ],
            serviceTypes: [
              { id: 'beginner', name: 'Beginner Voice Training' },
              { id: 'pop-rock', name: 'Pop/Rock Vocals' },
              { id: 'classical', name: 'Classical Voice' }
            ]
          },
          {
            id: 'drum-lessons',
            name: 'Drum Lessons',
            slug: 'drum-lessons',
            icon: '🥁',
            keywords: [
              'drum lessons', 'drums teacher', 'percussion lessons', 'learn drums',
              'drumming lessons', 'drum instructor', 'drum tutor',
              'beginner drums', 'drum classes'
            ],
            serviceTypes: [
              { id: 'beginner', name: 'Beginner Lessons' },
              { id: 'intermediate', name: 'Intermediate Lessons' },
              { id: 'advanced', name: 'Advanced Lessons' }
            ]
          }
        ]
      },
      {
        id: 'sports-fitness',
        name: 'Sports & Fitness Lessons',
        icon: '⚽',
        subservices: [
          {
            id: 'swimming-lessons',
            name: 'Swimming Lessons',
            slug: 'swimming-lessons',
            icon: '🏊',
            keywords: [
              'swimming lessons', 'swim lessons', 'learn to swim', 'swim instructor',
              'swimming teacher', 'private swim lessons', 'adult swimming lessons',
              'kids swimming lessons', 'swim coach'
            ],
            serviceTypes: [
              { id: 'kids', name: 'Kids Swimming Lessons' },
              { id: 'adult', name: 'Adult Swimming Lessons' },
              { id: 'competitive', name: 'Competitive Swimming' }
            ]
          },
          {
            id: 'tennis-lessons',
            name: 'Tennis Lessons',
            slug: 'tennis-lessons',
            icon: '🎾',
            keywords: [
              'tennis lessons', 'tennis coach', 'tennis instructor', 'learn tennis',
              'private tennis lessons', 'tennis training', 'tennis tutor',
              'beginner tennis', 'tennis classes'
            ],
            serviceTypes: [
              { id: 'private', name: 'Private Lessons' },
              { id: 'group', name: 'Group Lessons' },
              { id: 'kids', name: 'Kids Tennis' }
            ]
          },
          {
            id: 'golf-lessons',
            name: 'Golf Lessons',
            slug: 'golf-lessons',
            icon: '⛳',
            keywords: [
              'golf lessons', 'golf instructor', 'golf coach', 'learn golf',
              'golf tutor', 'private golf lessons', 'golf training',
              'beginner golf', 'golf swing lessons'
            ],
            serviceTypes: [
              { id: 'beginner', name: 'Beginner Lessons' },
              { id: 'intermediate', name: 'Intermediate Lessons' },
              { id: 'short-game', name: 'Short Game Lessons' }
            ]
          },
          {
            id: 'martial-arts',
            name: 'Martial Arts Lessons',
            slug: 'martial-arts-lessons',
            icon: '🥋',
            keywords: [
              'martial arts', 'self defense', 'karate lessons', 'taekwondo',
              'jiu jitsu', 'boxing lessons', 'kickboxing', 'MMA training',
              'kung fu', 'martial arts instructor'
            ],
            serviceTypes: [
              { id: 'karate', name: 'Karate' },
              { id: 'taekwondo', name: 'Taekwondo' },
              { id: 'boxing', name: 'Boxing' },
              { id: 'jiu-jitsu', name: 'Jiu Jitsu' }
            ]
          }
        ]
      },
      {
        id: 'academic-tutoring',
        name: 'Academic Tutoring',
        icon: '📚',
        subservices: [
          {
            id: 'math-tutoring',
            name: 'Math Tutoring',
            slug: 'math-tutoring',
            icon: '🔢',
            keywords: [
              'math tutor', 'math tutoring', 'mathematics tutor', 'algebra tutor',
              'calculus tutor', 'geometry tutor', 'math help', 'math teacher',
              'online math tutor', 'private math tutor'
            ],
            serviceTypes: [
              { id: 'elementary', name: 'Elementary Math' },
              { id: 'algebra', name: 'Algebra' },
              { id: 'calculus', name: 'Calculus' },
              { id: 'statistics', name: 'Statistics' }
            ]
          },
          {
            id: 'science-tutoring',
            name: 'Science Tutoring',
            slug: 'science-tutoring',
            icon: '🔬',
            keywords: [
              'science tutor', 'science tutoring', 'physics tutor', 'chemistry tutor',
              'biology tutor', 'science help', 'science teacher',
              'STEM tutor', 'lab help'
            ],
            serviceTypes: [
              { id: 'physics', name: 'Physics' },
              { id: 'chemistry', name: 'Chemistry' },
              { id: 'biology', name: 'Biology' }
            ]
          },
          {
            id: 'language-lessons',
            name: 'Language Lessons',
            slug: 'language-lessons',
            icon: '🌍',
            keywords: [
              'language lessons', 'language tutor', 'learn language', 'ESL',
              'English tutor', 'Spanish lessons', 'French lessons', 'Arabic lessons',
              'Mandarin lessons', 'language teacher', 'foreign language'
            ],
            serviceTypes: [
              { id: 'english', name: 'English / ESL' },
              { id: 'spanish', name: 'Spanish' },
              { id: 'french', name: 'French' },
              { id: 'arabic', name: 'Arabic' },
              { id: 'mandarin', name: 'Mandarin Chinese' }
            ]
          },
          {
            id: 'test-prep',
            name: 'Test Preparation',
            slug: 'test-prep',
            icon: '📝',
            keywords: [
              'test prep', 'SAT tutor', 'ACT tutor', 'GRE tutor', 'GMAT tutor',
              'exam preparation', 'standardized test', 'college prep',
              'IELTS preparation', 'TOEFL preparation'
            ],
            serviceTypes: [
              { id: 'sat', name: 'SAT Prep' },
              { id: 'act', name: 'ACT Prep' },
              { id: 'gre', name: 'GRE Prep' },
              { id: 'ielts', name: 'IELTS Prep' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'auto',
    name: 'Auto Services',
    categories: [
      {
        id: 'mobile-auto',
        name: 'Mobile Auto Services',
        icon: '🚗',
        subservices: [
          {
            id: 'mobile-mechanic',
            name: 'Mobile Mechanic',
            slug: 'mobile-mechanic',
            icon: '🔧',
            keywords: [
              'mobile mechanic', 'mobile car repair', 'mechanic near me',
              'on-site mechanic', 'car repair at home', 'mobile auto repair',
              'traveling mechanic', 'emergency mechanic'
            ],
            serviceTypes: [
              { id: 'diagnostics', name: 'Diagnostics' },
              { id: 'brake-repair', name: 'Brake Repair' },
              { id: 'engine-repair', name: 'Engine Repair' },
              { id: 'general-repair', name: 'General Repair' }
            ]
          },
          {
            id: 'mobile-detailing',
            name: 'Mobile Auto Detailing',
            slug: 'mobile-auto-detailing',
            icon: '✨',
            keywords: [
              'mobile detailing', 'car detailing', 'auto detailing', 'mobile car wash',
              'interior detailing', 'exterior detailing', 'car cleaning',
              'paint correction', 'ceramic coating', 'waxing'
            ],
            serviceTypes: [
              { id: 'exterior', name: 'Exterior Detailing' },
              { id: 'interior', name: 'Interior Detailing' },
              { id: 'full-detail', name: 'Full Detailing' },
              { id: 'ceramic-coating', name: 'Ceramic Coating' }
            ]
          },
          {
            id: 'mobile-oil-change',
            name: 'Mobile Oil Change',
            slug: 'mobile-oil-change',
            icon: '🛢️',
            keywords: [
              'mobile oil change', 'oil change at home', 'oil change service',
              'synthetic oil change', 'oil change near me', 'quick oil change',
              'on-site oil change'
            ],
            serviceTypes: [
              { id: 'conventional', name: 'Conventional Oil Change' },
              { id: 'synthetic', name: 'Synthetic Oil Change' },
              { id: 'high-mileage', name: 'High Mileage Oil Change' }
            ]
          },
          {
            id: 'mobile-tire-service',
            name: 'Mobile Tire Service',
            slug: 'mobile-tire-service',
            icon: '🛞',
            keywords: [
              'mobile tire service', 'tire change', 'flat tire repair', 'tire installation',
              'tire rotation', 'tire balancing', 'roadside tire service',
              'emergency tire change'
            ],
            serviceTypes: [
              { id: 'tire-change', name: 'Tire Change' },
              { id: 'flat-repair', name: 'Flat Tire Repair' },
              { id: 'rotation', name: 'Tire Rotation' }
            ]
          },
          {
            id: 'auto-glass',
            name: 'Auto Glass Repair',
            slug: 'auto-glass-repair',
            icon: '🪟',
            keywords: [
              'auto glass repair', 'windshield repair', 'windshield replacement',
              'mobile windshield', 'car window repair', 'glass chip repair',
              'cracked windshield'
            ],
            serviceTypes: [
              { id: 'chip-repair', name: 'Chip Repair' },
              { id: 'windshield-replacement', name: 'Windshield Replacement' },
              { id: 'window-replacement', name: 'Window Replacement' }
            ]
          },
          {
            id: 'roadside-assistance',
            name: 'Roadside Assistance',
            slug: 'roadside-assistance',
            icon: '🚨',
            keywords: [
              'roadside assistance', 'towing', 'tow truck', 'jump start',
              'battery jump', 'lockout service', 'car lockout', 'fuel delivery',
              'emergency roadside'
            ],
            serviceTypes: [
              { id: 'towing', name: 'Towing' },
              { id: 'jump-start', name: 'Jump Start' },
              { id: 'lockout', name: 'Lockout Service' },
              { id: 'fuel-delivery', name: 'Fuel Delivery' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'business',
    name: 'Business Services',
    categories: [
      {
        id: 'professional-services',
        name: 'Professional Services',
        icon: '💼',
        subservices: [
          {
            id: 'accounting',
            name: 'Accounting',
            slug: 'accounting',
            icon: '📊',
            keywords: [
              'accountant', 'accounting services', 'bookkeeping', 'bookkeeper',
              'CPA', 'financial accounting', 'small business accounting',
              'accounts payable', 'accounts receivable'
            ],
            serviceTypes: [
              { id: 'bookkeeping', name: 'Bookkeeping' },
              { id: 'payroll', name: 'Payroll Services' },
              { id: 'financial-statements', name: 'Financial Statements' }
            ]
          },
          {
            id: 'tax-preparation',
            name: 'Tax Preparation',
            slug: 'tax-preparation',
            icon: '📋',
            keywords: [
              'tax preparation', 'tax preparer', 'tax filing', 'tax services',
              'income tax', 'business tax', 'tax consultant', 'tax accountant',
              'tax return', 'tax planning'
            ],
            serviceTypes: [
              { id: 'personal-tax', name: 'Personal Tax Filing' },
              { id: 'business-tax', name: 'Business Tax Filing' },
              { id: 'tax-planning', name: 'Tax Planning' }
            ]
          },
          {
            id: 'legal-services',
            name: 'Legal Services',
            slug: 'legal-services',
            icon: '⚖️',
            keywords: [
              'lawyer', 'attorney', 'legal services', 'legal advice',
              'contract lawyer', 'business lawyer', 'legal consultation',
              'legal document', 'notary'
            ],
            serviceTypes: [
              { id: 'consultation', name: 'Legal Consultation' },
              { id: 'contracts', name: 'Contract Review' },
              { id: 'business-formation', name: 'Business Formation' },
              { id: 'notary', name: 'Notary Services' }
            ]
          }
        ]
      },
      {
        id: 'creative-services',
        name: 'Creative & Digital Services',
        icon: '🎨',
        subservices: [
          {
            id: 'web-design',
            name: 'Web Design',
            slug: 'web-design',
            icon: '💻',
            keywords: [
              'web design', 'web designer', 'website design', 'web development',
              'website builder', 'web developer', 'responsive design',
              'WordPress', 'e-commerce website'
            ],
            serviceTypes: [
              { id: 'website-design', name: 'Website Design' },
              { id: 'wordpress', name: 'WordPress Development' },
              { id: 'e-commerce', name: 'E-Commerce Website' }
            ]
          },
          {
            id: 'graphic-design',
            name: 'Graphic Design',
            slug: 'graphic-design',
            icon: '🖼️',
            keywords: [
              'graphic design', 'graphic designer', 'logo design', 'branding',
              'business card design', 'flyer design', 'brochure design',
              'visual design', 'print design'
            ],
            serviceTypes: [
              { id: 'logo', name: 'Logo Design' },
              { id: 'branding', name: 'Branding' },
              { id: 'print', name: 'Print Design' },
              { id: 'social-media', name: 'Social Media Graphics' }
            ]
          },
          {
            id: 'photography',
            name: 'Photography',
            slug: 'photography',
            icon: '📷',
            keywords: [
              'photographer', 'photography', 'photo shoot', 'portrait photography',
              'headshot photographer', 'product photography', 'real estate photography',
              'event photographer', 'commercial photography'
            ],
            serviceTypes: [
              { id: 'portrait', name: 'Portrait Photography' },
              { id: 'headshots', name: 'Headshots' },
              { id: 'product', name: 'Product Photography' },
              { id: 'real-estate', name: 'Real Estate Photography' }
            ]
          },
          {
            id: 'videography',
            name: 'Videography',
            slug: 'videography',
            icon: '🎬',
            keywords: [
              'videographer', 'videography', 'video production', 'video editing',
              'corporate video', 'promotional video', 'commercial video',
              'video filming', 'drone videography'
            ],
            serviceTypes: [
              { id: 'corporate', name: 'Corporate Video' },
              { id: 'promotional', name: 'Promotional Video' },
              { id: 'editing', name: 'Video Editing' },
              { id: 'drone', name: 'Drone Videography' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'events',
    name: 'Events & Entertainment',
    categories: [
      {
        id: 'event-entertainment',
        name: 'Event Entertainment',
        icon: '🎉',
        subservices: [
          {
            id: 'dj-services',
            name: 'DJ Services',
            slug: 'dj-services',
            icon: '🎧',
            keywords: [
              'DJ', 'disc jockey', 'wedding DJ', 'party DJ', 'event DJ',
              'mobile DJ', 'DJ hire', 'DJ services', 'music DJ',
              'corporate DJ'
            ],
            serviceTypes: [
              { id: 'wedding', name: 'Wedding DJ' },
              { id: 'party', name: 'Party DJ' },
              { id: 'corporate', name: 'Corporate Event DJ' }
            ]
          },
          {
            id: 'live-music',
            name: 'Live Music',
            slug: 'live-music',
            icon: '🎷',
            keywords: [
              'live music', 'live band', 'wedding band', 'musician',
              'solo musician', 'acoustic band', 'jazz band', 'cover band',
              'live entertainment'
            ],
            serviceTypes: [
              { id: 'solo', name: 'Solo Musician' },
              { id: 'duo', name: 'Duo' },
              { id: 'band', name: 'Full Band' }
            ]
          },
          {
            id: 'mc-host',
            name: 'MC & Host Services',
            slug: 'mc-host-services',
            icon: '🎙️',
            keywords: [
              'MC', 'master of ceremonies', 'event host', 'emcee',
              'wedding MC', 'corporate MC', 'party host', 'event emcee'
            ],
            serviceTypes: [
              { id: 'wedding', name: 'Wedding MC' },
              { id: 'corporate', name: 'Corporate MC' },
              { id: 'party', name: 'Party Host' }
            ]
          }
        ]
      },
      {
        id: 'event-services',
        name: 'Event Services',
        icon: '🎊',
        subservices: [
          {
            id: 'catering',
            name: 'Catering',
            slug: 'catering',
            icon: '🍽️',
            keywords: [
              'catering', 'caterer', 'event catering', 'wedding catering',
              'corporate catering', 'party catering', 'food catering',
              'buffet catering', 'private chef catering'
            ],
            serviceTypes: [
              { id: 'wedding', name: 'Wedding Catering' },
              { id: 'corporate', name: 'Corporate Catering' },
              { id: 'private', name: 'Private Event Catering' },
              { id: 'buffet', name: 'Buffet Catering' }
            ]
          },
          {
            id: 'bartending',
            name: 'Bartending Services',
            slug: 'bartending',
            icon: '🍸',
            keywords: [
              'bartender', 'bartending', 'mobile bar', 'event bartender',
              'wedding bartender', 'cocktail bartender', 'bar service',
              'mixologist', 'private bartender'
            ],
            serviceTypes: [
              { id: 'full-service', name: 'Full Bar Service' },
              { id: 'cocktails', name: 'Cocktail Service' },
              { id: 'mobile-bar', name: 'Mobile Bar' }
            ]
          },
          {
            id: 'event-planning',
            name: 'Event Planning',
            slug: 'event-planning',
            icon: '📅',
            keywords: [
              'event planner', 'event planning', 'party planner', 'wedding planner',
              'event coordinator', 'event organizer', 'celebration planner',
              'corporate event planner'
            ],
            serviceTypes: [
              { id: 'wedding', name: 'Wedding Planning' },
              { id: 'corporate', name: 'Corporate Event Planning' },
              { id: 'party', name: 'Party Planning' },
              { id: 'day-of-coordination', name: 'Day-of Coordination' }
            ]
          },
          {
            id: 'photo-booth',
            name: 'Photo Booth Rental',
            slug: 'photo-booth',
            icon: '📸',
            keywords: [
              'photo booth', 'photo booth rental', 'party photo booth',
              'wedding photo booth', 'event photo booth', '360 photo booth',
              'mirror booth', 'selfie booth'
            ],
            serviceTypes: [
              { id: 'traditional', name: 'Traditional Photo Booth' },
              { id: '360-booth', name: '360 Photo Booth' },
              { id: 'mirror', name: 'Mirror Booth' }
            ]
          },
          {
            id: 'event-florist',
            name: 'Event Florist',
            slug: 'event-florist',
            icon: '💐',
            keywords: [
              'event florist', 'wedding florist', 'flower arrangement', 'floral design',
              'wedding flowers', 'party flowers', 'bouquet', 'centerpieces',
              'event flowers'
            ],
            serviceTypes: [
              { id: 'wedding', name: 'Wedding Flowers' },
              { id: 'centerpieces', name: 'Centerpieces' },
              { id: 'bouquets', name: 'Bouquets' },
              { id: 'event-decor', name: 'Floral Event Decor' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'wellness',
    name: 'Wellness & Lifestyle',
    categories: [
      {
        id: 'fitness-wellness',
        name: 'Fitness & Wellness',
        icon: '💪',
        subservices: [
          {
            id: 'personal-trainer',
            name: 'Personal Training',
            slug: 'personal-training',
            icon: '🏋️',
            keywords: [
              'personal trainer', 'personal training', 'fitness trainer', 'gym trainer',
              'home trainer', 'fitness coach', 'weight training', 'strength training',
              'fitness instruction', 'workout trainer'
            ],
            serviceTypes: [
              { id: 'in-home', name: 'In-Home Training' },
              { id: 'online', name: 'Online Training' },
              { id: 'group', name: 'Group Training' }
            ]
          },
          {
            id: 'yoga-instruction',
            name: 'Yoga Instruction',
            slug: 'yoga-instruction',
            icon: '🧘',
            keywords: [
              'yoga instructor', 'yoga teacher', 'private yoga', 'yoga classes',
              'home yoga', 'yoga lessons', 'hatha yoga', 'vinyasa yoga',
              'yoga therapy', 'corporate yoga'
            ],
            serviceTypes: [
              { id: 'private', name: 'Private Yoga' },
              { id: 'group', name: 'Group Yoga' },
              { id: 'corporate', name: 'Corporate Yoga' }
            ]
          },
          {
            id: 'pilates-instruction',
            name: 'Pilates Instruction',
            slug: 'pilates-instruction',
            icon: '🤸',
            keywords: [
              'pilates instructor', 'pilates teacher', 'private pilates', 'pilates classes',
              'mat pilates', 'reformer pilates', 'pilates lessons',
              'home pilates', 'pilates training'
            ],
            serviceTypes: [
              { id: 'mat', name: 'Mat Pilates' },
              { id: 'reformer', name: 'Reformer Pilates' },
              { id: 'private', name: 'Private Sessions' }
            ]
          },
          {
            id: 'massage-therapy',
            name: 'Massage Therapy',
            slug: 'massage-therapy',
            icon: '💆',
            keywords: [
              'massage therapist', 'massage therapy', 'mobile massage', 'home massage',
              'deep tissue massage', 'Swedish massage', 'sports massage',
              'relaxation massage', 'therapeutic massage'
            ],
            serviceTypes: [
              { id: 'swedish', name: 'Swedish Massage' },
              { id: 'deep-tissue', name: 'Deep Tissue Massage' },
              { id: 'sports', name: 'Sports Massage' },
              { id: 'relaxation', name: 'Relaxation Massage' }
            ]
          }
        ]
      },
      {
        id: 'life-coaching',
        name: 'Coaching & Counseling',
        icon: '🧠',
        subservices: [
          {
            id: 'life-coach',
            name: 'Life Coaching',
            slug: 'life-coaching',
            icon: '🌟',
            keywords: [
              'life coach', 'life coaching', 'personal coach', 'career coach',
              'executive coach', 'success coach', 'motivation coach',
              'mindset coach', 'transformation coach'
            ],
            serviceTypes: [
              { id: 'personal', name: 'Personal Coaching' },
              { id: 'career', name: 'Career Coaching' },
              { id: 'executive', name: 'Executive Coaching' }
            ]
          },
          {
            id: 'nutritionist',
            name: 'Nutritionist',
            slug: 'nutritionist',
            icon: '🥗',
            keywords: [
              'nutritionist', 'dietitian', 'nutrition coach', 'diet consultant',
              'meal planning', 'nutrition counseling', 'dietary advice',
              'weight loss nutritionist', 'sports nutrition'
            ],
            serviceTypes: [
              { id: 'consultation', name: 'Nutrition Consultation' },
              { id: 'meal-planning', name: 'Meal Planning' },
              { id: 'weight-management', name: 'Weight Management' }
            ]
          },
          {
            id: 'counseling',
            name: 'Counseling Services',
            slug: 'counseling',
            icon: '💬',
            keywords: [
              'counselor', 'counseling', 'therapist', 'therapy',
              'mental health', 'family counseling', 'couples counseling',
              'marriage counseling', 'anxiety counseling'
            ],
            serviceTypes: [
              { id: 'individual', name: 'Individual Counseling' },
              { id: 'couples', name: 'Couples Counseling' },
              { id: 'family', name: 'Family Counseling' }
            ]
          }
        ]
      }
    ]
  }
];

// Helper functions
export function getAllServices(): SubService[] {
  const allServices: SubService[] = [];
  serviceStructure.forEach(group => {
    group.categories.forEach(category => {
      allServices.push(...category.subservices);
    });
  });
  return allServices;
}

export function getServiceBySlug(slug: string): SubService | undefined {
  return getAllServices().find(service => service.slug === slug);
}

export function getCategoryServices(categoryId: string): SubService[] {
  for (const group of serviceStructure) {
    const category = group.categories.find(cat => cat.id === categoryId);
    if (category) {
      return category.subservices;
    }
  }
  return [];
}
