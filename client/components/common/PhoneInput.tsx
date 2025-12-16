'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter phone number',
  className = '',
  id,
  required = false,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Parse the value to extract country code and number
  const getCountryFromValue = () => {
    if (!value) return countries[0]; // Default to UAE

    // Find matching country by dial code (check longer codes first)
    const sortedCountries = [...countries].sort(
      (a, b) => b.dialCode.length - a.dialCode.length
    );
    const matchingCountry = sortedCountries.find((country) =>
      value.startsWith(country.dialCode)
    );

    return matchingCountry || countries[0];
  };

  const [selectedCountry, setSelectedCountry] = useState<Country>(
    getCountryFromValue()
  );

  // Extract phone number without country code
  const phoneNumber = value.replace(selectedCountry.dialCode, '').trim();

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    // Update the full phone number with new country code
    onChange(`${country.dialCode} ${phoneNumber}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/[^0-9\s]/g, ''); // Only allow numbers and spaces
    onChange(`${selectedCountry.dialCode} ${newNumber}`);
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="h-full px-3 py-2 border border-r-0 border-neutral-300 rounded-l-lg bg-white hover:bg-neutral-50 focus:outline-none focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="text-lg">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-neutral-700">
              {selectedCountry.dialCode}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute left-0 mt-1 w-72 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 max-h-80 overflow-hidden flex flex-col">
                {/* Search */}
                <div className="p-2 border-b border-neutral-200">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search country..."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-primary-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Country List */}
                <div className="overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full px-4 py-2 text-left hover:bg-neutral-50 flex items-center gap-3 ${
                        selectedCountry.code === country.code
                          ? 'bg-primary-50'
                          : ''
                      }`}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {country.name}
                        </p>
                      </div>
                      <span className="text-sm text-neutral-600">
                        {country.dialCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-r-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export default PhoneInput;
