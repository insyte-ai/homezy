'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getQuoteById, deleteQuote, Quote } from '@/lib/services/quotes';
import { getLeadById, Lead } from '@/lib/services/leads';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Paperclip,
  Download,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StartConversationButton } from '@/components/common/StartConversationButton';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.quoteId as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    }
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const data = await getQuoteById(quoteId);
      setQuote(data);

      // Load the lead details
      const leadId = typeof data.lead === 'string' ? data.lead : data.lead?.id;
      if (leadId) {
        try {
          const leadData = await getLeadById(leadId);
          setLead(leadData);
        } catch (error) {
          console.error('Failed to load lead:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to load quote:', error);
      toast.error(error.response?.data?.message || 'Failed to load quote');
      router.push('/pro/dashboard/quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await deleteQuote(quoteId);
      toast.success('Quote deleted successfully');
      router.push('/pro/dashboard/quotes');
    } catch (error: any) {
      console.error('Failed to delete quote:', error);
      toast.error(error.response?.data?.message || 'Failed to delete quote');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4" />
            Accepted
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4" />
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Quote Not Found</h2>
          <p className="text-red-700 mb-4">This quote may have been deleted or you don&apos;t have access to it.</p>
          <button onClick={() => router.push('/pro/dashboard/quotes')} className="btn btn-primary">
            Back to My Quotes
          </button>
        </div>
      </div>
    );
  }

  const leadInfo = typeof quote.lead === 'object' ? quote.lead : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/pro/dashboard/quotes')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Quotes
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Quote Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {leadInfo?.title || 'Quote'} - Submitted {formatDate(quote.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(quote.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pricing Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary-600" />
                Pricing Breakdown
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Qty</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.pricing.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                        <td className="py-3 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-700 dark:text-gray-300">
                          AED {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">
                          AED {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    AED {quote.pricing.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">VAT (5%):</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    AED {quote.pricing.vat.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-primary-600">
                    AED {quote.pricing.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Project Timeline
              </h2>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Duration</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {quote.timeline.estimatedDuration} {quote.timeline.estimatedDuration === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            {/* Approach */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Approach & Methodology
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {quote.approach}
              </p>
            </div>

            {/* Warranty */}
            {quote.warranty && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary-600" />
                  Warranty & Guarantees
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {quote.warranty}
                </p>
              </div>
            )}

            {/* Attachments */}
            {quote.attachments && quote.attachments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Paperclip className="h-5 w-5 text-primary-600" />
                  Attached Documents
                </h2>
                <div className="space-y-3">
                  {quote.attachments.map((attachment, index) => (
                    <div
                      key={attachment.id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                          {attachment.type === 'image' ? (
                            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {attachment.filename || `Document ${index + 1}`}
                          </p>
                          {attachment.size && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {attachment.size < 1024
                                ? `${attachment.size} B`
                                : attachment.size < 1024 * 1024
                                ? `${(attachment.size / 1024).toFixed(1)} KB`
                                : `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition"
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                        <a
                          href={attachment.url}
                          download={attachment.filename}
                          className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Decline Reason */}
            {quote.status === 'declined' && quote.declineReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-900 dark:text-red-200 mb-2">
                  Decline Reason
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  {quote.declineReason}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            {quote.status === 'pending' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/pro/dashboard/quotes/${quoteId}/edit`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Quote
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete Quote'}
                  </button>
                </div>
              </div>
            )}

            {/* Lead Info */}
            {lead && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                    <p className="font-medium text-gray-900 dark:text-white">{lead.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {lead.location?.neighborhood ? `${lead.location.neighborhood}, ` : ''}
                      {lead.location?.emirate}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push(`/pro/dashboard/leads/${lead.id}`)}
                    className="w-full mt-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
                  >
                    View Full Lead
                  </button>
                </div>
              </div>
            )}

            {/* Homeowner Info */}
            {lead && typeof lead.homeownerId === 'object' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Homeowner
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {lead.homeownerId.name}
                      </p>
                    </div>
                  </div>
                  {lead.homeownerId.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        <a
                          href={`tel:${lead.homeownerId.phone}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {lead.homeownerId.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <a
                        href={`mailto:${lead.homeownerId.email}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {lead.homeownerId.email}
                      </a>
                    </div>
                  </div>

                  {/* Message Button */}
                  <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                    <StartConversationButton
                      recipientId={lead.homeownerId.id}
                      recipientName={lead.homeownerId.name}
                      relatedLeadId={lead.id}
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status History
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Submitted</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(quote.createdAt)}
                    </p>
                  </div>
                </div>
                {quote.acceptedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Accepted</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(quote.acceptedAt)}
                      </p>
                    </div>
                  </div>
                )}
                {quote.declinedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Declined</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(quote.declinedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
