'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, MessageSquare, Users, X, Loader2 } from 'lucide-react';
import { searchDashboard, SearchResult } from '@/lib/services/search';

export function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchDashboard(query);
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (err) {
        setError('Search failed');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build flat list of all results for keyboard navigation
  const flatResults = useCallback(() => {
    if (!results) return [];
    const items: Array<{ type: string; item: unknown; href: string }> = [];

    results.requests.forEach((r) => {
      items.push({ type: 'request', item: r, href: `/dashboard/requests/${r.id}` });
    });
    results.quotes.forEach((q) => {
      items.push({ type: 'quote', item: q, href: `/dashboard/requests/${q.leadId}/quotes` });
    });
    results.professionals.forEach((p) => {
      items.push({ type: 'professional', item: p, href: `/pro/${p.id}` });
    });

    return items;
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = flatResults();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = items[selectedIndex];
      if (selected) {
        router.push(selected.href);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleResultClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const hasResults = results && (
    results.requests.length > 0 ||
    results.quotes.length > 0 ||
    results.professionals.length > 0
  );

  const noResults = results && !hasResults;

  let currentIndex = -1;

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search requests, quotes, or professionals..."
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

        {/* Loading indicator or clear button */}
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        ) : query.length > 0 ? (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {error && (
            <div className="px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {noResults && (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {hasResults && (
            <>
              {/* Requests Section */}
              {results.requests.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Requests
                  </div>
                  {results.requests.map((request) => {
                    currentIndex++;
                    const isSelected = selectedIndex === currentIndex;
                    return (
                      <button
                        key={request.id}
                        onClick={() => handleResultClick(`/dashboard/requests/${request.id}`)}
                        className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-50 ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.category} • {request.status}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quotes Section */}
              {results.quotes.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Quotes
                  </div>
                  {results.quotes.map((quote) => {
                    currentIndex++;
                    const isSelected = selectedIndex === currentIndex;
                    return (
                      <button
                        key={quote.id}
                        onClick={() => handleResultClick(`/dashboard/requests/${quote.leadId}/quotes`)}
                        className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-50 ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {quote.professionalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {quote.leadTitle} • AED {quote.total.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Professionals Section */}
              {results.professionals.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                    Professionals
                  </div>
                  {results.professionals.map((pro) => {
                    currentIndex++;
                    const isSelected = selectedIndex === currentIndex;
                    return (
                      <button
                        key={pro.id}
                        onClick={() => handleResultClick(`/pro/${pro.id}`)}
                        className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-gray-50 ${
                          isSelected ? 'bg-primary-50' : ''
                        }`}
                      >
                        <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {pro.businessName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pro.services.slice(0, 2).join(', ')}
                            {pro.rating > 0 && ` • ★ ${pro.rating.toFixed(1)}`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
