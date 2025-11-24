/**
 * Multi-Step Lead Form
 * Progressive disclosure form for lead creation
 */

'use client';

import { useEffect } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { useChatPanelStore } from '@/store/chatPanelStore';
import { useAuthStore } from '@/store/authStore';
import { loadQuestionnaire } from '@/lib/services/questionnaireLoader';
import { ServiceQuestionsStep } from './ServiceQuestionsStep';
import { CommonFieldsStep } from './CommonFieldsStep';
import { PhotoUploadStep } from './PhotoUploadStep';
import { ContactInfoStep } from './ContactInfoStep';
import { ArrowLeft, ArrowRight, X, Send } from 'lucide-react';

interface MultiStepLeadFormProps {
  serviceId: string;
  onClose: () => void;
  onSubmit?: () => void;
  // For direct leads to a specific professional
  professionalId?: string;
  professionalName?: string;
  professionalPhoto?: string;
}

export function MultiStepLeadForm({
  serviceId,
  onClose,
  onSubmit,
  professionalId,
  professionalName,
  professionalPhoto,
}: MultiStepLeadFormProps) {
  const isDirectLead = !!professionalId;
  const {
    currentStep,
    questionnaire,
    isSubmitting,
    setServiceId,
    setQuestionnaire,
    setTargetProfessionalId,
    nextStep,
    previousStep,
    validateCurrentStep,
    getTotalSteps,
    getProgress,
  } = useLeadFormStore();

  const { isOpen: isChatPanelOpen } = useChatPanelStore();
  const { isAuthenticated } = useAuthStore();

  // Skip contact step for authenticated users
  const skipContactStep = isAuthenticated;

  // Load questionnaire and set professional context on mount
  useEffect(() => {
    setServiceId(serviceId);
    setTargetProfessionalId(professionalId || null);
    loadQuestionnaire(serviceId).then((q) => {
      setQuestionnaire(q);
    });
  }, [serviceId, professionalId]);

  if (!questionnaire) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-all duration-300"
        style={{ right: isChatPanelOpen ? '450px' : '0' }}
      >
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Calculate total steps based on authentication
  // Authenticated users: 3 steps (skip contact info)
  // Guest users: 4 steps (include contact info)
  const totalSteps = skipContactStep ? 3 : getTotalSteps();
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  // Determine which step component to render
  // For authenticated users (3 steps): Service Questions → Common Fields → Photo Upload (auto-submit)
  // For guest users (4 steps): Service Questions → Common Fields → Photo Upload → Contact Info
  const renderStep = () => {
    if (skipContactStep) {
      // 3-step flow for authenticated users
      switch (currentStep) {
        case 0:
          return <ServiceQuestionsStep />;
        case 1:
          return <CommonFieldsStep />;
        case 2:
          return <PhotoUploadStep onAutoSubmit={onSubmit} />;
        default:
          return null;
      }
    } else {
      // 4-step flow for guest users
      switch (currentStep) {
        case 0:
          return <ServiceQuestionsStep />;
        case 1:
          return <CommonFieldsStep />;
        case 2:
          return <PhotoUploadStep />;
        case 3:
          return <ContactInfoStep onSubmit={onSubmit} />;
        default:
          return null;
      }
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-all duration-300"
      style={{ right: isChatPanelOpen ? '450px' : '0' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with progress */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {questionnaire.serviceName}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Direct Lead Banner */}
        {isDirectLead && professionalName && (
          <div className="border-b border-gray-200 bg-primary-50 px-6 py-4">
            <div className="flex items-center gap-3 max-w-2xl mx-auto">
              {professionalPhoto && (
                <img
                  src={professionalPhoto}
                  alt={professionalName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary-200"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary-600" />
                  <p className="text-sm font-semibold text-gray-900">
                    Sending direct request to
                  </p>
                </div>
                <p className="text-base font-bold text-primary-700">
                  {professionalName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">{renderStep()}</div>
        </div>

        {/* Footer with navigation */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3 max-w-2xl mx-auto">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
            )}

            {!isLastStep && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
