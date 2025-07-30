'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Swap, Certificate } from '@/types';
import Calendar from '@/components/calendar/Calendar';
import DashboardSummaryCard from '@/components/common/DashboardSummaryCard';

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  const [pendingSwaps, setPendingSwaps] = useState(0);
  const [pendingCertificates, setPendingCertificates] = useState(0);
  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isShiftNow = (shift: string): boolean => {
    if (!shift || !shift.includes('-')) {
      return false;
    }
  
    const now = new Date();
    const currentHour = now.getHours();
    
    try {
      const [startStr, endStr] = shift.split('-');
      const startHour = parseInt(startStr.split(':')[0], 10);
      const endHour = parseInt(endStr.split(':')[0], 10);
  
      if (isNaN(startHour) || isNaN(endHour)) {
        return false;
      }
  
      if (startHour < endHour) {
        return currentHour >= startHour && currentHour < endHour;
      } else {
        return currentHour >= startHour || currentHour < endHour;
      }
    } catch (error) {
      console.error("Error parsing shift string:", shift, error);
      return false;
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      setIsLoading(false);
      router.push('/login');
      return;
    }
    
    const currentUser = JSON.parse(userDataString);
    setUser(currentUser);

    const fetchData = async () => {
        setIsLoading(true);
        const token = Cookies.get('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            const allUsers: User[] = await usersRes.json();

            if (currentUser.userType === 'master') {
                const [swapsRes, certsRes] = await Promise.all([
                    fetch(`${apiURL}/api/swaps?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/certificates`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                const swaps: Swap[] = await swapsRes.json();
                const certs: Certificate[] = await certsRes.json();
                setPendingSwaps(swaps.length);
                setPendingCertificates(certs.filter(c => c.status === 'pending').length);
                setUsersOnShift(allUsers.filter(u => u.shift && isShiftNow(u.shift)));
            } else {
                const colleaguesOnShift = allUsers.filter(u => 
                    u.id !== currentUser.id && 
                    u.shift === currentUser.shift && 
                    isShiftNow(u.shift)
                );
                setUsersOnShift(colleaguesOnShift);
            }
        } catch (error) { 
            console.error("Failed to fetch dashboard data", error);
        } finally { 
            setIsLoading(false); 
        }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{user.userType === 'master' ? 'Painel Principal' : 'Meu Calendário'}</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>

      {user.userType === 'master' ? (
        <div>
          {isLoading ? <p>Carregando resumo...</p> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
                <DashboardSummaryCard title="Trocas Pendentes" value={pendingSwaps} linkTo="/dashboard/swaps" linkLabel="Ver trocas"/>
                <DashboardSummaryCard title="Atestados Pendentes" value={pendingCertificates} linkTo="/dashboard/certificates" linkLabel="Ver atestados"/>
              </div>
              <div style={{marginTop: '40px'}}>
                <h3>Colaboradores de Plantão Agora</h3>
                <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', border: '1px solid rgb(var(--card-border-rgb))', padding: '10px 20px', borderRadius: '8px'}}>
                  {usersOnShift.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: 0}}>
                      {usersOnShift.map(u => (
                        <li key={u.id} style={{padding: '10px 0', borderBottom: '1px solid rgb(var(--card-border-rgb))'}}>
                          {u.firstName} {u.lastName} ({u.team}) - Turno: {u.shift}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{color: 'var(--text-secondary-color)'}}>Nenhum colaborador no turno atual.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <Calendar user={user} />
          <div style={{marginTop: '40px'}}>
            <h3>Colegas no seu Turno Agora</h3>
            <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', border: '1px solid rgb(var(--card-border-rgb))', padding: '10px 20px', borderRadius: '8px'}}>
              {isLoading ? <p>Carregando...</p> : usersOnShift.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0}}>
                  {usersOnShift.map(u => (
                    <li key={u.id} style={{padding: '10px 0', borderBottom: '1px solid rgb(var(--card-border-rgb))'}}>
                      {u.firstName} {u.lastName} ({u.team})
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{color: 'var(--text-secondary-color)'}}>Nenhum outro colaborador no seu turno agora.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}