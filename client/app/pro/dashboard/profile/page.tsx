'use client';

import Link from 'next/link';

export default function ProProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/pro/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Your Profile
        </h1>
        <p className="text-neutral-600 mb-8">
          Manage your business profile and service information
        </p>

        <div className="space-y-6">
          <div>
            <label className="label">Business Tagline</label>
            <input type="text" className="input" placeholder="One-line description of your business" maxLength={150} />
            <p className="text-sm text-neutral-500 mt-1">Max 150 characters</p>
          </div>

          <div>
            <label className="label">About Your Business</label>
            <textarea className="input" rows={6} placeholder="Tell homeowners about your experience and what makes you stand out" maxLength={500} />
            <p className="text-sm text-neutral-500 mt-1">0/500 characters</p>
          </div>

          <div>
            <label className="label">Years in Business</label>
            <input type="number" className="input" placeholder="5" min="0" />
          </div>

          <div>
            <label className="label">Team Size</label>
            <input type="number" className="input" placeholder="10" min="1" />
          </div>

          <button className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
