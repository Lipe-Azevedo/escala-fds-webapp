'use client';

import Sidebar from '@/components/Sidebar';
import { NotificationProvider } from '@/context/NotificationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flexGrow: 1, padding: '20px 40px' }}>
          {children}
        </main>
      </div>
    </NotificationProvider>
  )
}