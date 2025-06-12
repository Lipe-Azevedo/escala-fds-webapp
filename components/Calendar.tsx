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

type User = {
  id: number;
  shift: string;
  weekdayOff: string;
  initialWeekendOff: string;
  createdAt: string;
};

type Holiday = { date: string; name: string };
type Swap = { newDate: string; originalDate: string, newShift: string };
type Comment = { date: string };

type DayInfo = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isDayOff: boolean;
  dayOffReason: 'Weekday' | 'Weekend' | 'Swap' | '';
  isHoliday: boolean;
  holidayName: string;
  hasComment: boolean;
  shift: string;
};

const weekdayMap: { [key: number]: string } = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday' };

export default function Calendar({ user }: { user: User }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const newDayOffMap = new Map(swaps.map(s => [s.newDate, s]));
    const newWorkDayMap = new Map(swaps.map(s => [s.originalDate, s]));
    const commentsMap = new Map(comments.map(c => [c.date, true]));

    const calendarGrid = days.map((day): DayInfo => {
      const dateString = format(day, 'yyyy-MM-dd');
      let dayInfo: DayInfo = {
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
        isDayOff: false,
        dayOffReason: '',
        isHoliday: holidaysMap.has(dateString),
        holidayName: holidaysMap.get(dateString) || '',
        hasComment: commentsMap.has(dateString),
        shift: user.shift,
      };
      
      const newDayOffSwap = newDayOffMap.get(dateString);
      if (newDayOffSwap) {
        dayInfo.isDayOff = true;
        dayInfo.dayOffReason = 'Swap';
        dayInfo.shift = newDayOffSwap.newShift;
      } else if (newWorkDayMap.has(dateString)) {
        // É um dia de trabalho devido a uma troca, então não fazemos nada.
      } else {
        const dayOfWeek = getDay(day);
        if (weekdayMap[dayOfWeek] === user.weekdayOff) {
          dayInfo.isDayOff = true;
          dayInfo.dayOffReason = 'Weekday';
        }
        
        if ((dayOfWeek === 0 || dayOfWeek === 6) && user.initialWeekendOff) {
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
            dayInfo.isDayOff = true;
            dayInfo.dayOffReason = 'Weekend';
          }
        }
      }
      return dayInfo;
    });

    setCalendarDays(calendarGrid);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = Cookies.get('authToken');
      if (!user || !token) {
        setIsLoading(false);
        return;
      };

      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const params = `?startDate=${format(monthStart, 'yyyy-MM-dd')}&endDate=${format(monthEnd, 'yyyy-MM-dd')}`;
      
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const [holidaysRes, swapsRes, commentsRes] = await Promise.all([
          fetch(`${apiURL}/api/holidays${params}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/swaps/user/${user.id}?status=approved`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/comments/user/${user.id}${params}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        const holidays = (await holidaysRes.json()) || [];
        const swaps = (await swapsRes.json()) || [];
        const comments = (await commentsRes.json()) || [];

        generateCalendar(currentMonth, holidays, swaps, comments);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
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
        {/* AQUI ESTÁ A CORREÇÃO */}
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth}>Próximo Mês</button>
      </div>

      {isLoading ? <p>Carregando calendário...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} style={{ fontWeight: 'bold', textAlign: 'center' }}>{day}</div>)}
          
          {calendarDays.map((day) => (
            <div key={day.date.toString()} style={{
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '100px',
              backgroundColor: !day.isCurrentMonth ? '#f9f9f9' : 'white',
              color: day.isToday ? 'blue' : 'black',
            }}>
              <div style={{ fontWeight: 'bold' }}>{format(day.date, 'd')}</div>

              {day.isHoliday && <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{day.holidayName}</div>}
              {day.hasComment && <div style={{ fontSize: '12px', color: 'orange' }}>Comentário</div>}

              {day.isDayOff 
                ? <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>Folga</div>
                : <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>{day.shift}</div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}