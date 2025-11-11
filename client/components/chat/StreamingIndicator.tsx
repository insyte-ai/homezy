'use client';

export const StreamingIndicator = () => {
  return (
    <div className="flex items-center gap-2 text-gray-600 text-sm py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>Home GPT is thinking...</span>
    </div>
  );
};
