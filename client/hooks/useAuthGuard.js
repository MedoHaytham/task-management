// hooks/useAuthGuard.js
//
// Reusable auth guard hook for any protected page.
// - Shows <LoadingScreen /> while the session is being verified
// - Redirects to /login if unauthenticated
// - Returns { user, isReady } once authenticated
//
// Usage:
//   const { user, isReady } = useAuthGuard();
//   if (!isReady) return <LoadingScreen />;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/features/userSlice';

export function useAuthGuard() {
  const { data, isLoading } = useGetMeQuery();
  const user = data?.data?.data ?? null;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  return {
    user,
    isReady: !isLoading && !!user,
  };
}
