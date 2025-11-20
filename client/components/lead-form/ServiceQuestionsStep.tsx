/**
 * Service Questions Step
 * Displays all service-specific questions grouped together on a single step
 * Replaces the previous one-question-per-step approach
 */

'use client';

import { useLeadFormStore } from '@/store/leadFormStore';
import { QuestionRenderer } from './QuestionComponents';
import { Lightbulb } from 'lucide-react';

export function ServiceQuestionsStep() {
  const { questionnaire, answers, errors, setAnswer } = useLeadFormStore();

  if (!questionnaire || !questionnaire.questions || questionnaire.questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">No service-specific questions</p>
              <p>This service uses a generic questionnaire. Please continue to the next step.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your {questionnaire.serviceName.toLowerCase()} needs
        </h2>
        <p className="text-sm text-gray-600">
          {questionnaire.description || 'Help professionals understand your specific requirements'}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why we ask these questions</p>
            <p>
              These details help us match you with the right professionals who have the exact skills
              and experience for your specific {questionnaire.serviceName.toLowerCase()} project.
            </p>
          </div>
        </div>
      </div>

      {/* All Questions */}
      <div className="space-y-8">
        {questionnaire.questions.map((question, index) => (
          <div
            key={question.id}
            className="pb-8 border-b border-gray-200 last:border-b-0 last:pb-0"
          >
            {/* Question Number Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Question {index + 1} of {questionnaire.questions.length}
                {question.required && (
                  <span className="ml-1 text-red-600">*</span>
                )}
              </span>
            </div>

            {/* Question Component */}
            <QuestionRenderer
              question={question}
              value={answers[question.id]}
              onChange={(value) => setAnswer(question.id, value)}
              error={errors[question.id]}
            />
          </div>
        ))}
      </div>

      {/* Helpful Tips Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="text-sm text-gray-700">
          <p className="font-medium mb-1">💡 Helpful tips:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Be as specific as possible - it helps professionals provide accurate quotes</li>
            <li>Questions marked with <span className="text-red-600">*</span> are required</li>
            <li>You can always come back and edit your answers before submitting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
