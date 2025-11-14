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
    { value: 'all', label: 'All Leads', count: leads.length },
    { value: LeadStatus.OPEN, label: 'Open', count: leads.filter((l) => l.status === LeadStatus.OPEN).length },
    { value: LeadStatus.QUOTED, label: 'Quoted', count: leads.filter((l) => l.status === LeadStatus.QUOTED).length },
    { value: LeadStatus.ACCEPTED, label: 'Accepted', count: leads.filter((l) => l.status === LeadStatus.ACCEPTED).length },
    { value: LeadStatus.EXPIRED, label: 'Expired', count: leads.filter((l) => l.status === LeadStatus.EXPIRED).length },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      quoted: { bg: 'bg-purple-100', text: 'text-purple-700', icon: MessageSquare },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      full: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Users },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.open;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      open: 'Open',
      quoted: 'Quotes Received',
      accepted: 'Accepted',
      full: 'Full',
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Leads</h1>
          <p className="text-gray-600">
            Manage your project requests and view professional responses
          </p>
        </div>
        <Link href="/" className="btn btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No leads found' : 'No leads yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Create your first lead to get started with your home improvement project'}
          </p>
          {!searchQuery && (
            <Link href="/" className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Lead
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const statusConfig = getStatusBadge(lead.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Link
                key={lead._id}
                href={`/dashboard/leads/${lead._id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {lead.title}
                      </h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {getStatusLabel(lead.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {lead.description}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    {lead.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {lead.location.emirate}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    AED {lead.budgetBracket}
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getUrgencyBadge(lead.urgency)}`}>
                    {lead.urgency.charAt(0).toUpperCase() + lead.urgency.slice(1)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{lead.claimsCount}</span>
                    <span className="text-gray-500">/ {lead.maxClaimsAllowed || 5} claims</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 font-medium">{lead.quotesCount || 0}</span>
                    <span className="text-gray-500">quotes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
                    <Calendar className="h-4 w-4" />
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Indicator */}
                {lead.status === LeadStatus.QUOTED && lead.quotesCount && lead.quotesCount > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-sm text-purple-700">
                    <MessageSquare className="h-4 w-4" />
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
