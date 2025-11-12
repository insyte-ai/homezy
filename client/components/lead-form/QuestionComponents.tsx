/**
 * Question Type Components
 * Reusable components for rendering different question types
 */

'use client';

import { QuestionOption, ServiceQuestion } from '@/config/questionTypes';
import { Check } from 'lucide-react';

interface QuestionComponentProps {
  question: ServiceQuestion;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  error?: string;
}

/**
 * Single Choice Question Component
 * Renders as a grid of selectable cards
 */
export function SingleChoiceQuestion({
  question,
  value,
  onChange,
  error,
}: QuestionComponentProps) {
  const selectedValue = value as string | undefined;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-gray-600">{question.helpText}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            isSelected={selectedValue === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Multiple Choice Question Component
 * Renders as a grid of multi-selectable cards
 */
export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
  error,
}: QuestionComponentProps) {
  const selectedValues = (value as string[] | undefined) || [];

  const handleToggle = (optionValue: string) => {
    if (selectedValues.includes(optionValue)) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    } else {
      onChange([...selectedValues, optionValue]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-gray-600">{question.helpText}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options?.map((option) => (
          <OptionCard
            key={option.value}
            option={option}
            isSelected={selectedValues.includes(option.value)}
            onClick={() => handleToggle(option.value)}
            multiSelect
          />
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Text Input Question Component
 */
export function TextQuestion({
  question,
  value,
  onChange,
  error,
}: QuestionComponentProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-gray-600 mb-4">{question.helpText}</p>
        )}
      </div>

      <textarea
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        minLength={question.minLength}
        maxLength={question.maxLength}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
      />

      {question.maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {((value as string) || '').length} / {question.maxLength}
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Number Input Question Component
 */
export function NumberQuestion({
  question,
  value,
  onChange,
  error,
}: QuestionComponentProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.question}
        </h2>
        {question.helpText && (
          <p className="text-sm text-gray-600 mb-4">{question.helpText}</p>
        )}
      </div>

      <input
        type="number"
        value={(value as number) || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={question.placeholder}
        min={question.min}
        max={question.max}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Reusable Option Card Component
 */
interface OptionCardProps {
  option: QuestionOption;
  isSelected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}

function OptionCard({
  option,
  isSelected,
  onClick,
  multiSelect = false,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 transition-all text-left
        ${
          isSelected
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        {option.icon && (
          <div className="text-3xl flex-shrink-0">{option.icon}</div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 mb-1">
            {option.label}
          </div>
          {option.helpText && (
            <div className="text-sm text-gray-600">{option.helpText}</div>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Question Renderer - automatically selects the right component
 */
export function QuestionRenderer(props: QuestionComponentProps) {
  switch (props.question.type) {
    case 'single-choice':
      return <SingleChoiceQuestion {...props} />;
    case 'multiple-choice':
      return <MultipleChoiceQuestion {...props} />;
    case 'text':
      return <TextQuestion {...props} />;
    case 'number':
      return <NumberQuestion {...props} />;
    default:
      return <div>Unknown question type</div>;
  }
}
