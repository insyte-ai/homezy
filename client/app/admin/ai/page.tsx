'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface KnowledgeBaseStats {
  articleCount: number;
  isSemanticSearchAvailable: boolean;
}

export default function AIPage() {
  const [isReloading, setIsReloading] = useState(false);
  const [stats, setStats] = useState<KnowledgeBaseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleReloadKnowledgeBase = async () => {
    setIsReloading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await api.post('/admin/knowledge-base/reload');
      setStats(response.data.data);
      setSuccessMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reload knowledge base');
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">AI Configuration</h1>
      <p className="text-gray-600 mt-1">Manage AI-powered features and knowledge base</p>

      <div className="mt-8 space-y-6">
        {/* Knowledge Base Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Knowledge Base</h2>
          <p className="text-gray-600 mb-4">
            The knowledge base provides HomeGPT with curated information about UAE home improvement,
            regulations, best practices, and maintenance guides.
          </p>

          {/* Stats Display */}
          {stats && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Articles Loaded</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.articleCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semantic Search</p>
                  <p className="text-2xl font-semibold">
                    {stats.isSemanticSearchAvailable ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-yellow-600">Fallback Mode</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Reload Button */}
          <button
            onClick={handleReloadKnowledgeBase}
            disabled={isReloading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isReloading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Reloading...
              </>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Reload Knowledge Base
              </>
            )}
          </button>

          <p className="mt-3 text-sm text-gray-500">
            Reloads all knowledge base articles from disk and re-indexes them in Weaviate for semantic search.
          </p>
        </div>

        {/* Weaviate Status Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Weaviate Vector Database</h2>
          <p className="text-gray-600 mb-4">
            Weaviate provides semantic search capabilities for the knowledge base, enabling HomeGPT
            to find relevant articles based on meaning rather than just keywords.
          </p>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              Click &quot;Reload Knowledge Base&quot; above to check Weaviate connection status and view article counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
