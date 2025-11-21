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
  CheckCircle
} from 'lucide-react';
import { searchProfessionals, type SearchProsParams } from '@/lib/services/professional';
import type { ProProfile } from '@homezy/shared';

interface Professional {
  id: string;
  businessName: string;
  slug?: string;
  profilePhoto?: string;
  proProfile: ProProfile;
}

export default function ProfessionalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEmirate, setSelectedEmirate] = useState('all');
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Professionals</h1>
        <p className="text-gray-600">
          Search and connect with verified home improvement professionals in the UAE
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by business name, service, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {emirates.map((emirate) => (
                <option key={emirate} value={emirate.toLowerCase()}>
                  {emirate}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min. Rating</label>
            <select
              value={minRating || 'all'}
              onChange={(e) => setMinRating(e.target.value === 'all' ? undefined : parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {totalResults > 0 && (
              <span className="font-medium text-gray-900">
                {totalResults} professional{totalResults !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <Link href="/create-request" className="btn btn-primary inline-flex items-center gap-2">
            Request Quotes
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <Link
              key={pro.id}
              href={`/professionals/${pro.id}/${pro.slug || 'profile'}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Profile Photo */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {pro.profilePhoto ? (
                    <img
                      src={pro.profilePhoto}
                      alt={pro.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Briefcase className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {pro.businessName}
                  </h3>
                  {pro.proProfile.verificationStatus === 'approved' && (
                    <div className="flex items-center gap-1 text-xs">
                      <CheckCircle className="h-3.5 w-3.5 text-primary-600" />
                      <span className="text-primary-600 font-medium">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tagline */}
              {pro.proProfile.tagline && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {pro.proProfile.tagline}
                </p>
              )}

              {/* Rating */}
              {pro.proProfile.rating && pro.proProfile.rating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">
                      {pro.proProfile.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({pro.proProfile.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Categories */}
              {pro.proProfile.categories && pro.proProfile.categories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {pro.proProfile.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {category}
                    </span>
                  ))}
                  {pro.proProfile.categories.length > 3 && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      +{pro.proProfile.categories.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Service Areas */}
              {pro.proProfile.serviceAreas && pro.proProfile.serviceAreas.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {pro.proProfile.serviceAreas.map(area => area.emirate).join(', ')}
                  </span>
                </div>
              )}

              {/* View Profile Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-primary-600 text-sm font-medium hover:text-primary-700">
                  View Profile →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
