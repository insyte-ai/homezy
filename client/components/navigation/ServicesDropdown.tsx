'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SERVICE_NAVIGATION, SERVICE_SUBCATEGORIES } from '@/lib/serviceNavigation';

export function ServicesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
      >
        Explore Services
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60]">
          {SERVICE_NAVIGATION.map((category) => (
            <div key={category.id} className="px-4 py-3">
              {/* Category Header */}
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                {category.name}
              </h3>

              {/* Service Links */}
              <div className="space-y-1">
                {category.services.map((service) => {
                  // Link to specific service page if exists in subcategories, otherwise to all services
                  const serviceUrl = SERVICE_SUBCATEGORIES[service.id]?.[0]?.slug
                    ? `/services/${SERVICE_SUBCATEGORIES[service.id][0].slug}`
                    : '/services';

                  return (
                    <Link
                      key={service.id}
                      href={serviceUrl}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-primary-600">
                        {service.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                    </Link>
                  );
                })}
              </div>

              {/* Divider after each category except last */}
              {category.id !== SERVICE_NAVIGATION[SERVICE_NAVIGATION.length - 1].id && (
                <div className="border-t border-gray-200 mt-3" />
              )}
            </div>
          ))}

          {/* View All Services Link */}
          <div className="border-t border-gray-200 mt-2 px-4 py-3">
            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all services →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
