'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = Cookies.get('authToken');
    const isLoginPage = pathname === '/login';

    if (token && isLoginPage) {
      router.replace('/dashboard');
    } else if (!token && !isLoginPage) {
      router.replace('/login');
    } else {
      setIsVerifying(false);
    }
  }, [pathname, router]);

  return isVerifying;
}