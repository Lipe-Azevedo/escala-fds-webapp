'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, Swap, Certificate, DaySchedule } from '@/types';
import Calendar from '@/components/calendar/Calendar';
import DashboardSummaryCard from '@/components/common/DashboardSummaryCard';
import CalendarSummary from '@/components/calendar/CalendarSummary';
import WeeklyDetailsPanel from '@/components/dashboard/WeeklyDetailsPanel';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid, chunk } from '@/lib/calendarUtils';
import { addMonths, subMonths, isSameWeek, parseISO } from 'date-fns';

export default function DashboardHomePage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  const [pendingSwaps, setPendingSwaps] = useState(0);
  const [pendingCertificates, setPendingCertificates] = useState(0);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading: isLoadingCalendar, error: calendarError, data: calendarRawData, fetchData: refetchCalendar } = useCalendarData(currentMonth, user);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [calendarSummary, setCalendarSummary] = useState({ workedDays: 0, holidaysWorked: 0 });

  const [usersOnShift, setUsersOnShift] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      router.push('/login');
      return;
    }
    const currentUser = JSON.parse(userDataString)
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchWidgetsData = async () => {
        setIsLoading(true);
        const token = Cookies.get('authToken');
        if (!token) { setIsLoading(false); return; }

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            // ... (lógica de fetch inalterada)
        } catch (error: any) { 
            console.error("Failed to fetch dashboard data", error);
        } finally { 
            setIsLoading(false); 
        }
    };
    fetchWidgetsData();
  }, [user]);

  const calendarGrid = useMemo(() => {
    if (!user || !calendarRawData) return [];
    return generateCalendarGrid(currentMonth, user, calendarRawData.holidays, calendarRawData.swaps, calendarRawData.comments, calendarRawData.certificates).calendarGrid;
  }, [currentMonth, user, calendarRawData]);

  useEffect(() => {
    if (calendarGrid.length > 0) {
        const today = new Date();
        const currentDayIndex = calendarGrid.findIndex(day => isSameWeek(today, parseISO(day.date), { weekStartsOn: 0 }));
        if(currentDayIndex !== -1) {
            setSelectedWeekIndex(Math.floor(currentDayIndex / 7));
        } else {
            setSelectedWeekIndex(0);
        }
    }
  }, [calendarGrid]);
  
  const weeks = useMemo(() => chunk(calendarGrid, 7), [calendarGrid]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    localStorage.removeItem('userData');
    router.push('/login');
  };
  
  if (!user) return <div>Carregando...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{user.userType === 'master' ? 'Painel Principal' : 'Meu Calendário'}</h1>
        <button onClick={handleLogout}>Sair</button>
      </div>

      {user.userType === 'master' ? (
        <div>
          {/* ... (JSX do Master inalterado) ... */}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '30px', alignItems: 'flex-start', marginTop: '20px' }}>
            <Calendar 
                user={user} 
                onSummaryChange={setCalendarSummary} 
                calendarGrid={calendarGrid}
                currentMonth={currentMonth}
                isLoading={isLoadingCalendar}
                error={calendarError}
                onPrevMonth={() => setCurrentMonth(prev => subMonths(prev, 1))}
                onNextMonth={() => setCurrentMonth(prev => addMonths(prev, 1))}
                onCommentAdded={refetchCalendar}
                selectedWeekIndex={selectedWeekIndex}
            />
            <WeeklyDetailsPanel 
                weeks={weeks}
                selectedWeekIndex={selectedWeekIndex}
                onWeekChange={setSelectedWeekIndex}
            />
          </div>
          <div style={{marginTop: '20px'}}>
            <CalendarSummary 
                workedDays={calendarSummary.workedDays}
                holidaysWorked={calendarSummary.holidaysWorked}
            />
          </div>
        </>
      )}
    </div>
  );
}