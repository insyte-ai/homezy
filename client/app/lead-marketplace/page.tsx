'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMarketplace, Lead, LeadFilters } from '@/lib/services/leads';
import { useChatPanelStore } from '@/store/chatPanelStore';
import LeadCard from '@/components/leads/LeadCard';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Filter, Search, RefreshCw, AlertCircle, LogIn, UserPlus, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLeadMarketplaceContent = () => {
  const router = useRouter();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  // Calculate active filter count for badge
  const activeFilterCount = [
    filters.category !== '',
    filters.minBudget !== undefined,
    filters.maxBudget !== undefined,
    filters.urgency !== '',
    filters.location !== '',
    filters.search !== '',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={`container-custom py-8 transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[40vw]' : 'lg:pr-14'}`}>
        {/* Authentication Banner for Guests */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Browse Home Improvement Opportunities</h2>
              <p className="text-blue-100 text-sm sm:text-base">
                Join as a professional to claim leads and grow your business
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="flex-1 sm:flex-none px-4 py-1.5 sm:px-6 sm:py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Sign In
              </button>
              <button
                onClick={() => router.push('/auth/pro/register')}
                className="flex-1 sm:flex-none px-4 py-1.5 sm:px-6 sm:py-2 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Become a Pro
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Lead Marketplace
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover new home improvement opportunities across UAE
          </p>
        </div>

        {/* Filter Toggle Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Filters</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {leads.length > 0 && (
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {leads.length} lead{leads.length !== 1 ? 's' : ''}
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-500 transition-transform duration-200 ${
                  filtersOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Collapsible Filter Content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              filtersOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Keywords..."
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={filters.category || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g., Plumbing"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urgency
                  </label>
                  <select
                    value={filters.urgency || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, urgency: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
                  >
                    <option value="">All Urgencies</option>
                    <option value="emergency">Emergency (&lt;24h)</option>
                    <option value="urgent">Urgent (&lt;1 week)</option>
                    <option value="flexible">Flexible (1-4 weeks)</option>
                    <option value="planning">Planning (&gt;1 month)</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Emirate or Area"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
                  />
                </div>

                {/* Budget Range */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget (AED)
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
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
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
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Pills and Clear Button */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      Search: {filters.search}
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, search: '' }));
                          setSearchTerm('');
                        }}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      {filters.category}
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.urgency && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      {filters.urgency}
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, urgency: '' }))}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      {filters.location}
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, location: '' }))}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.minBudget || filters.maxBudget) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      Budget: {filters.minBudget || 0} - {filters.maxBudget || '∞'} AED
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, minBudget: undefined, maxBudget: undefined }))}
                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="ml-auto px-3 py-1 text-xs sm:text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg transition flex items-center gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
            {/* Refresh Bar */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
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
              <div className={`grid gap-3 sm:gap-4 ${isChatPanelOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-40 sm:h-48"
                  ></div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && leads.length === 0 && (
              <div className="text-center py-8 sm:py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No leads found
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 px-4">
                  Try adjusting your filters or check back later for new opportunities
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Lead Grid */}
            {!loading && leads.length > 0 && (
              <>
                <div className={`grid gap-3 sm:gap-4 ${isChatPanelOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {leads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      variant="marketplace"
                      onViewDetails={(id) => router.push(`/lead-marketplace/${id}`)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
