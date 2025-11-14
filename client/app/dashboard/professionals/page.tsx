'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Star,
  Shield,
  Briefcase,
  MessageSquare,
  Filter,
  Users
} from 'lucide-react';

export default function ProfessionalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEmirate, setSelectedEmirate] = useState('all');

  // TODO: This will be replaced with actual API call
  const professionals: any[] = [];
  const loading = false;

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
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="all">All Ratings</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>Advanced filters coming soon...</span>
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
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Professional Directory Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            We're building a comprehensive directory of verified professionals. In the meantime, create a lead to get matched with professionals automatically.
          </p>
          <Link href="/dashboard/leads" className="btn btn-primary inline-flex items-center gap-2">
            Create a Lead
          </Link>

          {/* Placeholder for future */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-gray-50 rounded-lg p-6">
              <Shield className="h-8 w-8 text-primary-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Verified Professionals</h4>
              <p className="text-sm text-gray-600">
                All professionals are verified with licenses and insurance
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <Star className="h-8 w-8 text-primary-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Rated & Reviewed</h4>
              <p className="text-sm text-gray-600">
                Read authentic reviews from other homeowners
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <Briefcase className="h-8 w-8 text-primary-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Portfolio Showcases</h4>
              <p className="text-sm text-gray-600">
                View past work and project galleries
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Professional cards will go here */}
        </div>
      )}
    </div>
  );
}
