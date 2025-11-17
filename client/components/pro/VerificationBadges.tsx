import React from 'react';
import { CheckCircle, Shield, Award } from 'lucide-react';

interface VerificationBadgesProps {
  verificationStatus: 'unverified' | 'pending' | 'basic' | 'comprehensive' | 'rejected';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function VerificationBadges({
  verificationStatus,
  size = 'md',
  showLabel = true,
  className = '',
}: VerificationBadgesProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (verificationStatus === 'unverified' || verificationStatus === 'rejected') {
    return null;
  }

  if (verificationStatus === 'pending') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full ${className}`}
      >
        <Shield className={sizeClasses[size]} />
        {showLabel && <span className={`font-medium ${textSizeClasses[size]}`}>Pending Verification</span>}
      </div>
    );
  }

  if (verificationStatus === 'basic') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 text-neutral-900 rounded-full ${className}`}
        title="Basic Verified - License & Insurance"
      >
        <CheckCircle className={sizeClasses[size]} />
        {showLabel && (
          <span className={`font-medium ${textSizeClasses[size]}`}>
            Verified <span className="font-normal">✓</span>
          </span>
        )}
      </div>
    );
  }

  if (verificationStatus === 'comprehensive') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 border-2 border-primary-600 text-neutral-900 rounded-full ${className}`}
        title="Comprehensive Verified - Background Check, References & Portfolio"
      >
        <Award className={sizeClasses[size]} />
        {showLabel && (
          <span className={`font-medium ${textSizeClasses[size]}`}>
            Premium Verified <span className="font-normal">✓✓</span>
          </span>
        )}
      </div>
    );
  }

  return null;
}

export default VerificationBadges;
