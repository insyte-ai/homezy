'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  getAdminLeadDetails,
  AdminLead,
} from '@/lib/services/admin';
import toast from 'react-hot-toast';

const LeadDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const leadId = params.id;
  const router = useRouter();
  const [lead, setLead] = useState<AdminLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchLeadDetails();
    }
  }, [leadId]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const data = await getAdminLeadDetails(leadId);
      setLead(data);
    } catch (error: any) {
      console.error('Failed to fetch lead details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load lead details';
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
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'soon':
        return 'bg-orange-100 text-orange-800';
      case 'flexible':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Loading lead details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lead && !loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Lead not found</h2>
          <p className="text-neutral-600 mb-4">The lead details could not be loaded.</p>
          <button
            onClick={() => router.push('/admin/leads')}
            className="btn btn-primary"
          >
            Back to Leads List
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
        <button
          onClick={() => router.push('/admin/leads')}
          className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Leads
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-neutral-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{lead.title}</h1>
              <p className="text-sm text-neutral-600 mt-1">{lead.category}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.status)}`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(lead.urgency)}`}>
              {lead.urgency}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Description */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lead Details</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-neutral-500 mb-1">Description</div>
                  <p className="text-neutral-900">{lead.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Budget</div>
                    <div className="flex items-center text-neutral-900">
                      <CurrencyDollarIcon className="h-5 w-5 text-neutral-400 mr-2" />
                      {lead.budgetBracket}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Location</div>
                    <div className="flex items-center text-neutral-900">
                      <MapPinIcon className="h-5 w-5 text-neutral-400 mr-2" />
                      {lead.location.city}, {lead.location.emirate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Created</div>
                    <div className="flex items-center text-neutral-900">
                      <CalendarIcon className="h-5 w-5 text-neutral-400 mr-2" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-1">Expires</div>
                    <div className="flex items-center text-neutral-900">
                      <ClockIcon className="h-5 w-5 text-neutral-400 mr-2" />
                      {lead.expiresAt ? new Date(lead.expiresAt).toLocaleDateString() : 'No expiry'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Homeowner Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Homeowner</h2>
              <div className="flex items-start space-x-4">
                <UserCircleIcon className="h-12 w-12 text-neutral-400" />
                <div className="flex-1">
                  <div className="font-medium text-neutral-900">
                    {lead.homeowner.firstName} {lead.homeowner.lastName}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-neutral-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {lead.homeowner.email}
                    </div>
                    {lead.homeowner.phoneNumber && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {lead.homeowner.phoneNumber}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/admin/homeowners/${lead.homeowner.id}`)}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Homeowner Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Claims */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Claims ({lead.claimsCount} / {lead.maxClaimsAllowed})
              </h2>
              {lead.claims && lead.claims.length > 0 ? (
                <div className="space-y-3">
                  {lead.claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <UserCircleIcon className="h-10 w-10 text-neutral-400" />
                          <div>
                            <div className="font-medium text-neutral-900">
                              {claim.professional.firstName} {claim.professional.lastName}
                            </div>
                            {claim.professional.businessName && (
                              <div className="text-sm text-neutral-500">{claim.professional.businessName}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-neutral-500">
                            Claimed: {new Date(claim.claimedAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-neutral-500">
                            Credits used: {claim.creditsUsed}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/professionals/${claim.professional.id}`)}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Professional
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">No professionals have claimed this lead yet.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Lead Stats</h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{lead.claimsCount}</div>
                  <div className="text-sm text-neutral-500">Claims</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{lead.maxClaimsAllowed}</div>
                  <div className="text-sm text-neutral-500">Max Claims</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{lead.creditsRequired}</div>
                  <div className="text-sm text-neutral-500">Credits Required</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailPage;
