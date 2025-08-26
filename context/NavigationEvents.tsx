'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoader } = useLoading();

  useEffect(() => {
    hideLoader();
  }, [pathname, searchParams, hideLoader]);

  return null;
}