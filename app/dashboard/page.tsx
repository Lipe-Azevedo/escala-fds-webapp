'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Holiday, Swap, Certificate, ShiftName } from '@/types';
import { addDays, format, parseISO } from 'date-fns';
import { getDayStatus } from '@/lib/calendarUtils';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar'; // Import atualizado
import { useRouter } from 'next/navigation';

export default function DashboardHomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchPageData = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      try {
        const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const allUsers: User[] = await usersRes.json() || [];

        const isShiftNow = (shift: string): boolean => {
          if (!shift || !shift.includes('-')) { return false; }
          const now = new Date();
          const currentHour = now.getHours();
          try {
            const parts = shift.split('-');
            if (parts.length !== 2) return false;
            const startHour = parseInt(parts[0].split(':')[0], 10);
            const endHour = parseInt(parts[1].split(':')[0], 10);
            if (isNaN(startHour) || isNaN(endHour)) { return false; }
            if (startHour < endHour) { return currentHour >= startHour && currentHour < endHour; } 
            else { return currentHour >= startHour || currentHour < endHour; }
          } catch (error) { return false; }
        };

        const colleaguesOnShift = allUsers.filter(u => 
            u.id !== currentUser.id && 
            u.shift === currentUser.shift && 
            isShiftNow(u.shift)
        );
        setUsersOnShift(colleaguesOnShift);

      } catch(e) {
        setError('Erro ao carregar dados da página.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [currentUser]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  const tableHeaderStyle: React.CSSProperties = {
    padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#a0aec0',
    textTransform: 'uppercase', fontSize: '12px', borderBottom: '2px solid rgb(var(--card-border-rgb))',
  };

  const tableCellStyle: React.CSSProperties = {
    padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgb(var(--card-border-rgb))',
  };

  if (!currentUser) {
    return <div>Carregando...</div>;
  }
  
  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Meu Calendário</h1>
            <button onClick={handleLogout}>Sair</button>
        </div>

        <div style={{ padding: '25px', background: 'rgb(var(--card-background-rgb))', borderRadius: '8px', maxWidth: '800px', margin: '20px auto 0' }}>
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
                <div style={{flex: '1 1 320px', minWidth: '320px'}}>
                    <label>Calendário:</label>
                    {isLoading ? <p>Carregando...</p> : (
                    <DashboardCalendar />
                    )}
                </div>
                <div style={{
                              flex: '1 1 320px', 
                              minWidth: '320px', 
                              background: 'rgb(var(--card-background-rgb))', 
                              border: '1px solid rgb(var(--card-border-rgb))', 
                              borderRadius: '8px', boxSizing: 'border-box', 
                              height: '380px'
                            }}>
                    {/* Painel vazio com o mesmo tamanho */}
                </div>
            </div>

            <div style={{marginTop: '40px'}}>
              <h3>Colegas de plantão</h3>
              <div style={{border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', overflow: 'hidden'}}>
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
                  <p style={{color: 'var(--text-secondary-color)', padding: '20px', textAlign: 'center'}}>Nenhum outro colaborador no seu turno agora.</p>
                )}
              </div>
            </div>
        </div>
    </div>
  );
}