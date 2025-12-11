'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProAnalytics, ProAnalytics } from '@/lib/services/analytics';
import { getMyDirectLeads, getMarketplace, Lead } from '@/lib/services/leads';
import { TrendingUp, DollarSign, FileText, Star, Clock, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProDashboardPage() {
  const [analytics, setAnalytics] = useState<ProAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [directLeadsCount, setDirectLeadsCount] = useState(0);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadDirectLeadsCount();
    loadRecentLeads();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getProAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectLeadsCount = async () => {
    try {
      const data = await getMyDirectLeads({ status: 'pending' });
      setDirectLeadsCount(data.total || 0);
    } catch (error) {
      console.error('Failed to load direct leads count:', error);
    }
  };

  const loadRecentLeads = async () => {
    try {
      setLeadsLoading(true);
      const data = await getMarketplace({ limit: 3 });
      setRecentLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to load recent leads:', error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const nextSteps = [
    {
      id: 1,
      icon: '📸',
      title: 'Add portfolio photos',
      description: 'Pros with portfolios get 3x more responses',
      link: '/pro/dashboard/portfolio',
      primary: true,
    },
    {
      id: 2,
      icon: '💰',
      title: 'Purchase credits',
      description: 'Get ready to claim your first lead',
      link: '/pro/dashboard/credits',
      primary: false,
    },
    {
      id: 3,
      icon: '✍️',
      title: 'Complete your bio',
      description: 'Tell homeowners about your experience',
      link: '/pro/dashboard/profile',
      primary: false,
    },
  ];


  return (
    <div className="container-custom py-8">
      {/* Direct Requests Alert Banner */}
      {directLeadsCount > 0 && (
        <Link
          href="/pro/dashboard/leads"
          className="block mb-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <Inbox className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">
                  You have {directLeadsCount} direct request{directLeadsCount > 1 ? 's' : ''} waiting!
                </h3>
                <p className="text-white/80 text-sm">
                  Homeowners sent you direct quotes. Respond within 24 hours or they'll go to the public marketplace.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold">
              View Requests
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-neutral-600">
          Here's what's happening with your business
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm border border-neutral-200 p-6 h-32"></div>
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {/* Claimed Leads */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Claimed Leads</p>
                  <p className="text-3xl font-bold text-neutral-900">{analytics.overview.claimedLeads.total}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.overview.claimedLeads.last7Days > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">{analytics.overview.claimedLeads.last7Days} last 7 days</span>
                      </>
                    ) : (
                      <span className="text-xs text-neutral-500">No recent claims</span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            {/* Credit Balance */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Credit Balance</p>
                  <p className="text-3xl font-bold text-neutral-900">{analytics.overview.creditBalance.total}</p>
                  <Link href="/pro/dashboard/credits" className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block">
                    Buy credits →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Active Quotes */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Active Quotes</p>
                  <p className="text-3xl font-bold text-neutral-900">{analytics.overview.activeQuotes}</p>
                  <Link href="/pro/dashboard/quotes" className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block">
                    View quotes →
                  </Link>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Projects Completed */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Projects Completed</p>
                  <p className="text-3xl font-bold text-neutral-900">{analytics.overview.projectsCompleted}</p>
                  <p className="text-xs text-neutral-500 mt-1">Total completed</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quote Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Quote Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-neutral-600">Acceptance Rate</span>
                    <span className="text-sm font-semibold text-neutral-900">{analytics.quotes.acceptanceRate}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analytics.quotes.acceptanceRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-neutral-900">{analytics.quotes.pending}</p>
                    <p className="text-xs text-neutral-600">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{analytics.quotes.accepted}</p>
                    <p className="text-xs text-neutral-600">Accepted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{analytics.quotes.rejected}</p>
                    <p className="text-xs text-neutral-600">Rejected</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Avg. Quote Value</span>
                    <span className="text-sm font-semibold">AED {analytics.quotes.avgValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Revenue</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-neutral-900">AED {analytics.revenue.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Last Month</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-semibold text-neutral-900">AED {analytics.revenue.lastMonth.toLocaleString()}</p>
                    {analytics.revenue.change > 0 && (
                      <span className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {analytics.revenue.change}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-neutral-600">Rating</span>
                  </div>
                  <span className="font-semibold">{analytics.performance.rating.toFixed(1)} ({analytics.performance.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <span className="text-sm text-neutral-600">Response Time</span>
                  </div>
                  <span className="font-semibold">{analytics.performance.responseTimeHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Projects Completed</span>
                  <span className="font-semibold">{analytics.performance.projectsCompleted}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Next Steps */}
        <div className="lg:col-span-2">
          {/* Next Steps Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Complete Your Setup
            </h2>
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.link}
                  className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    step.primary
                      ? 'border-primary-600 bg-primary-50 hover:border-primary-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{step.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${step.primary ? 'text-primary-900' : 'text-neutral-900'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.primary ? 'text-primary-700' : 'text-neutral-600'}`}>
                        {step.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">
                Recent Leads in Your Area
              </h2>
              <Link href="/pro/dashboard/leads/marketplace" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all →
              </Link>
            </div>
            {leadsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse border border-neutral-200 rounded-lg p-4">
                    <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-500">No leads available in your area yet.</p>
                <p className="text-sm text-neutral-400 mt-1">Check back soon for new opportunities!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-neutral-900">{lead.title}</h3>
                          {lead.urgency === 'urgent' && (
                            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {lead.category} • {lead.location?.emirate || 'UAE'} • {lead.budgetBracket || 'Budget TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span>Posted {formatTimeAgo(lead.createdAt)}</span>
                        {lead.claimsCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{lead.claimsCount}/5 claimed</span>
                          </>
                        )}
                      </div>
                      <Link
                        href={`/pro/dashboard/leads/${lead.id}`}
                        className="btn btn-outline text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Help & Resources */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Market Insights</h3>
            <div className="space-y-3">
              <div>
                <p className="text-neutral-600 text-sm">Leads this week</p>
                <p className="text-2xl font-bold text-neutral-900">142</p>
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Avg. response time</p>
                <p className="text-2xl font-bold text-neutral-900">3.2 hrs</p>
              </div>
              <div>
                <p className="text-neutral-600 text-sm">Top category</p>
                <p className="text-lg font-medium text-neutral-900">Plumbing</p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Need Help?</h3>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Getting Started Guide
              </a>
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQs
              </a>
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
