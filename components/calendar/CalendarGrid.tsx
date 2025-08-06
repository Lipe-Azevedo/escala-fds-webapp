'use client';

import { DaySchedule } from '@/types';
import DayCell from '@/components/calendar/DayCell';
import { isSameMonth } from 'date-fns';
import styles from './CalendarGrid.module.css';

interface CalendarGridProps {
  days: DaySchedule[];
  currentMonth: Date;
  onDayClick: (date: Date) => void;
}

export default function CalendarGrid({ days, currentMonth, onDayClick }: CalendarGridProps) {
  return (
    <div className={styles.grid}>
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => 
        <div key={i} className={styles.weekday}>
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