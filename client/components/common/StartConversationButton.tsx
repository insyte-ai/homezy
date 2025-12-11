'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface StartConversationButtonProps {
  recipientId: string;
  recipientName: string;
  relatedLeadId?: string;
  variant?: 'primary' | 'outline' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StartConversationButton({
  recipientId,
  recipientName,
  relatedLeadId,
  variant = 'outline',
  size = 'md',
  className = '',
}: StartConversationButtonProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleClick = () => {
    const basePath = user?.role === 'pro' ? '/pro/dashboard/messages' : '/dashboard/messages';

    // Build query params to open/start conversation
    const params = new URLSearchParams();
    params.set('recipientId', recipientId);
    params.set('recipientName', recipientName);
    if (relatedLeadId) {
      params.set('leadId', relatedLeadId);
    }

    router.push(`${basePath}?${params.toString()}`);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    icon: 'p-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full',
  };

  const buttonClass =
    variant === 'icon'
      ? variantClasses.icon
      : `${sizeClasses[size]} ${variantClasses[variant]} rounded-lg font-medium transition flex items-center gap-2`;

  return (
    <button
      onClick={handleClick}
      className={`${buttonClass} ${className}`}
      title={`Message ${recipientName}`}
    >
      <MessageSquare className={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} />
      {variant !== 'icon' && <span>Message</span>}
    </button>
  );
}
