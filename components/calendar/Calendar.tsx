'use client';

import { useState } from 'react';
import { User, DaySchedule } from '@/types';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, addDays } from 'date-fns';
import { useCalendarData } from '@/hooks/useCalendarData';
import CommentsModal from '@/components/comment/CommentsModal';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarSummary from '@/components/calendar/CalendarSummary';
import CalendarGrid from '@/components/calendar/CalendarGrid';

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export default function Calendar({ user }: { user: CalendarUser }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading, error, schedule, fetchData } = useCalendarData(currentMonth, user);
  
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCommentModalOpen(true);
  };
  
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  // Gera a grade completa de 6 semanas para o frontend
  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = addDays(startDate, 41);
  const daySkeletons = eachDayOfInterval({ start: startDate, end: endDate });

  // Mapeia os dados do backend para a grade
  const scheduleMap = new Map(schedule?.days.map(d => [d.date, d]));
  const calendarDays: DaySchedule[] = daySkeletons.map(day => {
    const dateString = format(day, 'yyyy-MM-dd');
    return scheduleMap.get(dateString) || { date: dateString, isDayOff: false, indicators: [] };
  });

  return (
    <div>
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />
      
      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
        <>
            <CalendarGrid days={calendarDays} currentMonth={currentMonth} onDayClick={handleDayClick} />
            <CalendarSummary 
                workedDays={schedule?.workedDaysCount || 0}
                holidaysWorked={schedule?.holidaysWorkedCount || 0}
            />
        </>
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