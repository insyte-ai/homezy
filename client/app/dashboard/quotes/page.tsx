'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  ExternalLink,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { getMyLeads, Lead } from '@/lib/services/leads';
import { getQuotesForLead, Quote, QuoteStatus } from '@/lib/services/quotes';

interface LeadWithQuotes {
  lead: Lead;
  quotes: Quote[];
}

export default function QuotesPage() {
  const [leadsWithQuotes, setLeadsWithQuotes] = useState<LeadWithQuotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const { leads } = await getMyLeads({ limit: 100 });

      // Fetch quotes for all leads
      const leadsWithQuotesData = await Promise.all(
        leads.map(async (lead) => {
          try {
            const { quotes } = await getQuotesForLead(lead.id);
            return { lead, quotes };
          } catch {
            return { lead, quotes: [] };
          }
        })
      );

      // Filter out leads with no quotes
      const filtered = leadsWithQuotesData.filter(lwq => lwq.quotes.length > 0);
      setLeadsWithQuotes(filtered);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const allQuotes = leadsWithQuotes.flatMap(lwq =>
    lwq.quotes.map(quote => ({ ...quote, leadInfo: lwq.lead }))
  );

  const filteredQuotes = selectedStatus === 'all'
    ? allQuotes
    : allQuotes.filter(q => q.status === selectedStatus);

  const statusCounts = {
    all: allQuotes.length,
    pending: allQuotes.filter(q => q.status === QuoteStatus.PENDING).length,
    accepted: allQuotes.filter(q => q.status === QuoteStatus.ACCEPTED).length,
    declined: allQuotes.filter(q => q.status === QuoteStatus.DECLINED).length,
  };

  const getQuoteStatusBadge = (status: QuoteStatus) => {
    const badges = {
      [QuoteStatus.PENDING]: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' },
      [QuoteStatus.ACCEPTED]: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Accepted' },
      [QuoteStatus.DECLINED]: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Declined' },
      [QuoteStatus.WITHDRAWN]: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle, label: 'Withdrawn' },
    };
    return badges[status] || badges[QuoteStatus.PENDING];
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Quotes</h1>
        <p className="text-gray-600">
          View and manage quotes from all your project requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
          <div className="text-sm text-gray-600">Total Quotes</div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</div>
          <div className="text-sm text-yellow-700">Pending Review</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-2xl font-bold text-green-700">{statusCounts.accepted}</div>
          <div className="text-sm text-green-700">Accepted</div>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-700">{statusCounts.declined}</div>
          <div className="text-sm text-gray-700">Declined</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Quotes', count: statusCounts.all },
            { value: QuoteStatus.PENDING, label: 'Pending', count: statusCounts.pending },
            { value: QuoteStatus.ACCEPTED, label: 'Accepted', count: statusCounts.accepted },
            { value: QuoteStatus.DECLINED, label: 'Declined', count: statusCounts.declined },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === filter.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/20">
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes yet</h3>
          <p className="text-gray-600 mb-6">
            Quotes will appear here once professionals respond to your requests
          </p>
          <Link href="/dashboard/requests" className="btn btn-primary inline-flex items-center gap-2">
            View My Requests
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const statusConfig = getQuoteStatusBadge(quote.status);
            const StatusIcon = statusConfig.icon;
            const professional = typeof quote.professional === 'object' ? quote.professional : null;

            return (
              <div
                key={quote.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Lead Info */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/dashboard/requests/${(quote as any).leadInfo.id}`}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                      >
                        For: {(quote as any).leadInfo.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {(quote as any).leadInfo.category} • {(quote as any).leadInfo.location.emirate}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{quote.professionalName}</h3>
                    {professional && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
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
                    <p className="text-sm text-gray-700 line-clamp-2">{quote.approach}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Price
                      </span>
                      <span className="font-bold text-gray-900">
                        AED {quote.pricing.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Timeline
                      </span>
                      <span className="text-sm text-gray-700">
                        {quote.timeline.estimatedDuration} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Submitted
                      </span>
                      <span className="text-sm text-gray-700">
                        {new Date(quote.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href={`/dashboard/requests/${(quote as any).leadInfo.id}/quotes`}
                    className="btn btn-primary text-sm inline-flex items-center gap-2"
                  >
                    View Full Quote
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
