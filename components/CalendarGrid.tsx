'use client';

import { DayInfo } from '@/hooks/useCalendar';
import DayCell from './DayCell';

interface CalendarGridProps {
  days: DayInfo[];
  onDayClick: (date: Date) => void;
}

export default function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} style={{ fontWeight: 'bold', textAlign: 'center' }}>{day}</div>)}
      
      {days.map((day) => (
        <DayCell key={day.date.toString()} day={day} onClick={onDayClick} />
      ))}
    </div>
  );
}