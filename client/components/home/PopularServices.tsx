'use client';

import { useState, useEffect } from 'react';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';

interface PopularServicesProps {
  onSelectService: (serviceId: string) => void;
}

// Most popular services to display (using actual IDs from serviceStructure.ts)
const POPULAR_SERVICE_IDS = [
  'plumbing',
  'electrical',
  'hvac',
  'handyman',
  'appliance-repair',
  'home-cleaning',
  'deep-cleaning',
  'kitchen-remodelling',
  'bathroom-remodelling',
  'flooring',
  'painting',
  'roofing',
  'landscaping',
  'pool-services',
  'home-automation',
  'pest-control',
  'door-windows',
  'waterproofing',
];

export function PopularServices({ onSelectService }: PopularServicesProps) {
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const subservices = await getAllSubservices();
        setServiceCategories(subservices);
      } catch (err) {
        console.error('Failed to load service categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const popularServices = serviceCategories.filter((service) =>
    POPULAR_SERVICE_IDS.includes(service.id)
  );

  if (loading) {
    return (
      <div className="w-full">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-100 rounded-2xl animate-pulse h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Services</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {popularServices.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelectService(service.id)}
            className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl
                       border-2 border-gray-100 hover:border-primary-500 hover:shadow-lg
                       transition-all duration-200 text-center"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
              {service.icon}
            </span>
            <span className="text-xs font-medium text-gray-900 group-hover:text-primary-700">
              {service.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
