'use client';

import { useRouter } from 'next/navigation';

interface GuestLimitBannerProps {
  remaining: number;
}

export const GuestLimitBanner = ({ remaining }: GuestLimitBannerProps) => {
  const router = useRouter();

  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-1">
              Message Limit Reached
            </h3>
            <p className="text-sm text-red-700 mb-3">
              You've used all your free messages. Sign up to continue chatting with Home GPT and unlock unlimited conversations.
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-yellow-800">
            <span className="font-medium">{remaining} message{remaining !== 1 ? 's' : ''} remaining</span> as a guest
          </p>
        </div>
        <button
          onClick={() => router.push('/auth/register')}
          className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
