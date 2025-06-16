'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type User = {
  firstName: string;
  lastName: string;
};

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      Cookies.remove('authToken');
      router.push('/login');
    } else {
      setUser(JSON.parse(userDataString));
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Painel Principal</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>
      <h2 style={{fontWeight: 400}}>Bem-vindo(a) de volta, {user.firstName} {user.lastName}!</h2>
      <p>Utilize a navegação ao lado para gerenciar o sistema.</p>
    </div>
  );
}