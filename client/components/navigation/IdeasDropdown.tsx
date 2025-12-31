'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { ROOM_CATEGORY_CONFIG, type RoomCategory } from '@homezy/shared';

// Group categories for display
const CATEGORY_GROUPS: { title: string; categories: RoomCategory[] }[] = [
  {
    title: 'Kitchen & Dining',
    categories: ['kitchen', 'dining-room'],
  },
  {
    title: 'Living Spaces',
    categories: ['living-room', 'bedroom', 'home-office'],
  },
  {
    title: 'Bed & Bath',
    categories: ['bathroom', 'closet-storage'],
  },
  {
    title: 'Kids & Family',
    categories: ['kids-room', 'nursery'],
  },
  {
    title: 'Outdoor',
    categories: ['outdoor', 'patio-deck', 'pool', 'garden-landscaping', 'balcony'],
  },
  {
    title: 'Utility',
    categories: ['laundry', 'garage', 'basement'],
  },
  {
    title: 'More Rooms',
    categories: ['gym-fitness', 'entryway', 'hallway', 'staircase'],
  },
];

// Helper to get label from config
const getCategoryLabel = (id: RoomCategory): string => {
  return ROOM_CATEGORY_CONFIG.find((c) => c.id === id)?.label || id;
};

export function IdeasDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-900 transition-all">
        <Lightbulb className="h-4 w-4" />
        <span>Ideas</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full -mt-px bg-white shadow-xl border border-gray-200 rounded-b-lg z-50 p-6">
          <div className="flex gap-8">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.title} className="min-w-[140px]">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.categories.map((categoryId) => (
                    <li key={categoryId}>
                      <Link
                        href={`/ideas?category=${categoryId}`}
                        className="text-sm text-gray-700 hover:text-gray-900 hover:underline whitespace-nowrap"
                        onClick={handleLinkClick}
                      >
                        {getCategoryLabel(categoryId)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              href="/ideas"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              onClick={handleLinkClick}
            >
              View all ideas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
