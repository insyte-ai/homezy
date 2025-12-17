'use client';

import Link from 'next/link';
import {
  Rocket,
  Home,
  UserCheck,
  Briefcase,
  FileText,
  TrendingUp,
  Calendar,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { CategoryInfo } from '@/types/resource';

interface CategoryCardProps {
  category: CategoryInfo;
}

export function CategoryCard({ category }: CategoryCardProps) {
  // Map icon names to actual icon components
  const getIcon = (iconName?: string) => {
    const iconProps = { className: 'h-7 w-7' };

    switch (iconName) {
      case 'Rocket':
        return <Rocket {...iconProps} />;
      case 'Home':
        return <Home {...iconProps} />;
      case 'UserCheck':
        return <UserCheck {...iconProps} />;
      case 'Briefcase':
        return <Briefcase {...iconProps} />;
      case 'FileText':
        return <FileText {...iconProps} />;
      case 'TrendingUp':
        return <TrendingUp {...iconProps} />;
      case 'Calendar':
        return <Calendar {...iconProps} />;
      case 'HelpCircle':
        return <HelpCircle {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };

  return (
    <Link
      href={`/resources/${category.slug}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all p-6"
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-lg ${category.bgColor} ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          {getIcon(category.icon)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {category.description}
          </p>
          {category.resourceCount !== undefined && (
            <p className="text-xs text-gray-500">
              {category.resourceCount}{' '}
              {category.resourceCount === 1 ? 'resource' : 'resources'}
            </p>
          )}
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

export default CategoryCard;
