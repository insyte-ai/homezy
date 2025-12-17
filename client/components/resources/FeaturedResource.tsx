'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { Resource, RESOURCE_TYPE_LABELS, ResourceType } from '@/types/resource';
import { formatPublishedDate } from '@/lib/services/resources';

interface FeaturedResourceProps {
  resource: Resource;
}

export function FeaturedResource({ resource }: FeaturedResourceProps) {
  const typeLabel = RESOURCE_TYPE_LABELS[resource.type as ResourceType] || resource.type;

  return (
    <Link
      href={`/resources/${resource.category}/${resource.slug}`}
      className="group block bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100 hover:border-primary-300 hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="grid md:grid-cols-2 gap-8 p-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white">
              Featured
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200">
              {typeLabel}
            </span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors">
            {resource.title}
          </h2>

          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {resource.excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span className="font-medium text-gray-900">
              {resource.author.name}
            </span>
            <span>•</span>
            <span>{resource.publishedAt ? formatPublishedDate(resource.publishedAt) : ''}</span>
            {resource.content.readingTime && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{resource.content.readingTime} min read</span>
                </div>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all">
            Read More
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {resource.featuredImage && (
          <div className="relative">
            <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-lg">
              <Image
                src={resource.featuredImage}
                alt={resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default FeaturedResource;
