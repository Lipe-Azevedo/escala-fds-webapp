'use client';

import Sidebar from '@/components/Sidebar';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './layout.module.css';
import { Suspense } from 'react';
import TopLoader from '@/components/common/TopLoader';

function DashboardContent({ children }: { children: React.ReactNode }) {
  useAuth();

  return (
    <div className={styles.dashboardContainer}>
      <TopLoader />
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <Suspense>
        <DashboardContent>{children}</DashboardContent>
      </Suspense>
    </NotificationProvider>
  );
}