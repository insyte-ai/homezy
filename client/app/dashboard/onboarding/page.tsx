'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  House,
  Building,
  Home,
  Castle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  X,
  Bed,
  Bath,
  Square,
  Calendar,
  MapPin,
} from 'lucide-react';
import { createProperty, type CreatePropertyInput } from '@/lib/services/property';
import { updateOnboardingStatus } from '@/lib/services/users';
import { useAuthStore } from '@/store/authStore';
import { EMIRATES } from '@homezy/shared';

type Step = 'welcome' | 'property-type' | 'ownership' | 'details' | 'complete';

const PROPERTY_TYPES = [
  { value: 'villa', label: 'Villa', icon: House, description: 'Standalone house with private garden' },
  { value: 'townhouse', label: 'Townhouse', icon: Building, description: 'Multi-story home sharing walls' },
  { value: 'apartment', label: 'Apartment', icon: Home, description: 'Unit in a residential building' },
  { value: 'penthouse', label: 'Penthouse', icon: Castle, description: 'Top-floor luxury apartment' },
] as const;

const OWNERSHIP_TYPES = [
  { value: 'owned', label: 'I Own It', description: 'You own this property' },
  { value: 'rental', label: 'I Rent It', description: 'You are renting this property' },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { fetchCurrentUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePropertyInput>({
    name: '',
    emirate: 'dubai',
    neighborhood: '',
    ownershipType: 'owned',
    propertyType: 'apartment',
    bedrooms: undefined,
    bathrooms: undefined,
    sizeSqFt: undefined,
    yearBuilt: undefined,
    isPrimary: true,
  });

  const steps: Step[] = ['welcome', 'property-type', 'ownership', 'details', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handlePropertyTypeSelect = (type: typeof PROPERTY_TYPES[number]['value']) => {
    setFormData((prev) => ({ ...prev, propertyType: type }));
    goNext();
  };

  const handleOwnershipSelect = (type: typeof OWNERSHIP_TYPES[number]['value']) => {
    setFormData((prev) => ({ ...prev, ownershipType: type }));
    goNext();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a name for your property');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createProperty(formData);
      // Mark onboarding as completed
      await updateOnboardingStatus({ completed: true });
      // Refresh user data to update the store
      await fetchCurrentUser();
      setCurrentStep('complete');
    } catch (err: any) {
      console.error('Failed to create property:', err);
      setError(err.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as skipped
      await updateOnboardingStatus({ skipped: true });
      // Refresh user data to update the store
      await fetchCurrentUser();
      router.push('/dashboard/my-home');
    } catch (err) {
      console.error('Failed to skip onboarding:', err);
      // Still navigate even if API call fails
      router.push('/dashboard/my-home');
    }
  };

  const handleComplete = () => {
    router.push('/dashboard/my-home');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Skip Button */}
        {currentStep !== 'complete' && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Skip for now
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {currentStep !== 'welcome' && currentStep !== 'complete' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">
                Step {currentStepIndex} of {steps.length - 2}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${((currentStepIndex - 1) / (steps.length - 3)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <House className="h-10 w-10 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to My Home
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Let's set up your home profile. This helps us provide personalized
                recommendations for your property.
              </p>
              <div className="space-y-3">
                <button
                  onClick={goNext}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  I'll do this later
                </button>
              </div>
            </div>
          )}

          {/* Property Type Step */}
          {currentStep === 'property-type' && (
            <div className="p-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                What type of property do you have?
              </h2>
              <p className="text-gray-600 mb-6">
                Select the type that best describes your home
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROPERTY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.propertyType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handlePropertyTypeSelect(type.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-primary-100' : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isSelected ? 'text-primary-600' : 'text-gray-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ownership Step */}
          {currentStep === 'ownership' && (
            <div className="p-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Do you own or rent this property?
              </h2>
              <p className="text-gray-600 mb-6">
                This helps us tailor recommendations for your situation
              </p>
              <div className="space-y-4">
                {OWNERSHIP_TYPES.map((type) => {
                  const isSelected = formData.ownershipType === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleOwnershipSelect(type.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Details Step */}
          {currentStep === 'details' && (
            <div className="p-8">
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Tell us about your property
              </h2>
              <p className="text-gray-600 mb-6">
                Add details to complete your home profile
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Property Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., My Home, Beach Villa"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Emirate *
                    </label>
                    <select
                      name="emirate"
                      value={formData.emirate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {EMIRATES.map((emirate) => (
                        <option key={emirate.id} value={emirate.id}>
                          {emirate.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neighborhood
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Downtown, Marina"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Bed className="h-4 w-4 inline mr-1" />
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms ?? ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Bath className="h-4 w-4 inline mr-1" />
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms ?? ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Square className="h-4 w-4 inline mr-1" />
                      Size (sq ft)
                    </label>
                    <input
                      type="number"
                      name="sizeSqFt"
                      value={formData.sizeSqFt ?? ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      min={0}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Year Built
                    </label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt ?? ''}
                      onChange={handleInputChange}
                      placeholder="2020"
                      min={1900}
                      max={new Date().getFullYear() + 5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="p-8 text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                You're All Set!
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your property has been added. You can now start managing your home
                improvement projects, track services, and set up reminders.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleComplete}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Go to My Home
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href="/dashboard/my-home/projects/new"
                  className="block w-full px-6 py-3 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                >
                  Create Your First Project
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        {currentStep !== 'complete' && (
          <p className="text-center text-sm text-gray-500 mt-6">
            You can always update your property details later from the settings page.
          </p>
        )}
      </div>
    </div>
  );
}
