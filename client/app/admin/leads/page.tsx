'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import {
  getAdminLeads,
  AdminLead,
} from '@/lib/services/admin';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadLeads();
  }, [pagination.page, searchQuery, statusFilter, categoryFilter]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await getAdminLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        category: categoryFilter,
      });
      setLeads(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Failed to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-green-100 text-green-700',
      full: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-500',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const columns: Column<AdminLead>[] = [
    {
      key: 'title',
      header: 'Lead',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.title}</div>
          <div className="text-sm text-gray-500">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'homeowner',
      header: 'Homeowner',
      render: (item) => (
        <div>
          <div className="text-gray-900">
            {item.homeowner.firstName} {item.homeowner.lastName}
          </div>
          <div className="text-sm text-gray-500">{item.homeowner.email}</div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <div className="text-gray-700">
          <div>{item.location.city}</div>
          <div className="text-sm text-gray-500">{item.location.emirate}</div>
        </div>
      ),
    },
    {
      key: 'budgetBracket',
      header: 'Budget',
      render: (item) => (
        <span className="text-gray-700">{item.budgetBracket}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-sm rounded font-medium ${getStatusColor(item.status)}`}>
          {item.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'claims',
      header: 'Claims',
      render: (item) => (
        <div className="text-center">
          <span className="font-medium text-gray-900">
            {item.claimsCount}/{item.maxClaimsAllowed}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (item) => (
        <span className="text-gray-700">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <button
          onClick={() => router.push(`/admin/leads/${item.id}`)}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 mt-1">
          Manage all platform leads and monitor activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Leads</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Open</div>
          <div className="text-2xl font-bold text-green-600">
            {leads.filter((l) => l.status === 'open').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Full</div>
          <div className="text-2xl font-bold text-yellow-600">
            {leads.filter((l) => l.status === 'full').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Accepted</div>
          <div className="text-2xl font-bold text-blue-600">
            {leads.filter((l) => l.status === 'accepted').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Expired</div>
          <div className="text-2xl font-bold text-gray-600">
            {leads.filter((l) => l.status === 'expired').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={leads}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
