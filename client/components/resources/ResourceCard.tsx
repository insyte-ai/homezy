'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import {
  Resource,
  ResourceType,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
} from '@/types/resource';
import { getTimeAgo } from '@/lib/services/resources';

interface ResourceCardProps {
  resource: Resource;
  variant?: 'default' | 'compact' | 'featured';
}

export function ResourceCard({ resource, variant = 'default' }: ResourceCardProps) {
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const typeLabel = RESOURCE_TYPE_LABELS[resource.type as ResourceType] || resource.type;
  const typeColor = RESOURCE_TYPE_COLORS[resource.type as ResourceType] || 'bg-gray-100 text-gray-800';

  if (variant === 'compact') {
    return (
      <Link
        href={`/resources/${resource.category}/${resource.slug}`}
        className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
            {resource.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span title={formatDate(resource.publishedAt)}>
              {resource.publishedAt ? getTimeAgo(resource.publishedAt) : ''}
            </span>
            {resource.content.readingTime && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {resource.content.readingTime} min read
                </span>
              </>
            )}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link
        href={`/resources/${resource.category}/${resource.slug}`}
        className="group block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
      >
        {resource.featuredImage && (
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <Image
              src={resource.featuredImage}
              alt={resource.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
              {typeLabel}
            </span>
            {resource.featured && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
            {resource.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-3">
            {resource.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>{resource.author.name}</span>
              <span>•</span>
              <span title={formatDate(resource.publishedAt)}>
                {resource.publishedAt ? getTimeAgo(resource.publishedAt) : ''}
              </span>
            </div>
            {resource.content.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{resource.content.readingTime} min</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/resources/${resource.category}/${resource.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all overflow-hidden"
    >
      {resource.thumbnail && (
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <Image
            src={resource.thumbnail}
            alt={resource.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          {resource.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {resource.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span title={formatDate(resource.publishedAt)}>
            {resource.publishedAt ? getTimeAgo(resource.publishedAt) : ''}
          </span>
          {resource.content.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{resource.content.readingTime} min read</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ResourceCard;
