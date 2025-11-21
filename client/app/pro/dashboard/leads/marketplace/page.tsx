'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getMarketplace, claimLead, Lead, LeadFilters } from '@/lib/services/leads';
import { getBalance, CreditBalance as CreditBalanceType } from '@/lib/services/credits';
import { useAuthStore } from '@/store/authStore';
import LeadCard from '@/components/leads/LeadCard';
import CreditBalance from '@/components/credits/CreditBalance';
import { Filter, Search, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProLeadMarketplaceContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const highlightedLeadId = searchParams?.get('leadId');
  const leadRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [leads, setLeads] = useState<Lead[]>([]);
  const [balance, setBalance] = useState<CreditBalanceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [highlightNotFound, setHighlightNotFound] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined,
    urgency: '',
    location: '',
    search: '',
  });

  useEffect(() => {
    loadMarketplace();
    loadBalance();
  }, [page, filters]);

  // Scroll to highlighted lead when loaded
  useEffect(() => {
    if (highlightedLeadId && leads.length > 0 && !loading) {
      const leadExists = leads.some(lead => lead._id === highlightedLeadId);
      if (leadExists) {
        setTimeout(() => {
          const element = leadRefs.current[highlightedLeadId];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            toast.success('Showing the lead from your notification');
          }
        }, 100);
      } else {
        setHighlightNotFound(true);
        toast.error('This lead may have been claimed by you or is no longer available');
      }
    }
  }, [highlightedLeadId, leads, loading]);

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

  const loadBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleClaimClick = (leadId: string) => {
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return;

    if (!balance || balance.totalCredits < (lead.creditsRequired || 0)) {
      toast.error('Insufficient credits. Please purchase more credits.');
      router.push('/pro/dashboard/credits');
      return;
    }

    setSelectedLead(lead);
    setShowClaimDialog(true);
  };

  const handleConfirmClaim = async () => {
    if (!selectedLead) return;

    try {
      setClaiming(selectedLead._id);
      setShowClaimDialog(false);
      await claimLead(selectedLead._id);
      toast.success('Lead claimed successfully! Redirecting to your claimed leads...');

      // Redirect to claimed leads page
      setTimeout(() => {
        router.push('/pro/dashboard/leads');
      }, 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to claim lead');
      setClaiming(null);
      setSelectedLead(null);
    }
  };

  const handleCancelClaim = () => {
    setShowClaimDialog(false);
    setSelectedLead(null);
  };

  const handleSearch = (searchTerm: string) => {
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
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== undefined
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lead Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover new home improvement opportunities matching your expertise
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Credit Balance */}
            <CreditBalance />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/pro/dashboard/leads')}
                  className="w-full py-2 px-4 bg-primary-50 dark:bg-primary-900/20 text-neutral-900 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition text-sm font-medium"
                >
                  View Claimed Leads
                </button>
                <button
                  onClick={() => router.push('/pro/dashboard/credits')}
                  className="w-full py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition text-sm font-medium"
                >
                  Buy More Credits
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-sm text-neutral-900 dark:text-primary-400 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="e.g., Plumbing"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget (AED)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minBudget || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minBudget: Number(e.target.value) || undefined,
                        }))
                      }
                      placeholder="Min"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxBudget || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxBudget: Number(e.target.value) || undefined,
                        }))
                      }
                      placeholder="Max"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={filters.urgency}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, urgency: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="City or Emirate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search leads by title, description, or category..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  onClick={loadMarketplace}
                  disabled={loading}
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-neutral-900 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary-900 dark:text-primary-200">
                  <p className="font-medium mb-1">How Lead Matching Works</p>
                  <p className="text-primary-700 dark:text-primary-300">
                    Leads are ranked based on your service categories, location proximity,
                    and verification status. Claim leads that match your expertise!
                  </p>
                </div>
              </div>
            </div>

            {/* Lead Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-96"
                  ></div>
                ))}
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No leads found matching your criteria
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-neutral-900 dark:text-primary-400 hover:underline"
                  >
                    Clear filters and try again
                  </button>
                )}
              </div>
            ) : (
              <>
                {highlightNotFound && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-900 dark:text-yellow-200">
                        <p className="font-medium mb-1">Lead Not Found</p>
                        <p className="text-yellow-700 dark:text-yellow-300">
                          The lead you're looking for is not in the marketplace. It may have
                          already been claimed by you or fully booked.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setHighlightNotFound(false);
                          router.replace(pathname || '/pro/dashboard/leads/marketplace');
                        }}
                        className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {leads.map((lead) => (
                    <div
                      key={lead._id}
                      ref={(el) => {
                        leadRefs.current[lead._id] = el;
                      }}
                      className={`transition-all ${
                        highlightedLeadId === lead._id
                          ? 'ring-4 ring-primary-500 ring-opacity-50 rounded-lg'
                          : ''
                      }`}
                    >
                      <LeadCard
                        lead={lead}
                        variant="marketplace"
                        onClaim={handleClaimClick}
                        isClaimed={false}
                        claiming={claiming === lead._id}
                        verificationStatus={(user as any)?.proProfile?.verificationStatus}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
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

      {/* Claim Confirmation Dialog */}
      {showClaimDialog && selectedLead && balance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Confirm Lead Claim
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You are about to claim: <span className="font-semibold text-gray-900 dark:text-white">{selectedLead.title}</span>
            </p>
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Credits Required:</span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-primary-400">
                  {selectedLead.creditsRequired || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Balance After Claim:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(balance?.totalCredits || 0) - (selectedLead.creditsRequired || 0)} credits
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Once claimed, you'll get access to the homeowner's contact details and can submit your quote.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClaim}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClaim}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
              >
                Confirm Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProLeadMarketplace = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading marketplace...</p>
        </div>
      </div>
    }>
      <ProLeadMarketplaceContent />
    </Suspense>
  );
};

export default ProLeadMarketplace;
