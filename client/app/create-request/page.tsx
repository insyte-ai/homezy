/**
 * Create Request Page for Authenticated Homeowners
 * Dedicated page for logged-in homeowners to submit service requests
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MultiStepLeadForm } from '@/components/lead-form/MultiStepLeadForm';
import { SearchBar } from '@/components/home/SearchBar';
import { PopularServices } from '@/components/home/PopularServices';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateRequestPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    setIsLoading(false);

    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push('/auth/login?returnTo=/create-request');
      return;
    }

    if (user && user.role !== 'homeowner') {
      // Only homeowners can create requests
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!isAuthenticated || user?.role !== 'homeowner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user.firstName}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedServiceId ? (
          // Service Selection View
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                What service do you need?
              </h1>
              <p className="text-lg text-gray-600">
                Select a service to get started with your request. We'll match you with the best
                professionals in your area.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                onSelectService={(serviceId) => {
                  setSelectedServiceId(serviceId);
                }}
              />
            </div>

            {/* Popular Services */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Popular Services
              </h2>
              <PopularServices
                onSelectService={(serviceId) => {
                  setSelectedServiceId(serviceId);
                }}
              />
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="font-bold text-gray-900 mb-3">Why create a request?</h3>
              <div className="grid gap-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Get quotes from up to 5 verified professionals</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Compare pricing, reviews, and availability</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Choose the best professional for your project</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Track everything from your dashboard</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Lead Form View (in a card instead of modal)
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Close/Back Button */}
              <div className="border-b border-gray-200 p-4 bg-gray-50">
                <button
                  onClick={() => setSelectedServiceId(undefined)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Change Service</span>
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <MultiStepLeadForm
                  serviceId={selectedServiceId}
                  onClose={() => {
                    // On close, go back to service selection
                    setSelectedServiceId(undefined);
                  }}
                  onSubmit={() => {
                    // On submit, redirect to dashboard
                    router.push('/dashboard');
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
