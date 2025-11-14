'use client';

import { useEffect, useState } from 'react';
import { AdminTable, Column } from '@/components/admin/AdminTable';
import {
  getCreditTransactions,
  CreditTransaction,
} from '@/lib/services/admin';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [pagination.page, typeFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getCreditTransactions({
        page: pagination.page,
        limit: pagination.limit,
        type: typeFilter,
      });
      setTransactions(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load credit transactions:', error);
      toast.error('Failed to load credit transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      purchase: 'bg-green-100 text-green-700',
      spend: 'bg-blue-100 text-blue-700',
      refund: 'bg-yellow-100 text-yellow-700',
      bonus: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const columns: Column<CreditTransaction>[] = [
    {
      key: 'user',
      header: 'Professional',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">
            {item.user.firstName} {item.user.lastName}
          </div>
          <div className="text-sm text-gray-500">{item.user.email}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <span className={`px-2 py-1 text-sm rounded font-medium ${getTypeColor(item.type)}`}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item) => (
        <div className="text-center">
          <span className={`font-medium ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {item.amount >= 0 ? '+' : ''}{item.amount}
          </span>
        </div>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (item) => (
        <div className="text-gray-700">
          <div className="text-sm text-gray-500">Before: {item.balance.before}</div>
          <div className="font-medium">After: {item.balance.after}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <span className="text-gray-700">{item.description}</span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (item) => (
        <div className="text-gray-700">
          <div>{new Date(item.createdAt).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500">
            {new Date(item.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ];

  // Calculate totals
  const totalPurchases = transactions
    .filter(t => t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalRefunded = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBonus = transactions
    .filter(t => t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
        <p className="text-gray-600 mt-1">
          Manage credit system and transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Purchases</div>
          <div className="text-2xl font-bold text-green-600">
            {totalPurchases} credits
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600">
            {totalSpent} credits
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Refunded</div>
          <div className="text-2xl font-bold text-yellow-600">
            {totalRefunded} credits
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Bonus</div>
          <div className="text-2xl font-bold text-purple-600">
            {totalBonus} credits
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Types</option>
            <option value="purchase">Purchase</option>
            <option value="spend">Spend</option>
            <option value="refund">Refund</option>
            <option value="bonus">Bonus</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={transactions}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      />
    </div>
  );
}
