/**
 * Room Categories for Ideas Page
 * Used for tagging portfolio photos by room/space type
 */

// ============================================================================
// Room Category Types
// ============================================================================

export const ROOM_CATEGORIES = [
  'kitchen',
  'bathroom',
  'bedroom',
  'living-room',
  'dining-room',
  'home-office',
  'outdoor',
  'patio-deck',
  'pool',
  'garden-landscaping',
  'garage',
  'laundry',
  'closet-storage',
  'gym-fitness',
  'kids-room',
  'nursery',
  'entryway',
  'hallway',
  'staircase',
  'basement',
  'balcony',
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

// ============================================================================
// Room Category Configuration
// ============================================================================

export interface RoomCategoryConfig {
  id: RoomCategory;
  label: string;
  labelAr: string;
  icon: string; // Lucide icon name
}

export const ROOM_CATEGORY_CONFIG: RoomCategoryConfig[] = [
  { id: 'kitchen', label: 'Kitchen', labelAr: 'المطبخ', icon: 'ChefHat' },
  { id: 'bathroom', label: 'Bathroom', labelAr: 'الحمام', icon: 'Bath' },
  { id: 'bedroom', label: 'Bedroom', labelAr: 'غرفة النوم', icon: 'Bed' },
  {
    id: 'living-room',
    label: 'Living Room',
    labelAr: 'غرفة المعيشة',
    icon: 'Sofa',
  },
  {
    id: 'dining-room',
    label: 'Dining Room',
    labelAr: 'غرفة الطعام',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'home-office',
    label: 'Home Office',
    labelAr: 'مكتب منزلي',
    icon: 'Laptop',
  },
  { id: 'outdoor', label: 'Outdoor', labelAr: 'في الهواء الطلق', icon: 'Sun' },
  {
    id: 'patio-deck',
    label: 'Patio & Deck',
    labelAr: 'الفناء والسطح',
    icon: 'Umbrella',
  },
  { id: 'pool', label: 'Pool', labelAr: 'المسبح', icon: 'Waves' },
  {
    id: 'garden-landscaping',
    label: 'Garden & Landscaping',
    labelAr: 'الحديقة والمناظر الطبيعية',
    icon: 'Flower2',
  },
  { id: 'garage', label: 'Garage', labelAr: 'المرآب', icon: 'Car' },
  { id: 'laundry', label: 'Laundry', labelAr: 'غرفة الغسيل', icon: 'Shirt' },
  {
    id: 'closet-storage',
    label: 'Closet & Storage',
    labelAr: 'الخزانة والتخزين',
    icon: 'Archive',
  },
  {
    id: 'gym-fitness',
    label: 'Gym & Fitness',
    labelAr: 'صالة الألعاب الرياضية',
    icon: 'Dumbbell',
  },
  {
    id: 'kids-room',
    label: "Kids' Room",
    labelAr: 'غرفة الأطفال',
    icon: 'Gamepad2',
  },
  { id: 'nursery', label: 'Nursery', labelAr: 'غرفة الحضانة', icon: 'Baby' },
  { id: 'entryway', label: 'Entryway', labelAr: 'المدخل', icon: 'DoorOpen' },
  { id: 'hallway', label: 'Hallway', labelAr: 'الممر', icon: 'MoveHorizontal' },
  {
    id: 'staircase',
    label: 'Staircase',
    labelAr: 'الدرج',
    icon: 'TrendingUp',
  },
  { id: 'basement', label: 'Basement', labelAr: 'القبو', icon: 'ArrowDownToLine' },
  { id: 'balcony', label: 'Balcony', labelAr: 'الشرفة', icon: 'Building2' },
];

// Helper to get config by ID
export const getRoomCategoryConfig = (
  id: RoomCategory
): RoomCategoryConfig | undefined => {
  return ROOM_CATEGORY_CONFIG.find((config) => config.id === id);
};

// Helper to get label by ID (with fallback)
export const getRoomCategoryLabel = (id: RoomCategory): string => {
  return getRoomCategoryConfig(id)?.label || id;
};
