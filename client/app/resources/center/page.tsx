'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Home, Briefcase } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  ResourceCard,
  CategoryCard,
  FeaturedResource,
  NewsletterSignup,
  FAQSection,
} from '@/components/resources';
import { Resource, CategoryInfo } from '@/types/resource';
import {
  getFeaturedResources,
  getLatestResources,
  getResourceStats,
  getCategoriesWithCounts,
} from '@/lib/services/resources';
import { CATEGORY_INFO, HOMEOWNER_FAQS, PRO_FAQS } from '@/data/resources';

export default function ResourceCenterPage() {
  const router = useRouter();
  const [featuredResource, setFeaturedResource] = useState<Resource | null>(null);
  const [latestResources, setLatestResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>(CATEGORY_INFO);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const [featured, latest, stats] = await Promise.all([
        getFeaturedResources(1),
        getLatestResources(6),
        getResourceStats(),
      ]);

      setFeaturedResource(featured[0] || null);
      setLatestResources(latest);
      setCategories(getCategoriesWithCounts(stats));
    } catch (error) {
      console.error('Error loading resource center content:', error);
      // Keep default categories on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/resources/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Combine FAQs for general resource center
  const allFaqs = [...HOMEOWNER_FAQS.slice(0, 2), ...PRO_FAQS.slice(0, 2)];

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

      {/* Hero Section with Role Selection */}
      <section className="relative bg-gradient-to-br from-primary-50 to-white py-16 md:py-20">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Homezy Resource Center
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Everything you need to succeed with your home projects and professional services
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Link
                href="/resources/homeowner"
                className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:scale-110 transition-all">
                    <Home className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    I'm a Homeowner
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Learn how to find the right professionals, plan projects, and get the best results for your home
                  </p>
                  <span className="text-primary-600 font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                    Explore Homeowner Academy
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>

              <Link
                href="/resources/pro"
                className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:shadow-xl transition-all p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:scale-110 transition-all">
                    <Briefcase className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    I'm a Professional
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Discover how to win more leads, build your reputation, and grow your business on Homezy
                  </p>
                  <span className="text-primary-600 font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                    Explore Pro Academy
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources, guides, and tips..."
                  className="w-full px-6 py-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg bg-white"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-primary-600 transition-colors"
                >
                  <Search className="h-6 w-6" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Resource */}
      {featuredResource && (
        <section className="py-12 bg-white">
          <div className="container-custom">
            <FeaturedResource resource={featuredResource} />
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore resources organized by topic to find exactly what you need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Resources */}
      {latestResources.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Latest Resources
                </h2>
                <p className="text-gray-600">
                  Stay up to date with our newest guides and insights
                </p>
              </div>
              <Link
                href="/resources/categories"
                className="hidden md:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestResources.map((resource) => (
                <ResourceCard key={resource.id || resource._id} resource={resource} />
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link
                href="/resources/categories"
                className="btn btn-primary inline-flex items-center justify-center"
              >
                View All Resources
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <FAQSection faqs={allFaqs} title="Common Questions" />
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <NewsletterSignup />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
