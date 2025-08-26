'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const user: User = JSON.parse(userDataString);
      
      if (user.userType === 'master') {
        router.replace('/dashboard/master');
      } else {
        router.replace('/dashboard/collaborator');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <LoadingSpinner size={40} />
    </div>
  );
}