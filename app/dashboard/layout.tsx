'use client';

import Sidebar from '@/components/Sidebar';
import { NotificationProvider } from '@/context/NotificationContext';
import { useAuth } from '@/hooks/useAuth';
import styles from './layout.module.css';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
import { NavigationEvents } from '@/context/NavigationEvents';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Suspense } from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  useAuth();
  const { isLoading } = useLoading();

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />
      <main className={styles.mainContent}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <LoadingSpinner size={40} />
          </div>
        ) : (
          children
        )}
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
      <LoadingProvider>
        <DashboardContent>{children}</DashboardContent>
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
      </LoadingProvider>
    </NotificationProvider>
  );
}