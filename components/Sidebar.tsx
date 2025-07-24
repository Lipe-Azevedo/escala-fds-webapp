'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './Sidebar.module.css';
import { User, Notification } from '../types';

const navItems = [
    { href: '/dashboard', label: 'Início', key: 'home' },
    { href: '/dashboard/users', label: 'Colaboradores', key: 'users', masterOnly: true },
    { href: '/dashboard/swaps', label: 'Trocas de Folga', key: 'swaps' },
    { href: '/dashboard/certificates', label: 'Atestados', key: 'certificates' },
    { href: '/dashboard/comments', label: 'Comentários', key: 'comments' },
    { href: '/dashboard/holidays', label: 'Feriados', key: 'holidays', masterOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
    
    const fetchNotifications = async () => {
      const token = Cookies.get('authToken');
      if (!token) return;
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      try {
          const res = await fetch(`${apiURL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
          if(res.ok) {
              const data: Notification[] = await res.json();
              const unreadStatus: Record<string, boolean> = {};
              const unreadNotifications = data.filter(n => !n.isRead);

              for (const n of unreadNotifications) {
                if (n.link.includes('/swaps')) unreadStatus.swaps = true;
                if (n.link.includes('/comments')) unreadStatus.comments = true;
                if (n.link.includes('/certificates')) unreadStatus.certificates = true;
              }
              setNotificationStatus(unreadStatus);
          }
      } catch(e) {
          console.error("Failed to fetch notifications", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logo}>
          EscalaFDS
        </div>
        <nav className={styles.nav}>
          <ul>
            {navItems.map(({ href, label, key, masterOnly }) => {
              if (masterOnly && user?.userType !== 'master') {
                return null;
              }
              return (
                <li key={href}>
                  <Link href={href} className={`${styles.navLink} ${pathname.startsWith(href) && href !== '/dashboard' || pathname === href ? styles.active : ''}`}>
                    <span>{label}</span>
                    {notificationStatus[key] && <span className={styles.notificationDot}></span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div className={styles.userProfile}>
        {user ? user.firstName.charAt(0) : ''}
      </div>
    </aside>
  );
}