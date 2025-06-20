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
  addDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Holiday, Swap, Certificate, DayOffReason, Comment } from '../types';
import CommentsModal from './CommentsModal';

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

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export default function Calendar({ user }: { user: CalendarUser }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

        generateCalendar(currentMonth, holidays, swaps, comments, certificates);
      } catch (error: any) {
        setError(error.message || 'Ocorreu um erro.');
      } finally {
        setIsLoading(false);
      }
  }, [currentMonth, user]);

  const generateCalendar = useCallback((
    month: Date,
    holidays: Holiday[],
    swaps: Swap[],
    comments: Comment[],
    certificates: Certificate[]
  ) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const holidaysMap = new Map(holidays.map(h => [h.date, h.name]));
    const approvedSwapsMap = new Map();
    swaps.forEach(s => {
        approvedSwapsMap.set(s.originalDate, s);
        approvedSwapsMap.set(s.newDate, s);
    });
    const commentsMap = new Map(comments.map(c => [c.date, true]));
    const certificateDaysMap = new Map();
    certificates.forEach(cert => {
        const start = new Date(cert.startDate.replace(/-/g, '/'));
        const end = new Date(cert.endDate.replace(/-/g, '/'));
        for (let d = start; d <= end; d = addDays(d, 1)) {
            certificateDaysMap.set(format(d, 'yyyy-MM-dd'), true);
        }
    });

    let workedCounter = 0;
    let holidaysWorkedCounter = 0;

    const calendarGrid = days.map((day): DayInfo => {
      const dateString = format(day, 'yyyy-MM-dd');
      const dayOfWeek = getDay(day);

      let isOff = false;
      let reason: DayOffReason = '';
      let shift = user.shift;
      const holidayName = holidaysMap.get(dateString);
      
      if (weekdayMap[dayOfWeek] === user.weekdayOff) {
        isOff = true; reason = 'Weekday';
      } else if (user.initialWeekendOff && user.createdAt && (dayOfWeek === 0 || dayOfWeek === 6)) {
        const userCreatedAt = new Date(user.createdAt);
        const firstWeekendOffDay = user.initialWeekendOff === 'saturday' ? 6 : 0;
        let firstOccurrence = startOfWeek(userCreatedAt);
        while(getDay(firstOccurrence) !== firstWeekendOffDay) {
          firstOccurrence = new Date(firstOccurrence.setDate(firstOccurrence.getDate() + 1));
        }
        const weeksDiff = differenceInCalendarWeeks(day, firstOccurrence, { weekStartsOn: 1 });
        const currentWeekendOffDay = (weeksDiff % 2 === 0) ? firstWeekendOffDay : (firstWeekendOffDay === 6 ? 0 : 6);
        if (dayOfWeek === currentWeekendOffDay) {
          isOff = true; reason = 'Weekend';
        }
      }
      
      const swap = approvedSwapsMap.get(dateString);
      if (swap) {
        const isShiftChangeOnly = swap.originalDate === swap.newDate;
        if (isShiftChangeOnly) {
            isOff = false;
            shift = swap.newShift;
            reason = '';
        } else {
            const isNewDayOff = dateString === swap.newDate;
            if (isNewDayOff) {
                isOff = true;
                reason = 'Swap';
            } else {
                isOff = false;
                shift = swap.newShift;
                reason = '';
            }
        }
      }

      if (certificateDaysMap.has(dateString)) {
        isOff = true; 
        reason = 'Certificate';
      }

      if(isSameMonth(day, month)) {
        if (!isOff) {
          workedCounter++;
          if (holidayName) {
            holidaysWorkedCounter++;
          }
        }
      }
      
      return {
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day),
        isDayOff: isOff,
        dayOffReason: reason,
        isHoliday: !!holidayName,
        holidayName: holidayName || '',
        hasComment: commentsMap.has(dateString),
        shift: isOff ? '' : shift,
      };
    });

    setCalendarDays(calendarGrid);
    setWorkedDaysCount(workedCounter);
    setHolidaysWorkedCount(holidaysWorkedCounter);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setCommentModalOpen(true);
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const renderDayStatus = (day: DayInfo) => {
    if (day.dayOffReason === 'Certificate') {
      return <div style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 'bold' }}>Atestado</div>;
    }
    if (day.dayOffReason === 'Swap') {
      return <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>Folga (Troca)</div>;
    }
    if (day.isDayOff) {
      return <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>Folga</div>;
    }
    return <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>{day.shift}</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <button onClick={prevMonth}>Mês Anterior</button>
        <h2>{format(currentMonth, "LLLL yyyy", { locale: ptBR })}</h2>
        <button onClick={nextMonth}>Próximo Mês</button>
      </div>

      <div style={{display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0', padding: '10px', background: '#f3f4f6', borderRadius: '8px'}}>
        <span><strong>Dias Trabalhados no Mês:</strong> {workedDaysCount}</span>
        <span><strong>(Sendo {holidaysWorkedCount} em feriados)</strong></span>
      </div>

      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} style={{ fontWeight: 'bold', textAlign: 'center' }}>{day}</div>)}
          
          {calendarDays.map((day) => {
            const dayStyle: React.CSSProperties = {
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '100px',
              color: day.isToday ? 'blue' : 'black',
              backgroundColor: day.isCurrentMonth ? 'white' : '#f9f9f9',
              cursor: 'pointer',
            };
            
            return (
                <div key={day.date.toString()} style={dayStyle} onClick={() => handleDayClick(day.date)}>
                  <div style={{ fontWeight: 'bold' }}>{format(day.date, 'd')}</div>
                  {day.isHoliday && <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{day.holidayName}</div>}
                  {day.hasComment && <div style={{ fontSize: '12px', color: 'orange' }}>&#9998; Comentário</div>}
                  {renderDayStatus(day)}
                </div>
            )
          })}
        </div>
      )}
      <CommentsModal 
        isOpen={isCommentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onCommentAdded={fetchData}
        selectedDate={selectedDate}
        calendarUser={user}
      />
    </div>
  );
}