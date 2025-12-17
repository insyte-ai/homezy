'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Home, Briefcase } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CategoryCard } from '@/components/resources';
import { CategoryInfo, TargetAudience } from '@/types/resource';
import { getResourceStats, getCategoriesWithCounts } from '@/lib/services/resources';
import { CATEGORY_INFO } from '@/data/resources';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORY_INFO);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const stats = await getResourceStats();
      setCategories(getCategoriesWithCounts(stats));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const homeownerCategories = categories.filter(
    (cat) =>
      cat.targetAudience === TargetAudience.HOMEOWNER ||
      cat.targetAudience === TargetAudience.BOTH
  );

  const proCategories = categories.filter(
    (cat) =>
      cat.targetAudience === TargetAudience.PRO ||
      cat.targetAudience === TargetAudience.BOTH
  );

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
            <span className="text-gray-900 font-medium">All Categories</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-primary-50 to-white">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse All Categories</h1>
            <p className="text-xl text-gray-600">
              Explore our complete library of resources organized by topic and audience.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="border-b border-gray-200">
        <div className="container-custom py-6">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/resources/homeowner"
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Home className="h-5 w-5" />
              Homeowner Academy
            </Link>
            <Link
              href="/resources/pro"
              className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Briefcase className="h-5 w-5" />
              Pro Academy
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* For Homeowners */}
          <section className="py-12">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Homeowners</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeownerCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>

          {/* For Professionals */}
          <section className="py-12 bg-gray-50">
            <div className="container-custom">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Professionals</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {proCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <PublicFooter />
    </div>
  );
}
