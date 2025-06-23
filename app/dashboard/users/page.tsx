'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Calendar from '@/components/calendar/Calendar'; // Caminho atualizado
import Link from 'next/link';
import { User } from '@/types';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const res = await fetch(`${apiURL}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Falha ao buscar dados do usuário.');
        }
        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [userId]);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!user) return <div>Usuário não encontrado.</div>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/users" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          &larr; Voltar para a lista
        </Link>
      </div>
      <h1>Calendário de {user.firstName} {user.lastName}</h1>
      <Calendar user={user} />
    </div>
  );
}