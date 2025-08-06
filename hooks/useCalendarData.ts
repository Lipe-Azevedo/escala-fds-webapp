'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { User, Schedule } from '@/types';

type CalendarUser = Pick<User, 'id'>;

export const useCalendarData = (currentMonth: Date, user: CalendarUser | null) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const year = format(currentMonth, 'yyyy');
    const month = format(currentMonth, 'M');

    try {
      const res = await fetch(`${apiURL}/api/schedule/${user.id}?year=${year}&month=${month}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });

      if (!res.ok) throw new Error('Falha ao buscar a escala.');
      
      const data: Schedule = await res.json();
      setSchedule(data);
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { isLoading, error, schedule, fetchData };
};