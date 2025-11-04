/**
 * Service categories for home improvement professionals
 * 20+ comprehensive categories for UAE market
 */

export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Emergency repairs, pipe installation, leak detection, bathroom fixtures',
    icon: '🔧',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    description: 'Wiring, lighting installation, panel upgrades, fault finding',
    icon: '⚡',
  },
  {
    id: 'hvac',
    name: 'HVAC (Air Conditioning)',
    description: 'AC installation, repair, duct cleaning, maintenance',
    icon: '❄️',
  },
  {
    id: 'general-contracting',
    name: 'General Contracting',
    description: 'Full renovations, additions, structural work, project management',
    icon: '🏗️',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    description: 'Roof repair, replacement, waterproofing, inspection',
    icon: '🏠',
  },
  {
    id: 'painting',
    name: 'Painting & Wallpaper',
    description: 'Interior painting, exterior painting, wallpaper installation',
    icon: '🎨',
  },
  {
    id: 'flooring',
    name: 'Flooring',
    description: 'Tile, marble, hardwood, laminate, vinyl, carpet installation',
    icon: '📐',
  },
  {
    id: 'kitchen-remodeling',
    name: 'Kitchen Remodeling',
    description: 'Cabinet installation, countertops, backsplash, full renovation',
    icon: '🍳',
  },
  {
    id: 'bathroom-remodeling',
    name: 'Bathroom Remodeling',
    description: 'Shower/tub installation, vanity, tiling, waterproofing',
    icon: '🚿',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    description: 'Custom furniture, built-ins, trim/molding, door installation',
    icon: '🪚',
  },
  {
    id: 'masonry',
    name: 'Masonry & Tiling',
    description: 'Brickwork, stonework, tile installation, concrete work',
    icon: '🧱',
  },
  {
    id: 'landscaping',
    name: 'Landscaping & Garden',
    description: 'Garden design, lawn installation, irrigation, tree services',
    icon: '🌳',
  },
  {
    id: 'windows-doors',
    name: 'Windows & Doors',
    description: 'Window replacement, door installation, glass work, frames',
    icon: '🚪',
  },
  {
    id: 'interior-design',
    name: 'Interior Design',
    description: 'Space planning, furniture selection, color consultation',
    icon: '🛋️',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'Design plans, structural design, permits, project planning',
    icon: '📐',
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing & Insulation',
    description: 'Basement waterproofing, thermal insulation, soundproofing',
    icon: '💧',
  },
  {
    id: 'smart-home',
    name: 'Smart Home & Security',
    description: 'Security systems, cameras, smart lighting, home automation',
    icon: '🔐',
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Termite treatment, rodent control, insect control, prevention',
    icon: '🐛',
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Deep cleaning, post-construction cleaning, regular maintenance',
    icon: '🧹',
  },
  {
    id: 'pool-spa',
    name: 'Pool & Spa',
    description: 'Pool installation, maintenance, repair, cleaning, equipment',
    icon: '🏊',
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair & Installation',
    description: 'Refrigerator, washer/dryer, dishwasher, oven repair',
    icon: '🔧',
  },
  {
    id: 'handyman',
    name: 'Handyman Services',
    description: 'General repairs, mounting, assembly, minor electrical/plumbing',
    icon: '🛠️',
  },
] as const;

export type ServiceCategoryId = typeof SERVICE_CATEGORIES[number]['id'];
