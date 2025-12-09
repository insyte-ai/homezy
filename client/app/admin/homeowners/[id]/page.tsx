'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  getHomeownerDetails,
  HomeownerDetails,
} from '@/lib/services/admin';
import toast from 'react-hot-toast';

const HomeownerDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const homeownerId = params.id;
  const router = useRouter();
  const [homeowner, setHomeowner] = useState<HomeownerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (homeownerId) {
      fetchHomeownerDetails();
    }
  }, [homeownerId]);

  const fetchHomeownerDetails = async () => {
    try {
      setLoading(true);
      const data = await getHomeownerDetails(homeownerId);
      setHomeowner(data);
    } catch (error: any) {
      console.error('Failed to fetch homeowner details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load homeowner details';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Loading homeowner details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!homeowner && !loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Homeowner not found</h2>
          <p className="text-neutral-600 mb-4">The homeowner details could not be loaded.</p>
          <button
            onClick={() => router.push('/admin/homeowners')}
            className="btn btn-primary"
          >
            Back to Homeowners List
          </button>
        </div>
      </div>
    );
  }

  if (!homeowner) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
        <button
          onClick={() => router.push('/admin/homeowners')}
          className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Homeowners
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-neutral-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {homeowner.firstName} {homeowner.lastName}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">{homeowner.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500">Email</div>
                    <div className="text-sm font-medium">{homeowner.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500">Phone</div>
                    <div className="text-sm font-medium">{homeowner.phoneNumber || 'Not provided'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-neutral-400" />
                  <div>
                    <div className="text-sm text-neutral-500">Joined</div>
                    <div className="text-sm font-medium">{new Date(homeowner.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {homeowner.address && (
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-5 w-5 text-neutral-400" />
                    <div>
                      <div className="text-sm text-neutral-500">Location</div>
                      <div className="text-sm font-medium">
                        {homeowner.address.city}, {homeowner.address.emirate}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Leads */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Leads ({homeowner.leads?.length || 0})
              </h2>
              {homeowner.leads && homeowner.leads.length > 0 ? (
                <div className="space-y-3">
                  {homeowner.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer"
                      onClick={() => router.push(`/admin/leads?search=${lead.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-neutral-400" />
                            <span className="font-medium text-neutral-900">{lead.title}</span>
                          </div>
                          <div className="mt-1 text-sm text-neutral-500">
                            {lead.category} | {lead.claimsCount} claims | Created: {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">No leads submitted yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Key Metrics</h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{homeowner.totalLeadsSubmitted}</div>
                  <div className="text-sm text-neutral-500">Total Leads</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{homeowner.activeLeads}</div>
                  <div className="text-sm text-neutral-500">Active Leads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerDetailPage;
