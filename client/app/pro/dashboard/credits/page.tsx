'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CreditBalance from '@/components/credits/CreditBalance';
import { Coins, ShoppingCart, History,  TrendingUp, Sparkles, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getBalance,
  getTransactions,
  getPackages,
  createCheckout,
  verifyCheckoutSession,
  type CreditPackage,
  type CreditTransaction,
} from '@/lib/services/credits';

const CreditsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchase' | 'history'>('overview');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Check for success parameter from Stripe redirect and verify the session
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      const verifySession = async () => {
        try {
          const result = await verifyCheckoutSession(sessionId);
          if (result.alreadyCompleted) {
            toast.success('Your purchase was already completed!', { duration: 4000 });
          } else {
            toast.success(`🎉 ${result.credits} credits added successfully!`, { duration: 5000 });
          }
          // Refresh transactions and balance
          fetchTransactions();
        } catch (error: any) {
          console.error('Failed to verify session:', error);
          toast.error(error.response?.data?.message || 'Failed to verify purchase. Please contact support.');
        }
        router.replace('/pro/dashboard/credits');
      };
      verifySession();
    }
  }, [searchParams, router]);

  useEffect(() => {
    fetchPackages();
    fetchTransactions();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      const data = await getPackages();
      setPackages(data);
    } catch (error) {
      console.error('Failed to load packages:', error);
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await getTransactions({ limit: 20 });
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast.error('Please select a package');
      return;
    }

    try {
      setPurchasing(true);
      const { checkoutUrl } = await createCheckout(selectedPackage);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate checkout');
      setPurchasing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Coins },
    { id: 'purchase', label: 'Purchase Credits', icon: ShoppingCart },
    { id: 'history', label: 'Transaction History', icon: History }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Credit Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your credits and claim more leads from the marketplace
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition
                      ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credit Balance */}
              <div className="lg:col-span-1">
                <CreditBalance />
              </div>

              {/* Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* How Credits Work */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    How Credits Work
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Browse Lead Marketplace
                        </h4>
                        <p className="text-sm text-gray-600">
                          View leads matched to your services. Each lead shows the credits required to claim.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Claim Leads
                        </h4>
                        <p className="text-sm text-gray-600">
                          Spend credits to claim full lead details and homeowner contact information.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          Submit Quotes
                        </h4>
                        <p className="text-sm text-gray-600">
                          Create and submit competitive quotes to win the project.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lead Cost Brackets */}
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    Lead Cost by Budget
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    1 credit = AED 5
                  </p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Under AED 3K</span>
                      <span className="font-semibold text-gray-900">3 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">AED 3K - 5K</span>
                      <span className="font-semibold text-gray-900">4 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">AED 5K - 20K</span>
                      <span className="font-semibold text-gray-900">6 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">AED 20K - 50K</span>
                      <span className="font-semibold text-gray-900">8 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">AED 50K - 100K</span>
                      <span className="font-semibold text-gray-900">12 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">AED 100K - 250K</span>
                      <span className="font-semibold text-gray-900">16 credits</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Over AED 250K</span>
                      <span className="font-semibold text-gray-900">20 credits</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ready to grow your business?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Purchase credits now and start bidding on homeowner projects.
                  </p>
                  <button
                    onClick={() => setActiveTab('purchase')}
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
                  >
                    View Credit Packages
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Pro tip:</strong> Larger packages offer better value per credit. Purchased credits never expire.
                </p>
              </div>

              {/* Credit Packages */}
              {loadingPackages ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-lg border-2 ${
                        selectedPackage === pkg.id
                          ? 'border-primary-500 ring-2 ring-primary-500 shadow-lg'
                          : 'border-gray-300 hover:shadow-md'
                      } transition-all bg-white overflow-hidden cursor-pointer`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      {/* Popular Badge */}
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </div>
                      )}

                      <div className="p-6">
                        {/* Package Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {pkg.name}
                        </h3>

                        {/* Credits */}
                        <div className="mb-4">
                          <div className="text-3xl font-bold text-primary-600">
                            {pkg.totalCredits.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {pkg.credits} + {pkg.bonusCredits} bonus
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-900">
                              AED {pkg.priceAED}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            AED {pkg.perCreditCost.toFixed(2)} per credit
                          </div>
                          {pkg.bonusCredits > 0 && (
                            <div className="text-xs text-green-600 font-medium mt-1">
                              +{pkg.bonusCredits} bonus credits
                            </div>
                          )}
                        </div>

                        {/* Select Indicator */}
                        <div className={`w-full py-3 px-4 rounded-lg font-semibold transition text-center ${
                          selectedPackage === pkg.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {selectedPackage === pkg.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <Check className="h-4 w-4" />
                              Selected
                            </span>
                          ) : (
                            'Select Package'
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedPackage && (
                <div className="flex justify-end">
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {purchasing ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow border border-gray-200">
              {/* Transaction History */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaction History
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {loadingTransactions ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : transactions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p>No transactions found</p>
                  </div>
                ) : (
                  transactions.map((txn) => (
                    <div key={txn.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 capitalize">
                            {txn.type.replace(/_/g, ' ')}
                          </div>
                          {txn.description && (
                            <div className="text-sm text-gray-500 mt-0.5">
                              {txn.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(txn.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-semibold ${
                            txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {txn.amount >= 0 ? '+' : ''}{txn.amount}
                          </div>
                          <div className="text-sm text-gray-500">
                            Balance: {txn.balance}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CreditsPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">Loading...</div>}>
      <CreditsPage />
    </Suspense>
  );
}
