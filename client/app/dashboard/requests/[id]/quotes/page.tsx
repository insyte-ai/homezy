'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Star,
  Shield,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { getLeadById, Lead } from '@/lib/services/leads';
import { getQuotesForLead, acceptQuote, declineQuote, Quote, QuoteStatus } from '@/lib/services/quotes';
import { sendMessage } from '@/lib/services/messages';
import toast from 'react-hot-toast';

export default function QuoteComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    type: 'accept' | 'decline';
    quote: Quote;
  } | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [messageModal, setMessageModal] = useState<{ quote: Quote } | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadData();
    }
  }, [leadId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadData, quotesData] = await Promise.all([
        getLeadById(leadId),
        getQuotesForLead(leadId)
      ]);
      setLead(leadData);
      setQuotes(quotesData.quotes);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error(error.response?.data?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!actionModal || actionModal.type !== 'accept') return;

    try {
      setProcessing(true);
      await acceptQuote(actionModal.quote.id, actionNote);
      toast.success('Quote accepted! The professional has been notified.');
      setActionModal(null);
      setActionNote('');
      loadData(); // Reload to get updated statuses
    } catch (error: any) {
      console.error('Failed to accept quote:', error);
      toast.error(error.response?.data?.message || 'Failed to accept quote');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!actionModal || actionModal.type !== 'decline') return;

    try {
      setProcessing(true);
      await declineQuote(actionModal.quote.id, actionNote);
      toast.success('Quote declined');
      setActionModal(null);
      setActionNote('');
      loadData();
    } catch (error: any) {
      console.error('Failed to decline quote:', error);
      toast.error(error.response?.data?.message || 'Failed to decline quote');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageModal || !messageContent.trim()) return;

    try {
      setSendingMessage(true);
      await sendMessage({
        recipientId: messageModal.quote.professionalId,
        content: messageContent.trim(),
        relatedLead: leadId,
      });
      toast.success('Message sent! View your conversation in Messages.');
      setMessageModal(null);
      setMessageContent('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getQuoteStatusBadge = (status: QuoteStatus) => {
    const badges = {
      [QuoteStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      [QuoteStatus.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      [QuoteStatus.DECLINED]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' },
      [QuoteStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Withdrawn' },
    };
    return badges[status] || badges[QuoteStatus.PENDING];
  };

  const pendingQuotes = quotes.filter(q => q.status === QuoteStatus.PENDING);
  const sortedQuotes = [...quotes].sort((a, b) => a.pricing.total - b.pricing.total);
  const lowestPrice = sortedQuotes[0]?.pricing.total;

  if (loading) {
    return (
      <div>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead || quotes.length === 0) {
    return (
      <div>
        <Link
          href={`/dashboard/requests/${leadId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lead Details
        </Link>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
          <p className="text-gray-600">
            Professionals will submit quotes once they respond to your request
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/requests/${leadId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lead Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Quotes</h1>
        <p className="text-gray-600">{lead.title}</p>
      </div>

      {/* Summary Banner */}
      {pendingQuotes.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>{pendingQuotes.length}</strong> {pendingQuotes.length === 1 ? 'quote' : 'quotes'} waiting for your decision.
            Review each quote carefully and choose the best professional for your project.
          </p>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                  Professional
                </th>
                {sortedQuotes.map((quote) => {
                  const professional = typeof quote.professional === 'object' ? quote.professional : null;
                  const statusConfig = getQuoteStatusBadge(quote.status);

                  return (
                    <th key={quote.id} className="px-6 py-4 text-center min-w-[250px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="font-semibold text-gray-900">{quote.professionalName}</div>
                        {professional && professional.rating && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{professional.rating.toFixed(1)}</span>
                            <span className="text-gray-400">({professional.reviewCount || 0})</span>
                          </div>
                        )}
                        {professional && professional.verificationStatus && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Shield className="h-3 w-3" />
                            Verified
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Price Row */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Total Price
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-bold text-gray-900">
                        AED {quote.pricing.total.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Inc. VAT</div>
                      {quote.pricing.total === lowestPrice && sortedQuotes.length > 1 && (
                        <div className="mt-1 text-xs font-medium text-green-600">Lowest Price</div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Breakdown */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Subtotal
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    AED {quote.pricing.subtotal.toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  VAT (5%)
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    AED {quote.pricing.vat.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Timeline */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Start Date
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {new Date(quote.timeline.startDate).toLocaleDateString()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Completion Date
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {new Date(quote.timeline.completionDate).toLocaleDateString()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Duration
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {quote.timeline.estimatedDuration} days
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Warranty
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 text-center text-sm text-gray-700">
                    {quote.warranty || 'Not specified'}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                  Actions
                </td>
                {sortedQuotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4">
                    {quote.status === QuoteStatus.PENDING ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setActionModal({ type: 'accept', quote })}
                          className="btn btn-primary text-sm w-full flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => setMessageModal({ quote })}
                          className="btn btn-outline text-sm w-full flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                        <button
                          onClick={() => setActionModal({ type: 'decline', quote })}
                          className="btn btn-outline text-sm w-full text-gray-600"
                        >
                          Decline
                        </button>
                      </div>
                    ) : quote.status === QuoteStatus.ACCEPTED ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <p className="text-sm font-medium text-green-700">Accepted</p>
                        <button
                          onClick={() => setMessageModal({ quote })}
                          className="btn btn-outline text-sm w-full flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <XCircle className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Declined</p>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Quote Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Detailed Quotes</h2>
        {sortedQuotes.map((quote) => {
          const statusConfig = getQuoteStatusBadge(quote.status);

          return (
            <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {quote.professionalName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Submitted {new Date(quote.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Approach</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{quote.approach}</p>
              </div>

              {quote.pricing.items && quote.pricing.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Description</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Qty</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Unit Price</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {quote.pricing.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-700 text-right">
                              AED {item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900 font-medium text-right">
                              AED {item.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {quote.status === QuoteStatus.PENDING && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setActionModal({ type: 'accept', quote })}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Accept
                  </button>
                  <button
                    onClick={() => setMessageModal({ quote })}
                    className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Message
                  </button>
                  <button
                    onClick={() => setActionModal({ type: 'decline', quote })}
                    className="flex-1 btn btn-outline text-gray-600"
                  >
                    Decline
                  </button>
                </div>
              )}

              {quote.status === QuoteStatus.ACCEPTED && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setMessageModal({ quote })}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Message Professional
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {actionModal.type === 'accept' ? 'Accept Quote?' : 'Decline Quote?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {actionModal.type === 'accept'
                ? `You're about to accept the quote from ${actionModal.quote.professionalName}. They will be notified and you can proceed with your project.`
                : `Are you sure you want to decline this quote? ${actionModal.quote.professionalName} will be notified.`}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionModal.type === 'accept' ? 'Message to professional (optional)' : 'Reason (optional)'}
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={actionModal.type === 'accept' ? 'Add a message...' : 'Let them know why...'}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionNote('');
                }}
                disabled={processing}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={actionModal.type === 'accept' ? handleAccept : handleDecline}
                disabled={processing}
                className={`flex-1 btn ${
                  actionModal.type === 'accept'
                    ? 'btn-primary'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {processing
                  ? 'Processing...'
                  : actionModal.type === 'accept'
                  ? 'Accept Quote'
                  : 'Decline Quote'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {messageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Message {messageModal.quote.professionalName}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Send a quick message to ask questions or discuss the quote
            </p>
            <div className="mb-4">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Hi, I have a question about your quote..."
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                {messageContent.length}/500 characters
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMessageModal(null);
                  setMessageContent('');
                }}
                disabled={sendingMessage}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageContent.trim() || messageContent.length > 500}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  'Sending...'
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
