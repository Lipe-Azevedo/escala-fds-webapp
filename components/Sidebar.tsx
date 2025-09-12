'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { User } from '../types';
import { useNotifications } from '@/context/NotificationContext';
import ProfileDropdown from './common/ProfileDropdown';
import Cookies from 'js-cookie';
import CalendarIcon from './icons/CalendarIcon';
import UsersIcon from './icons/UsersIcon';
import SwapIcon from './icons/SwapIcon';
import CertificateIcon from './icons/CertificateIcon';
import CommentIcon from './icons/CommentIcon';
import HolidayIcon from './icons/HolidayIcon';

const navItems = [
    { href: '/dashboard', label: 'Início', key: 'home', icon: CalendarIcon },
    { href: '/dashboard/users', label: 'Colaboradores', key: 'users', managerOnly: true, icon: UsersIcon },
    { href: '/dashboard/swaps', label: 'Trocas', key: 'swaps', icon: SwapIcon },
    { href: '/dashboard/certificates', label: 'Atestados', key: 'certificates', icon: CertificateIcon },
    { href: '/dashboard/comments', label: 'Comentários', key: 'comments', icon: CommentIcon },
    { href: '/dashboard/holidays', label: 'Feriados', key: 'holidays', masterOnly: true, icon: HolidayIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const { unreadByCategory } = useNotifications();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };
  
  const canViewManagerItems = user?.userType === 'master' || (user?.position && user.position.includes('Supervisor'));

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          <Image src="/logo-main.png" alt="EscalaFDS Logo" width={0} height={0} sizes="100vw" style={{ width: '70%', height: 'auto' }} priority />
        </div>
        <nav className={styles.nav}>
          <ul>
            {navItems.map(({ href, label, key, masterOnly, managerOnly, icon: Icon }) => {
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
                  <Link href={href} className={`${styles.navLink} ${isActive ? styles.active : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon />
                      <span>{label}</span>
                    </div>
                    {unreadByCategory[key] && <span className={styles.notificationDot}></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <ProfileDropdown onLogout={handleLogout} />
    </aside>
  );
}