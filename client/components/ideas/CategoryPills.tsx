'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROOM_CATEGORY_CONFIG, type RoomCategory } from '@homezy/shared';
import type { CategoryCount } from '@/lib/services/ideas';

interface CategoryPillsProps {
  selectedCategory: RoomCategory | null;
  onSelectCategory: (category: RoomCategory | null) => void;
  categoryCounts?: CategoryCount[];
}

export function CategoryPills({
  selectedCategory,
  onSelectCategory,
  categoryCounts = [],
}: CategoryPillsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Create a map of category to count for quick lookup
  const countMap = new Map(categoryCounts.map((c) => [c.category, c.count]));

  // Sort categories by count (highest first), but keep "All" first
  const sortedCategories = [...ROOM_CATEGORY_CONFIG].sort((a, b) => {
    const countA = countMap.get(a.id) || 0;
    const countB = countMap.get(b.id) || 0;
    return countB - countA;
  });

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const totalCount = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Categories container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-1 py-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All category pill */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
          {totalCount > 0 && (
            <span className="ml-1.5 text-xs opacity-75">
              ({totalCount.toLocaleString()})
            </span>
          )}
        </button>

        {/* Category pills */}
        {sortedCategories.map((category) => {
          const count = countMap.get(category.id) || 0;
          if (count === 0) return null; // Don't show categories with no photos

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
              <span className="ml-1.5 text-xs opacity-75">
                ({count.toLocaleString()})
              </span>
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
