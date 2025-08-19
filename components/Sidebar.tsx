'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { User } from '../types';
import { useNotifications } from '@/context/NotificationContext';

const navItems = [
    { href: '/dashboard', label: 'Início', key: 'home' },
    { href: '/dashboard/users', label: 'Colaboradores', key: 'users', managerOnly: true },
    { href: '/dashboard/swaps', label: 'Trocas de Folga', key: 'swaps' },
    { href: '/dashboard/certificates', label: 'Atestados', key: 'certificates' },
    { href: '/dashboard/comments', label: 'Comentários', key: 'comments' },
    { href: '/dashboard/holidays', label: 'Feriados', key: 'holidays', masterOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { unreadByCategory } = useNotifications();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);
  
  const canViewManagerItems = user?.userType === 'master' || (user?.position && user.position.includes('Supervisor'));

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          EscalaFDS
        </div>
        <nav className={styles.nav}>
          <ul>
            {navItems.map(({ href, label, key, masterOnly, managerOnly }) => {
              if (masterOnly && user?.userType !== 'master') {
                return null;
              }
              if (managerOnly && !canViewManagerItems) {
                  return null;
              }
              return (
                <li key={href}>
                  <Link href={href} className={`${styles.navLink} ${pathname.startsWith(href) && href !== '/dashboard' || pathname === href ? styles.active : ''}`}>
                    <span>{label}</span>
                    {unreadByCategory[key] && <span className={styles.notificationDot}></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <Link href="/dashboard/profile" title="Meu Perfil" style={{ textDecoration: 'none', alignSelf: 'center' }}>
        <div className={styles.userProfile}>
          {user ? user.firstName.charAt(0) : ''}
        </div>
      </Link>
    </aside>
  );
}