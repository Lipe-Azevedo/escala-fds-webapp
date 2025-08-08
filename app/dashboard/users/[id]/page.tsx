'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { User, DaySchedule } from '@/types';
import Calendar from '@/components/calendar/Calendar';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid, chunk } from '@/lib/calendarUtils';
import { addMonths, subMonths, isSameWeek, parseISO } from 'date-fns';
import CalendarSummary from '@/components/calendar/CalendarSummary';
import Link from 'next/link';
import WeeklyDetailsPanel from '@/components/dashboard/WeeklyDetailsPanel';
import CalendarViewLayout from '@/components/layout/CalendarViewLayout';

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading: isLoadingCalendar, error: calendarError, data: calendarRawData, fetchData: refetchCalendar } = useCalendarData(currentMonth, user);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [calendarSummary, setCalendarSummary] = useState({ workedDays: 0, holidaysWorked: 0 });

  const params = useParams();
  const userId = params.id;

  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      try {
        const res = await fetch(`${apiURL}/api/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Falha ao buscar detalhes do usuário.');
        setUser(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

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

  if (isLoadingUser) return <p>Carregando perfil do usuário...</p>;
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!user) return <p>Usuário não encontrado.</p>;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/users" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
          &larr; Voltar para Colaboradores
        </Link>
      </div>
      <h1 style={{marginBottom: '10px'}}>Calendário de {user.firstName} {user.lastName}</h1>
      
      <CalendarViewLayout
        calendar={
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
        }
        panel={
          <WeeklyDetailsPanel 
              weeks={weeks}
              selectedWeekIndex={selectedWeekIndex}
              onWeekChange={setSelectedWeekIndex}
              currentMonth={currentMonth}
          />
        }
      />
      <div style={{marginTop: '20px'}}>
          <CalendarSummary 
              workedDays={calendarSummary.workedDays}
              holidaysWorked={calendarSummary.holidaysWorked}
          />
      </div>
    </div>
  );
}