'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  ResourceCard,
  CategoryCard,
  ResourceSidebar,
  NewsletterSignup,
  FAQSection,
} from '@/components/resources';
import { Resource, CategoryInfo, TargetAudience } from '@/types/resource';
import {
  getFeaturedResources,
  getLatestResources,
  getResourceStats,
  getCategoriesWithCounts,
} from '@/lib/services/resources';
import { PRO_FAQS, getProCategories } from '@/data/resources';

export default function ProAcademyPage() {
  const [featuredResources, setFeaturedResources] = useState<Resource[]>([]);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>(getProCategories());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [featured, latest, stats] = await Promise.all([
        getFeaturedResources(3, TargetAudience.PRO),
        getLatestResources(6, TargetAudience.PRO),
        getResourceStats(),
      ]);

      setFeaturedResources(featured);
      setLatestResources(latest);

      // Filter categories for pros and add counts
      const proCats = getCategoriesWithCounts(stats).filter(
        cat => cat.targetAudience === TargetAudience.PRO || cat.targetAudience === TargetAudience.BOTH
      );
      setCategories(proCats);
    } catch (error) {
      console.error('Error loading pro academy content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-12 md:py-16">
        <div className="container-custom">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Pro Academy
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Resources for Professionals
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-2xl">
              Grow your business with expert guides on winning leads, building your reputation, and delivering exceptional service.
            </p>
            <Link
              href="/become-a-pro"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Join as a Pro
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ResourceSidebar audience={TargetAudience.PRO} />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Featured Resources */}
            {featuredResources.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured for Pros</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id || resource._id}
                      resource={resource}
                      variant="featured"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Categories */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Topic</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>

            {/* Latest Resources */}
            {latestResources.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Pro Resources</h2>
                  <Link
                    href="/resources/categories"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {latestResources.map((resource) => (
                    <ResourceCard key={resource.id || resource._id} resource={resource} />
                  ))}
                </div>
              </section>
            )}

            {/* FAQ Section */}
            <section className="mb-12">
              <FAQSection faqs={PRO_FAQS} title="Pro FAQs" />
            </section>

            {/* Newsletter */}
            <NewsletterSignup
              title="Pro Success Tips"
              description="Get expert advice on growing your business, winning more leads, and delivering exceptional service."
            />
          </main>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
