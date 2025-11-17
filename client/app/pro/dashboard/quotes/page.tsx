'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyQuotes, deleteQuote, type Quote } from '@/lib/services/quotes';

export default function QuotesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await getMyQuotes();
      setQuotes(data.quotes);
    } catch (error) {
      console.error('Failed to load quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(
    (quote) => activeTab === 'all' || quote.status === activeTab
  );

  const stats = {
    total: quotes.length,
    pending: quotes.filter((q) => q.status === 'pending').length,
    accepted: quotes.filter((q) => q.status === 'accepted').length,
    declined: quotes.filter((q) => q.status === 'declined').length,
    acceptanceRate: (() => {
      const responded = quotes.filter(q => q.status !== 'pending').length;
      const accepted = quotes.filter((q) => q.status === 'accepted').length;
      return responded > 0 ? Math.round((accepted / responded) * 100) : 0;
    })(),
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'declined':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      await deleteQuote(quoteId);
      toast.success('Quote deleted successfully');
      await loadQuotes(); // Reload the list
    } catch (error) {
      toast.error('Failed to delete quote');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Quotes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track and manage your submitted quotes
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Declined</p>
                <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-lg border-2 border-primary-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary-700 font-medium">Acceptance Rate</p>
                <p className="text-2xl font-bold text-primary-600">{stats.acceptanceRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'all', label: 'All Quotes', count: stats.total },
                { id: 'pending', label: 'Pending', count: stats.pending },
                { id: 'accepted', label: 'Accepted', count: stats.accepted },
                { id: 'declined', label: 'Declined', count: stats.declined },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-neutral-900'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Quotes List */}
        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'all'
                ? 'You haven\'t submitted any quotes yet'
                : `No ${activeTab} quotes`}
            </p>
            <button
              onClick={() => router.push('/pro/dashboard/leads')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Browse Claimed Leads
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => {
              const leadTitle = typeof quote.lead === 'string' ? 'Lead' : quote.lead.title;
              const leadId = typeof quote.lead === 'string' ? quote.lead : quote.lead._id;
              const respondedAt = quote.acceptedAt || quote.declinedAt;

              return (
                <div
                  key={quote._id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  {/* Acceptance Banner */}
                  {quote.status === 'accepted' && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-400 p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-green-900">
                            Quote Accepted!
                          </h4>
                          <p className="text-sm text-green-700">
                            Homeowner accepted your quote on {formatDate(respondedAt!)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {leadTitle}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(
                              quote.status
                            )}`}
                          >
                            {quote.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          AED {quote.pricing.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Total Price</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Start Date:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(quote.timeline.startDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Completion:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(quote.timeline.completionDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted:</span>
                        <p className="font-medium text-gray-900">
                          {formatDate(quote.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/pro/dashboard/quotes/${quote._id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>

                      {quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/pro/dashboard/quotes/${quote._id}/edit`)
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Quote
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </>
                      )}

                      {quote.status === 'accepted' && (
                        <button
                          onClick={() =>
                            router.push(`/pro/dashboard/projects/${leadId}`)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          View Project
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
