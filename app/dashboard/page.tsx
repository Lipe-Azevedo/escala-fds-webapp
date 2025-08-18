'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User } from '@/types';
import WeeklyDetailsPanel from '@/components/dashboard/WeeklyDetailsPanel';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import CalendarSummary from '@/components/dashboard/CalendarSummary';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid, chunk } from '@/lib/calendarUtils';
import { addMonths, subMonths, isSameWeek, parseISO } from 'date-fns';
import styles from './Dashboard.module.css';

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading: isLoadingCalendar, data: calendarRawData} = useCalendarData(currentMonth, user);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
  const [isLoadingWidgets, setIsLoadingWidgets] = useState(true);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      if (currentUser.userType === 'master') {
        router.push('/dashboard/users');
      } else {
        setUser(currentUser);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user || user.userType === 'master') {
        setIsLoadingWidgets(false);
        return;
    }
     
    const fetchUsers = async () => {
        setIsLoadingWidgets(true);
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            const allUsers: User[] = await usersRes.json() || [];

            const isShiftNow = (shift: string): boolean => {
                if (!shift || !shift.includes('-')) return false;
                const now = new Date();
                const currentHour = now.getHours();
                try {
                    const [startStr, endStr] = shift.split('-');
                    const startHour = parseInt(startStr, 10);
                    const endHour = parseInt(endStr, 10);
                    if (isNaN(startHour) || isNaN(endHour)) return false;
                    return startHour < endHour ? currentHour >= startHour && currentHour < endHour : currentHour >= startHour || currentHour < endHour;
                } catch (error) { return false; }
            };
            setUsersOnShift(allUsers.filter(u => u.id !== user.id && u.shift === user.shift && isShiftNow(u.shift)));
        } catch (e) {
            console.error('Erro ao buscar usuários de plantão', e);
        } finally {
            setIsLoadingWidgets(false);
        }
    };
    fetchUsers();
  }, [user]);

  const { calendarGrid, weeks, workedDays, holidaysWorked } = useMemo(() => {
    if (!user || !calendarRawData) return { calendarGrid: [], weeks: [], workedDays: 0, holidaysWorked: 0 };
    const { calendarGrid, workedCounter, holidaysWorkedCounter } = generateCalendarGrid(currentMonth, user, calendarRawData.holidays, calendarRawData.swaps, calendarRawData.comments, calendarRawData.certificates);
    const weeks = chunk(calendarGrid, 7);
    return { calendarGrid, weeks, workedDays: workedCounter, holidaysWorked: holidaysWorkedCounter };
  }, [currentMonth, user, calendarRawData]);

  useEffect(() => {
    if (calendarGrid.length > 0) {
        const today = new Date();
        const currentDayIndex = calendarGrid.findIndex(day => isSameWeek(today, parseISO(day.date), { weekStartsOn: 0 }));
        setSelectedWeekIndex(currentDayIndex !== -1 ? Math.floor(currentDayIndex / 7) : 0);
    }
  }, [calendarGrid]);
  
  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };
  
  if (!user || user.userType === 'master') {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Meu Calendário</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.contentGrid}>
          {isLoadingCalendar ? <p>Carregando...</p> : 
          <>
              <DashboardCalendar
                currentMonth={currentMonth}
                onPrevMonth={() => setCurrentMonth(prev => subMonths(prev, 1))}
                onNextMonth={() => setCurrentMonth(prev => addMonths(prev, 1))}
                calendarGrid={calendarGrid}
                selectedWeekIndex={selectedWeekIndex}
                onDateSelect={(date) => {
                  const weekIndex = weeks.findIndex(week => week.some(day => isSameWeek(parseISO(day.date), date, { weekStartsOn: 0 })));
                  if (weekIndex !== -1) {
                    setSelectedWeekIndex(weekIndex);
                  }
                }}
              />
              <WeeklyDetailsPanel 
                  weeks={weeks}
                  selectedWeekIndex={selectedWeekIndex}
                  onWeekChange={setSelectedWeekIndex}
                  currentMonth={currentMonth}
              />
          </>
          }
        </div>
        
        {!isLoadingCalendar &&
            <CalendarSummary 
                workedDays={workedDays}
                holidaysWorked={holidaysWorked}
            />
        }
        
        <div className={styles.onShiftWidget}>
          <h3>Colaboradores de plantão</h3>
            {isLoadingWidgets ? <p style={{padding: '20px', textAlign: 'center'}}>Carregando...</p> : usersOnShift.length > 0 ? (
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr>
                    <th className={styles.tableHeader}>Nome</th>
                    <th className={styles.tableHeader}>Equipe</th>
                  </tr>
                </thead>
                <tbody>
                  {usersOnShift.map(u => (
                    <tr key={u.id}>
                      <td className={styles.tableCell}>{u.firstName} {u.lastName}</td>
                      <td className={styles.tableCell}>{u.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{color: 'var(--text-secondary-color)', textAlign: 'center', padding: '20px'}}>Nenhum colega no seu turno agora.</p>
            )
          }
        </div>
      </div>
    </div>
  );
}