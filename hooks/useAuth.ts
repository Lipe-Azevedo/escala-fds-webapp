'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get('authToken');
    const isLoginPage = pathname === '/login';

    if (token && isLoginPage) {
      // Se o usuário está logado e tenta acessar /login, redireciona para o dashboard
      router.push('/dashboard');
    }
    
    if (!token && !isLoginPage) {
      // Se não está logado e tenta acessar qualquer outra página, redireciona para o login
      router.push('/login');
    }
  }, [pathname, router]);
}