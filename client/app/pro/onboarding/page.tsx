'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { completeOnboarding, uploadVerificationDocument } from '@/lib/services/professional';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';

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
  firstName: string;
  lastName: string;
  phone: string;
  businessName: string;
  businessType: string;
  tradeLicenseNumber: string;
  vatNumber: string;

  // Step 3
  primaryEmirate: string;
  serviceRadius: number;

  // Step 4 - Verification Documents
  tradeLicenseFile: File | null;
  vatTrnFile: File | null;

  // Step 5
  profilePhotoFile: File | null;
}

export default function ProOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [categorySearch, setCategorySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState<OnboardingData>({
    primaryCategory: '',
    additionalCategories: [],
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    businessName: '',
    businessType: 'sole-proprietor',
    tradeLicenseNumber: '',
    vatNumber: '',
    primaryEmirate: '',
    serviceRadius: 50,
    tradeLicenseFile: null,
    vatTrnFile: null,
    profilePhotoFile: null,
  });

  // Fetch service categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const subservices = await getAllSubservices();
        setServiceCategories(subservices);
      } catch (err) {
        console.error('Failed to load service categories:', err);
        toast.error('Failed to load service categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Check if user is pro and redirect if onboarding is already complete
  useEffect(() => {
    if (!user) return;

    if (!user.role?.startsWith('pro')) {
      router.push('/');
      return;
    }

    // If onboarding is already complete, redirect to dashboard
    if (user.proOnboardingCompleted) {
      router.push('/pro/dashboard');
    }
  }, [user, router]);

  const filteredCategories = serviceCategories.filter(cat =>
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
    if (currentStep === 2) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please enter your first and last name');
        return;
      }
      if (!formData.phone) {
        setError('Please enter your phone number');
        return;
      }
      if (!formData.businessName) {
        setError('Please enter your business name');
        return;
      }
      if (!formData.tradeLicenseNumber) {
        setError('Please enter your trade license number');
        return;
      }
      if (!formData.vatNumber) {
        setError('Please enter your VAT registration number');
        return;
      }
    }
    if (currentStep === 3 && !formData.primaryEmirate) {
      setError('Please select your primary service emirate');
      return;
    }
    if (currentStep === 4) {
      if (!formData.tradeLicenseFile) {
        setError('Please upload your trade license (required for verification)');
        return;
      }
      if (!formData.vatTrnFile) {
        setError('Please upload your VAT TRN certificate (required for verification)');
        return;
      }
    }

    setError('');
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'tradeLicense' | 'vat') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    if (fileType === 'tradeLicense') {
      setFormData({ ...formData, tradeLicenseFile: file });
    } else {
      setFormData({ ...formData, vatTrnFile: file });
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setFormData({ ...formData, profilePhotoFile: file });
  };

  const handleSkipToDashboard = async () => {
    // Save progress if required fields are filled
    setIsSubmitting(true);
    try {
      // Only save if we have minimum required data
      if (formData.firstName && formData.lastName && formData.phone && formData.businessName && formData.primaryCategory && formData.primaryEmirate) {
        await completeOnboarding({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          businessName: formData.businessName,
          businessType: formData.businessType as 'sole-proprietor' | 'llc' | 'corporation',
          tradeLicenseNumber: formData.tradeLicenseNumber,
          vatNumber: formData.vatNumber,
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
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.businessName || !formData.primaryCategory || !formData.primaryEmirate) {
        setError('Please complete all required fields');
        return;
      }

      if (!formData.tradeLicenseFile) {
        setError('Please upload your trade license');
        return;
      }

      if (!formData.vatTrnFile) {
        setError('Please upload your VAT TRN certificate');
        return;
      }

      // Complete onboarding first
      await completeOnboarding({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType as 'sole-proprietor' | 'llc' | 'corporation',
        tradeLicenseNumber: formData.tradeLicenseNumber,
        vatNumber: formData.vatNumber,
        categories: [formData.primaryCategory, ...formData.additionalCategories],
        primaryEmirate: formData.primaryEmirate,
        serviceRadius: formData.serviceRadius,
      });

      // Upload verification documents
      toast.loading('Uploading verification documents...');

      // Upload trade license
      await uploadVerificationDocument(formData.tradeLicenseFile, 'license');

      // Upload VAT TRN certificate
      await uploadVerificationDocument(formData.vatTrnFile, 'vat');

      toast.dismiss();
      toast.success('Onboarding completed! Your documents are under review.');

      // Use full page reload to refresh user state (like Tradezy)
      // This ensures the dashboard gets fresh user data from the server
      window.location.href = '/pro/dashboard';
    } catch (err: any) {
      toast.dismiss();
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
      case 4: return 'Upload verification documents';
      case 5: return 'Add your business photo';
      case 6: return 'You\'re all set!';
      default: return '';
    }
  };

  const selectedPrimaryCategory = serviceCategories.find(c => c.id === formData.primaryCategory);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-neutral-600">
              Step {currentStep} of 6
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
              style={{ width: `${(currentStep / 6) * 100}%` }}
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
                {loadingCategories ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-neutral-600">Loading services...</span>
                  </div>
                ) : (
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
                        {category.icon && <span className="text-2xl mr-3">{category.icon}</span>}
                        <div className="flex-1">
                          <span className="font-medium text-neutral-900">{category.name}</span>
                          {category.category && (
                            <span className="block text-xs text-neutral-500 mt-1">{category.category}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Categories */}
              {formData.primaryCategory && !loadingCategories && (
                <div>
                  <label className="label mb-3">
                    Select any additional services you provide (optional)
                  </label>
                  <p className="text-sm text-neutral-600 mb-3">
                    You can add more services later from your dashboard
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-neutral-200 rounded-lg p-4">
                    {serviceCategories.filter(c => c.id !== formData.primaryCategory).map((category) => (
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

          {/* Step 2: Personal & Business Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="label">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="label">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="+971 50 123 4567"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Homeowners will see this number when you respond to their leads
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Business Details</h3>

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

                  <div>
                    <label htmlFor="tradeLicenseNumber" className="label">
                      Trade License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="tradeLicenseNumber"
                      type="text"
                      required
                      value={formData.tradeLicenseNumber}
                      onChange={(e) => setFormData({ ...formData, tradeLicenseNumber: e.target.value })}
                      className="input"
                      placeholder="e.g., 123456"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Enter your business trade license number
                    </p>
                  </div>

                  <div>
                    <label htmlFor="vatNumber" className="label">
                      VAT Registration Number (TRN) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="vatNumber"
                      type="text"
                      required
                      value={formData.vatNumber}
                      onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                      className="input"
                      placeholder="e.g., 100123456700003"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Enter your 15-digit VAT Tax Registration Number
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  <strong>Your contact info:</strong> We'll use your email ({user?.email}) and the phone number above to send you lead notifications.
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

          {/* Step 4: Verification Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-900">Why verification matters</h3>
                    <div className="mt-2 text-sm text-blue-800">
                      <p>Verified professionals get:</p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>5-15% discount on lead costs</li>
                        <li>Higher visibility in search results</li>
                        <li>Trust badge on your profile</li>
                        <li>Access to premium leads</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade License (Required) */}
              <div>
                <label className="label mb-3">
                  Trade License <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                  {!formData.tradeLicenseFile ? (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'tradeLicense')}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <p className="mt-2 text-sm font-medium text-neutral-900">
                          Upload Trade License
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          PDF, JPEG, or PNG (max 10MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900">
                            {formData.tradeLicenseFile.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(formData.tradeLicenseFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tradeLicenseFile: null })}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Required for Basic Verification (✓). Your trade license will be reviewed by our team.
                </p>
              </div>

              {/* VAT TRN Certificate (Required) */}
              <div>
                <label className="label mb-3">
                  VAT TRN Certificate <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                  {!formData.vatTrnFile ? (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'vat')}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <p className="mt-2 text-sm font-medium text-neutral-900">
                          Upload VAT TRN Certificate
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          PDF, JPEG, or PNG (max 10MB)
                        </p>
                      </div>
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-green-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-neutral-900">
                            {formData.vatTrnFile.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {(formData.vatTrnFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, vatTrnFile: null })}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Required for Basic Verification (✓). Your VAT TRN certificate will be reviewed by our team.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Profile Photo */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {!formData.profilePhotoFile ? (
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
                      <input
                        id="photo-upload"
                        name="photo-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                      />
                    </label>
                    <p className="mt-1 text-xs text-neutral-500">PNG, JPG, WebP, GIF up to 5MB</p>
                    <p className="mt-2 text-sm text-neutral-600">
                      Upload a clear image that represents your brand
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-green-300 rounded-lg p-6 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-neutral-200 rounded-lg mr-4 overflow-hidden">
                        <img
                          src={URL.createObjectURL(formData.profilePhotoFile)}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {formData.profilePhotoFile.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {(formData.profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, profilePhotoFile: null })}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  💡 <strong>New pro tip:</strong> Pros with a profile photo get 3x more responses from homeowners.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Complete */}
          {currentStep === 6 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                Welcome to Homezy, {user?.firstName}!
              </h2>
              <p className="text-lg text-neutral-600 mb-4 max-w-2xl mx-auto">
                Your profile is complete! Your verification documents are being reviewed by our team.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-lg mx-auto text-left">
                <p className="text-sm text-amber-900">
                  <strong>⏱️ What's next?</strong><br />
                  Our team will review your trade license within 24-48 hours. Once approved, you'll receive Basic Verification (✓) and can start claiming leads with a 5% discount.
                </p>
              </div>

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
          {currentStep < 6 && (
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
                {currentStep === 4 ? 'Continue' : currentStep === 5 ? (formData.profilePhotoFile ? 'Next' : 'Skip for now') : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
