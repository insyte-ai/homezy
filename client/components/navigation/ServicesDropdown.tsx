'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react';
import { serviceStructure, ServiceCategory } from '@/data/serviceStructure';

// Flatten all categories from all groups for the navigation
const allCategories: ServiceCategory[] = serviceStructure.flatMap(group => group.categories);

export function ServicesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleLinkClick = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
    // Set first category as active by default
    if (!activeCategory && allCategories.length > 0) {
      setActiveCategory(allCategories[0].id);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsOpen(false);
        setActiveCategory(null);
      }}
    >
      {/* Trigger Button */}
      <button
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 py-3 border-b-2 border-transparent hover:border-gray-900 transition-all"
      >
        <LayoutGrid className="h-4 w-4" />
        <span>All Services</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 top-full -mt-px bg-white shadow-xl border border-gray-200 rounded-b-lg z-50"
          style={{ width: '1200px' }}
        >
          <div className="flex">
            {/* Left sidebar with main categories */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <div className="py-2">
                {allCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                      activeCategory === category.id
                        ? 'bg-white text-gray-900 font-medium border-r-2 border-gray-900'
                        : 'hover:bg-white text-gray-700 hover:text-gray-900'
                    }`}
                    onMouseEnter={() => setActiveCategory(category.id)}
                  >
                    <span className="text-sm">{category.name}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                ))}
                <Link
                  href="/services"
                  className="px-4 py-3 text-sm text-primary-600 hover:text-primary-700 font-medium block border-t border-gray-200 mt-2"
                  onClick={handleLinkClick}
                >
                  Show all services
                </Link>
              </div>
            </div>

            {/* Right side with subservices */}
            <div className="flex-1 p-6">
              {activeCategory && (
                <>
                  {allCategories.map((category) => {
                    if (category.id !== activeCategory) return null;

                    return (
                      <div key={category.id}>
                        {/* Category Header */}
                        <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Browse all {category.name.toLowerCase()} services
                          </p>
                        </div>

                        {/* Services Grid */}
                        <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                          {category.subservices.map((subservice) => {
                            const serviceTypes = subservice.serviceTypes || [];

                            return (
                              <div key={subservice.id}>
                                <Link
                                  href={`/services/${subservice.slug}`}
                                  className="font-medium text-sm text-gray-900 hover:text-primary-600 block mb-3"
                                  onClick={handleLinkClick}
                                >
                                  {subservice.name}
                                </Link>
                                {serviceTypes.length > 0 && (
                                  <ul className="space-y-2">
                                    {serviceTypes.slice(0, 4).map((type) => (
                                      <li key={type.id}>
                                        <Link
                                          href={`/services/${subservice.slug}?type=${type.id}`}
                                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                                          onClick={handleLinkClick}
                                        >
                                          {type.name}
                                        </Link>
                                      </li>
                                    ))}
                                    {serviceTypes.length > 4 && (
                                      <li>
                                        <Link
                                          href={`/services/${subservice.slug}`}
                                          className="text-sm text-primary-600 hover:text-primary-700"
                                          onClick={handleLinkClick}
                                        >
                                          View all ({serviceTypes.length})
                                        </Link>
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
