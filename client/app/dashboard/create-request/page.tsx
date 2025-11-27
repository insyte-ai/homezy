'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MultiStepLeadForm } from '@/components/lead-form/MultiStepLeadForm';
import { SearchBar } from '@/components/home/SearchBar';
import { PopularServices } from '@/components/home/PopularServices';
import { ArrowLeft } from 'lucide-react';

export default function CreateRequestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();

  return (
    <div>
      {!selectedServiceId ? (
        // Service Selection View
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              What service do you need?
            </h1>
            <p className="text-gray-600">
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
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Popular Services
            </h2>
            <PopularServices
              onSelectService={(serviceId) => {
                setSelectedServiceId(serviceId);
              }}
            />
          </div>

          {/* Additional Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 max-w-3xl mx-auto">
            <h3 className="font-bold text-gray-900 mb-3">Why create a request?</h3>
            <div className="grid gap-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span>Get quotes from up to 5 verified professionals</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span>Compare pricing, reviews, and availability</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span>Choose the best professional for your project</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span>Track everything from your dashboard</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Lead Form View (in a card)
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Back Button */}
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
                  setSelectedServiceId(undefined);
                }}
                onSubmit={() => {
                  router.push('/dashboard/requests');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
