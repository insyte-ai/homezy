'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { completeOnboarding, uploadVerificationDocument, uploadPortfolioImages, addPortfolioItem, uploadProfilePhoto } from '@/lib/services/professional';
import { getAllSubservices, SubService } from '@/lib/services/serviceData';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { PhoneInput } from '@/components/common/PhoneInput';

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
  { value: 'sole-establishment', label: 'Sole Establishment / Sole Proprietorship' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'general-partnership', label: 'General Partnership' },
  { value: 'limited-partnership', label: 'Limited Partnership' },
  { value: 'civil-company', label: 'Civil Company' },
  { value: 'foreign-branch', label: 'Branch of a Foreign Company' },
  { value: 'free-zone', label: 'Free Zone LLC / Free Zone Establishment (FZE)' },
];

interface OnboardingData {
  // Step 1
  primaryCategory: string;
  additionalCategories: string[];

  // Step 2
  firstName: string;
  lastName: string;
  phone: string;
  businessEmail: string;
  businessName: string;
  brandName: string;
  businessType: string;
  tradeLicenseNumber: string;
  vatNumber: string;
  businessLogoFile: File | null;

  // Step 3
  primaryEmirate: string;
  serviceRadius: number;

  // Step 4 - Verification Documents
  tradeLicenseFile: File | null;
  vatTrnFile: File | null;

  // Step 5 - Portfolio
  portfolioFiles: File[];
}

