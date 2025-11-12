'use client';

import { SERVICE_CATEGORIES } from '@homezy/shared';

interface PopularServicesProps {
  onSelectService: (serviceId: string) => void;
}

// Most popular services to display
const POPULAR_SERVICE_IDS = [
  'plumbing',
  'electrical',
  'hvac',
  'painting',
  'kitchen-remodeling',
  'bathroom-remodeling',
  'flooring',
  'general-contracting',
];

export function PopularServices({ onSelectService }: PopularServicesProps) {
  const popularServices = SERVICE_CATEGORIES.filter((service) =>
    POPULAR_SERVICE_IDS.includes(service.id)
  );

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Services</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {popularServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-2xl
                       border-2 border-gray-100 hover:border-primary-500 hover:shadow-lg
                       transition-all duration-200 text-center"
          >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {service.icon}
            </span>
            <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
              {service.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
