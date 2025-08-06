'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, DaySchedule } from '@/types';
import { addMonths, subMonths } from 'date-fns';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid } from '@/lib/calendarUtils';
import CommentsModal from '@/components/comment/CommentsModal';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

interface CalendarProps {
    user: CalendarUser;
    onSummaryChange: (summary: { workedDays: number, holidaysWorked: number }) => void;
}

export default function Calendar({ user, onSummaryChange }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading, error, data, fetchData } = useCalendarData(currentMonth, user);

  const { calendarGrid, workedCounter, holidaysWorkedCounter } = useMemo(() => {
    if (!user || !data) return { calendarGrid: [], workedCounter: 0, holidaysWorkedCounter: 0 };
    return generateCalendarGrid(currentMonth, user, data.holidays, data.swaps, data.comments, data.certificates);
  }, [currentMonth, user, data]);

  useEffect(() => {
    onSummaryChange({ workedDays: workedCounter, holidaysWorked: holidaysWorkedCounter });
  }, [workedCounter, holidaysWorkedCounter, onSummaryChange]);
  
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    fetchData(); 
  }
  
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', borderRadius: '8px', padding: '20px'}}>
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />
      
      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
        <CalendarGrid 
            days={calendarGrid} 
            currentMonth={currentMonth} 
            onDayClick={handleDayClick} 
        />
      )}

      <CommentsModal 
        isOpen={isCommentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onCommentAdded={handleCommentAdded}
        selectedDate={selectedDate}
        calendarUser={user}
      />
    </div>
  );
}