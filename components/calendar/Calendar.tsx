'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, DaySchedule } from '@/types';
import { addMonths, subMonths, isSameMonth, parseISO } from 'date-fns';
import { useCalendarData } from '@/hooks/useCalendarData';
import CommentsModal from '@/components/comment/CommentsModal';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

interface CalendarProps {
    user: CalendarUser;
    onSummaryChange: (summary: { workedDays: number, holidaysWorked: number }) => void;
    calendarGrid: DaySchedule[];
    currentMonth: Date;
    isLoading: boolean;
    error: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onCommentAdded: () => void;
    selectedWeekIndex: number;
}

export default function Calendar({ 
    user, 
    onSummaryChange, 
    calendarGrid,
    currentMonth,
    isLoading,
    error,
    onPrevMonth,
    onNextMonth,
    onCommentAdded,
    selectedWeekIndex
}: CalendarProps) {
  
  const { workedCounter, holidaysWorkedCounter } = useMemo(() => {
    let workedDays = 0;
    let holidaysWorked = 0;
    calendarGrid.forEach(day => {
        if(isSameMonth(new Date(day.date.replace(/-/g, '/')), currentMonth) && !day.isDayOff) {
            workedDays++;
            if (day.indicators.some(i => i.type === 'holiday')) {
                holidaysWorked++;
            }
        }
    });
    return { workedCounter: workedDays, holidaysWorkedCounter: holidaysWorked };
  }, [calendarGrid, currentMonth]);

  useEffect(() => {
    onSummaryChange({ workedDays: workedCounter, holidaysWorked: holidaysWorkedCounter });
  }, [workedCounter, holidaysWorkedCounter, onSummaryChange]);
  
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCommentModalOpen(true);
  };
  
  return (
    <div style={{backgroundColor: 'rgb(var(--card-background-rgb))', borderRadius: '8px', padding: '20px'}}>
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      
      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
        <CalendarGrid 
            days={calendarGrid} 
            currentMonth={currentMonth} 
            onDayClick={handleDayClick} 
            selectedWeekIndex={selectedWeekIndex}
        />
      )}

      <CommentsModal 
        isOpen={isCommentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onCommentAdded={onCommentAdded}
        selectedDate={selectedDate}
        calendarUser={user}
      />
    </div>
  );
}