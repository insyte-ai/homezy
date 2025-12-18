'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Edit,
  XCircle,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { getLeadById, cancelLead, Lead, LeadStatus, getLeadClaims, LeadClaimWithProfessional } from '@/lib/services/leads';
import { getQuotesForLead, Quote, QuoteStatus } from '@/lib/services/quotes';
import { getReviewForLead, type Review } from '@/lib/services/reviews';
import toast from 'react-hot-toast';
import { Star, Shield } from 'lucide-react';
import { StartConversationButton } from '@/components/common/StartConversationButton';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [claims, setClaims] = useState<LeadClaimWithProfessional[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadLeadDetails();
    }
  }, [leadId]);

  const loadLeadDetails = async () => {
    try {
      setLoading(true);
      const [leadData, quotesData, claimsData, reviewData] = await Promise.all([
        getLeadById(leadId),
        getQuotesForLead(leadId).catch(() => ({ quotes: [], total: 0 })),
        getLeadClaims(leadId).catch(() => []),
        getReviewForLead(leadId).catch(() => null),
      ]);
      setLead(leadData);
      setQuotes(quotesData.quotes);
      setClaims(claimsData);
      setReview(reviewData);
    } catch (error: any) {
      console.error('Failed to load lead details:', error);
      toast.error(error.response?.data?.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLead = async () => {
    if (!lead) return;

    try {
      setCancelling(true);
      await cancelLead(lead.id, cancelReason);
      toast.success('Lead cancelled successfully');
      setCancelModalOpen(false);
      router.push('/dashboard/leads');
    } catch (error: any) {
      console.error('Failed to cancel lead:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel lead');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
      full: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Full (5/5)' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expired' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    };
    return badges[status as keyof typeof badges] || badges.open;
  };

  const getQuoteStatusBadge = (status: QuoteStatus) => {
    const badges = {
      [QuoteStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
      [QuoteStatus.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      [QuoteStatus.DECLINED]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' },
      [QuoteStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Withdrawn' },
    };
    return badges[status] || badges[QuoteStatus.PENDING];
  };

  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Request not found</h3>
          <p className="text-gray-600 mb-6">The request you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/requests" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusBadge(lead.status);
  const canCancel = lead.status === LeadStatus.OPEN || lead.status === LeadStatus.FULL;
  const pendingQuotes = quotes.filter(q => q.status === QuoteStatus.PENDING);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/requests"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Requests
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{lead.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-gray-600">Created {new Date(lead.createdAt).toLocaleDateString()}</p>
          </div>
          {canCancel && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              <XCircle className="h-4 w-4" />
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* Action Alert */}
      {pendingQuotes.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-1">
              {pendingQuotes.length} {pendingQuotes.length === 1 ? 'quote' : 'quotes'} waiting for review
            </h3>
            <p className="text-sm text-purple-700 mb-3">
              Compare quotes and accept the best professional for your project
            </p>
            <Link
              href={`/dashboard/requests/${lead.id}/quotes`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Compare Quotes
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
          </div>

          {/* Photos */}
          {lead.photos && lead.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Photos ({lead.photos.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {lead.photos.map((photo, index) => (
                  <a
                    key={index}
                    href={photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-75 transition-opacity"
                  >
                    <img
                      src={photo}
                      alt={`Project photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Interested Professionals Section */}
          {claims.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Interested Professionals ({claims.length})
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                These professionals have expressed interest in your project. You can message them directly.
              </p>
              <div className="space-y-4">
                {claims.map((claim) => {
                  const pro = claim.professional;
                  const profile = pro?.proProfile;
                  const proName = profile?.businessName ||
                    (pro?.firstName && pro?.lastName
                      ? `${pro.firstName} ${pro.lastName}`
                      : claim.professionalName || 'Professional');
                  const profilePhoto = pro?.profilePhoto;
                  const proSlug = profile?.slug;
                  const proProfileUrl = proSlug ? `/pros/${claim.professionalId}/${proSlug}` : null;

                  return (
                    <div
                      key={claim.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        {proProfileUrl ? (
                          <Link href={proProfileUrl} className="flex items-start gap-3 flex-1 group">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {profilePhoto ? (
                                <img
                                  src={profilePhoto}
                                  alt={proName}
                                  className="w-12 h-12 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary-300 transition-all"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold group-hover:ring-2 group-hover:ring-primary-300 transition-all">
                                  {proName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {proName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                {profile?.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {profile.rating.toFixed(1)}
                                  </span>
                                )}
                                {profile?.reviewCount !== undefined && (
                                  <span>({profile.reviewCount} reviews)</span>
                                )}
                                {profile?.verificationStatus === 'approved' && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <Shield className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </Link>
                        ) : (
                          <div className="flex items-start gap-3 flex-1">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {profilePhoto ? (
                                <img
                                  src={profilePhoto}
                                  alt={proName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
                                  {proName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div>
                              <h3 className="font-semibold text-gray-900">{proName}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                {profile?.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {profile.rating.toFixed(1)}
                                  </span>
                                )}
                                {profile?.reviewCount !== undefined && (
                                  <span>({profile.reviewCount} reviews)</span>
                                )}
                                {profile?.verificationStatus === 'approved' && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <Shield className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Claimed {new Date(claim.claimedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Message Button */}
                        <StartConversationButton
                          recipientId={claim.professionalId}
                          recipientName={proName}
                          relatedLeadId={lead.id}
                          variant="outline"
                          size="sm"
                        />
                      </div>

                      {claim.quoteSubmitted && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3 w-3" />
                            Quote submitted
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quotes Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quotes Received ({quotes.length})
              </h2>
              {quotes.length > 1 && (
                <Link
                  href={`/dashboard/requests/${lead.id}/quotes`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Compare All
                </Link>
              )}
            </div>

            {quotes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No quotes yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Professionals will submit quotes once they respond to your request
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => {
                  const quoteStatus = getQuoteStatusBadge(quote.status);
                  const professional = typeof quote.professional === 'object' ? quote.professional : null;

                  return (
                    <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{quote.professionalName}</h3>
                          {professional && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              {professional.rating && (
                                <span className="flex items-center gap-1">
                                  ⭐ {professional.rating.toFixed(1)}
                                </span>
                              )}
                              {professional.reviewCount && (
                                <span>({professional.reviewCount} reviews)</span>
                              )}
                              {professional.verificationStatus && (
                                <span className="text-green-600">✓ Verified</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${quoteStatus.bg} ${quoteStatus.text}`}>
                          {quoteStatus.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="text-lg font-bold text-gray-900">
                            AED {quote.pricing.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Inc. VAT</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {quote.timeline.estimatedDuration} {quote.timeline.estimatedDuration === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/requests/${lead.id}/quotes`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        View Full Quote
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Category
                </p>
                <p className="font-medium text-gray-900">{lead.category}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </p>
                <p className="font-medium text-gray-900">
                  {lead.location.neighborhood && `${lead.location.neighborhood}, `}
                  {lead.location.emirate}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget
                </p>
                <p className="font-medium text-gray-900">AED {lead.budgetBracket}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Urgency
                </p>
                <p className="font-medium text-gray-900 capitalize">{lead.urgency}</p>
              </div>

              {lead.timeline && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeline
                  </p>
                  <p className="font-medium text-gray-900">{lead.timeline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Claims
                </span>
                <span className="font-semibold text-gray-900">
                  {lead.claimsCount ?? 0} / {lead.maxClaimsAllowed || 5}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Quotes
                </span>
                <span className="font-semibold text-gray-900">{quotes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Expires
                </span>
                <span className="font-medium text-gray-900">
                  {new Date(lead.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Review Card - Only for accepted leads */}
          {lead.status === LeadStatus.ACCEPTED && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5" />
                Review
              </h2>
              {review ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.overallRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {review.overallRating}/5
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{review.reviewText}</p>
                  <p className="text-xs text-gray-500">
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Share your experience with this professional
                  </p>
                  <Link
                    href={`/dashboard/requests/${leadId}/review`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <Star className="h-4 w-4" />
                    Leave a Review
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Request?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this request? This action cannot be undone. Any professionals who responded will be refunded their credits.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Let us know why you're cancelling..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
                className="flex-1 btn btn-outline"
              >
                Keep Lead
              </button>
              <button
                onClick={handleCancelLead}
                disabled={cancelling}
                className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
