'use client';

export const WelcomeSection = () => {
  const suggestedPrompts = [
    'Estimate budget for kitchen renovation',
    'How long does bathroom remodeling take?',
    'What permits do I need in Dubai?',
    'Best flooring for UAE climate',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center space-y-6">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Home GPT
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered home improvement assistant for UAE
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600">
          Get instant budget estimates, timeline planning, and expert advice for your home improvement projects.
          Ask me anything about renovations, repairs, or home maintenance in the UAE.
        </p>

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                onClick={() => {
                  // TODO: Pre-fill message input with this prompt
                  console.log('Suggested prompt:', prompt);
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-gray-600">Budget Estimates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📅</div>
            <p className="text-xs text-gray-600">Timeline Planning</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-gray-600">Expert Knowledge</p>
          </div>
        </div>
      </div>
    </div>
  );
};
