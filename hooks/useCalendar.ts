'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from 'date-fns';
import { User, DayOffReason } from '@/types';
import { generateCalendarGrid } from '@/lib/calendarUtils';

export interface DayInfo {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDayOff: boolean;
  dayOffReason: DayOffReason;
  isHoliday: boolean;
  holidayName: string;
  hasComment: boolean;
  shift: string;
}

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export const useCalendar = (user: CalendarUser) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [workedDaysCount, setWorkedDaysCount] = useState(0);
  const [holidaysWorkedCount, setHolidaysWorkedCount] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    if (!user || !token) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const holidayParams = `startDate=${format(monthStart, 'yyyy-MM-dd')}&endDate=${format(monthEnd, 'yyyy-MM-dd')}`;
      const commentParams = `collaboratorId=${user.id}&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
      
      const [holidaysRes, swapsRes, commentsRes, certificatesRes] = await Promise.all([
        fetch(`${apiURL}/api/holidays?${holidayParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiURL}/api/swaps/user/${user.id}?status=approved`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiURL}/api/comments?${commentParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiURL}/api/certificates/user/${user.id}?status=approved`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!holidaysRes.ok) throw new Error(`Falha ao buscar feriados`);
      if (!swapsRes.ok) throw new Error(`Falha ao buscar trocas`);
      if (!commentsRes.ok) throw new Error(`Falha ao buscar comentários`);
      if (!certificatesRes.ok) throw new Error(`Falha ao buscar atestados`);

      const holidays = await holidaysRes.json() || [];
      const swaps = await swapsRes.json() || [];
      const comments = await commentsRes.json() || [];
      const certificates = await certificatesRes.json() || [];

      const { calendarGrid, workedCounter, holidaysWorkedCounter } = generateCalendarGrid(currentMonth, user, holidays, swaps, comments, certificates);
      setCalendarDays(calendarGrid);
      setWorkedDaysCount(workedCounter);
      setHolidaysWorkedCount(holidaysWorkedCounter);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return { 
    currentMonth,
    calendarDays,
    isLoading,
    error,
    workedDaysCount,
    holidaysWorkedCount,
    fetchData,
    prevMonth,
    nextMonth
  };
};