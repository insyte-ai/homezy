'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyDirectLeads,
  acceptDirectLead,
  declineDirectLead,
  Lead,
} from '@/lib/services/leads';
import {
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function DirectRequestsPanel() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingLeadId, setProcessingLeadId] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectLeads();

    // Refresh every 30 seconds to update countdowns
    const interval = setInterval(fetchDirectLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDirectLeads = async () => {
    try {
      const data = await getMyDirectLeads({ status: 'pending' });
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Failed to load direct requests:', error);
      if (!loading) {
        // Only show error if not initial load
        toast.error('Failed to refresh direct requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (leadId: string) => {
    try {
      setProcessingLeadId(leadId);
      const result = await acceptDirectLead(leadId);

      toast.success(
        `Request accepted! ${result.creditsDeducted} credits deducted. You can now submit a quote.`
      );

      // Remove from list
      setLeads((prev) => prev.filter((l) => l._id !== leadId));

      // Redirect to lead details to submit quote
      router.push(`/pro/dashboard/leads/${leadId}`);
    } catch (error) {
      console.error('Failed to accept request:', error);
      const message = error instanceof Error && 'response' in error
        ? ((error as any).response?.data?.message || 'Failed to accept request')
        : 'Failed to accept request';
      toast.error(message);
    } finally {
      setProcessingLeadId(null);
    }
  };

  const handleDecline = async (leadId: string) => {
    const reason = prompt('Please provide a reason for declining (optional):');

    try {
      setProcessingLeadId(leadId);
      await declineDirectLead(leadId, reason || undefined);

      toast.success('Request declined. It has been moved to the public marketplace.');

      // Remove from list
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
    } catch (error) {
      console.error('Failed to decline request:', error);
      const message = error instanceof Error && 'response' in error
        ? ((error as any).response?.data?.message || 'Failed to decline request')
        : 'Failed to decline request';
      toast.error(message);
    } finally {
      setProcessingLeadId(null);
    }
  };

  // Calculate time remaining with countdown
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;

    if (diff <= 0) return { text: 'Expired', expired: true, urgent: false };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const urgent = hours < 2; // Less than 2 hours remaining

    if (hours > 0) {
      return {
        text: `${hours}h ${minutes}m remaining`,
        expired: false,
        urgent
      };
    }
    return {
      text: `${minutes}m remaining`,
      expired: false,
      urgent: true
    };
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800',
      urgent: 'bg-orange-100 text-orange-800',
      flexible: 'bg-blue-100 text-blue-800',
      planning: 'bg-gray-100 text-gray-800',
    };
    return colors[urgency as keyof typeof colors] || colors.flexible;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Direct Requests
        </h3>
        <p className="text-gray-600">
          When homeowners send requests directly to you, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-900 font-medium">
            You have 24 hours to respond to these requests
          </p>
          <p className="text-xs text-blue-700 mt-1">
            If you don't respond, requests will automatically move to the public marketplace
            where other professionals can claim them.
          </p>
        </div>
      </div>

      {/* Direct Requests List */}
      {leads.map((lead) => {
        // Use directLeadExpiresAt for direct leads, fallback to expiresAt
        const expiryDate = lead.directLeadExpiresAt || lead.expiresAt;
        const timeRemaining = getTimeRemaining(expiryDate);
        const isProcessing = processingLeadId === lead._id;

        return (
          <div
            key={lead._id}
            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="p-6">
              {/* Header with countdown */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lead.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {typeof lead.homeownerId === 'object' && lead.homeownerId?.name
                        ? lead.homeownerId.name
                        : 'Homeowner'}
                    </span>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm ${
                    timeRemaining.expired
                      ? 'bg-red-100 text-red-800'
                      : timeRemaining.urgent
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  {timeRemaining.text}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 line-clamp-2">{lead.description}</p>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{lead.location.emirate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {lead.budgetBracket.replace('k', 'K').replace('+', '+')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className={`px-2 py-0.5 rounded text-xs ${getUrgencyBadge(lead.urgency)}`}>
                    {lead.urgency}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Credits:</span>
                  <span className="font-medium text-gray-900">{lead.creditsRequired}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAccept(lead._id)}
                  disabled={isProcessing || timeRemaining.expired}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? 'Accepting...' : 'Accept & Quote'}
                </button>
                <button
                  onClick={() => handleDecline(lead._id)}
                  disabled={isProcessing || timeRemaining.expired}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
