'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Briefcase,
  Filter,
  Users,
  CheckCircle,
  Award,
  MessageCircle
} from 'lucide-react';
import { searchProfessionals, type SearchProsParams } from '@/lib/services/professional';
import type { ProProfile } from '@homezy/shared';
import { MultiStepLeadForm } from '@/components/lead-form/MultiStepLeadForm';
import { useAuthStore } from '@/store/authStore';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ChatPanelAwareContainer } from '@/components/layout/ChatPanelAwareContainer';
import { useChatPanelStore } from '@/store/chatPanelStore';

interface Professional {
  id: string;
  businessName: string;
  slug?: string;
  profilePhoto?: string;
  proProfile: ProProfile;
}

export default function BrowseProfessionalsPage() {
  const { user } = useAuthStore();
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEmirate, setSelectedEmirate] = useState('all');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Lead form state
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const categories = [
    'All Categories',
    'Plumbing',
    'Electrical',
    'HVAC',
    'Painting',
    'Carpentry',
    'Flooring',
    'Kitchen Remodeling',
    'Bathroom Remodeling',
    'General Contracting',
    'Roofing',
    'Landscaping',
  ];

  const emirates = [
    'All Emirates',
    'Dubai',
    'Abu Dhabi',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah',
  ];

  // Fetch professionals based on filters
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true);

        const params: SearchProsParams = {
          limit: 12,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        if (selectedEmirate !== 'all') {
          params.emirate = selectedEmirate;
        }

        if (minRating) {
          params.minRating = minRating;
        }

        const data = await searchProfessionals(params);
        setProfessionals(data.professionals);
        setTotalResults(data.pagination.total);
      } catch (error) {
        console.error('Failed to fetch professionals:', error);
        setProfessionals([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, [searchQuery, selectedCategory, selectedEmirate, minRating]);

  const handleRequestQuote = (pro: Professional, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation

    // Only block if user is a professional (they shouldn't request quotes)
    if (user?.role === 'pro') {
      alert('Professionals cannot request quotes');
      return;
    }

    // Allow both authenticated homeowners and guests to request quotes
    // The MultiStepLeadForm handles contact info collection for guests
    setSelectedProfessional(pro);
    setShowLeadForm(true);
  };

  const getVerificationBadge = (verificationStatus: string, verificationLevel?: string) => {
    if (verificationStatus !== 'approved') return null;

    if (verificationLevel === 'comprehensive') {
      return (
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle className="h-3.5 w-3.5 text-primary-600" />
          <CheckCircle className="h-3.5 w-3.5 text-primary-600 -ml-2" />
          <span className="text-primary-600 font-medium">Verified Pro</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs">
        <CheckCircle className="h-3.5 w-3.5 text-primary-600" />
        <span className="text-primary-600 font-medium">Verified</span>
      </div>
    );
  };

  const getPricingDisplay = (hourlyRateMin?: number, hourlyRateMax?: number) => {
    if (!hourlyRateMin && !hourlyRateMax) return null;

    if (hourlyRateMin && hourlyRateMax && hourlyRateMin !== hourlyRateMax) {
      return `AED ${hourlyRateMin}-${hourlyRateMax}/hr`;
    }
    return `From AED ${hourlyRateMin || hourlyRateMax}/hr`;
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50">
      <ChatPanelAwareContainer className="container-custom py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Home Improvement Professionals</h1>
          <p className="text-gray-600">
            Search for a service or browse by category to find verified professionals in the UAE.
          </p>
        </div>

        {/* Search Bar - Prominent */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a service (e.g., plumbing, electrical, painting)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="xl:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Service Category</h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {categories.map((cat) => {
                    const catValue = cat.toLowerCase().replace(/\s+/g, ' ');
                    const isSelected = selectedCategory === catValue;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(isSelected ? 'all' : catValue)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          isSelected
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Location</h4>
                <select
                  value={selectedEmirate}
                  onChange={(e) => setSelectedEmirate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {emirates.map((emirate) => (
                    <option key={emirate} value={emirate.toLowerCase().replace(/\s+/g, ' ')}>
                      {emirate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Rating</h4>
                <select
                  value={minRating || 'all'}
                  onChange={(e) => setMinRating(e.target.value === 'all' ? undefined : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>

              {/* Results Count */}
              {totalResults > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{totalResults}</span> professional{totalResults !== 1 ? 's' : ''} found
                  </p>
                </div>
              )}

              {/* Reset Filters */}
              {(selectedCategory !== 'all' || selectedEmirate !== 'all' || minRating || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedEmirate('all');
                    setMinRating(undefined);
                    setSearchQuery('');
                  }}
                  className="w-full mt-4 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">

            {/* Results */}
            {loading ? (
              <div className={`grid gap-4 ${isChatPanelOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : !professionals || professionals.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Professionals Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No professionals match your current filters. Try adjusting your search criteria or request quotes to get matched automatically.
                </p>
                <Link href="/dashboard/create-request" className="btn btn-primary inline-flex items-center gap-2">
                  Request Quotes
                </Link>
              </div>
            ) : (
              <div className={`grid gap-4 ${isChatPanelOpen ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {professionals.map((pro) => {
                  const pricing = getPricingDisplay(pro.proProfile.hourlyRateMin, pro.proProfile.hourlyRateMax);

                  return (
                    <div
                      key={pro.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                    >
                  <Link
                    href={`/pros/${pro.id}/${pro.slug || 'profile'}`}
                    className="p-4 flex-1"
                  >
                    {/* Profile Photo and Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {pro.profilePhoto ? (
                          <img
                            src={pro.profilePhoto}
                            alt={pro.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Briefcase className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
                          {pro.businessName}
                        </h3>
                        {getVerificationBadge(
                          pro.proProfile.verificationStatus,
                          'basic' // TODO: Add comprehensiveVerification field to ProProfile type
                        )}
                      </div>
                    </div>

                    {/* Tagline */}
                    {pro.proProfile.tagline && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {pro.proProfile.tagline}
                      </p>
                    )}

                    {/* Rating and Stats */}
                    <div className="space-y-1.5 mb-2">
                      {pro.proProfile.rating && pro.proProfile.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium text-gray-900 text-sm">
                              {pro.proProfile.rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({pro.proProfile.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Years in Business */}
                      {pro.proProfile.yearsInBusiness && pro.proProfile.yearsInBusiness > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Award className="h-3.5 w-3.5 text-gray-400" />
                          <span>{pro.proProfile.yearsInBusiness} yrs exp</span>
                        </div>
                      )}

                      {/* Pricing */}
                      {pricing && (
                        <div className="text-xs font-medium text-primary-600">
                          {pricing}
                        </div>
                      )}
                    </div>

                    {/* Categories */}
                    {pro.proProfile.categories && pro.proProfile.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pro.proProfile.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {category}
                          </span>
                        ))}
                        {pro.proProfile.categories.length > 2 && (
                          <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                            +{pro.proProfile.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Service Areas */}
                    {pro.proProfile.serviceAreas && pro.proProfile.serviceAreas.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">
                          {pro.proProfile.serviceAreas.map(area => area.emirate).join(', ')}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4 pt-3 flex gap-2 border-t border-gray-200 mt-auto">
                    <Link
                      href={`/pros/${pro.id}/${pro.slug || 'profile'}`}
                      className="flex-1 text-center py-2 text-primary-600 text-sm font-medium border border-primary-200 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={(e) => handleRequestQuote(pro, e)}
                      className="flex-1 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Request Quote
                    </button>
                  </div>
                </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Direct Lead Form */}
        {selectedProfessional && showLeadForm && (
          <MultiStepLeadForm
            serviceId={selectedProfessional.proProfile.categories?.[0] || 'general contracting'}
            onClose={() => {
              setShowLeadForm(false);
              setSelectedProfessional(null);
            }}
            professionalId={selectedProfessional.id}
            professionalName={selectedProfessional.businessName}
            professionalPhoto={selectedProfessional.profilePhoto}
          />
        )}
      </ChatPanelAwareContainer>
      </div>
      <PublicFooter />
    </>
  );
}
