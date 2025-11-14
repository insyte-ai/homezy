'use client';

import { useEffect, useState } from 'react';
import { CreditBalance as CreditBalanceType, getBalance } from '@/lib/services/credits';
import { Coins, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

export const CreditBalance = () => {
  const [balance, setBalance] = useState<CreditBalanceType | null>(null);
  const [expiringCredits, setExpiringCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getBalance();
      setBalance(data.balance);
      setExpiringCredits(data.expiringCredits || []);
    } catch (error) {
      console.error('Failed to load balance:', error);
      // Set safe defaults on error
      setBalance(null);
      setExpiringCredits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadBalance(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
    );
  }

  if (!balance) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Failed to load credit balance
          </p>
          <button
            onClick={() => loadBalance()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credit Balance</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1 rounded transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 inline mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mb-4">
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{balance.totalCredits}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Credits Available</div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{balance.freeCredits}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Free Credits</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{balance.paidCredits}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Purchased Credits</div>
          </div>
        </div>
      </div>

      {/* Expiring Credits Alert */}
      {expiringCredits && expiringCredits.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                Credits Expiring Soon
              </h4>
              <div className="space-y-2">
                {expiringCredits.map((item, index) => (
                  <div key={index} className="text-sm text-yellow-800 dark:text-yellow-300">
                    <span className="font-medium">{item.credits} credits</span> expire in{' '}
                    <span className="font-medium">{item.daysUntilExpiry} days</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credit Expiry Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <h4 className="font-medium text-gray-900 dark:text-white">Credit Information</h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Purchased credits expire 6 months after purchase. Use them before they expire!
        </p>
        {balance.lastResetDate && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Last activity: {new Date(balance.lastResetDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default CreditBalance;
