'use client';

import { Lead, LeadStatus, UrgencyLevel } from '@/lib/services/leads';
import {
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  Lock,
  CheckCircle,
  Clock
} from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  variant?: 'marketplace' | 'homeowner' | 'professional';
  onClaim?: (leadId: string) => void;
  onViewDetails?: (leadId: string) => void;
  isClaimed?: boolean;
  claiming?: boolean;
}

export const LeadCard = ({
  lead,
  variant = 'marketplace',
  onClaim,
  onViewDetails,
  isClaimed = false,
  claiming = false
}: LeadCardProps) => {
  // Helper to get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'urgent':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'flexible':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'planning':
        return 'bg-primary-100 text-neutral-900 dark:bg-primary-900/30 dark:text-primary-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'full':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'quoted':
        return 'bg-primary-100 text-neutral-900 dark:bg-primary-900/30 dark:text-primary-400';
      case 'accepted':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'expired':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Helper to format budget bracket
  const formatBudgetBracket = (bracket: string) => {
    const budgetMap: { [key: string]: string } = {
      '500-1k': 'AED 500 - 1,000',
      '1k-5k': 'AED 1,000 - 5,000',
      '5k-15k': 'AED 5,000 - 15,000',
      '15k-50k': 'AED 15,000 - 50,000',
      '50k-150k': 'AED 50,000 - 150,000',
      '150k+': 'AED 150,000+'
    };
    return budgetMap[bracket] || bracket;
  };

  // Helper to format urgency label
  const formatUrgencyLabel = (urgency: string) => {
    const urgencyMap: { [key: string]: string } = {
      'emergency': 'Emergency (<24h)',
      'urgent': 'Urgent (<1 week)',
      'flexible': 'Flexible (1-4 weeks)',
      'planning': 'Planning (>1 month)'
    };
    return urgencyMap[urgency.toLowerCase()] || urgency;
  };

  // Calculate days until expiry
  const daysUntilExpiry = Math.ceil(
    (new Date(lead.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {lead.category}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {lead.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {lead.description}
            </p>
          </div>

          {variant === 'marketplace' && lead.matchScore !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {lead.matchScore}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
            </div>
          )}
        </div>

        {/* Status and Urgency Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(lead.status)}`}>
            {lead.status}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(lead.urgency)}`}>
            {formatUrgencyLabel(lead.urgency)}
          </span>
          {lead.claimsCount > 0 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {lead.claimsCount}/{lead.maxClaimsAllowed || 5} Claimed
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="flex items-start gap-2">
          <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Service: <span className="font-semibold text-gray-900 dark:text-white">
                {lead.category}
              </span>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Budget: <span className="font-semibold text-gray-900 dark:text-white">
              {formatBudgetBracket(lead.budgetBracket)}
            </span>
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {lead.location.emirate}
            {lead.location.neighborhood && `, ${lead.location.neighborhood}`}
          </span>
        </div>

        {/* Timeline (if provided) */}
        {lead.timeline && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Timeline: <span className="font-medium text-gray-900 dark:text-white">
                {lead.timeline}
              </span>
            </span>
          </div>
        )}

        {/* Lead Expiry */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Expires: <span className="font-medium text-gray-900 dark:text-white">
              {new Date(lead.expiresAt).toLocaleDateString()}
            </span>
            {daysUntilExpiry > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({daysUntilExpiry} days)
              </span>
            )}
          </span>
        </div>

        {/* Credits Required (Marketplace view) */}
        {variant === 'marketplace' && !isClaimed && lead.creditsRequired && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Lock className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {lead.creditsRequired} credits to claim
            </span>
          </div>
        )}

        {/* Quotes Count (Homeowner view) */}
        {variant === 'homeowner' && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {lead.quotesCount || 0} quote{lead.quotesCount !== 1 ? 's' : ''} received
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        {variant === 'marketplace' && !isClaimed && onClaim && (
          <button
            onClick={() => onClaim(lead._id)}
            disabled={claiming || lead.claimsCount >= (lead.maxClaimsAllowed || 5)}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claiming ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2 align-middle"></div>
                Claiming...
              </>
            ) : lead.claimsCount >= (lead.maxClaimsAllowed || 5) ? (
              'Fully Claimed'
            ) : (
              <>
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Claim Lead
              </>
            )}
          </button>
        )}

        {(variant !== 'marketplace' || isClaimed) && onViewDetails && (
          <button
            onClick={() => onViewDetails(lead._id)}
            className="w-full py-2 px-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium rounded-lg transition"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
