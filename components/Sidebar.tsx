'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import styles from './Sidebar.module.css';
import { User, Notification } from '../types';
import NotificationPanel from './common/NotificationPanel';

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
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    const token = Cookies.get('authToken');
    if (!token) return;
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) {
            const data = await res.json();
            setNotifications(data || []);
        }
    } catch(e) {
        console.error("Failed to fetch notifications", e);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, []);
  
  const handleNotificationClick = async (notification: Notification) => {
    if (notification.isRead) return;
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      await fetch(`${apiURL}/api/notifications/${notification.id}/read`, { 
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>EscalaFDS</div>
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
      <div className={styles.sidebarFooter}>
        <div className={styles.notificationBell} onClick={() => setShowNotifications(!showNotifications)}>
            &#128276;
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
        </div>
        <div className={styles.userProfile}>
          {user ? user.firstName.charAt(0) : ''}
        </div>
      </div>
      {showNotifications && <NotificationPanel notifications={notifications} onNotificationClick={handleNotificationClick} onClose={() => setShowNotifications(false)}/>}
    </aside>
  );
}