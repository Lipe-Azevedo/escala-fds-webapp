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
        const token = Cookies.get('authToken');
        if (!token) return;

        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            if (user.userType === 'master') {
                const [swapsRes, certsRes] = await Promise.all([
                    fetch(`${apiURL}/api/swaps?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${apiURL}/api/certificates?status=pending`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                if (!swapsRes.ok) throw new Error('Falha ao buscar trocas.');
                if (!certsRes.ok) throw new Error('Falha ao buscar atestados.');

                const swaps: Swap[] = (await swapsRes.json()) || [];
                const certs: Certificate[] = (await certsRes.json()) || [];
                
                setPendingSwaps(swaps.length);
                setPendingCertificates(certs.length);
            }
        } catch (error: any) { 
            console.error("Failed to fetch dashboard data", error);
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '25px' }}>
            <DashboardSummaryCard title="Trocas Pendentes" value={pendingSwaps} linkTo="/dashboard/swaps?status=pending" linkLabel="Ver trocas"/>
            <DashboardSummaryCard title="Atestados Pendentes" value={pendingCertificates} linkTo="/dashboard/certificates?status=pending" linkLabel="Ver atestados"/>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'stretch', marginTop: '20px' }}>
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
                currentMonth={currentMonth}
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