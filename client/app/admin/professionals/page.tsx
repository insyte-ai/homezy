'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import {
  getProfessionals,
  ProfessionalListItem,
  PaginatedResponse,
} from '@/lib/services/admin';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProfessionalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [professionals, setProfessionals] = useState<ProfessionalListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || '');
  const [verificationFilter, setVerificationFilter] = useState('');

  useEffect(() => {
    loadProfessionals();
  }, [pagination.page, searchQuery, statusFilter, verificationFilter]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);
      const response = await getProfessionals({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
        verificationStatus: verificationFilter,
      });
      setProfessionals(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Failed to load professionals:', error);
      toast.error('Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      basic: 'bg-blue-100 text-blue-800',
      comprehensive: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<ProfessionalListItem>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.firstName} {item.lastName}
          </div>
          {item.businessName && (
            <div className="text-sm text-gray-500">{item.businessName}</div>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact',
      render: (item) => (
        <div className="text-sm">
          <div className="text-gray-900">{item.email}</div>
          {item.phoneNumber && (
            <div className="text-gray-500">{item.phoneNumber}</div>
          )}
        </div>
      ),
    },
    {
      key: 'serviceCategories',
      header: 'Services',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.serviceCategories.slice(0, 2).map((category, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {category}
            </span>
          ))}
          {item.serviceCategories.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{item.serviceCategories.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'verificationStatus',
      header: 'Verification',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getVerificationBadge(
            item.verificationStatus
          )}`}
        >
          {item.verificationStatus}
        </span>
      ),
    },
    {
      key: 'stats',
      header: 'Activity',
      render: (item) => (
        <div className="text-sm text-gray-600">
          <div>{item.totalLeadsClaimed} claimed</div>
          <div>{item.totalJobsCompleted} completed</div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            item.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (item) => (
        <div className="text-sm text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Professionals</h1>
        <p className="text-gray-600 mt-1">
          Manage and verify home service professionals
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => {
              setVerificationFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Verification</option>
            <option value="pending">Pending</option>
            <option value="basic">Basic</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="rejected">Rejected</option>
          </select>

          {(statusFilter || verificationFilter || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setVerificationFilter('');
                setSearchQuery('');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}

          <div className="flex-1"></div>

          <button
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Pending Verification</div>
          <div className="text-2xl font-bold text-yellow-600">
            {professionals.filter((p) => p.verificationStatus === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">
            {professionals.filter((p) => p.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Comprehensive</div>
          <div className="text-2xl font-bold text-blue-600">
            {professionals.filter((p) => p.verificationStatus === 'comprehensive').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={professionals}
        loading={loading}
        searchPlaceholder="Search by name, email, or business..."
        onSearch={handleSearch}
        onRowClick={(professional) =>
          router.push(`/admin/professionals/${professional._id}`)
        }
        pagination={pagination}
        onPageChange={handlePageChange}
        emptyMessage="No professionals found"
      />
    </div>
  );
}
