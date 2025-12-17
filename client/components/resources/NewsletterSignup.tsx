'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

interface NewsletterSignupProps {
  variant?: 'default' | 'compact';
  title?: string;
  description?: string;
}

export function NewsletterSignup({
  variant = 'default',
  title = 'Stay Updated',
  description = 'Get the latest home improvement tips, industry insights, and exclusive guides delivered to your inbox.',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setStatus('loading');

    // Simulate API call - replace with actual newsletter signup
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus('success');
      setMessage('Thanks for subscribing! Check your inbox to confirm.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-primary-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm">{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? '...' : <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-2 text-sm text-red-600">{message}</p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Mail className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-semibold">{title}</h3>
      </div>
      <p className="text-primary-100 mb-6">
        {description}
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-3 bg-white/10 rounded-lg p-4">
          <CheckCircle className="h-6 w-6 text-green-300" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder:text-primary-200 focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-300">{message}</p>
          )}
          <p className="text-xs text-primary-200">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}

export default NewsletterSignup;
