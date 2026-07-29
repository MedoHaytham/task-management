'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery } from '@/features/userSlice';
import LoadingScreen from './LoadingScreen';

export default function GuestGuard({ children }) {
  const { data, isLoading } = useGetMeQuery();
  const user = data?.data?.data ?? null;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/projects');
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
