/**
 * Lead Form State Management
 * Manages multi-step lead form state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServiceQuestionnaire, ServiceAnswers } from '@/config/questionTypes';

interface LeadFormState {
  // Current state
  currentStep: number;
  selectedServiceId: string | null;
  questionnaire: ServiceQuestionnaire | null;

  // Form data
  answers: Record<string, string | string[] | number>;
  photos: string[]; // Cloudinary URLs

  // Common fields (collected at the end)
  title: string;
  description: string;
  emirate: string;
  neighborhood: string;
  budgetBracket: string;
  urgency: string;
  timeline: string;

  // Contact info (for guest signup)
  email: string;
  name: string;
  phone: string;

  // UI state
  isSubmitting: boolean;
  errors: Record<string, string>;

  // Actions
  setServiceId: (serviceId: string) => void;
  setQuestionnaire: (questionnaire: ServiceQuestionnaire) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  setAnswer: (questionId: string, answer: string | string[] | number) => void;
  addPhoto: (url: string) => void;
  removePhoto: (url: string) => void;

  setCommonField: (field: string, value: string) => void;
  setContactField: (field: string, value: string) => void;

  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  validateCurrentStep: () => boolean;

  setSubmitting: (isSubmitting: boolean) => void;

  reset: () => void;

  // Computed
  getTotalSteps: () => number;
  getProgress: () => number;
  isComplete: () => boolean;
  getServiceAnswers: () => ServiceAnswers | null;
}

const initialState = {
  currentStep: 0,
  selectedServiceId: null,
  questionnaire: null,
  answers: {},
  photos: [],
  title: '',
  description: '',
  emirate: '',
  neighborhood: '',
  budgetBracket: '',
  urgency: '',
  timeline: '',
  email: '',
  name: '',
  phone: '',
  isSubmitting: false,
  errors: {},
};

export const useLeadFormStore = create<LeadFormState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setServiceId: (serviceId) => set({ selectedServiceId: serviceId }),

      setQuestionnaire: (questionnaire) => set({ questionnaire }),

      nextStep: () => {
        const { currentStep, getTotalSteps, validateCurrentStep } = get();
        if (validateCurrentStep() && currentStep < getTotalSteps() - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step) => {
        const { getTotalSteps } = get();
        if (step >= 0 && step < getTotalSteps()) {
          set({ currentStep: step });
        }
      },

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: answer,
          },
        }));
        // Clear error for this question if it exists
        get().clearError(questionId);
      },

      addPhoto: (url) => {
        set((state) => ({
          photos: [...state.photos, url],
        }));
      },

      removePhoto: (url) => {
        set((state) => ({
          photos: state.photos.filter((p) => p !== url),
        }));
      },

      setCommonField: (field, value) => {
        set({ [field]: value } as any);
        get().clearError(field);
      },

      setContactField: (field, value) => {
        set({ [field]: value } as any);
        get().clearError(field);
      },

      setError: (field, error) => {
        set((state) => ({
          errors: {
            ...state.errors,
            [field]: error,
          },
        }));
      },

      clearError: (field) => {
        set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[field];
          return { errors: newErrors };
        });
      },

      clearAllErrors: () => set({ errors: {} }),

      validateCurrentStep: () => {
        const {
          currentStep,
          questionnaire,
          answers,
          title,
          description,
          emirate,
          budgetBracket,
          urgency,
          email,
          setError,
          clearAllErrors,
          getTotalSteps,
        } = get();

        clearAllErrors();
        let isValid = true;

        // Service-specific question steps
        if (questionnaire && currentStep < questionnaire.questions.length) {
          const question = questionnaire.questions[currentStep];
          if (question.required && !answers[question.id]) {
            setError(question.id, 'This question is required');
            isValid = false;
          }
        }

        // Common fields step (after service questions)
        const commonFieldsStep = questionnaire?.questions.length || 0;
        if (currentStep === commonFieldsStep) {
          if (!title || title.length < 10) {
            setError('title', 'Title must be at least 10 characters');
            isValid = false;
          }
          if (!description || description.length < 20) {
            setError('description', 'Description must be at least 20 characters');
            isValid = false;
          }
          if (!emirate) {
            setError('emirate', 'Please select an emirate');
            isValid = false;
          }
          if (!budgetBracket) {
            setError('budgetBracket', 'Please select a budget range');
            isValid = false;
          }
          if (!urgency) {
            setError('urgency', 'Please select urgency level');
            isValid = false;
          }
        }

        // Contact info step (final step)
        const contactStep = getTotalSteps() - 1;
        if (currentStep === contactStep) {
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('email', 'Please enter a valid email address');
            isValid = false;
          }
        }

        return isValid;
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      reset: () => set(initialState),

      getTotalSteps: () => {
        const { questionnaire } = get();
        // Service questions + Common fields + Photo upload (optional) + Contact info
        return (questionnaire?.questions.length || 0) + 3;
      },

      getProgress: () => {
        const { currentStep, getTotalSteps } = get();
        return Math.round(((currentStep + 1) / getTotalSteps()) * 100);
      },

      isComplete: () => {
        const { currentStep, getTotalSteps } = get();
        return currentStep >= getTotalSteps() - 1;
      },

      getServiceAnswers: () => {
        const { selectedServiceId, answers } = get();
        if (!selectedServiceId) return null;

        return {
          serviceId: selectedServiceId,
          answers,
          answeredAt: new Date(),
        };
      },
    }),
    {
      name: 'lead-form-storage',
      // Only persist form data, not UI state
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedServiceId: state.selectedServiceId,
        answers: state.answers,
        photos: state.photos,
        title: state.title,
        description: state.description,
        emirate: state.emirate,
        neighborhood: state.neighborhood,
        budgetBracket: state.budgetBracket,
        urgency: state.urgency,
        timeline: state.timeline,
        email: state.email,
        name: state.name,
        phone: state.phone,
      }),
    }
  )
);
