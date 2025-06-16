'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  getDay,
  differenceInCalendarWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User } from '../types';

type Holiday = { date: string; name: string };
type Swap = { newDate: string; originalDate: string; newShift: string };
type Comment = { date: string };
type DayOffReason = 'Weekday' | 'Weekend' | 'Swap' | '';

type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDayOff: boolean;
  dayOffReason: DayOffReason;
  isHoliday: boolean;
  holidayName: string;
  hasComment: boolean;
  shift: string;
};

const weekdayMap: { [key: number]: string } = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt'>;

export default function Calendar({ user }: { user: CalendarUser }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const generateCalendar = useCallback((
    month: Date,
    holidays: Holiday[],
    swaps: Swap[],
    comments: Comment[]
  ) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const holidaysMap = new Map(holidays.map(h => [h.date, h.name]));
    const dayOffSwapMap = new Map(swaps.map(s => [s.newDate, s]));
    const workDaySwapMap = new Map(swaps.map(s => [s.originalDate, s]));
    const commentsMap = new Map(comments.map(c => [c.date, true]));

    const calendarGrid = days.map((day): DayInfo => {
      const dateString = format(day, 'yyyy-MM-dd');
      const dayOfWeek = getDay(day);

      let isOff = false;
      let reason: DayOffReason = '';
      let shift = user.shift;
      
      const holidayName = holidaysMap.get(dateString);
      
      // Lógica de Precedência Corrigida:
      // 1. Define o status base de folga (semanal ou fim de semana)
      if (weekdayMap[dayOfWeek] === user.weekdayOff) {
        isOff = true;
        reason = 'Weekday';
      } else if (user.initialWeekendOff && user.createdAt && (dayOfWeek === 0 || dayOfWeek === 6)) {
        const userCreatedAt = new Date(user.createdAt);
        const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;
        
        let firstOccurrence = startOfWeek(userCreatedAt);
        while(getDay(firstOccurrence) !== firstWeekendOffDay) {
          firstOccurrence = new Date(firstOccurrence.setDate(firstOccurrence.getDate() + 1));
        }
        
        const weeksDiff = differenceInCalendarWeeks(day, firstOccurrence, { weekStartsOn: 1 });
        
        const currentWeekendOffDay = (weeksDiff % 2 === 0) 
          ? firstWeekendOffDay 
          : (firstWeekendOffDay === 6 ? 0 : 6);
        
        if (dayOfWeek === currentWeekendOffDay) {
          isOff = true;
          reason = 'Weekend';
        }
      }
      
      // 2. Trocas sobrepõem a lógica de folga base
      if (dayOffSwapMap.has(dateString)) {
        isOff = true;
        reason = 'Swap';
      } else if (workDaySwapMap.has(dateString)) {
        isOff = false;
        shift = workDaySwapMap.get(dateString)!.newShift;
      }
      
      return {
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
        isDayOff: isOff,
        dayOffReason: reason,
        isHoliday: !!holidayName, // O feriado é um indicador separado
        holidayName: holidayName || '',
        hasComment: commentsMap.has(dateString),
        shift: isOff ? '' : shift,
      };
    });

    setCalendarDays(calendarGrid);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      if (!user || !token) {
        setIsLoading(false);
        return;
      };

      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const holidayParams = `startDate=${format(monthStart, 'yyyy-MM-dd')}&endDate=${format(monthEnd, 'yyyy-MM-dd')}`;
        const commentParams = `collaboratorId=${user.id}&startDate=${format(monthStart, 'yyyy-MM-dd')}&endDate=${format(monthEnd, 'yyyy-MM-dd')}`;
        
        const [holidaysRes, swapsRes, commentsRes] = await Promise.all([
          fetch(`${apiURL}/api/holidays?${holidayParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/swaps/user/${user.id}?status=approved`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/comments?${commentParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (!holidaysRes.ok) throw new Error(`Falha ao buscar feriados (status: ${holidaysRes.status})`);
        if (!swapsRes.ok) throw new Error(`Falha ao buscar trocas (status: ${swapsRes.status})`);
        if (!commentsRes.ok) throw new Error(`Falha ao buscar comentários (status: ${commentsRes.status})`);

        const holidays = await holidaysRes.json() || [];
        const swaps = await swapsRes.json() || [];
        const comments = await commentsRes.json() || [];

        generateCalendar(currentMonth, holidays, swaps, comments);
      } catch (error: any) {
        console.error("Failed to fetch calendar data:", error);
        setError(error.message || 'Ocorreu um erro.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, user, generateCalendar]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <button onClick={prevMonth}>Mês Anterior</button>
        <h2>{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
        <button onClick={nextMonth}>Próximo Mês</button>
      </div>

      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} style={{ fontWeight: 'bold', textAlign: 'center' }}>{day}</div>)}
          
          {calendarDays.map((day) => (
            <div key={day.date.toString()} style={{
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '100px',
              backgroundColor: !day.isCurrentMonth ? '#f9f9f9' : (day.isDayOff ? '#e8f5e9' : 'white'),
              color: day.isToday ? 'blue' : 'black',
            }}>
              <div style={{ fontWeight: 'bold' }}>{format(day.date, 'd')}</div>

              {day.isHoliday && <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{day.holidayName}</div>}
              {day.hasComment && <div style={{ fontSize: '12px', color: 'orange' }}>&#9998; Comentário</div>}

              {day.isDayOff 
                ? <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>
                    Folga {day.dayOffReason === 'Swap' && '(Troca)'}
                  </div>
                : <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>{day.shift}</div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}