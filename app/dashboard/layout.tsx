'use client';

import Sidebar from '@/components/Sidebar';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAuth(); // Proteção de Rota

  return (
    <NotificationProvider>
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  )
}