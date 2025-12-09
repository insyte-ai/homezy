'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import {
  getHomeowners,
  HomeownerListItem,
} from '@/lib/services/admin';
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function HomeownersPage() {
  const router = useRouter();
  const [homeowners, setHomeowners] = useState<HomeownerListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHomeowners();
  }, [pagination.page, searchQuery]);

  const loadHomeowners = async () => {
    try {
      setLoading(true);
      const response = await getHomeowners({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
      });
      setHomeowners(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load homeowners:', error);
      toast.error('Failed to load homeowners');
      setHomeowners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns: Column<HomeownerListItem>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.firstName} {item.lastName}
          </div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Phone',
      render: (item) => (
        <span className="text-gray-700">
          {item.phoneNumber || '-'}
        </span>
      ),
    },
    {
      key: 'totalLeadsSubmitted',
      header: 'Total Leads',
      render: (item) => (
        <span className="font-medium text-gray-900">
          {item.totalLeadsSubmitted}
        </span>
      ),
    },
    {
      key: 'activeLeads',
      header: 'Active Leads',
      render: (item) => (
        <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded font-medium">
          {item.activeLeads}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (item) => (
        <span className="text-gray-700">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Homeowners</h1>
        <p className="text-gray-600 mt-1">
          Manage homeowner accounts and their activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Homeowners</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Leads Submitted</div>
          <div className="text-2xl font-bold text-blue-600">
            {homeowners.reduce((sum, h) => sum + h.totalLeadsSubmitted, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active Leads</div>
          <div className="text-2xl font-bold text-green-600">
            {homeowners.reduce((sum, h) => sum + h.activeLeads, 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={homeowners}
        loading={loading}
        onRowClick={(homeowner) => router.push(`/admin/homeowners/${homeowner.id}`)}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
