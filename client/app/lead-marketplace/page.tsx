'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMarketplace, Lead, LeadFilters } from '@/lib/services/leads';
import { useChatPanelStore } from '@/store/chatPanelStore';
import LeadCard from '@/components/leads/LeadCard';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Filter, Search, RefreshCw, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLeadMarketplaceContent = () => {
  const router = useRouter();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState<LeadFilters>({
    category: '',
    minBudget: undefined,
    maxBudget: undefined,
    urgency: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    loadMarketplace();
  }, [page, filters]);

  const loadMarketplace = async () => {
    try {
      setLoading(true);

      // Clean filters - remove empty strings and undefined values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined) {
          (acc as Record<string, unknown>)[key] = value;
        }
        return acc;
      }, {} as Partial<LeadFilters>);

      const data = await getMarketplace({
        ...cleanFilters,
        page,
        limit: 12,
      });
      setLeads(data.leads);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: any) {
      console.error('Failed to load marketplace:', error);
      toast.error(error.response?.data?.message || 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      minBudget: undefined,
      maxBudget: undefined,
      urgency: '',
      location: '',
      search: '',
    });
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== undefined
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`container-custom py-8 transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
        {/* Authentication Banner for Guests */}
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Browse Home Improvement Opportunities</h2>
              <p className="text-blue-100">
                Join as a professional to claim leads and grow your business
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/pro/register')}
                className="px-6 py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Become a Pro
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lead Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover new home improvement opportunities across UAE
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Keywords..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <button
                      onClick={handleSearch}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={filters.category || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g., Plumbing"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Range (AED)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minBudget || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minBudget: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxBudget || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxBudget: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urgency
                  </label>
                  <select
                    value={filters.urgency || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, urgency: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="">All</option>
                    <option value="emergency">Emergency (&lt;24h)</option>
                    <option value="urgent">Urgent (&lt;1 week)</option>
                    <option value="flexible">Flexible (1-4 weeks)</option>
                    <option value="planning">Planning (&gt;1 month)</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Emirate or Area"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Lead Grid */}
          <div className="lg:col-span-3">
            {/* Refresh Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}
                  </>
                )}
              </div>
              <button
                onClick={loadMarketplace}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"
                  ></div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && leads.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No leads found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your filters or check back later for new opportunities
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Lead Grid */}
            {!loading && leads.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead._id}
                      lead={lead}
                      variant="marketplace"
                      onViewDetails={(id) => router.push(`/lead-marketplace/${id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicLeadMarketplace = () => {
  return (
    <>
      <PublicHeader />
      <PublicLeadMarketplaceContent />
      <PublicFooter />
    </>
  );
};

export default PublicLeadMarketplace;
