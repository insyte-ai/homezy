'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Filter } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ResourceCard } from '@/components/resources';
import { Resource, ResourceType, RESOURCE_TYPE_LABELS } from '@/types/resource';
import { getResources, getCategoryBySlug } from '@/lib/services/resources';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('');
  const [total, setTotal] = useState(0);

  const category = getCategoryBySlug(categorySlug);

  useEffect(() => {
    if (category) {
      loadResources();
    }
  }, [categorySlug, selectedType]);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const result = await getResources({
        category: categorySlug,
        type: selectedType || undefined,
        limit: 20,
      });
      setResources(result.resources);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Error loading category resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/resources/center" className="text-gray-500 hover:text-gray-700">
              Resources
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className={`py-12 ${category.bgColor}`}>
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-xl text-gray-600">{category.description}</p>
            {total > 0 && (
              <p className="mt-4 text-sm text-gray-500">
                {total} {total === 1 ? 'resource' : 'resources'} available
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="container-custom py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Filter by type:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !selectedType
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {Object.entries(RESOURCE_TYPE_LABELS).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No resources found in this category yet.</p>
              <Link
                href="/resources/center"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse all resources
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource.id || resource._id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
