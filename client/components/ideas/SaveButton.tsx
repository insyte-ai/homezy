'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { savePhoto, unsavePhoto } from '@/lib/services/ideas';
import toast from 'react-hot-toast';

interface SaveButtonProps {
  photoId: string;
  initialSaved?: boolean;
  saveCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'icon' | 'button';
  onSaveChange?: (isSaved: boolean) => void;
}

export function SaveButton({
  photoId,
  initialSaved = false,
  saveCount = 0,
  size = 'md',
  showCount = false,
  variant = 'icon',
  onSaveChange,
}: SaveButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState(saveCount);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        await unsavePhoto(photoId);
        setIsSaved(false);
        setCount((prev) => Math.max(0, prev - 1));
        toast.success('Removed from My Ideas');
      } else {
        await savePhoto(photoId);
        setIsSaved(true);
        setCount((prev) => prev + 1);
        toast.success('Saved to My Ideas');
      }
      onSaveChange?.(!isSaved);
    } catch (error) {
      toast.error('Failed to save photo');
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
          isSaved
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isLoading ? (
          <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        ) : (
          <Heart className={`${sizeClasses[size]} ${isSaved ? 'fill-current' : ''}`} />
        )}
        <span>{isSaved ? 'Saved' : 'Save'}</span>
        {showCount && count > 0 && (
          <span className="text-sm opacity-75">({count})</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`rounded-full ${buttonSizeClasses[size]} transition-all ${
        isSaved
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white/90 text-gray-700 hover:bg-white hover:text-red-500'
      }`}
      aria-label={isSaved ? 'Unsave photo' : 'Save photo'}
    >
      {isLoading ? (
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      ) : (
        <Heart className={`${sizeClasses[size]} ${isSaved ? 'fill-current' : ''}`} />
      )}
    </button>
  );
}