export default function ProOnboardingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [categorySearch, setCategorySearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serviceCategories, setServiceCategories] = useState<SubService[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Helper to get field error
  const getFieldError = (field: string) => fieldErrors[field];

  // Helper to clear field error when user starts typing
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const [formData, setFormData] = useState<OnboardingData>({
    primaryCategory: '',
    additionalCategories: [],
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    businessEmail: '',
    businessName: '',
    brandName: '',
    businessType: 'sole-establishment',
    tradeLicenseNumber: '',
    vatNumber: '',
    businessLogoFile: null,
    primaryEmirate: '',
    serviceRadius: 50,
    tradeLicenseFile: null,
    vatTrnFile: null,
    portfolioFiles: [],
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

  // Filter categories using keyword-based search (same logic as homepage SearchBar)
  const filteredCategories = serviceCategories
    .map((service) => {
      if (!categorySearch.trim()) return service;

      const query = categorySearch.toLowerCase();
      const nameMatch = service.name.toLowerCase().includes(query);
      const categoryMatch = service.category?.toLowerCase().includes(query);
      const matchedKeyword = service.keywords?.find(keyword =>
        keyword.toLowerCase().includes(query)
      );
      const matchedType = service.serviceTypes?.find(type =>
        type.name.toLowerCase().includes(query)
      );

      if (nameMatch || categoryMatch || matchedKeyword || matchedType) {
        return {
          ...service,
          matchedKeyword: matchedKeyword || null,
          matchedType: matchedType?.name || null,
        };
      }
      return null;
    })
    .filter((service): service is NonNullable<typeof service> => service !== null);

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
    // Clear previous errors
    setError('');
    const newFieldErrors: Record<string, string> = {};

    // Validation for current step
    if (currentStep === 1 && !formData.primaryCategory) {
      setError('Please select your primary service category');
      return;
    }
    if (currentStep === 2) {
      let hasErrors = false;
      if (!formData.firstName) {
        newFieldErrors.firstName = 'First name is required';
        hasErrors = true;
      }
      if (!formData.lastName) {
        newFieldErrors.lastName = 'Last name is required';
        hasErrors = true;
      }
      if (!formData.phone) {
        newFieldErrors.phone = 'Phone number is required';
        hasErrors = true;
      }
      if (!formData.businessName) {
        newFieldErrors.businessName = 'Business name is required';
        hasErrors = true;
      }
      if (!formData.tradeLicenseNumber) {
        newFieldErrors.tradeLicenseNumber = 'Trade license number is required';
        hasErrors = true;
      }
      if (!formData.vatNumber) {
        newFieldErrors.vatNumber = 'VAT number is required';
        hasErrors = true;
      }
      if (hasErrors) {
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted errors');
        return;
      }
    }
    if (currentStep === 3 && !formData.primaryEmirate) {
      setFieldErrors({ primaryEmirate: 'Please select an emirate' });
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
    setFieldErrors({});
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setFieldErrors({});
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

  const handlePortfolioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const validTypes = [...validImageTypes, ...validVideoTypes];
    const maxFileSize = 50 * 1024 * 1024; // 50MB for videos
    const maxFiles = 10;

    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!validTypes.includes(file.type)) {
        setError(`"${file.name}" is not a supported format. Use JPEG, PNG, WebP, GIF, MP4, MOV, or WebM.`);
        return;
      }

      if (file.size > maxFileSize) {
        setError(`"${file.name}" is too large. Maximum file size is 50MB.`);
        return;
      }

      newFiles.push(file);
    }

    const totalFiles = formData.portfolioFiles.length + newFiles.length;
    if (totalFiles > maxFiles) {
      setError(`You can upload up to ${maxFiles} files. You have ${formData.portfolioFiles.length} already.`);
      return;
    }

    setError('');
    setFormData({ ...formData, portfolioFiles: [...formData.portfolioFiles, ...newFiles] });

    // Reset input so the same file can be selected again if removed
    e.target.value = '';
  };

  const removePortfolioFile = (index: number) => {
    setFormData({
      ...formData,
      portfolioFiles: formData.portfolioFiles.filter((_, i) => i !== index),
    });
  };

  const handleBusinessLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image file (JPEG, PNG, WebP, SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setFormData({ ...formData, businessLogoFile: file });
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
          businessEmail: formData.businessEmail || undefined,
          businessName: formData.businessName,
          brandName: formData.brandName || undefined,
          businessType: formData.businessType as 'sole-establishment' | 'llc' | 'general-partnership' | 'limited-partnership' | 'civil-company' | 'foreign-branch' | 'free-zone',
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
    setError('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.businessName || !formData.primaryCategory || !formData.primaryEmirate) {
        setError('Please complete all required fields in Step 2');
        setIsSubmitting(false);
        return;
      }

      if (!formData.tradeLicenseNumber) {
        setError('Please enter your Trade License Number in Step 2');
        setIsSubmitting(false);
        return;
      }

      if (!formData.vatNumber) {
        setError('Please enter your VAT Number in Step 2');
        setIsSubmitting(false);
        return;
      }

      if (!formData.tradeLicenseFile) {
        setError('Please upload your trade license document in Step 4');
        setIsSubmitting(false);
        return;
      }

      if (!formData.vatTrnFile) {
        setError('Please upload your VAT TRN certificate in Step 4');
        setIsSubmitting(false);
        return;
      }

      console.log('[Onboarding] Submitting data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        businessName: formData.businessName,
        tradeLicenseNumber: formData.tradeLicenseNumber,
        vatNumber: formData.vatNumber,
        categories: [formData.primaryCategory, ...formData.additionalCategories],
        primaryEmirate: formData.primaryEmirate,
      });

      // Complete onboarding first
      await completeOnboarding({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        businessEmail: formData.businessEmail || undefined,
        businessName: formData.businessName,
        brandName: formData.brandName || undefined,
        businessType: formData.businessType as 'sole-establishment' | 'llc' | 'general-partnership' | 'limited-partnership' | 'civil-company' | 'foreign-branch' | 'free-zone',
        tradeLicenseNumber: formData.tradeLicenseNumber,
        vatNumber: formData.vatNumber,
        categories: [formData.primaryCategory, ...formData.additionalCategories],
        primaryEmirate: formData.primaryEmirate,
        serviceRadius: formData.serviceRadius,
      });

      // Upload business logo as profile photo if provided
      if (formData.businessLogoFile) {
        toast.loading('Uploading business logo...');
        try {
          await uploadProfilePhoto(formData.businessLogoFile);
        } catch (logoError) {
          console.error('[Onboarding] Business logo upload error:', logoError);
          // Don't fail the whole onboarding if logo upload fails
          toast.dismiss();
          toast.error('Business logo could not be uploaded. You can add it later from your profile.');
        }
      }

      // Upload verification documents
      toast.loading('Uploading verification documents...');

      // Upload trade license
      await uploadVerificationDocument(formData.tradeLicenseFile, 'license');

      // Upload VAT TRN certificate
      await uploadVerificationDocument(formData.vatTrnFile, 'vat');

      // Upload portfolio images if any were added
      if (formData.portfolioFiles.length > 0) {
        toast.dismiss();
        toast.loading('Uploading portfolio images...');

        try {
          const imageUrls = await uploadPortfolioImages(formData.portfolioFiles);

          // Create a portfolio item with the uploaded images
          const primaryCategoryName = serviceCategories.find(c => c.id === formData.primaryCategory)?.name || 'Work Samples';
          await addPortfolioItem({
            title: `${primaryCategoryName} - Sample Work`,
            description: 'Work samples uploaded during onboarding. Edit this project to add more details about your work.',
            category: formData.primaryCategory,
            images: imageUrls,
            completionDate: new Date().toISOString(),
          });
        } catch (portfolioError) {
          console.error('[Onboarding] Portfolio upload error:', portfolioError);
          // Don't fail the whole onboarding if portfolio upload fails
          toast.dismiss();
          toast.error('Portfolio images could not be uploaded. You can add them later from your dashboard.');
        }
      }

      toast.dismiss();
      toast.success('Onboarding completed! Your documents are under review.');

      // Use full page reload to refresh user state (like Tradezy)
      // This ensures the dashboard gets fresh user data from the server
      window.location.href = '/pro/dashboard';
    } catch (err: any) {
      toast.dismiss();
      console.error('[Onboarding] Error:', err.response?.data || err.message);

      // Parse field-specific validation errors from server
      if (err.response?.status === 400 && err.response?.data?.details) {
        const serverErrors: Record<string, string> = {};
        err.response.data.details.forEach((detail: { field: string; message: string }) => {
          serverErrors[detail.field] = detail.message;
        });
        setFieldErrors(serverErrors);

        // Find which step has the first error and navigate there
        const errorFields = Object.keys(serverErrors);
        const step2Fields = ['firstName', 'lastName', 'phone', 'businessEmail', 'businessName', 'brandName', 'businessType', 'tradeLicenseNumber', 'vatNumber'];
        const step3Fields = ['primaryEmirate', 'serviceRadius'];
        const step1Fields = ['categories', 'primaryCategory'];

        if (errorFields.some(f => step1Fields.includes(f))) {
          setCurrentStep(1);
        } else if (errorFields.some(f => step2Fields.includes(f))) {
          setCurrentStep(2);
        } else if (errorFields.some(f => step3Fields.includes(f))) {
          setCurrentStep(3);
        }

        setError('Please fix the highlighted errors below');
        toast.error('Please fix the validation errors');
      } else {
        setError(err.response?.data?.message || err.message || 'Unable to complete onboarding');
        toast.error('Unable to complete onboarding. Please try again.');
      }
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
      case 5: return 'Show off your work';
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
                          <span className="block text-xs text-neutral-500 mt-1">
                            {category.category}
                            {(category.matchedKeyword || category.matchedType) && categorySearch && (
                              <span className="text-primary-600 font-medium">
                                {' • '}Matches: {category.matchedKeyword || category.matchedType}
                              </span>
                            )}
                          </span>
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
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      clearFieldError('firstName');
                    }}
                    className={`input ${getFieldError('firstName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="John"
                  />
                  {getFieldError('firstName') && (
                    <p className="mt-1 text-xs text-red-600">{getFieldError('firstName')}</p>
                  )}
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
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      clearFieldError('lastName');
                    }}
                    className={`input ${getFieldError('lastName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Doe"
                  />
                  {getFieldError('lastName') && (
                    <p className="mt-1 text-xs text-red-600">{getFieldError('lastName')}</p>
                  )}
                </div>
              </div>

              {/* Phone + Business Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData({ ...formData, phone: value });
                      clearFieldError('phone');
                    }}
                    placeholder="50 123 4567"
                    className={getFieldError('phone') ? 'border-red-500' : ''}
                  />
                  {getFieldError('phone') ? (
                    <p className="mt-1 text-xs text-red-600">{getFieldError('phone')}</p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-500">
                      Visible to homeowners on your quotes
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessEmail" className="label">
                    Business Email (Optional)
                  </label>
                  <input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, businessEmail: e.target.value });
                      clearFieldError('businessEmail');
                    }}
                    className={`input ${getFieldError('businessEmail') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="contact@yourbusiness.com"
                  />
                  {getFieldError('businessEmail') ? (
                    <p className="mt-1 text-xs text-red-600">{getFieldError('businessEmail')}</p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-500">
                      If different from your account email
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  <strong>Your contact info:</strong> We'll use your email ({user?.email}) and the phone number above to send you lead notifications.
                </p>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Business Details</h3>

                <div className="space-y-6">
                  {/* Business Logo Upload */}
                  <div>
                    <label className="label mb-2">
                      Business Logo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-3 hover:border-primary-400 transition-colors">
                      {!formData.businessLogoFile ? (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                            onChange={handleBusinessLogoUpload}
                            className="hidden"
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Upload className="h-5 w-5 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">
                                Upload your business logo
                              </p>
                              <p className="text-xs text-neutral-500">
                                JPEG, PNG, WebP, or SVG (max 5MB)
                              </p>
                            </div>
                          </div>
                        </label>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={URL.createObjectURL(formData.businessLogoFile)}
                                alt="Business logo preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900 truncate max-w-[200px]">
                                {formData.businessLogoFile.name}
                              </p>
                              <p className="text-xs text-neutral-500">
                                {(formData.businessLogoFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, businessLogoFile: null })}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Name (full width - legal names can be long) */}
                  <div>
                    <label htmlFor="businessName" className="label">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={(e) => {
                        setFormData({ ...formData, businessName: e.target.value });
                        clearFieldError('businessName');
                      }}
                      className={`input ${getFieldError('businessName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="e.g., Dubai Pro Plumbing Technical Services LLC"
                    />
                    {getFieldError('businessName') ? (
                      <p className="mt-1 text-xs text-red-600">{getFieldError('businessName')}</p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-500">
                        Legal business name as registered on your trade license
                      </p>
                    )}
                  </div>

                  {/* Brand Name + Type Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brandName" className="label">
                        Brand Name (Optional)
                      </label>
                      <input
                        id="brandName"
                        type="text"
                        value={formData.brandName}
                        onChange={(e) => {
                          setFormData({ ...formData, brandName: e.target.value });
                          clearFieldError('brandName');
                        }}
                        className={`input ${getFieldError('brandName') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., Pro Plumbers"
                      />
                      {getFieldError('brandName') ? (
                        <p className="mt-1 text-xs text-red-600">{getFieldError('brandName')}</p>
                      ) : (
                        <p className="mt-1 text-xs text-neutral-500">
                          If different from your legal business name
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="businessType" className="label">
                        Business Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="businessType"
                        value={formData.businessType}
                        onChange={(e) => {
                          setFormData({ ...formData, businessType: e.target.value });
                          clearFieldError('businessType');
                        }}
                        className={`input ${getFieldError('businessType') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      >
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {getFieldError('businessType') && (
                        <p className="mt-1 text-xs text-red-600">{getFieldError('businessType')}</p>
                      )}
                    </div>
                  </div>

                  {/* License + VAT Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tradeLicenseNumber" className="label">
                        Trade License Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="tradeLicenseNumber"
                        type="text"
                        required
                        value={formData.tradeLicenseNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, tradeLicenseNumber: e.target.value });
                          clearFieldError('tradeLicenseNumber');
                        }}
                        className={`input ${getFieldError('tradeLicenseNumber') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., 123456"
                      />
                      {getFieldError('tradeLicenseNumber') && (
                        <p className="mt-1 text-xs text-red-600">{getFieldError('tradeLicenseNumber')}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="vatNumber" className="label">
                        VAT Number (TRN) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="vatNumber"
                        type="text"
                        required
                        value={formData.vatNumber}
                        onChange={(e) => {
                          setFormData({ ...formData, vatNumber: e.target.value });
                          clearFieldError('vatNumber');
                        }}
                        className={`input ${getFieldError('vatNumber') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="e.g., 100123456700003"
                      />
                      {getFieldError('vatNumber') && (
                        <p className="mt-1 text-xs text-red-600">{getFieldError('vatNumber')}</p>
                      )}
                    </div>
                  </div>
                </div>
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
                  onChange={(e) => {
                    setFormData({ ...formData, primaryEmirate: e.target.value });
                    clearFieldError('primaryEmirate');
                  }}
                  className={`input ${getFieldError('primaryEmirate') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Select an emirate</option>
                  {UAE_EMIRATES.map((emirate) => (
                    <option key={emirate} value={emirate}>
                      {emirate}
                    </option>
                  ))}
                </select>
                {getFieldError('primaryEmirate') && (
                  <p className="mt-1 text-xs text-red-600">{getFieldError('primaryEmirate')}</p>
                )}
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

          {/* Step 5: Portfolio */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <p className="text-neutral-600">
                Upload photos and videos to showcase your work. This helps homeowners see the quality of your services.
              </p>

              {/* Upload suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">What to upload:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Before & after photos</strong> of completed projects</li>
                  <li>• Photos of your <strong>team at work</strong></li>
                  <li>• Your <strong>workspace or equipment</strong></li>
                  <li>• Short <strong>video clips</strong> showcasing your skills</li>
                </ul>
              </div>

              {/* Upload area */}
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
                <label className="cursor-pointer block text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
                    onChange={handlePortfolioUpload}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-500">
                    Click to upload photos or videos
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    JPEG, PNG, WebP, GIF, MP4, MOV, WebM (max 50MB each, up to 10 files)
                  </p>
                </label>
              </div>

              {/* Uploaded files preview */}
              {formData.portfolioFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-3">
                    Uploaded files ({formData.portfolioFiles.length}/10)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {formData.portfolioFiles.map((file, index) => (
                      <div
                        key={index}
                        className="relative group border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100"
                      >
                        {file.type.startsWith('video/') ? (
                          <div className="aspect-square flex items-center justify-center bg-neutral-800">
                            <video
                              src={URL.createObjectURL(file)}
                              className="max-h-full max-w-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/50 rounded-full p-2">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePortfolioFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <p className="text-xs text-white truncate">{file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  💡 <strong>Pro tip:</strong> Professionals with portfolio photos get 3x more quote requests from homeowners.
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
                {currentStep === 4 ? 'Continue' : currentStep === 5 ? (formData.portfolioFiles.length > 0 ? 'Next' : 'Skip for now') : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
