'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import Link from 'next/link';
import styles from './Profile.module.css';
import cardStyles from '@/components/common/Card.module.css';
import { getDay, differenceInCalendarWeeks } from 'date-fns';
import { translate } from '@/lib/translations';
import Cookies from 'js-cookie';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [superiorName, setSuperiorName] = useState<string>('N/A');

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      setUser(currentUser);

      if (currentUser.superiorId) {
        fetchSuperior(currentUser.superiorId);
      }
    }
  }, []);

  const fetchSuperior = async (superiorId: number) => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiURL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const users: User[] = await res.json();
        const superior = users.find(u => u.id === superiorId);
        if (superior) {
          setSuperiorName(`${superior.firstName} ${superior.lastName}`);
        }
      }
    } catch (error) {
      console.error("Falha ao ir buscar o nome do superior", error);
    }
  };

  const getCurrentWeekendOff = (): string => {
    if (!user || !user.initialWeekendOff || !user.createdAt) return 'N/A';

    const today = new Date();
    const userCreatedAt = new Date(user.createdAt);
    
    const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;

    let firstOccurrence = new Date(userCreatedAt);
    firstOccurrence.setDate(firstOccurrence.getDate() + (firstWeekendOffDay - getDay(firstOccurrence) + 7) % 7);

    const weeksDiff = differenceInCalendarWeeks(today, firstOccurrence, { weekStartsOn: 1 });

    const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);

    return currentWeekendOffDay === 6 ? 'Sábado' : 'Domingo';
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Meu Perfil</h1>
        <Link href="/dashboard/profile/edit">
            <button>Editar Perfil</button>
        </Link>
      </div>

      <div className={cardStyles.card}>
        <div className={styles.profileSection}>
            <h2 className={styles.sectionTitle}>Informações Pessoais</h2>
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
                <h2 className={styles.sectionTitle}>Informações de Trabalho</h2>
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