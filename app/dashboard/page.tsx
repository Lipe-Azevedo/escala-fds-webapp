'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Holiday, Swap, Certificate, ShiftName } from '@/types';
import { addDays, format, parseISO } from 'date-fns';
import { getDayStatus } from '@/lib/calendarUtils';
import CustomDatePicker from '@/components/common/CustomDatePicker/CustomDatePicker';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardHomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    originalDate: '',
    newDate: '',
    newShift: '' as ShiftName | '',
    reason: '',
  });
  
  const [availableDaysOff, setAvailableDaysOff] = useState<Set<string>>(new Set());
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

    const fetchAndProcessSchedule = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      try {
        const [holidaysRes, swapsRes, certsRes, usersRes] = await Promise.all([
          fetch(`${apiURL}/api/holidays`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/swaps/user/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/certificates/user/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const holidays: Holiday[] = await holidaysRes.json();
        const swaps: Swap[] = await swapsRes.json();
        const certificates: Certificate[] = await certsRes.json();
        const allUsers: User[] = await usersRes.json() || [];

        const upcomingDaysOff = new Set<string>();
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const day = addDays(today, i);
          const dayStatus = getDayStatus(day, currentUser, holidays, swaps.filter(s => s.status === 'approved'), certificates.filter(c => c.status === 'approved'));
          if(dayStatus.isDayOff) {
            upcomingDaysOff.add(format(day, 'yyyy-MM-dd'));
          }
        }
        setAvailableDaysOff(upcomingDaysOff);

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

    fetchAndProcessSchedule();
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
                    <label>Dia da Folga:</label>
                    {isLoading ? <p>Carregando escala...</p> : (
                    <CustomDatePicker
                        selectedDate={formData.originalDate ? parseISO(formData.originalDate) : null}
                        onDateSelect={(date) => setFormData({...formData, originalDate: format(date, 'yyyy-MM-dd')})}
                        isDaySelectable={(date) => availableDaysOff.has(format(date, 'yyyy-MM-dd'))}
                    />
                    )}
                </div>
                <div style={{flex: '1 1 320px', minWidth: '320px'}}>
                    <label>Novo dia de trabalho:</label>
                    <CustomDatePicker
                        selectedDate={formData.newDate ? parseISO(formData.newDate) : null}
                        onDateSelect={(date) => setFormData({...formData, newDate: format(date, 'yyyy-MM-dd')})}
                        isDaySelectable={(date) => !availableDaysOff.has(format(date, 'yyyy-MM-dd'))}
                    />
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