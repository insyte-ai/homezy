'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  MessageSquare,
  House,
  Plus,
  Clock,
  Users,
  ArrowRight
} from 'lucide-react';
import { getMyLeads, Lead, LeadStatus } from '@/lib/services/leads';
import { useAuthStore } from '@/store/authStore';
import { handleApiError } from '@/lib/utils/errorHandler';
import { ErrorState } from '@/components/common/ErrorState';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeLeads: 0,
    quotesReceived: 0,
    activeProjects: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { leads: myLeads } = await getMyLeads({ limit: 10 });
      setLeads(myLeads);

      // Calculate stats
      const activeLeads = myLeads.filter(
        (l) => l.status === LeadStatus.OPEN || l.status === LeadStatus.FULL
      ).length;
      const quotesReceived = myLeads.reduce((sum, l) => sum + (l.quotesCount || 0), 0);
      const activeProjects = myLeads.filter((l) => l.status === LeadStatus.ACCEPTED).length;

      setStats({
        activeLeads,
        quotesReceived,
        activeProjects,
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      handleApiError(err, 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-blue-100 text-blue-700',
      full: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Open',
      full: 'Full (5 claims)',
      accepted: 'Accepted',
      expired: 'Expired',
      cancelled: 'Cancelled',
    };
    return labels[status as keyof typeof labels] || status;
  };

  // Show error state if loading failed
  if (error && !loading) {
    return (
      <div className="py-12">
        <ErrorState
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Here's what's happening with your home improvement projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          href="/dashboard/requests"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow group"
          title="View all your quote requests"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {loading ? '...' : stats.activeLeads}
          </div>
          <div className="text-sm text-gray-600">Active Requests</div>
          <div className="text-xs text-gray-500 mt-1 sm:mt-2">
            Currently accepting quotes
          </div>
        </Link>

        <Link
          href="/dashboard/requests"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {loading ? '...' : stats.quotesReceived}
          </div>
          <div className="text-sm text-gray-600">Quotes Received</div>
          <div className="text-xs text-gray-500 mt-1 sm:mt-2">
            From verified professionals
          </div>
        </Link>

        <Link
          href="/dashboard/my-home"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow group sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2.5 sm:p-3 bg-green-100 rounded-lg">
              <House className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {loading ? '...' : stats.activeProjects}
          </div>
          <div className="text-sm text-gray-600">Active Jobs</div>
          <div className="text-xs text-gray-500 mt-1 sm:mt-2">
            Hired professionals
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Quote Requests</h2>
            <Link
              href="/dashboard/requests"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No quote requests yet
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Start your first home improvement project by requesting quotes
            </p>
            <Link
              href="/dashboard/create-request"
              className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              Request Your First Quote
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leads.slice(0, 5).map((lead) => (
              <Link
                key={lead.id}
                href={`/dashboard/requests/${lead.id}`}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors block"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      {lead.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                      {lead.description}
                    </p>
                  </div>
                  <span
                    className={`self-start px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadge(
                      lead.status
                    )}`}
                  >
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {lead.claimsCount}/{lead.maxClaimsAllowed || 5} claims
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {lead.quotesCount || 0} quotes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
