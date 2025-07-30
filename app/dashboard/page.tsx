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
  const [error, setError] = useState('');

  const isShiftNow = (shift: string): boolean => {
    if (!shift || !shift.includes('-')) {
      return false;
    }
  
    const now = new Date();
    const currentHour = now.getHours();
    
    try {
      const parts = shift.split('-');
      if (parts.length !== 2) return false;

      const startHour = parseInt(parts[0].split(':')[0], 10);
      const endHour = parseInt(parts[1].split(':')[0], 10);
  
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
        setError('');
        const token = Cookies.get('authToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!usersRes.ok) throw new Error('Falha ao buscar usuários.');
            const allUsers: User[] = await usersRes.json();

            if (currentUser.userType === 'master') {
                const [swapsRes, certsRes] = await Promise.all([
                    fetch(`${apiURL}/api/swaps`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/certificates`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                if (!swapsRes.ok) throw new Error('Falha ao buscar trocas.');
                if (!certsRes.ok) throw new Error('Falha ao buscar atestados.');

                const swaps: Swap[] = await swapsRes.json();
                const certs: Certificate[] = await certsRes.json();
                
                setPendingSwaps(swaps.filter(s => s.status === 'pending').length);
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
        } catch (error: any) { 
            console.error("Failed to fetch dashboard data", error);
            setError(error.message);
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

  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#a0aec0',
    textTransform: 'uppercase',
    fontSize: '12px',
    borderBottom: '2px solid rgb(var(--card-border-rgb))',
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid rgb(var(--card-border-rgb))',
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
          {isLoading ? <p>Carregando resumo...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
                <DashboardSummaryCard title="Trocas Pendentes" value={pendingSwaps} linkTo="/dashboard/swaps" linkLabel="Ver trocas"/>
                <DashboardSummaryCard title="Atestados Pendentes" value={pendingCertificates} linkTo="/dashboard/certificates" linkLabel="Ver atestados"/>
              </div>
              <div style={{marginTop: '40px'}}>
                <h3>Colaboradores de plantão</h3>
                <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', overflow: 'hidden'}}>
                  {usersOnShift.length > 0 ? (
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                      <thead>
                        <tr>
                          <th style={{...tableHeaderStyle, width: '50%'}}>Nome</th>
                          <th style={tableHeaderStyle}>Equipe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersOnShift.map(u => (
                          <tr key={u.id}>
                            <td style={tableCellStyle}>{u.firstName} {u.lastName}</td>
                            <td style={tableCellStyle}>{u.team}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{color: 'var(--text-secondary-color)', padding: '20px'}}>Nenhum colaborador no turno atual.</p>
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
            <h3>Colegas de plantão</h3>
            <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', overflow: 'hidden'}}>
              {isLoading ? <p style={{padding: '20px'}}>Carregando...</p> : usersOnShift.length > 0 ? (
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                        <tr>
                            <th style={{...tableHeaderStyle, width: '50%'}}>Nome</th>
                            <th style={tableHeaderStyle}>Equipe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersOnShift.map(u => (
                            <tr key={u.id}>
                                <td style={tableCellStyle}>{u.firstName} {u.lastName}</td>
                                <td style={tableCellStyle}>{u.team}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              ) : (
                <p style={{color: 'var(--text-secondary-color)', padding: '20px'}}>Nenhum outro colaborador no seu turno agora.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}