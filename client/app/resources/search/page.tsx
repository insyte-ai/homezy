'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ResourceCard } from '@/components/resources';
import { Resource, TargetAudience, TARGET_AUDIENCE_LABELS } from '@/types/resource';
import { searchResources } from '@/lib/services/resources';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialAudience = searchParams.get('audience') as TargetAudience | null;

  const [query, setQuery] = useState(initialQuery);
  const [audience, setAudience] = useState<TargetAudience | ''>((initialAudience as TargetAudience) || '');
  const [results, setResults] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await searchResources(searchQuery, 20);
      // Filter by audience if selected
      const filteredResults = audience
        ? searchResults.filter(
            (r) => r.targetAudience === audience || r.targetAudience === TargetAudience.BOTH
          )
        : searchResults;
      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set('q', query);
      if (audience) params.set('audience', audience);
      router.push(`/resources/search?${params.toString()}`);
      performSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    router.push('/resources/search');
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />

      {/* Search Header */}
      <section className="bg-gray-50 py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Search Resources
            </h1>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides, tips, and articles..."
                  className="w-full px-6 py-4 pr-24 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>

            {/* Audience Filter */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">Show results for:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAudience('');
                    if (hasSearched) performSearch(query);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !audience
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Everyone
                </button>
                {Object.entries(TARGET_AUDIENCE_LABELS)
                  .filter(([key]) => key !== TargetAudience.BOTH)
                  .map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setAudience(key as TargetAudience);
                        if (hasSearched) performSearch(query);
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        audience === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {label}s
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : hasSearched ? (
            <>
              <div className="mb-6">
                <p className="text-gray-600">
                  {results.length === 0 ? (
                    <>
                      No results found for "<span className="font-medium">{query}</span>"
                    </>
                  ) : (
                    <>
                      Found <span className="font-medium">{results.length}</span> results for "
                      <span className="font-medium">{query}</span>"
                    </>
                  )}
                </p>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Try different keywords or browse our categories.</p>
                  <Link
                    href="/resources/categories"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Browse All Categories
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((resource) => (
                    <ResourceCard key={resource.id || resource._id} resource={resource} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Enter a search term to find guides, tips, and articles.
              </p>
              <Link
                href="/resources/categories"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Or browse all categories
              </Link>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
