/**
 * Home Project Management Constants
 * Project categories, resource types, and task configurations
 */

import type {
  ProjectCategory,
  ResourceType,
  CostCategory,
  TaskPriority,
  HomeProjectStatus,
} from '../types/project.types';

// ============================================================================
// Project Category Configuration
// ============================================================================

export interface ProjectCategoryConfig {
  id: ProjectCategory;
  label: string;
  labelAr: string;
  icon: string; // Lucide icon name
  description: string;
  suggestedTasks: string[];
}

export const PROJECT_CATEGORY_CONFIG: ProjectCategoryConfig[] = [
  {
    id: 'kitchen',
    label: 'Kitchen',
    labelAr: 'المطبخ',
    icon: 'ChefHat',
    description: 'Kitchen renovation and remodeling',
    suggestedTasks: ['Design layout', 'Select cabinets', 'Choose countertops', 'Order appliances', 'Demolition', 'Installation'],
  },
  {
    id: 'bathroom',
    label: 'Bathroom',
    labelAr: 'الحمام',
    icon: 'Bath',
    description: 'Bathroom renovation and upgrades',
    suggestedTasks: ['Design layout', 'Select fixtures', 'Choose tiles', 'Plumbing work', 'Installation'],
  },
  {
    id: 'bedroom',
    label: 'Bedroom',
    labelAr: 'غرفة النوم',
    icon: 'Bed',
    description: 'Bedroom renovation and design',
    suggestedTasks: ['Design concept', 'Select flooring', 'Choose paint colors', 'Order furniture', 'Installation'],
  },
  {
    id: 'living-room',
    label: 'Living Room',
    labelAr: 'غرفة المعيشة',
    icon: 'Sofa',
    description: 'Living room renovation and redesign',
    suggestedTasks: ['Design layout', 'Select furniture', 'Choose lighting', 'Flooring', 'Paint/wallpaper'],
  },
  {
    id: 'dining-room',
    label: 'Dining Room',
    labelAr: 'غرفة الطعام',
    icon: 'UtensilsCrossed',
    description: 'Dining room updates and renovation',
    suggestedTasks: ['Design concept', 'Select furniture', 'Lighting fixtures', 'Flooring'],
  },
  {
    id: 'outdoor',
    label: 'Outdoor / Garden',
    labelAr: 'الحديقة',
    icon: 'Trees',
    description: 'Outdoor spaces, garden, and patio',
    suggestedTasks: ['Landscape design', 'Hardscaping', 'Planting', 'Irrigation system', 'Outdoor furniture'],
  },
  {
    id: 'garage',
    label: 'Garage',
    labelAr: 'المرآب',
    icon: 'Car',
    description: 'Garage renovation and organization',
    suggestedTasks: ['Flooring', 'Storage systems', 'Lighting', 'Door replacement'],
  },
  {
    id: 'hvac',
    label: 'HVAC System',
    labelAr: 'نظام التكييف',
    icon: 'Thermometer',
    description: 'AC and ventilation projects',
    suggestedTasks: ['System assessment', 'Get quotes', 'Unit selection', 'Installation', 'Ductwork'],
  },
  {
    id: 'electrical',
    label: 'Electrical',
    labelAr: 'الكهرباء',
    icon: 'Zap',
    description: 'Electrical upgrades and installations',
    suggestedTasks: ['Assessment', 'Panel upgrade', 'Wiring', 'Fixtures installation', 'Smart home setup'],
  },
  {
    id: 'plumbing',
    label: 'Plumbing',
    labelAr: 'السباكة',
    icon: 'Droplet',
    description: 'Plumbing repairs and upgrades',
    suggestedTasks: ['Inspection', 'Pipe replacement', 'Fixture installation', 'Water heater'],
  },
  {
    id: 'flooring',
    label: 'Flooring',
    labelAr: 'الأرضيات',
    icon: 'Square',
    description: 'Floor replacement and refinishing',
    suggestedTasks: ['Select material', 'Subfloor prep', 'Installation', 'Finishing'],
  },
  {
    id: 'painting',
    label: 'Painting',
    labelAr: 'الدهان',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting',
    suggestedTasks: ['Color selection', 'Surface prep', 'Priming', 'Painting', 'Touch-ups'],
  },
  {
    id: 'roofing',
    label: 'Roofing',
    labelAr: 'الأسقف',
    icon: 'Home',
    description: 'Roof repairs and replacement',
    suggestedTasks: ['Inspection', 'Material selection', 'Repairs/replacement', 'Waterproofing'],
  },
  {
    id: 'landscaping',
    label: 'Landscaping',
    labelAr: 'تنسيق الحدائق',
    icon: 'Flower2',
    description: 'Garden design and landscaping',
    suggestedTasks: ['Design plan', 'Irrigation', 'Hardscaping', 'Planting', 'Lighting'],
  },
  {
    id: 'pool',
    label: 'Pool',
    labelAr: 'المسبح',
    icon: 'Waves',
    description: 'Pool construction or renovation',
    suggestedTasks: ['Design', 'Permits', 'Excavation', 'Construction', 'Equipment', 'Finishing'],
  },
  {
    id: 'security',
    label: 'Security',
    labelAr: 'الأمان',
    icon: 'Shield',
    description: 'Security system installation',
    suggestedTasks: ['System design', 'Equipment selection', 'Installation', 'Configuration', 'Training'],
  },
  {
    id: 'whole-home',
    label: 'Whole Home',
    labelAr: 'المنزل بالكامل',
    icon: 'Building',
    description: 'Whole home renovation or remodel',
    suggestedTasks: ['Master plan', 'Permits', 'Demolition', 'Structural work', 'MEP', 'Finishing'],
  },
  {
    id: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    icon: 'MoreHorizontal',
    description: 'Other home improvement projects',
    suggestedTasks: ['Planning', 'Execution', 'Completion'],
  },
];

