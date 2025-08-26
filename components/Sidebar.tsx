'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { User } from '../types';
import { useNotifications } from '@/context/NotificationContext';
import ProfileDropdown from './common/ProfileDropdown';
import Cookies from 'js-cookie';
import { useLoading } from '@/context/LoadingContext';

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { unreadByCategory } = useNotifications();
  const { showLoader } = useLoading();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  const handleLogout = () => {
    showLoader();
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };
  
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

              let isActive = false;
              if (href === '/dashboard') {
                isActive = pathname === '/dashboard' || pathname === '/dashboard/master' || pathname === '/dashboard/collaborator';
              } else {
                isActive = pathname.startsWith(href);
              }

              return (
                <li key={href}>
                  <Link href={href} className={`${styles.navLink} ${isActive ? styles.active : ''}`} onClick={() => pathname !== href && showLoader()}>
                    <span>{label}</span>
                    {unreadByCategory[key] && <span className={styles.notificationDot}></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <ProfileDropdown user={user} onLogout={handleLogout} />
    </aside>
  );
}