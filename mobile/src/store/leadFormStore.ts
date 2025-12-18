/**
 * Lead Form State Management
 * Manages multi-step lead form state with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubService } from '../services/services';

export type QuestionType = 'single-choice' | 'multiple-choice' | 'text' | 'number';

export interface QuestionOption {
  value: string;
  label: string;
  icon?: string;
  helpText?: string;
}

export interface ServiceQuestion {
  id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  weight: number;
  options?: QuestionOption[];
  placeholder?: string;
  helpText?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
}

export interface ServiceQuestionnaire {
  serviceId: string;
  serviceName: string;
  description?: string;
  questions: ServiceQuestion[];
}

interface LeadFormState {
  // Current state
  currentStep: number;
  selectedService: SubService | null;
  questionnaire: ServiceQuestionnaire | null;

  // Form data
  answers: Record<string, string | string[] | number>;
  photos: string[]; // Cloudinary URLs

  // Common fields
  title: string;
  description: string;
  emirate: string;
  neighborhood: string;
  budgetBracket: string;
  urgency: string;
  timeline: string;

  // Direct lead context (optional - for sending to specific professional)
  targetProfessionalId: string | null;

  // UI state
  isSubmitting: boolean;
  isGeneratingContent: boolean;
  errors: Record<string, string>;

  // Actions
  setService: (service: SubService) => void;
  setQuestionnaire: (questionnaire: ServiceQuestionnaire) => void;
  setTargetProfessionalId: (professionalId: string | null) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;

  setAnswer: (questionId: string, answer: string | string[] | number) => void;
  addPhoto: (url: string) => void;
  removePhoto: (url: string) => void;

  setCommonField: (field: string, value: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;

  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;

  validateCurrentStep: () => boolean;

  setSubmitting: (isSubmitting: boolean) => void;
  setGeneratingContent: (isGenerating: boolean) => void;

  reset: () => void;

  // Computed
  getTotalSteps: () => number;
  getProgress: () => number;
  isComplete: () => boolean;
  getFormData: () => {
    title: string;
    description: string;
    category: string;
    location: {
      emirate: string;
      neighborhood?: string;
    };
    budgetBracket: string;
    urgency: string;
    timeline?: string;
    photos?: string[];
    serviceAnswers?: {
      serviceId: string;
      answers: Record<string, string | string[] | number>;
      answeredAt: Date;
    };
  } | null;
}

const initialState = {
  currentStep: 0,
  selectedService: null,
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
  isSubmitting: false,
  isGeneratingContent: false,
  errors: {},
};

export const useLeadFormStore = create<LeadFormState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setService: (service) => {
        const currentService = get().selectedService;

        // If changing service (not initial set), clear all related state
        if (currentService && currentService.id !== service.id) {
          set({
            selectedService: service,
            answers: {},
            photos: [],
            currentStep: 0,
            questionnaire: null,
            errors: {},
            title: '',
            description: '',
            emirate: '',
            neighborhood: '',
            budgetBracket: '',
            urgency: '',
            timeline: '',
          });
        } else {
          set({ selectedService: service });
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

      setTitle: (title) => {
        set({ title });
        get().clearError('title');
      },

      setDescription: (description) => {
        set({ description });
        get().clearError('description');
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
          selectedService,
          title,
          description,
          emirate,
          budgetBracket,
          urgency,
          setError,
          clearAllErrors,
        } = get();

        clearAllErrors();
        let isValid = true;

        // Step 0: Service selection
        if (currentStep === 0) {
          if (!selectedService) {
            setError('service', 'Please select a service');
            isValid = false;
          }
        }

        // Step 1: Project details (title, description, location, budget, urgency)
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
            setError('emirate', 'Please select a location');
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

        // Step 3: Review (final validation before submit)
        if (currentStep === 3) {
          if (!selectedService) {
            setError('service', 'Please select a service');
            isValid = false;
          }
          if (!title || title.length < 10) {
            setError('title', 'Title is required');
            isValid = false;
          }
          if (!description || description.length < 20) {
            setError('description', 'Description is required');
            isValid = false;
          }
          if (!emirate) {
            setError('emirate', 'Location is required');
            isValid = false;
          }
          if (!budgetBracket) {
            setError('budgetBracket', 'Budget is required');
            isValid = false;
          }
          if (!urgency) {
            setError('urgency', 'Urgency is required');
            isValid = false;
          }
        }

        return isValid;
      },

      setSubmitting: (isSubmitting) => set({ isSubmitting }),

      setGeneratingContent: (isGenerating) => set({ isGeneratingContent: isGenerating }),

      reset: () => set(initialState),

      getTotalSteps: () => {
        // Fixed 4-step flow:
        // 0. Service selection
        // 1. Project details (title, description, location, budget, urgency)
        // 2. Photo upload (optional)
        // 3. Review & submit
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

      getFormData: () => {
        const {
          selectedService,
          title,
          description,
          emirate,
          neighborhood,
          budgetBracket,
          urgency,
          timeline,
          photos,
          answers,
        } = get();

        if (!selectedService || !title || !emirate || !budgetBracket || !urgency) {
          return null;
        }

        return {
          title,
          description,
          category: selectedService.slug,
          location: {
            emirate,
            neighborhood: neighborhood || undefined,
          },
          budgetBracket,
          urgency,
          timeline: timeline || undefined,
          photos: photos.length > 0 ? photos : undefined,
          serviceAnswers: Object.keys(answers).length > 0
            ? {
                serviceId: selectedService.id,
                answers,
                answeredAt: new Date(),
              }
            : undefined,
        };
      },
    }),
    {
      name: 'lead-form-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist form data, not UI state
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedService: state.selectedService,
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
      }),
    }
  )
);
