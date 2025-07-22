'use client';

import { useState, useMemo } from 'react';
import { User } from '@/types';
import { addMonths, subMonths } from 'date-fns';
import { useCalendarData } from '@/hooks/useCalendarData';
import { generateCalendarGrid } from '@/lib/calendarUtils';
import CommentsModal from '@/components/comment/CommentsModal';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarSummary from '@/components/calendar/CalendarSummary';
import CalendarGrid from '@/components/calendar/CalendarGrid';

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export default function Calendar({ user }: { user: CalendarUser }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isLoading, error, data, fetchData } = useCalendarData(currentMonth, user);

  const { calendarGrid, workedCounter, holidaysWorkedCounter } = useMemo(() => {
    return generateCalendarGrid(currentMonth, user, data.holidays, data.swaps, data.comments, data.certificates);
  }, [currentMonth, user, data]);
  
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
    <div>
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />
      
      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
        <>
            <CalendarGrid days={calendarGrid} onDayClick={handleDayClick} />
            <CalendarSummary 
                workedDays={workedCounter}
                holidaysWorked={holidaysWorkedCounter}
            />
        </>
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