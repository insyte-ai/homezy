/**
 * Lead Success with Matching Professionals
 * Shows after successful lead creation - displays matching pros and allows direct lead creation
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Star, MapPin, Clock, DollarSign, Loader2, Award } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Professional {
  _id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  responseTime?: string;
  location?: {
    emirate: string;
    area?: string;
  };
  services: string[];
  verified?: boolean;
  topPro?: boolean;
  hourlyRate?: {
    min: number;
    max: number;
  };
}

interface LeadSuccessWithProsProps {
  leadId: string;
  serviceCategory: string;
  emirate: string;
  onClose: () => void;
  isGuest?: boolean;
}

export function LeadSuccessWithPros({
  leadId,
  serviceCategory,
  emirate,
  onClose,
  isGuest = false,
}: LeadSuccessWithProsProps) {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedPros, setSelectedPros] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Load matching professionals
  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/pros/matching', {
          params: {
            category: serviceCategory,
            emirate: emirate,
            limit: 10,
          },
        });

        if (response.data.success) {
          setProfessionals(response.data.data.professionals || []);
        }
      } catch (error) {
        console.error('Failed to load professionals:', error);
        toast.error('Failed to load professionals');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfessionals();
  }, [serviceCategory, emirate]);

  const toggleProSelection = (proId: string) => {
    setSelectedPros((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(proId)) {
        newSet.delete(proId);
      } else {
        newSet.add(proId);
      }
      return newSet;
    });
  };

  const handleSendDirectLeads = async () => {
    if (selectedPros.size === 0) {
      toast.error('Please select at least one professional');
      return;
    }

    // Guest users can't send direct leads (requires auth)
    if (isGuest) {
      toast.error('Please check your email to set up your account first, then you can send direct requests.');
      return;
    }

    setIsSending(true);
    try {
      // Send direct leads to selected professionals
      await api.post('/leads/send-to-pros', {
        leadId,
        professionalIds: Array.from(selectedPros),
      });

      toast.success(`Direct requests sent to ${selectedPros.size} professional(s)!`);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to send direct leads:', error);
      toast.error(error.response?.data?.message || 'Failed to send requests');
    } finally {
      setIsSending(false);
    }
  };

  const topThreePros = professionals.slice(0, 3);
  const otherPros = professionals.slice(3);

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Request Posted Successfully!
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isGuest
            ? 'Your request is now live on the marketplace. Professionals will contact you with quotes.'
            : 'Your request is now live on the marketplace. Choose professionals below to send your request directly to them for faster quotes.'}
        </p>

        {/* Guest user email notice */}
        {isGuest && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800">
              <strong>Check your email!</strong> We've sent you a link to manage your requests
              and communicate with professionals.
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600">Finding matching professionals...</p>
        </div>
      )}

      {/* No Professionals Found */}
      {!isLoading && professionals.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-gray-700 mb-4">
            No professionals found matching your requirements yet. Don't worry! Your request is
            still live on the marketplace and professionals can claim it.
          </p>
          <button
            onClick={() => router.push(isGuest ? '/' : '/dashboard')}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            {isGuest ? 'Go to Homepage' : 'Go to Dashboard'}
          </button>
        </div>
      )}

      {/* Top 3 Recommended Professionals */}
      {!isLoading && topThreePros.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Get quotes from the {topThreePros.length} best matches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {topThreePros.map((pro) => (
              <ProCard
                key={pro._id}
                pro={pro}
                isSelected={selectedPros.has(pro._id)}
                onToggle={() => toggleProSelection(pro._id)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* Send Direct Requests Button */}
      {!isLoading && professionals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                {selectedPros.size > 0
                  ? `${selectedPros.size} professional(s) selected`
                  : 'Select professionals to send direct requests'}
              </p>
              <p className="text-sm text-gray-600">
                Homezy will send your project details to these pros, so you can compare quotes
                and availability.
              </p>
            </div>
            <button
              onClick={handleSendDirectLeads}
              disabled={selectedPros.size === 0 || isSending}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                `Send to ${selectedPros.size || '...'} ${selectedPros.size === 1 ? 'pro' : 'pros'}`
              )}
            </button>
          </div>
        </div>
      )}

      {/* All Other Professionals */}
      {!isLoading && otherPros.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">All professionals</h3>
          <div className="space-y-3">
            {otherPros.map((pro) => (
              <ProCard
                key={pro._id}
                pro={pro}
                isSelected={selectedPros.has(pro._id)}
                onToggle={() => toggleProSelection(pro._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Skip and Go to Dashboard/Homepage */}
      <div className="text-center">
        <button
          onClick={() => router.push(isGuest ? '/' : '/dashboard')}
          className="text-gray-600 hover:text-gray-800 underline"
        >
          {isGuest ? 'Skip and go to homepage' : 'Skip and go to dashboard'}
        </button>
      </div>
    </div>
  );
}

// Professional Card Component
interface ProCardProps {
  pro: Professional;
  isSelected: boolean;
  onToggle: () => void;
  featured?: boolean;
}

function ProCard({ pro, isSelected, onToggle, featured = false }: ProCardProps) {
  const initials = `${pro.firstName?.[0] || ''}${pro.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div
      onClick={onToggle}
      className={`
        relative border-2 rounded-xl p-4 cursor-pointer transition-all
        ${isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}
        ${featured ? 'shadow-md' : 'shadow-sm'}
      `}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 right-3">
        <div
          className={`
          w-6 h-6 rounded border-2 flex items-center justify-center
          ${isSelected ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300'}
        `}
        >
          {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
        </div>
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {pro.avatar ? (
            <img
              src={pro.avatar}
              alt={pro.businessName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-700">{initials}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 mb-1 truncate">{pro.businessName}</h4>

          {/* Rating */}
          {pro.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-gray-900">{pro.rating.toFixed(1)}</span>
              </div>
              {pro.reviewCount && (
                <span className="text-sm text-gray-600">({pro.reviewCount})</span>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {pro.topPro && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                <Award className="h-3 w-3" />
                Top Pro
              </span>
            )}
            {pro.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {pro.completedJobs !== undefined && (
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {pro.completedJobs} hires
              </span>
            )}
            {pro.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {pro.location.emirate}
              </span>
            )}
            {pro.responseTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {pro.responseTime}
              </span>
            )}
          </div>

          {/* Pricing */}
          {pro.hourlyRate && (
            <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-gray-900">
              <DollarSign className="h-4 w-4" />
              AED {pro.hourlyRate.min}-{pro.hourlyRate.max}/hr
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
