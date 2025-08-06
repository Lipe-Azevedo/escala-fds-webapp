'use client';

import { DaySchedule } from '@/types';
import DayCell from '@/components/calendar/DayCell';
import { isSameMonth } from 'date-fns';

interface CalendarGridProps {
  days: DaySchedule[];
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

export default function CalendarGrid({ days, currentMonth, onDayClick }: CalendarGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'rgb(var(--card-border-rgb))', border: '1px solid rgb(var(--card-border-rgb))' }}>
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => 
        <div key={day} style={{ fontWeight: 'bold', textAlign: 'center', padding: '10px', backgroundColor: 'rgb(var(--card-background-rgb))' }}>
          {day}
        </div>
      )}
      
      {days.map((day) => (
        <DayCell 
            key={day.date} 
            day={day} 
            isCurrentMonth={isSameMonth(new Date(day.date.replace(/-/g, '/')), currentMonth)}
            onClick={onDayClick} 
        />
      ))}
    </div>
  );
}