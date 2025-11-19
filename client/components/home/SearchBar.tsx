'use client';

import { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { searchServices, getAllSubservices, type SubService } from '@/lib/services/serviceData';

interface SearchBarProps {
  onSelectService: (serviceId: string) => void;
}

export function SearchBar({ onSelectService }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [filteredServices, setFilteredServices] = useState<SubService[]>([]);
  const [allServices, setAllServices] = useState<SubService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load all services on mount for quick filtering
  useEffect(() => {
    const loadServices = async () => {
      try {
        const services = await getAllSubservices();
        setAllServices(services);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    };
    loadServices();
  }, []);

  // Search services when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredServices([]);
        return;
      }

      if (searchQuery.trim().length < 2) {
        setFilteredServices([]);
        return;
      }

      setIsLoading(true);
      try {
        // First try local filtering for instant results
        const localResults = allServices.filter((service) => {
          const query = searchQuery.toLowerCase();
          return (
            service.name.toLowerCase().includes(query) ||
            service.category?.toLowerCase().includes(query)
          );
        });

        if (localResults.length > 0) {
          setFilteredServices(localResults.slice(0, 10));
        } else {
          // If no local results, try API search
          const results = await searchServices(searchQuery);
          setFilteredServices(results.slice(0, 10));
        }
      } catch (error) {
        console.error('Search failed:', error);
        setFilteredServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, allServices]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredServices.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && filteredServices[focusedIndex]) {
          handleSelectService(filteredServices[focusedIndex].id);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSelectService = (serviceId: string) => {
    const service = filteredServices.find((s) => s.id === serviceId);
    if (service) {
      setSearchQuery(service.name);
      setShowDropdown(false);
      setFocusedIndex(-1);
      onSelectService(serviceId);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowDropdown(true);
    setFocusedIndex(-1);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="What service do you need? (e.g., Plumbing, Kitchen Remodeling)"
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none
                     transition-all duration-200 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && filteredServices.length > 0 && !isLoading && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto">
          {filteredServices.map((service, index) => (
            <button
              key={service.id}
              onClick={() => handleSelectService(service.id)}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors
                         border-b border-gray-50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl
                         ${focusedIndex === index ? 'bg-primary-50' : ''}`}
            >
              <div className="flex items-center gap-3">
                {service.icon && <span className="text-2xl">{service.icon}</span>}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">
                    {service.category && `${service.category} • `}
                    {service.group || 'Home Service'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {showDropdown && isLoading && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <p className="text-gray-500 text-center">Searching...</p>
        </div>
      )}

      {/* No results message */}
      {showDropdown && searchQuery && filteredServices.length === 0 && !isLoading && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <p className="text-gray-500 text-center">
            No services found for &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
