'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { completeOnboarding } from '@/lib/services/professional';
import toast from 'react-hot-toast';

// Service categories from PRD
const SERVICE_CATEGORIES = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'hvac', name: 'HVAC (Air Conditioning)', icon: '❄️' },
  { id: 'general-contracting', name: 'General Contracting', icon: '🏗️' },
  { id: 'roofing', name: 'Roofing', icon: '🏠' },
  { id: 'painting-wallpaper', name: 'Painting & Wallpaper', icon: '🎨' },
  { id: 'flooring', name: 'Flooring', icon: '📏' },
  { id: 'kitchen-remodeling', name: 'Kitchen Remodeling', icon: '🍳' },
  { id: 'bathroom-remodeling', name: 'Bathroom Remodeling', icon: '🚿' },
  { id: 'carpentry', name: 'Carpentry', icon: '🪚' },
  { id: 'masonry-tiling', name: 'Masonry & Tiling', icon: '🧱' },
  { id: 'landscaping-garden', name: 'Landscaping & Garden', icon: '🌳' },
  { id: 'windows-doors', name: 'Windows & Doors', icon: '🚪' },
  { id: 'interior-design', name: 'Interior Design', icon: '🎨' },
  { id: 'architecture', name: 'Architecture', icon: '📐' },
  { id: 'waterproofing-insulation', name: 'Waterproofing & Insulation', icon: '💧' },
  { id: 'smart-home-security', name: 'Smart Home & Security', icon: '🔐' },
  { id: 'pest-control', name: 'Pest Control', icon: '🐛' },
  { id: 'cleaning-services', name: 'Cleaning Services', icon: '🧹' },
  { id: 'pool-spa', name: 'Pool & Spa', icon: '🏊' },
  { id: 'appliance-repair', name: 'Appliance Repair & Installation', icon: '🔌' },
  { id: 'handyman-services', name: 'Handyman Services', icon: '🛠️' },
];

const UAE_EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