// ============================================================================
// Resource Type Configuration
// ============================================================================

export interface ResourceTypeConfig {
  id: ResourceType;
  label: string;
  labelAr: string;
  icon: string;
  description: string;
  color: string; // Tailwind color class
}

export const RESOURCE_TYPE_CONFIG: ResourceTypeConfig[] = [
  {
    id: 'idea',
    label: 'Idea',
    labelAr: 'فكرة',
    icon: 'Lightbulb',
    description: 'Inspiration images and design ideas',
    color: 'yellow',
  },
  {
    id: 'pro',
    label: 'Professional',
    labelAr: 'محترف',
    icon: 'User',
    description: 'Saved professionals and contractors',
    color: 'blue',
  },
  {
    id: 'product',
    label: 'Product',
    labelAr: 'منتج',
    icon: 'Package',
    description: 'Products with prices and specs',
    color: 'green',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    labelAr: 'مورد',
    icon: 'Store',
    description: 'Suppliers, stores, and contractors',
    color: 'purple',
  },
  {
    id: 'document',
    label: 'Document',
    labelAr: 'مستند',
    icon: 'FileText',
    description: 'Contracts, permits, and receipts',
    color: 'gray',
  },
  {
    id: 'estimate',
    label: 'Estimate',
    labelAr: 'تقدير',
    icon: 'Calculator',
    description: 'Price estimates and quotes',
    color: 'orange',
  },
  {
    id: 'link',
    label: 'Link',
    labelAr: 'رابط',
    icon: 'Link',
    description: 'Useful links and references',
    color: 'cyan',
  },
];

// ============================================================================
// Cost Category Configuration
// ============================================================================

export interface CostCategoryConfig {
  id: CostCategory;
  label: string;
  labelAr: string;
  icon: string;
}

export const COST_CATEGORY_CONFIG: CostCategoryConfig[] = [
  {
    id: 'labor',
    label: 'Labor',
    labelAr: 'العمالة',
    icon: 'Users',
  },
  {
    id: 'materials',
    label: 'Materials',
    labelAr: 'المواد',
    icon: 'Package',
  },
  {
    id: 'permits',
    label: 'Permits & Fees',
    labelAr: 'التصاريح والرسوم',
    icon: 'FileCheck',
  },
  {
    id: 'other',
    label: 'Other',
    labelAr: 'أخرى',
    icon: 'MoreHorizontal',
  },
];

// ============================================================================
// Task Priority Configuration
// ============================================================================

export interface TaskPriorityConfig {
  id: TaskPriority;
  label: string;
  labelAr: string;
  color: string;
  icon: string;
}

export const TASK_PRIORITY_CONFIG: TaskPriorityConfig[] = [
  {
    id: 'low',
    label: 'Low',
    labelAr: 'منخفضة',
    color: 'green',
    icon: 'ArrowDown',
  },
  {
    id: 'medium',
    label: 'Medium',
    labelAr: 'متوسطة',
    color: 'yellow',
    icon: 'Minus',
  },
  {
    id: 'high',
    label: 'High',
    labelAr: 'عالية',
    color: 'red',
    icon: 'ArrowUp',
  },
];

// ============================================================================
// Project Status Configuration
// ============================================================================

export interface ProjectStatusConfig {
  id: HomeProjectStatus;
  label: string;
  labelAr: string;
  color: string;
  icon: string;
}

export const PROJECT_STATUS_CONFIG: ProjectStatusConfig[] = [
  {
    id: 'planning',
    label: 'Planning',
    labelAr: 'تخطيط',
    color: 'blue',
    icon: 'ClipboardList',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    labelAr: 'قيد التنفيذ',
    color: 'yellow',
    icon: 'Loader',
  },
  {
    id: 'on-hold',
    label: 'On Hold',
    labelAr: 'معلق',
    color: 'orange',
    icon: 'Pause',
  },
  {
    id: 'completed',
    label: 'Completed',
    labelAr: 'مكتمل',
    color: 'green',
    icon: 'CheckCircle',
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    labelAr: 'ملغى',
    color: 'gray',
    icon: 'XCircle',
  },
];

// ============================================================================
// Default Project Name
// ============================================================================

export const DEFAULT_PROJECT_NAME = 'My Ideas';
export const DEFAULT_PROJECT_DESCRIPTION = 'Your default collection for saving ideas, professionals, products, and more.';

// ============================================================================
// Helper Functions
// ============================================================================

export const getProjectCategoryConfig = (id: ProjectCategory): ProjectCategoryConfig | undefined => {
  return PROJECT_CATEGORY_CONFIG.find(config => config.id === id);
};

export const getResourceTypeConfig = (id: ResourceType): ResourceTypeConfig | undefined => {
  return RESOURCE_TYPE_CONFIG.find(config => config.id === id);
};

export const getCostCategoryConfig = (id: CostCategory): CostCategoryConfig | undefined => {
  return COST_CATEGORY_CONFIG.find(config => config.id === id);
};

export const getTaskPriorityConfig = (id: TaskPriority): TaskPriorityConfig | undefined => {
  return TASK_PRIORITY_CONFIG.find(config => config.id === id);
};

export const getProjectStatusConfig = (id: HomeProjectStatus): ProjectStatusConfig | undefined => {
  return PROJECT_STATUS_CONFIG.find(config => config.id === id);
};
