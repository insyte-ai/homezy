import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export function CharacterCounter({ current, max, className = '' }: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  return (
    <div className={`text-sm ${className}`}>
      <span
        className={`font-medium ${
          isAtLimit
            ? 'text-red-600'
            : isNearLimit
            ? 'text-yellow-600'
            : 'text-gray-500'
        }`}
      >
        {current}/{max}
      </span>
      {isAtLimit && (
        <span className="ml-2 text-red-600 text-xs">Character limit reached</span>
      )}
    </div>
  );
}

export default CharacterCounter;
