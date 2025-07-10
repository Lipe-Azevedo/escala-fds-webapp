'use client';

import { useState } from 'react';
import { User } from '@/types';
import CommentsModal from '@/components/comment/CommentsModal'; // Caminho de importação corrigido
import { useCalendar } from '@/hooks/useCalendar';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarSummary from '@/components/calendar/CalendarSummary';
import CalendarGrid from '@/components/calendar/CalendarGrid';

type CalendarUser = Pick<User, 'id' | 'shift' | 'weekdayOff' | 'initialWeekendOff' | 'createdAt' | 'superiorId'>;

export default function Calendar({ user }: { user: CalendarUser }) {
  const {
    currentMonth,
    calendarDays,
    isLoading,
    error,
    workedDaysCount,
    holidaysWorkedCount,
    fetchData,
    prevMonth,
    nextMonth
  } = useCalendar(user);
  
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    fetchData(); 
  }

  return (
    <div>
      <CalendarHeader 
        currentMonth={currentMonth}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
      />
      
      {isLoading ? <p>Carregando calendário...</p> : error ? <p style={{color: '#f87171'}}>{error}</p> : (
        <>
            <CalendarGrid days={calendarDays} onDayClick={handleDayClick} />
            <CalendarSummary 
                workedDays={workedDaysCount}
                holidaysWorked={holidaysWorkedCount}
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