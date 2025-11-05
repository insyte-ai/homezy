'use client';

import Link from 'next/link';

export default function ProVerificationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/pro/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Verification Documents
        </h1>
        <p className="text-neutral-600 mb-8">
          Upload your documents to get verified and start claiming leads
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">Why verify?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Start claiming and responding to leads</li>
            <li>✓ Build trust with homeowners</li>
            <li>✓ Get 15% credit discount with comprehensive verification</li>
            <li>✓ Priority placement in search results</li>
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <label className="label">Trade/Business License <span className="text-red-500">*</span></label>
            <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-neutral-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-neutral-500">PDF, PNG, JPG up to 10MB</p>
            </div>
          </div>

          <div>
            <label className="label">Insurance Certificate <span className="text-red-500">*</span></label>
            <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-neutral-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2 text-sm text-neutral-600">
                <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-neutral-500">Minimum AED 500K liability coverage</p>
            </div>
          </div>

          <button className="btn btn-primary">
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
