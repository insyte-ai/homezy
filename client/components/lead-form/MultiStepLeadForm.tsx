/**
 * Multi-Step Lead Form
 * Progressive disclosure form for lead creation
 */

'use client';

import { useEffect } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { loadQuestionnaire } from '@/lib/services/questionnaireLoader';
import { QuestionRenderer } from './QuestionComponents';
import { CommonFieldsStep } from './CommonFieldsStep';
import { PhotoUploadStep } from './PhotoUploadStep';
import { ContactInfoStep } from './ContactInfoStep';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface MultiStepLeadFormProps {
  serviceId: string;
  onClose: () => void;
  onSubmit?: () => void;
}

export function MultiStepLeadForm({
  serviceId,
  onClose,
  onSubmit,
}: MultiStepLeadFormProps) {
  const {
    currentStep,
    questionnaire,
    answers,
    errors,
    isSubmitting,
    setServiceId,
    setQuestionnaire,
    setAnswer,
    nextStep,
    previousStep,
    validateCurrentStep,
    getTotalSteps,
    getProgress,
    reset,
  } = useLeadFormStore();

  // Load questionnaire on mount
  useEffect(() => {
    setServiceId(serviceId);
    loadQuestionnaire(serviceId).then((q) => {
      setQuestionnaire(q);
    });

    // Cleanup on unmount
    return () => {
      // Optional: reset form when closing
      // reset();
    };
  }, [serviceId]);

  if (!questionnaire) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading questions...</p>
        </div>
      </div>
    );
  }

  const totalSteps = getTotalSteps();
  const progress = getProgress();
  const serviceQuestionsCount = questionnaire.questions.length;

  // Determine which step component to render
  const renderStep = () => {
    // Service-specific questions
    if (currentStep < serviceQuestionsCount) {
      const question = questionnaire.questions[currentStep];
      return (
        <QuestionRenderer
          question={question}
          value={answers[question.id]}
          onChange={(value) => setAnswer(question.id, value)}
          error={errors[question.id]}
        />
      );
    }

    // Common fields step
    if (currentStep === serviceQuestionsCount) {
      return <CommonFieldsStep />;
    }

    // Photo upload step (optional)
    if (currentStep === serviceQuestionsCount + 1) {
      return <PhotoUploadStep />;
    }

    // Contact info step (final)
    if (currentStep === serviceQuestionsCount + 2) {
      return <ContactInfoStep onSubmit={onSubmit} />;
    }

    return null;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
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
