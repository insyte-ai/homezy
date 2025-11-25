'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats, getRecentActivity, DashboardStats, RecentActivity } from '@/lib/services/admin';
import toast from 'react-hot-toast';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href?: string;
  subtext?: string;
}

function StatsCard({ title, value, icon: Icon, color, href, subtext }: StatsCardProps) {
  const card = (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${href ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{card}</Link> : card;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lead_created':
        return <DocumentTextIcon className="h-5 w-5 text-blue-600" />;
      case 'professional_registered':
        return <BriefcaseIcon className="h-5 w-5 text-green-600" />;
      case 'lead_claimed':
        return <CreditCardIcon className="h-5 w-5 text-purple-600" />;
      case 'credit_purchased':
        return <CreditCardIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lead_created':
        return 'bg-blue-50';
      case 'professional_registered':
        return 'bg-green-50';
      case 'lead_claimed':
        return 'bg-purple-50';
      case 'credit_purchased':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your Homezy platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Homeowners"
          value={stats?.totalHomeowners || 0}
          icon={UserGroupIcon}
          color="bg-blue-500"
          href="/admin/homeowners"
        />
        <StatsCard
          title="Total Professionals"
          value={stats?.totalProfessionals || 0}
          icon={BriefcaseIcon}
          color="bg-green-500"
          href="/admin/professionals"
          subtext={`${stats?.pendingApprovals || 0} pending approval`}
        />
        <StatsCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={DocumentTextIcon}
          color="bg-purple-500"
          href="/admin/leads"
          subtext={`${stats?.activeLeads || 0} active`}
        />
        <StatsCard
          title="Platform Revenue"
          value={`AED ${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={CreditCardIcon}
          color="bg-yellow-500"
          href="/admin/credits"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          icon={ClockIcon}
          color="bg-orange-500"
          href="/admin/professionals?status=pending"
        />
        <StatsCard
          title="Active Leads"
          value={stats?.activeLeads || 0}
          icon={DocumentTextIcon}
          color="bg-teal-500"
          href="/admin/leads?status=open"
        />
        <StatsCard
          title="Completed Jobs"
          value={stats?.completedLeads || 0}
          icon={ArrowTrendingUpIcon}
          color="bg-indigo-500"
        />
        <StatsCard
          title="Credits Used"
          value={`${stats?.creditsUsed || 0} / ${stats?.creditsPurchased || 0}`}
          icon={CreditCardIcon}
          color="bg-pink-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600 mt-1">Latest platform activities</p>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p>No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-600 mt-1">
                        by {activity.user.name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/admin/professionals?status=pending"
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <BriefcaseIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Review Professionals</h3>
          <p className="text-sm text-gray-600">
            {stats?.pendingApprovals || 0} pending approvals
          </p>
        </Link>

        <Link
          href="/admin/leads?status=open"
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <DocumentTextIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Manage Leads</h3>
          <p className="text-sm text-gray-600">
            {stats?.activeLeads || 0} active leads
          </p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <ArrowTrendingUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">View Analytics</h3>
          <p className="text-sm text-gray-600">Platform insights</p>
        </Link>
      </div>
    </div>
  );
}
