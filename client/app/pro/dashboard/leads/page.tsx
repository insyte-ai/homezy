'use client';

export default function ProLeadsPage() {
  const leads = [
    { id: 1, title: 'Kitchen Remodeling in Dubai Marina', category: 'Kitchen Remodeling', budget: 'AED 15K-50K', location: 'Dubai Marina', posted: '2 hours ago', claims: 2, maxClaims: 5 },
    { id: 2, title: 'Emergency Plumbing Repair', category: 'Plumbing', budget: 'AED 500-1K', location: 'Downtown Dubai', posted: '5 hours ago', claims: 4, maxClaims: 5, urgent: true },
    { id: 3, title: 'AC Installation for Villa', category: 'HVAC', budget: 'AED 5K-15K', location: 'Arabian Ranches', posted: '1 day ago', claims: 1, maxClaims: 5 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Available Leads
        </h1>
        <p className="text-neutral-600">
          Browse and claim leads matching your services
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
        <p className="text-amber-900">
          <strong>⚠️ Verification Required:</strong> Complete your verification to start claiming leads.
        </p>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-semibold text-neutral-900">{lead.title}</h3>
                  {lead.urgent && (
                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded">
                      URGENT
                    </span>
                  )}
                </div>
                <p className="text-neutral-600">
                  {lead.category} • {lead.location} • {lead.budget}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-neutral-600">
                <span>Posted {lead.posted}</span>
                <span>•</span>
                <span>{lead.claims}/{lead.maxClaims} pros claimed</span>
              </div>
              <button disabled className="btn btn-outline opacity-50 cursor-not-allowed" title="Complete verification first">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
