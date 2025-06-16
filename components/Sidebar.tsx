'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';
import { User } from '../types';

const navItems = [
  { href: '/dashboard', label: 'Início', masterOnly: false },
  { href: '/dashboard/users', label: 'Colaboradores', masterOnly: true },
  { href: '/dashboard/swaps', label: 'Trocas de Folga', masterOnly: false },
  { href: '/dashboard/certificates', label: 'Atestados', masterOnly: false },
  { href: '/dashboard/holidays', label: 'Feriados', masterOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>EscalaFDS</h1>
      <nav className={styles.nav}>
        {navItems.map(({ href, label, masterOnly }) => {
          if (masterOnly && user?.userType !== 'master') {
            return null;
          }
          return (
            <Link key={href} href={href} className={`${styles.navItem} ${pathname === href ? styles.active : ''}`}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}