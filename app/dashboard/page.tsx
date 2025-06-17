'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Swap, Certificate } from '../../types';
import Calendar from '../../components/Calendar';
import DashboardSummaryCard from '@/components/DashboardSummaryCard';

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  // State for dashboard data
  const [pendingSwaps, setPendingSwaps] = useState(0);
  const [pendingCertificates, setPendingCertificates] = useState(0);
  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isShiftNow = (shift: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const [startStr, endStr] = shift.split('-');
    const startHour = parseInt(startStr.split(':')[0], 10);
    const endHour = parseInt(endStr.split(':')[0], 10);

    if (startHour < endHour) { // Turnos diurnos (ex: 06-14, 14-22)
      return currentHour >= startHour && currentHour < endHour;
    } else { // Turno noturno (ex: 22-06)
      return currentHour >= startHour || currentHour < endHour;
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      Cookies.remove('authToken');
      router.push('/login');
      return;
    }
    
    const currentUser = JSON.parse(userDataString);
    setUser(currentUser);

    if (currentUser.userType === 'master') {
      fetchMasterDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchMasterDashboardData = async () => {
    setIsLoading(true);
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const [swapsRes, certificatesRes, usersRes] = await Promise.all([
        fetch(`${apiURL}/api/swaps`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiURL}/api/certificates`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const swaps: Swap[] = await swapsRes.json();
      const certificates: Certificate[] = await certificatesRes.json();
      const users: User[] = await usersRes.json();

      setPendingSwaps(swaps.filter(s => s.status === 'pending').length);
      setPendingCertificates(certificates.filter(c => c.status === 'pending').length);
      setUsersOnShift(users.filter(u => u.shift && isShiftNow(u.shift)));

    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        // Master's Dashboard View
        <div>
          <h2 style={{fontWeight: 400, marginBottom: '25px'}}>Bem-vindo(a) de volta, {user.firstName}!</h2>
          {isLoading ? <p>Carregando resumo...</p> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <DashboardSummaryCard 
                  title="Trocas de Folga Pendentes"
                  value={pendingSwaps}
                  linkTo="/dashboard/swaps"
                  linkLabel="Ver trocas"
                />
                <DashboardSummaryCard 
                  title="Atestados Médicos Pendentes"
                  value={pendingCertificates}
                  linkTo="/dashboard/certificates"
                  linkLabel="Ver atestados"
                />
              </div>
              <div style={{marginTop: '40px'}}>
                <h3>Colaboradores de Plantão Agora</h3>
                <div style={{backgroundColor: 'white', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>
                  {usersOnShift.length > 0 ? (
                    <ul style={{listStyle: 'none', padding: 0}}>
                      {usersOnShift.map(u => (
                        <li key={u.id} style={{padding: '10px 0', borderBottom: '1px solid #eee'}}>
                          {u.firstName} {u.lastName} ({u.team}) - Turno: {u.shift}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nenhum colaborador no turno atual.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        // Collaborator's Calendar View
        <Calendar user={user} />
      )}
    </div>
  );
}