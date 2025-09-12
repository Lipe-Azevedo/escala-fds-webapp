'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import styles from '../../profile/Profile.module.css'; 
import cardStyles from '@/components/common/Card.module.css';
import { getDay, differenceInCalendarWeeks } from 'date-fns';
import { translate } from '@/lib/translations';
import UserSquareIcon from '@/components/icons/UserSquareIcon';
import BriefcaseIcon from '@/components/icons/BriefcaseIcon';

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [superiorName, setSuperiorName] = useState<string>('N/A');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (!id) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const res = await fetch(`${apiURL}/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Falha ao carregar dados do colaborador.');
        }

        const userData: User = await res.json();
        setUser(userData);

        if (userData.superiorId) {
          // Fetch all users to find the superior's name
          const allUsersRes = await fetch(`${apiURL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (allUsersRes.ok) {
            const allUsers: User[] = await allUsersRes.json();
            const superior = allUsers.find(u => u.id === userData.superiorId);
            if (superior) {
              setSuperiorName(`${superior.firstName} ${superior.lastName}`);
            }
          }
        }
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const getCurrentWeekendOff = (): string => {
    if (!user || !user.initialWeekendOff || !user.createdAt) return 'N/A';

    const today = new Date();
    const userCreatedAt = new Date(user.createdAt);
    
    const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;

    const firstOccurrence = new Date(userCreatedAt);
    firstOccurrence.setDate(firstOccurrence.getDate() + (firstWeekendOffDay - getDay(firstOccurrence) + 7) % 7);

    const weeksDiff = differenceInCalendarWeeks(today, firstOccurrence, { weekStartsOn: 1 });

    const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);

    return currentWeekendOffDay === 6 ? 'Sábado' : 'Domingo';
  };

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (!user) {
    return <p>Colaborador não encontrado.</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Perfil do Colaborador</h1>
        <button onClick={() => router.back()}>Voltar</button>
      </div>

      <div className={cardStyles.card}>
        <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <UserSquareIcon size={22} />
              Informações Pessoais
            </h2>
            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Nome Completo</span>
                    <span className={styles.infoValue}>{user.firstName} {user.lastName}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{user.email}</span>
                </div>
                 <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Telefone</span>
                    <span className={styles.infoValue}>{user.phoneNumber || 'N/A'}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Aniversário</span>
                    <span className={styles.infoValue}>{user.birthday ? new Date(user.birthday.replace(/-/g, '/')).toLocaleDateString('pt-BR') : 'N/A'}</span>
                </div>
            </div>
        </div>
        
        {user.userType === 'collaborator' && (
            <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <BriefcaseIcon size={22} />
                  Informações de Trabalho
                </h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Equipe</span>
                        <span className={styles.infoValue}>{translate(user.team)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Cargo</span>
                        <span className={styles.infoValue}>{translate(user.position)}</span>
                    </div>
                     <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Superior Direto</span>
                        <span className={styles.infoValue}>{superiorName}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Turno</span>
                        <span className={styles.infoValue}>{user.shift || 'N/A'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Folga na Semana</span>
                        <span className={styles.infoValue}>{translate(user.weekdayOff)}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Folga Fim de Semana (Semana Atual)</span>
                        <span className={styles.infoValue}>{getCurrentWeekendOff()}</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}