'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        EscalaFDS
      </div>
      <nav className={styles.nav}>
        <ul>
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.userProfile}>
        N
      </div>
    </aside>
  );
}