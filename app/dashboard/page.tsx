'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Swap, Certificate, DaySchedule, Holiday, Comment } from '@/types';
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
  const { isLoading: isLoadingCalendar, error: calendarError, data: calendarRawData, fetchData: refetchCalendar } = useCalendarData(currentMonth, user);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Meu Calendário</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <div className={styles.pageContainer}>
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
                      onDateSelect={() => {}}
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
            
            <CalendarSummary 
                workedDays={workedDays}
                holidaysWorked={holidaysWorked}
            />
        </div>
      </div>
    </div>
  );
}