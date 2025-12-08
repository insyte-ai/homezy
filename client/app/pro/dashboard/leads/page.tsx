'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMyClaims, Lead, getMyDirectLeads } from '@/lib/services/leads';
import {
  Search,
  MessageSquare,
  TrendingUp,
  FileText,
  DollarSign,
  Trophy,
  AlertCircle,
  Inbox,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DirectRequestsPanel } from '@/components/professional/DirectRequestsPanel';
import { StartConversationButton } from '@/components/common/StartConversationButton';

type TabType = 'claimed' | 'direct';

export default function MyClaimedLeads() {
  const [activeTab, setActiveTab] = useState<TabType>('direct');
  const [directLeadsCount, setDirectLeadsCount] = useState(0);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeads();
    fetchDirectLeadsCount();
  }, [page]);

  const fetchDirectLeadsCount = async () => {
    try {
      const data = await getMyDirectLeads({ status: 'pending' });
      setDirectLeadsCount(data.total || 0);
    } catch (error) {
      console.error('Failed to load direct leads count:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getMyClaims({
        page,
        limit: 10,
      });
      setLeads(data.leads || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to load claimed leads:', error);
      const message = error instanceof Error && 'response' in error
        ? ((error as any).response?.data?.message || 'Failed to load claimed leads')
        : 'Failed to load claimed leads';
      toast.error(message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on search and status
  const filteredLeads = (leads || []).filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    active: (leads || []).filter((l) => l.status === 'open' || l.status === 'full').length,
    accepted: (leads || []).filter((l) => l.status === 'accepted').length,
    totalClaimed: (leads || []).length,
    totalValue: (leads || [])
      .filter((l) => l.status === 'open' || l.status === 'full')
      .reduce((sum, lead) => {
        // Estimate value from budget bracket
        const budgetMap: { [key: string]: number } = {
          '500-1k': 750,
          '1k-5k': 3000,
          '5k-15k': 10000,
          '15k-50k': 32500,
          '50k-150k': 100000,
          '150k+': 200000,
        };
        return sum + (budgetMap[lead.budgetBracket] || 0);
      }, 0),
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Leads
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage direct requests and claimed leads
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 -mb-px">
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'direct'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              <span>Direct Requests</span>
              {directLeadsCount > 0 && (
                <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {directLeadsCount}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('claimed')}
            className={`px-4 py-2 font-medium text-sm transition-colors relative ${
              activeTab === 'claimed'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Claimed Leads</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'direct' ? (
        <div className="px-8 py-6">
          <DirectRequestsPanel />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Leads</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.active}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-600 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      Leads Won! 🎉
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stats.accepted}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Claimed</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {stats.totalClaimed}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Value</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      AED {stats.totalValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="px-8 pb-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search leads by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="px-8 pb-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"
              ></div>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No claimed leads found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start claiming leads from the marketplace'}
            </p>
            <button
              onClick={() => router.push('/pro/dashboard/leads/marketplace')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredLeads.map((lead) => {
                // Determine if homeowner info is accessible
                const homeownerInfo =
                  typeof lead.homeownerId === 'object' ? lead.homeownerId : null;

                return (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {/* Award Banner (if accepted) */}
                    {lead.status === 'accepted' && (
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b-2 border-yellow-400 dark:border-yellow-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-3">
                            <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">
                              Congratulations! You won this lead!
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">
                              The homeowner has accepted your quote
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Lead Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {lead.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {lead.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                                lead.status
                              )}`}
                            >
                              {lead.status}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {lead.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.budgetBracket}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Location:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.location.emirate}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Time Remaining:
                          </span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {getTimeRemaining(lead.expiresAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Quotes:</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.quotesCount || 0}
                          </p>
                        </div>
                      </div>

                      {/* Homeowner Contact (if available) */}
                      {homeownerInfo && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-semibold text-primary-900 dark:text-primary-200">
                              Homeowner Contact
                            </h5>
                            <StartConversationButton
                              recipientId={homeownerInfo.id}
                              recipientName={homeownerInfo.name}
                              relatedLeadId={lead.id}
                              relatedLeadTitle={lead.title}
                              variant="primary"
                              size="sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-primary-700 dark:text-primary-300">Name:</span>{' '}
                              {homeownerInfo.name}
                            </div>
                            <div>
                              <span className="text-primary-700 dark:text-primary-300">Email:</span>{' '}
                              {homeownerInfo.email}
                            </div>
                            {homeownerInfo.phone && (
                              <div>
                                <span className="text-primary-700 dark:text-primary-300">Phone:</span>{' '}
                                {homeownerInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => router.push(`/pro/dashboard/leads/${lead.id}`)}
                          className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
                        >
                          {lead.status === 'accepted' ? 'View Award Details' : 'View Details'}
                        </button>
                        {(lead.status === 'open' || lead.status === 'full') && !lead.claim?.quoteSubmitted && (
                          <button
                            onClick={() =>
                              router.push(`/pro/dashboard/leads/${lead.id}`)
                            }
                            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                          >
                            Submit Quote
                          </button>
                        )}
                        {lead.claim?.quoteSubmitted && (
                          <span className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Quote Submitted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
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
        </>
      )}
    </div>
  );
}
