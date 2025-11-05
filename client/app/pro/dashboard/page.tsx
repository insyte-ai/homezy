'use client';

import Link from 'next/link';

export default function ProDashboardPage() {
  // Mock data - TODO: Fetch from API
  const stats = {
    profileViews: 0,
    leadsAvailable: 12,
    creditBalance: 0,
    activeQuotes: 0,
  };

  const nextSteps = [
    {
      id: 1,
      icon: '📄',
      title: 'Upload verification documents',
      description: 'Get verified to start claiming leads',
      link: '/pro/dashboard/verification',
      primary: true,
    },
    {
      id: 2,
      icon: '📸',
      title: 'Add portfolio photos',
      description: 'Pros with portfolios get 3x more responses',
      link: '/pro/dashboard/portfolio',
      primary: false,
    },
    {
      id: 3,
      icon: '💰',
      title: 'Purchase credits',
      description: 'Get ready to claim your first lead',
      link: '/pro/dashboard/credits',
      primary: false,
    },
    {
      id: 4,
      icon: '✍️',
      title: 'Complete your bio',
      description: 'Tell homeowners about your experience',
      link: '/pro/dashboard/profile',
      primary: false,
    },
  ];

  const recentLeads = [
    {
      id: 1,
      title: 'Kitchen Remodeling in Dubai Marina',
      category: 'Kitchen Remodeling',
      budget: 'AED 15K-50K',
      location: 'Dubai Marina',
      posted: '2 hours ago',
      claims: 2,
      maxClaims: 5,
    },
    {
      id: 2,
      title: 'Emergency Plumbing Repair',
      category: 'Plumbing',
      budget: 'AED 500-1K',
      location: 'Downtown Dubai',
      posted: '5 hours ago',
      claims: 4,
      maxClaims: 5,
      urgent: true,
    },
    {
      id: 3,
      title: 'AC Installation for Villa',
      category: 'HVAC',
      budget: 'AED 5K-15K',
      location: 'Arabian Ranches',
      posted: '1 day ago',
      claims: 1,
      maxClaims: 5,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-neutral-600">
          Here's what's happening with your business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Profile Views</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.profileViews}</p>
              <p className="text-xs text-neutral-500 mt-1">Last 7 days</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Available Leads</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.leadsAvailable}</p>
              <Link href="/pro/dashboard/leads" className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block">
                Browse leads →
              </Link>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Credit Balance</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.creditBalance}</p>
              <Link href="/pro/dashboard/credits" className="text-xs text-primary-600 hover:text-primary-700 mt-1 inline-block">
                Buy credits →
              </Link>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Active Quotes</p>
              <p className="text-3xl font-bold text-neutral-900">{stats.activeQuotes}</p>
              <p className="text-xs text-neutral-500 mt-1">Pending response</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Next Steps */}
        <div className="lg:col-span-2">
          {/* Next Steps Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">
              Complete Your Setup
            </h2>
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.link}
                  className={`block p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    step.primary
                      ? 'border-primary-600 bg-primary-50 hover:border-primary-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{step.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${step.primary ? 'text-primary-900' : 'text-neutral-900'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${step.primary ? 'text-primary-700' : 'text-neutral-600'}`}>
                        {step.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-neutral-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-neutral-900">
                Recent Leads in Your Area
              </h2>
              <Link href="/pro/dashboard/leads" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">{lead.title}</h3>
                        {lead.urgent && (
                          <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-600">
                        {lead.category} • {lead.location} • {lead.budget}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-sm text-neutral-600">
                      <span>Posted {lead.posted}</span>
                      <span>•</span>
                      <span>{lead.claims}/{lead.maxClaims} claimed</span>
                    </div>
                    <button
                      disabled
                      className="btn btn-outline text-sm opacity-50 cursor-not-allowed"
                      title="Complete verification to claim leads"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Help & Resources */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">Not Verified</p>
                  <p className="text-xs text-neutral-500">Upload documents to get started</p>
                </div>
              </div>
              <Link
                href="/pro/dashboard/verification"
                className="btn btn-primary w-full text-sm"
              >
                Start Verification
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <h3 className="font-semibold mb-3">Market Insights</h3>
            <div className="space-y-3">
              <div>
                <p className="text-blue-100 text-sm">Leads this week</p>
                <p className="text-2xl font-bold">142</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Avg. response time</p>
                <p className="text-2xl font-bold">3.2 hrs</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Top category</p>
                <p className="text-lg font-medium">Plumbing</p>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
            <h3 className="font-semibold text-neutral-900 mb-3">Need Help?</h3>
            <div className="space-y-3 text-sm">
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Getting Started Guide
              </a>
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                FAQs
              </a>
              <a href="#" className="flex items-center text-neutral-700 hover:text-primary-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
