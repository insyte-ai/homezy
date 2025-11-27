'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirect page - forwards to /dashboard/create-request
 * Kept for backwards compatibility with any existing links
 */
export default function CreateRequestRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/create-request');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
    </div>
  );
}
