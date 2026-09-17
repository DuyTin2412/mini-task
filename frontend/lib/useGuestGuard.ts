'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from './auth';

export function useGuestGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push('/projects');
    }
  }, [router]);
}