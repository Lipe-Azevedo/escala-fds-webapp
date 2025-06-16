'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/dashboard', label: 'Início' },
  { href: '/dashboard/users', label: 'Colaboradores' },
  { href: '/dashboard/swaps', label: 'Trocas de Folga' },
  { href: '/dashboard/certificates', label: 'Atestados' },
  { href: '/dashboard/holidays', label: 'Feriados' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>EscalaFDS</h1>
      <nav className={styles.nav}>
        {navItems.map(({ href, label }) => (
          <Link key={href} href={href} className={`${styles.navItem} ${pathname === href ? styles.active : ''}`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}