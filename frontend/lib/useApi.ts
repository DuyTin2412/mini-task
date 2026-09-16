'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from './auth';

export function useApi() {
  const router = useRouter();

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      if (res.status === 401) {
        logout();
        router.push('/login');
        throw new Error('Chưa đăng nhập hoặc phiên đã hết hạn');
      }

      if (res.status === 403) {
        const err = await res.json().catch(() => ({ message: 'Bạn không có quyền thực hiện hành động này' }));
        throw new Error(err.message);
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Đã xảy ra lỗi' }));
        throw new Error(err.message);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    },
    [router],
  );

  return { apiFetch };
}