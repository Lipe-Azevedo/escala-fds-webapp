'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import Link from 'next/link';
import styles from './Profile.module.css';
import { getDay, differenceInCalendarWeeks } from 'date-fns';

const translate = (value: string | undefined): string => {
    if (!value) return 'N/A';
    const translations: Record<string, string> = {
        'Security': 'Segurança',
        'Support': 'Suporte',
        'CustomerService': 'Atendimento',
        'SupervisorI': 'Supervisor I',
        'SupervisorII': 'Supervisor II',
        'BackendDeveloper': 'Dev. Backend',
        'FrontendDeveloper': 'Dev. Frontend',
        'Attendant': 'Atendente',
        'Master': 'Master',
        'monday': 'Segunda-feira',
        'tuesday': 'Terça-feira',
        'wednesday': 'Quarta-feira',
        'thursday': 'Quinta-feira',
        'friday': 'Sexta-feira',
        'saturday': 'Sábado',
        'sunday': 'Domingo',
    };
    return translations[value] || value;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  const getCurrentWeekendOff = (): string => {
    if (!user || !user.initialWeekendOff || !user.createdAt) return 'N/A';

    const today = new Date();
    const userCreatedAt = new Date(user.createdAt);
    
    const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0; // 6 for Saturday, 0 for Sunday

    let firstOccurrence = new Date(userCreatedAt);
    firstOccurrence.setDate(firstOccurrence.getDate() + (firstWeekendOffDay - getDay(firstOccurrence) + 7) % 7);

    const weeksDiff = differenceInCalendarWeeks(today, firstOccurrence, { weekStartsOn: 1 });

    const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);

    return currentWeekendOffDay === 6 ? 'Sábado' : 'Domingo';
  };


  if (!user) {
    return <p>A carregar perfil...</p>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Meu Perfil</h1>
        <Link href="/dashboard/profile/edit">
            <button>Editar Perfil</button>
        </Link>
      </div>

      <div className={styles.profileCard}>
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