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

  // Direct lead context (optional - for sending to specific professional)
  targetProfessionalId: string | null;

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
  setTargetProfessionalId: (professionalId: string | null) => void;
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
  targetProfessionalId: null,
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

      setServiceId: (serviceId) => {
        const currentServiceId = get().selectedServiceId;

        // If changing service (not initial set), clear all related state
        if (currentServiceId && currentServiceId !== serviceId) {
          set({
            selectedServiceId: serviceId,
            answers: {},              // Clear previous service answers
            photos: [],               // Clear uploaded photos
            currentStep: 0,           // Reset to first step
            questionnaire: null,      // Will reload new questionnaire
            errors: {},               // Clear any validation errors
            title: '',                // Clear common fields
            description: '',
            emirate: '',
            neighborhood: '',
            budgetBracket: '',
            urgency: '',
            timeline: '',
          });
        } else {
          // Initial set or same service - just update serviceId
          set({ selectedServiceId: serviceId });
        }
      },

      setQuestionnaire: (questionnaire) => set({ questionnaire }),

      setTargetProfessionalId: (professionalId) => set({ targetProfessionalId: professionalId }),

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
        } = get();

        clearAllErrors();
        let isValid = true;

        // Step 0: Service-specific questions (all grouped)
        if (currentStep === 0) {
          if (questionnaire && questionnaire.questions) {
            questionnaire.questions.forEach((question) => {
              if (question.required && !answers[question.id]) {
                setError(question.id, 'This question is required');
                isValid = false;
              }
            });
          }
        }

        // Step 1: Common fields (title, description, location, budget, urgency)
        if (currentStep === 1) {
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

        // Step 2: Photo upload (optional - no validation required)

        // Step 3: Contact info (email, name, phone)
        if (currentStep === 3) {
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
        // Fixed 4-step flow:
        // 1. Service-specific questions (all grouped)
        // 2. Common fields (title, description, location, budget, urgency)
        // 3. Photo upload (optional)
        // 4. Contact info (email, name, phone)
        return 4;
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
        targetProfessionalId: state.targetProfessionalId,
        email: state.email,
        name: state.name,
        phone: state.phone,
      }),
    }
  )
);