const BUSINESS_TYPES = [
  { value: 'sole-proprietor', label: 'Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
];

interface OnboardingData {
  // Step 1
  primaryCategory: string;
  additionalCategories: string[];

  // Step 2
  businessName: string;
  businessType: string;

  // Step 3
  primaryEmirate: string;
  serviceRadius: number;

  // Step 4
  profilePhotoUrl: string;
}

export default function ProOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [categorySearch, setCategorySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    primaryCategory: '',
    additionalCategories: [],
    businessName: '',
    businessType: 'sole-proprietor',
    primaryEmirate: '',
    serviceRadius: 50,
    profilePhotoUrl: '',
  });

  // Check if user is pro
  useEffect(() => {
    if (user && !user.role?.startsWith('pro')) {
      router.push('/');
    }
  }, [user, router]);

  const filteredCategories = SERVICE_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategoryToggle = (categoryId: string, isPrimary = false) => {
    if (isPrimary) {
      setFormData({ ...formData, primaryCategory: categoryId });
    } else {
      setFormData(prev => ({
        ...prev,
        additionalCategories: prev.additionalCategories.includes(categoryId)
          ? prev.additionalCategories.filter(id => id !== categoryId)
          : [...prev.additionalCategories, categoryId],
      }));
    }
  };

  const handleNext = () => {
    // Validation for current step
    if (currentStep === 1 && !formData.primaryCategory) {
      setError('Please select your primary service category');
      return;
    }
    if (currentStep === 2 && !formData.businessName) {
      setError('Please enter your business name');
      return;
    }
    if (currentStep === 3 && !formData.primaryEmirate) {
      setError('Please select your primary service emirate');
      return;
    }

    setError('');
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipToDashboard = async () => {
    // Save progress if required fields are filled
    setIsSubmitting(true);
    try {
      // Only save if we have minimum required data
      if (formData.businessName && formData.primaryCategory && formData.primaryEmirate) {
        await completeOnboarding({
          businessName: formData.businessName,
          businessType: formData.businessType as 'sole-proprietor' | 'llc' | 'corporation',
          categories: [formData.primaryCategory, ...formData.additionalCategories],
          primaryEmirate: formData.primaryEmirate,
          serviceRadius: formData.serviceRadius,
        });
      }
      router.push('/pro/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unable to save your progress');
      toast.error('Unable to save progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.businessName || !formData.primaryCategory || !formData.primaryEmirate) {
        setError('Please complete all required fields');
        return;
      }

      await completeOnboarding({
        businessName: formData.businessName,
        businessType: formData.businessType as 'sole-proprietor' | 'llc' | 'corporation',
        categories: [formData.primaryCategory, ...formData.additionalCategories],
        primaryEmirate: formData.primaryEmirate,
        serviceRadius: formData.serviceRadius,
      });

      router.push('/pro/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Unable to complete onboarding');
      toast.error('Unable to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'What service do you provide?';
      case 2: return 'Tell us about your business';
      case 3: return 'Where do you work?';
      case 4: return 'Add your business photo';
      case 5: return 'You\'re all set!';
      default: return '';
    }
  };

  const selectedPrimaryCategory = SERVICE_CATEGORIES.find(c => c.id === formData.primaryCategory);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-600">
              Step {currentStep} of 5
            </div>
            <button
              onClick={handleSkipToDashboard}
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Save and continue later
            </button>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Banner (Step 1 only) */}
        {currentStep === 1 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <p className="text-green-900">
                <strong>You're in demand!</strong> Over 500+ home improvement leads posted in Dubai last month.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {getStepTitle()}
          </h1>

          {currentStep < 5 && (
            <p className="text-neutral-600 mb-8">
              {currentStep === 1 && "You'll show up in search results and get leads for all services you select."}
              {currentStep === 2 && "This helps us customize Homezy for your business and make recommendations."}
              {currentStep === 3 && "Your leads will match your availability, work areas, and other preferences."}
              {currentStep === 4 && "Homeowners prefer pros with a clear profile photo or logo."}
            </p>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Step 1: Service Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="label">
                  Search for your service
                </label>
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="input"
                  placeholder="e.g., plumbing, electrical, painting..."
                />
              </div>

              {/* Primary Category */}
              <div>
                <label className="label mb-3">
                  Select your primary service <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id, true)}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all text-left ${
                        formData.primaryCategory === category.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <span className="font-medium text-neutral-900">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Categories */}
              {formData.primaryCategory && (
                <div>
                  <label className="label mb-3">
                    Select any additional services you provide (optional)
                  </label>
                  <p className="text-sm text-neutral-600 mb-3">
                    You can add more services later from your dashboard
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                    {SERVICE_CATEGORIES.filter(c => c.id !== formData.primaryCategory).map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.additionalCategories.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-neutral-700">{category.name}</span>
                      </label>
                    ))}
                  </div>
                  {formData.additionalCategories.length > 0 && (
                    <p className="mt-2 text-sm text-neutral-600">
                      {formData.additionalCategories.length} additional service{formData.additionalCategories.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Business Basics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="businessName" className="label">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="input"
                  placeholder="e.g., Dubai Pro Plumbing LLC"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="label">
                  Business Type
                </label>
                <select
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="input"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  <strong>Your contact info:</strong> We'll use the email and phone number you registered with ({user?.email}, {user?.phone || 'Not provided'}) to send you lead notifications.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Service Area */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="emirate" className="label">
                  Primary Emirate <span className="text-red-500">*</span>
                </label>
                <select
                  id="emirate"
                  required
                  value={formData.primaryEmirate}
                  onChange={(e) => setFormData({ ...formData, primaryEmirate: e.target.value })}
                  className="input"
                >
                  <option value="">Select an emirate</option>
                  {UAE_EMIRATES.map((emirate) => (
                    <option key={emirate} value={emirate}>
                      {emirate}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="serviceRadius" className="label">
                  Service Radius: {formData.serviceRadius} km
                </label>
                <input
                  id="serviceRadius"
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={formData.serviceRadius}
                  onChange={(e) => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) })}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>10 km</span>
                  <span>200 km</span>
                </div>
                <p className="mt-2 text-sm text-neutral-600">
                  How far are you willing to travel for projects?
                </p>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  <strong>Note:</strong> You can add more emirates and specify exact neighborhoods later from your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Profile Photo */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <svg
                  className="mx-auto h-16 w-16 text-neutral-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-primary-600 hover:text-primary-500">
                      Upload a photo or logo
                    </span>
                    <input id="photo-upload" name="photo-upload" type="file" className="sr-only" accept="image/*" />
                  </label>
                  <p className="mt-1 text-xs text-neutral-500">PNG, JPG, GIF up to 5MB</p>
                  <p className="mt-2 text-sm text-neutral-600">
                    Upload a clear image that represents your brand
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  💡 <strong>New pro tip:</strong> Pros with a profile photo get 3x more responses from homeowners.
                </p>
              </div>

              <button
                onClick={handleNext}
                className="text-sm text-neutral-600 hover:text-neutral-900 underline"
              >
                Skip for now (you can add this later)
              </button>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Welcome to Homezy, {user?.firstName}!
              </h2>
              <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
                Your basic profile is ready. You can now access your dashboard and start exploring leads.
              </p>

              {selectedPrimaryCategory && (
                <div className="bg-neutral-50 rounded-lg p-4 mb-8 max-w-md mx-auto text-left">
                  <h3 className="font-semibold text-neutral-900 mb-2">Your Profile Summary:</h3>
                  <ul className="space-y-2 text-sm text-neutral-700">
                    <li>✓ Primary service: <strong>{selectedPrimaryCategory.name}</strong></li>
                    {formData.additionalCategories.length > 0 && (
                      <li>✓ Additional services: <strong>{formData.additionalCategories.length}</strong></li>
                    )}
                    <li>✓ Business: <strong>{formData.businessName}</strong></li>
                    <li>✓ Service area: <strong>{formData.primaryEmirate}</strong> ({formData.serviceRadius}km radius)</li>
                  </ul>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 max-w-xl mx-auto text-left">
                <h3 className="font-semibold text-amber-900 mb-3">⏳ Complete Your Profile to Start Claiming Leads</h3>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li>• Upload verification documents (license & insurance)</li>
                  <li>• Add your bio and tagline (30% more responses)</li>
                  <li>• Upload portfolio photos (3x more quote requests)</li>
                  <li>• Set your pricing and availability</li>
                </ul>
                <p className="mt-3 text-sm text-amber-800">
                  You can complete these steps from your dashboard. <strong>Verification review typically takes 48 hours.</strong>
                </p>
              </div>

              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn btn-primary px-8 py-3 text-lg"
              >
                {isSubmitting ? 'Setting up...' : 'Go to Dashboard'}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-neutral-200">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                {currentStep === 4 ? 'Continue' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
