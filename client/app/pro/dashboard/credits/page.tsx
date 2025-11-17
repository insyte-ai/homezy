'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  History,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getBalance,
  getTransactions,
  getPackages,
  createCheckout,
  type CreditBalance,
  type CreditTransaction,
  type CreditPackage,
} from '@/lib/services/credits';

export default function CreditsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    fetchBalance();
    fetchPackages();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const data = await getBalance();
      setBalance(data.balance);
    } catch (error) {
      console.error('Failed to load credit balance:', error);
      toast.error('Failed to load credit balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to load credit packages:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await getTransactions({ limit: 10 });
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    try {
      toast.loading('Redirecting to checkout...', { id: 'checkout' });
      const { checkoutUrl } = await createCheckout(packageId);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate checkout', {
        id: 'checkout',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Credits</h1>
            <p className="mt-1 text-sm text-gray-600">
              Purchase credits to claim leads from the marketplace
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Balance Card */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Current Balance</h2>
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-primary-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-primary-200 rounded w-48"></div>
            </div>
          ) : balance ? (
            <>
              <div className="text-4xl font-bold text-neutral-900 mb-2">{balance.totalCredits} Credits</div>
              <div className="text-sm text-neutral-600">
                {balance.freeCredits} free credits • {balance.paidCredits} paid credits
              </div>
            </>
          ) : (
            <div className="text-lg text-neutral-900">No balance data available</div>
          )}
        </div>

        {/* Credit Packages */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Credit Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => {

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-lg border-2 p-6 relative ${
                    pkg.popular
                      ? 'border-primary-600 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  } transition`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {pkg.name}
                    </h3>
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {pkg.totalCredits}
                      </span>
                      <span className="text-gray-600">credits</span>
                    </div>
                    {pkg.bonusCredits > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        ({pkg.credits} + {pkg.bonusCredits} bonus)
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      AED {pkg.priceAED}
                    </div>
                    <div className="text-sm text-gray-600">
                      AED {pkg.perCreditCost.toFixed(2)} per credit
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      pkg.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Purchase
                  </button>
                </div>
              );
            })}
          </div>

          {/* Package Info */}
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-primary-900">
                <p className="font-medium mb-1">Credit Information</p>
                <ul className="space-y-1 text-neutral-900">
                  <li>• Credits expire 6 months after purchase</li>
                  <li>• Free credits are used before paid credits</li>
                  <li>• Credit cost varies by lead budget and urgency</li>
                  <li>• Comprehensive verified pros get 15% discount</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {loadingTransactions ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-600 text-sm">
                  Your credit purchases and usage will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const isPurchase = transaction.type === 'purchase' || transaction.type === 'admin_addition';
                  return (
                    <div key={transaction._id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isPurchase ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {isPurchase ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description || transaction.type.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-semibold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.amount > 0 ? '+' : ''}
                            {transaction.amount} credits
                          </p>
                          <p className="text-sm text-gray-600">
                            Balance: {transaction.balance}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
