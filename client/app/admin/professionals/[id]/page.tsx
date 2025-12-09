'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  UserCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  MapPinIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  getProfessionalDetails,
  approveProfessional,
  rejectProfessional,
  suspendProfessional,
  ProfessionalDetails,
} from '@/lib/services/admin';
import toast from 'react-hot-toast';

const ProfessionalDetailPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const professionalId = params.id;
  const router = useRouter();
  const [professional, setProfessional] = useState<ProfessionalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (professionalId) {
      fetchProfessionalDetails();
    }
  }, [professionalId]);

  const fetchProfessionalDetails = async () => {
    try {
      setLoading(true);
      const data = await getProfessionalDetails(professionalId);
      setProfessional(data);
    } catch (error: any) {
      console.error('Failed to fetch professional details:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load professional details';
      toast.error(errorMessage);
      // Don't redirect immediately - let the user see the error
      // router.push('/admin/professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!professional) return;

    try {
      await approveProfessional(professional.id, {
        notes: adminNotes,
      });
      toast.success('Professional approved successfully');
      setShowApprovalDialog(false);
      fetchProfessionalDetails();
    } catch (error: any) {
      console.error('Error approving professional:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve professional';
      toast.error(errorMessage);
    }
  };

  const handleReject = async () => {
    if (!professional || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await rejectProfessional(professional.id, {
        reason: rejectionReason,
        notes: adminNotes,
      });
      toast.success('Professional rejected');
      setShowRejectionDialog(false);
      fetchProfessionalDetails();
    } catch (error: any) {
      console.error('Error rejecting professional:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject professional';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'basic':
      case 'comprehensive':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'basic':
      case 'comprehensive':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: InformationCircleIcon },
    { id: 'documents', label: 'Documents', icon: DocumentTextIcon },
    { id: 'activity', label: 'Activity', icon: ChartBarIcon },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Loading professional details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!professional && !loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Professional not found</h2>
          <p className="text-neutral-600 mb-4">
            The professional details could not be loaded. This could be because:
          </p>
          <ul className="text-sm text-neutral-600 mb-6 text-left max-w-md mx-auto">
            <li>• The professional ID is invalid</li>
            <li>• The backend API endpoint is not implemented</li>
            <li>• You don't have permission to view this professional</li>
            <li>• The professional has not completed onboarding yet</li>
          </ul>
          <p className="text-sm text-neutral-500 mb-4">Check the browser console for more details.</p>
          <button
            onClick={() => router.push('/admin/professionals')}
            className="btn btn-primary"
          >
            Back to Professionals List
          </button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
        <button
          onClick={() => router.push('/admin/professionals')}
          className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Professionals
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-neutral-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {professional.firstName} {professional.lastName}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">{professional.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Onboarding Status Badge */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              professional.onboardingCompleted
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {professional.onboardingCompleted ? (
                <CheckCircleIcon className="h-4 w-4 mr-1" />
              ) : (
                <XCircleIcon className="h-4 w-4 mr-1" />
              )}
              Onboarding: {professional.onboardingCompleted ? 'Complete' : 'Incomplete'}
            </span>
            {/* Verification Status Badge */}
            {professional.verificationStatus && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(professional.verificationStatus)}`}>
                {getStatusIcon(professional.verificationStatus)}
                <span className="ml-1">
                  {professional.verificationStatus.charAt(0).toUpperCase() + professional.verificationStatus.slice(1)}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Professional Status</h2>

              {/* Approval Actions */}
              {(!professional.verificationStatus || professional.verificationStatus === 'pending') && (
                <>
                  {/* Onboarding Incomplete Warning */}
                  {!professional.onboardingCompleted && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Onboarding Incomplete</h3>
                          <p className="mt-1 text-sm text-yellow-700">
                            This professional has not completed their onboarding. They must complete onboarding before they can be approved.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-neutral-200">
                    <button
                      onClick={() => setShowApprovalDialog(true)}
                      disabled={!professional.onboardingCompleted}
                      className={`flex items-center px-4 py-2 rounded-md font-medium ${
                        professional.onboardingCompleted
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Approve Professional
                    </button>
                    <button
                      onClick={() => setShowRejectionDialog(true)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Application
                    </button>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">Business Name</div>
                  <div className="text-sm text-neutral-900">{professional.businessName || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">Phone Number</div>
                  <div className="text-sm text-neutral-900">{professional.phoneNumber || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">Trade License Number</div>
                  <div className="text-sm text-neutral-900">
                    {professional.tradeLicense?.number || 'Not provided'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">VAT Number (TRN)</div>
                  <div className="text-sm text-neutral-900">
                    {(professional as any).vatNumber || 'Not provided'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">Member Since</div>
                  <div className="text-sm text-neutral-900">
                    {new Date(professional.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-neutral-200">
              <div className="border-b border-neutral-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center py-4 px-1 border-b-2 font-medium text-sm
                          ${activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-lg font-medium text-neutral-900 mb-4">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-neutral-400" />
                          <div>
                            <div className="text-sm text-neutral-500">Email</div>
                            <div className="text-sm font-medium">{professional.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-neutral-400" />
                          <div>
                            <div className="text-sm text-neutral-500">Phone</div>
                            <div className="text-sm font-medium">{professional.phoneNumber || 'Not provided'}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-neutral-400" />
                          <div>
                            <div className="text-sm text-neutral-500">Joined</div>
                            <div className="text-sm font-medium">{new Date(professional.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {professional.address && (
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-5 w-5 text-neutral-400" />
                            <div>
                              <div className="text-sm text-neutral-500">Location</div>
                              <div className="text-sm font-medium">{professional.address.emirate}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Service Categories */}
                    <div>
                      <h4 className="text-lg font-medium text-neutral-900 mb-4">Service Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {professional.serviceCategories && professional.serviceCategories.length > 0 ? (
                          professional.serviceCategories.map((category, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                            >
                              {category}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-neutral-500">No service categories specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-neutral-900 mb-4">Verification Documents</h4>

                    {/* Trade License */}
                    {professional.tradeLicense && (
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neutral-900 mb-1">Trade License</div>
                            <div className="text-xs text-neutral-500">
                              {professional.tradeLicense.number && `License #: ${professional.tradeLicense.number}`}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {professional.tradeLicense.expiryDate && `Expires: ${new Date(professional.tradeLicense.expiryDate).toLocaleDateString()}`}
                            </div>
                          </div>
                          {professional.tradeLicense.documentUrl ? (
                            <a
                              href={professional.tradeLicense.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              View Document
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-3 py-2 text-sm text-neutral-400 bg-neutral-50 rounded-md">
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VAT Certificate */}
                    {(professional as any).vatDocument && (
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neutral-900 mb-1">VAT TRN Certificate</div>
                            <div className="text-xs text-neutral-500">
                              {(professional as any).vatNumber && `VAT Number: ${(professional as any).vatNumber}`}
                            </div>
                          </div>
                          {(professional as any).vatDocument?.url ? (
                            <a
                              href={(professional as any).vatDocument.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-2 border border-neutral-300 shadow-sm text-sm leading-4 font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                            >
                              <DocumentTextIcon className="h-4 w-4 mr-2" />
                              View Document
                            </a>
                          ) : (
                            <span className="inline-flex items-center px-3 py-2 text-sm text-neutral-400 bg-neutral-50 rounded-md">
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    {/* Recent Leads */}
                    {professional.leads && professional.leads.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-neutral-900 mb-4">Recent Leads</h4>
                        <div className="space-y-3">
                          {professional.leads.slice(0, 5).map((lead) => (
                            <div key={lead.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-neutral-900">{lead.title}</span>
                                  <span className="ml-3 text-sm text-neutral-600">
                                    Claimed: {new Date(lead.claimedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <span className="text-sm text-neutral-500">{lead.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {(professional.adminNotes || professional.rejectionReason) && (
                      <div>
                        <h4 className="text-lg font-medium text-neutral-900 mb-4">Admin Actions</h4>
                        <div className="space-y-4">
                          {professional.rejectionReason && (
                            <div className="p-4 bg-red-50 rounded-md">
                              <div className="flex">
                                <XCircleIcon className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                  <h5 className="text-sm font-medium text-red-800">Rejection Reason</h5>
                                  <p className="text-sm text-red-700 mt-1">{professional.rejectionReason}</p>
                                  {professional.rejectedAt && (
                                    <p className="text-xs text-red-600 mt-1">{new Date(professional.rejectedAt).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {professional.adminNotes && (
                            <div className="p-4 bg-blue-50 rounded-md">
                              <div className="flex">
                                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                                <div className="ml-3">
                                  <h5 className="text-sm font-medium text-blue-800">Admin Notes</h5>
                                  <p className="text-sm text-blue-700 mt-1">{professional.adminNotes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                  <div className="text-2xl font-bold text-neutral-900">{professional.totalLeadsClaimed || 0}</div>
                  <div className="text-sm text-neutral-500">Leads Claimed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-neutral-900">{professional.totalJobsCompleted || 0}</div>
                  <div className="text-sm text-neutral-500">Jobs Completed</div>
                </div>
                {professional.creditBalance && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <BanknotesIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-neutral-900">{professional.creditBalance.totalCredits || 0}</div>
                    <div className="text-sm text-neutral-500">Available Credits</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Dialog */}
      {showApprovalDialog && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity z-50" onClick={() => setShowApprovalDialog(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Professional</h3>

                <p className="text-sm text-gray-600 mb-4">
                  This will approve the professional's application and allow them to start claiming leads.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Add any notes..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowApprovalDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Rejection Dialog */}
      {showRejectionDialog && (
        <>
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity z-50" onClick={() => setShowRejectionDialog(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Professional</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Explain why the application is being rejected..."
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Add any internal notes..."
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRejectionDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessionalDetailPage;
