'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User } from '@/types';
import WeeklyDetailsPanel from '@/components/collaborator/WeeklyDetailsPanel';
import DashboardCalendar from '@/components/collaborator/DashboardCalendar';
import CalendarSummary from '@/components/collaborator/CalendarSummary';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid, chunk, isRegularDayOff } from '@/lib/calendarUtils';
import { addMonths, subMonths, isSameWeek, parseISO, isSameMonth, isSameDay } from 'date-fns';
import styles from './CollaboratorDashboard.module.css';
import cardStyles from '@/components/common/Card.module.css';
import tableStyles from '@/components/common/Table.module.css';
import { translate } from '@/lib/translations';

export default function CollaboratorDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading: isLoadingCalendar, data: calendarRawData} = useCalendarData(currentMonth, user);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
  
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      if (currentUser.userType === 'master') {
        router.push('/dashboard/master');
      } else {
        setUser(currentUser);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
     
    const fetchUsers = async () => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            const allUsers: User[] = await usersRes.json() || [];
            const today = new Date();

            const isShiftNow = (shift: string): boolean => {
                if (!shift || !shift.includes('-')) return false;
                const currentHour = today.getHours();
                try {
                    const [startStr, endStr] = shift.split('-');
                    const startHour = parseInt(startStr, 10);
                    const endHour = parseInt(endStr, 10);
                    if (isNaN(startHour) || isNaN(endHour)) return false;
                    return startHour < endHour ? currentHour >= startHour && currentHour < endHour : currentHour >= startHour || currentHour < endHour;
                } catch (error) { return false; }
            };
            
            const onShiftNow = allUsers.filter(u => {
              const isWorkingToday = !isRegularDayOff(today, u);
              const isShiftActive = isShiftNow(u.shift);
              const isNotCurrentUser = u.id !== user.id;

              return isWorkingToday && isShiftActive && isNotCurrentUser;
            });
            
            setUsersOnShift(onShiftNow);
        } catch (e) {
            console.error('Erro ao buscar usuários de plantão', e);
        }
    };
    fetchUsers();
  }, [user]);

  const { calendarGrid, workedDays, holidaysWorked } = useMemo(() => {
    if (!user || !calendarRawData) return { calendarGrid: [], workedDays: 0, holidaysWorked: 0 };
    const { calendarGrid, workedCounter, holidaysWorkedCounter } = generateCalendarGrid(currentMonth, user, calendarRawData.holidays, calendarRawData.swaps, calendarRawData.comments, calendarRawData.certificates);
    return { calendarGrid, workedDays: workedCounter, holidaysWorked: holidaysWorkedCounter };
  }, [currentMonth, user, calendarRawData]);

  const weeks = useMemo(() => chunk(calendarGrid, 7), [calendarGrid]);
  
  const displayWeeks = useMemo(() => {
    return weeks.filter(week =>
      week.some(day => isSameMonth(parseISO(day.date), currentMonth))
    );
  }, [weeks, currentMonth]);

  useEffect(() => {
    if (weeks.length > 0) {
      const today = new Date();
      const currentWeekIndex = weeks.findIndex(week => week.some(day => isSameDay(parseISO(day.date), today)));
      if (currentWeekIndex !== -1) {
          setSelectedWeekIndex(currentWeekIndex);
      } else {
          const firstWeekOfMonthIndex = weeks.findIndex(week => week.some(day => isSameMonth(parseISO(day.date), currentMonth)));
          setSelectedWeekIndex(firstWeekOfMonthIndex > -1 ? firstWeekOfMonthIndex : 0);
      }
    }
  }, [weeks, currentMonth]);
  
  const selectedDisplayWeekIndex = useMemo(() => {
    if (!weeks[selectedWeekIndex]) return -1;
    const selectedWeekStartDate = weeks[selectedWeekIndex][0].date;
    return displayWeeks.findIndex(week => week[0].date === selectedWeekStartDate);
  }, [selectedWeekIndex, weeks, displayWeeks]);

  const handleWeekChange = (newDisplayIndex: number) => {
    if (newDisplayIndex < 0 || newDisplayIndex >= displayWeeks.length) return;
    const targetWeekStartDate = displayWeeks[newDisplayIndex][0].date;
    const newGlobalIndex = weeks.findIndex(week => week[0].date === targetWeekStartDate);
    if (newGlobalIndex !== -1) {
      setSelectedWeekIndex(newGlobalIndex);
    }
  };
  
  if (isLoadingCalendar) {
    return null;
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>Meu Calendário</h1>
      </div>

      <div className={cardStyles.card}>
        <div className={styles.sectionsContainer}>
          <div className={styles.contentGrid}>
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
                weeks={displayWeeks}
                selectedWeekIndex={selectedDisplayWeekIndex}
                onWeekChange={handleWeekChange}
                currentMonth={currentMonth}
            />
          </div>
          
          <CalendarSummary 
              workedDays={workedDays}
              holidaysWorked={holidaysWorked}
          />
          
          <div className={styles.onShiftWidget}>
            <h3>Colaboradores de plantão</h3>
            {usersOnShift.length > 0 ? (
              <div className={tableStyles.tableWrapper}>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th className={tableStyles.header}>Nome</th>
                      <th className={tableStyles.header}>Equipe</th>
                      <th className={tableStyles.header}>Cargo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersOnShift.map(u => (
                      <tr key={u.id}>
                        <td className={tableStyles.cell}>{u.firstName} {u.lastName}</td>
                        <td className={tableStyles.cell}>{translate(u.team)}</td>
                        <td className={tableStyles.cell}>{translate(u.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{color: 'var(--text-secondary-color)', textAlign: 'center', padding: '20px'}}>Nenhum colega no seu turno agora.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}