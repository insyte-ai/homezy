'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getMyLeads, Lead, LeadStatus } from '@/lib/services/leads';

export default function MyLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLeads();
  }, [selectedStatus]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      const { leads: myLeads } = await getMyLeads(params);
      setLeads(myLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.title.toLowerCase().includes(query) ||
      lead.description.toLowerCase().includes(query) ||
      lead.category.toLowerCase().includes(query)
    );
  });

  const statusFilters = [
    { value: 'all', label: 'All Requests', count: leads.length },
    { value: LeadStatus.OPEN, label: 'Open', count: leads.filter((l) => l.status === LeadStatus.OPEN).length },
    { value: LeadStatus.FULL, label: 'Full', count: leads.filter((l) => l.status === LeadStatus.FULL).length },
    { value: LeadStatus.ACCEPTED, label: 'Accepted', count: leads.filter((l) => l.status === LeadStatus.ACCEPTED).length },
    { value: LeadStatus.EXPIRED, label: 'Expired', count: leads.filter((l) => l.status === LeadStatus.EXPIRED).length },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      full: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Users },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.open;
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

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      emergency: 'bg-red-100 text-red-700 border-red-200',
      urgent: 'bg-orange-100 text-orange-700 border-orange-200',
      flexible: 'bg-blue-100 text-blue-700 border-blue-200',
      planning: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return badges[urgency as keyof typeof badges] || badges.flexible;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Quote Requests</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your requests and view quotes from professionals
          </p>
        </div>
        <Link href="/dashboard/create-request" className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="h-5 w-5" />
          Request Quotes
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-white/20">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No requests found' : 'No requests yet'}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Request your first quote to get started with your home improvement project'}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/create-request" className="btn btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
              <Plus className="h-4 w-4" />
              Request Your First Quote
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredLeads.map((lead) => {
            const statusConfig = getStatusBadge(lead.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={lead.id}
                href={`/dashboard/requests/${lead.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      {lead.title}
                    </h3>
                    <span className={`self-start flex items-center gap-1 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {lead.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <span className="flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {lead.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {lead.location.emirate}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    AED {lead.budgetBracket}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded border text-xs font-medium ${getUrgencyBadge(lead.urgency)}`}>
                    {lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{lead.claimsCount}</span>
                    <span className="text-gray-500">/ {lead.maxClaimsAllowed || 5} claims</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{lead.quotesCount || 0}</span>
                    <span className="text-gray-500">quotes</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 sm:ml-auto">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Indicator */}
                {lead.quotesCount && lead.quotesCount > 0 && (lead.status === LeadStatus.OPEN || lead.status === LeadStatus.FULL) && (
                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-purple-700">
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-medium">
                      {lead.quotesCount} {lead.quotesCount === 1 ? 'quote' : 'quotes'} waiting for your review
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
