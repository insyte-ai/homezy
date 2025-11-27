'use client';

import { StarRatingInput } from './StarRatingInput';
import type { CategoryRatings as CategoryRatingsType } from '@/lib/services/reviews';

interface CategoryRatingsProps {
  value: CategoryRatingsType;
  onChange: (value: CategoryRatingsType) => void;
  disabled?: boolean;
}

const categoryLabels: Record<keyof CategoryRatingsType, string> = {
  professionalism: 'Professionalism',
  quality: 'Quality of Work',
  timeliness: 'Timeliness',
  value: 'Value for Money',
  communication: 'Communication',
};

const categoryDescriptions: Record<keyof CategoryRatingsType, string> = {
  professionalism: 'How professional was the contractor?',
  quality: 'How satisfied are you with the quality of work?',
  timeliness: 'Were they on time and met deadlines?',
  value: 'Was the price fair for the work done?',
  communication: 'How well did they communicate with you?',
};

export function CategoryRatings({ value, onChange, disabled = false }: CategoryRatingsProps) {
  const categories: (keyof CategoryRatingsType)[] = [
    'professionalism',
    'quality',
    'timeliness',
    'value',
    'communication',
  ];

  const handleCategoryChange = (category: keyof CategoryRatingsType, rating: number) => {
    onChange({
      ...value,
      [category]: rating,
    });
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900">{categoryLabels[category]}</h4>
              <p className="text-xs text-gray-500">{categoryDescriptions[category]}</p>
            </div>
            <StarRatingInput
              value={value[category]}
              onChange={(rating) => handleCategoryChange(category, rating)}
              size="sm"
              disabled={disabled}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
