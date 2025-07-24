'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './Sidebar.module.css';
import { User, Notification } from '../types';
import BellIcon from './icons/BellIcon';

const navItems = [
    { href: '/dashboard', label: 'Início' },
    { href: '/dashboard/users', label: 'Colaboradores' },
    { href: '/dashboard/swaps', label: 'Trocas de Folga' },
    { href: '/dashboard/certificates', label: 'Atestados' },
    { href: '/dashboard/comments', label: 'Comentários' },
    { href: '/dashboard/holidays', label: 'Feriados' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }

    const fetchUnreadCount = async () => {
      const token = Cookies.get('authToken');
      if (!token) return;
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      try {
          const res = await fetch(`${apiURL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
          if(res.ok) {
              const data: Notification[] = await res.json();
              setUnreadCount(data.filter(n => !n.isRead).length);
          }
      } catch(e) {
          console.error("Failed to fetch notifications", e);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Continua verificando periodicamente
    return () => clearInterval(interval);
  }, [pathname]); // Adiciona o pathname como dependência para re-buscar a cada navegação

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          EscalaFDS
        </div>
        <nav className={styles.nav}>
          <ul>
            {navItems.map(({ href, label }) => {
              if ((label === 'Colaboradores' || label === 'Feriados') && user?.userType !== 'master') {
                return null;
              }
              return (
                <li key={href}>
                  <Link href={href} className={`${styles.navLink} ${pathname.startsWith(href) && href !== '/dashboard' || pathname === href ? styles.active : ''}`}>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className={styles.sidebarFooter}>
        <button className={styles.notificationBell} onClick={() => router.push('/dashboard/notifications')}>
            <BellIcon />
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
        </button>
        <div className={styles.userProfile}>
          {user ? user.firstName.charAt(0) : ''}
        </div>
      </div>
    </aside>
  );
}