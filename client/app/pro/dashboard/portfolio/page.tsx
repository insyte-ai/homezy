'use client';

import Link from 'next/link';

export default function ProPortfolioPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/pro/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Portfolio
            </h1>
            <p className="text-neutral-600">
              Showcase your best work to win more projects
            </p>
          </div>
          <button className="btn btn-primary">
            Add Project
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Pros with 10+ portfolio photos get 3x more quote requests. Add before/after photos for best results!
          </p>
        </div>

        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects yet</h3>
          <p className="text-neutral-600 mb-4">Start by adding your first project</p>
          <button className="btn btn-primary">
            Add Your First Project
          </button>
        </div>
      </div>
    </div>
  );
}
