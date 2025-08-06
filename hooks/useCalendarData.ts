'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { User, Holiday, Swap, Certificate, Comment } from '@/types';

type CalendarUser = Pick<User, 'id'>;

export const useCalendarData = (currentMonth: Date, user: CalendarUser | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<{
    holidays: Holiday[];
    swaps: Swap[];
    comments: Comment[];
    certificates: Certificate[];
  }>({ holidays: [], swaps: [], comments: [], certificates: [] });

  const fetchData = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError('');
    
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

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
      
      setData({ holidays, swaps, comments, certificates });
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { isLoading, error, data, fetchData };
};