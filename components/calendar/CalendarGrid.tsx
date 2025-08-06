'use client';

import { DaySchedule } from '@/types';
import DayCell from '@/components/calendar/DayCell';
import { isSameMonth, parseISO } from 'date-fns';
import styles from './CalendarGrid.module.css';

interface CalendarGridProps {
  days: DaySchedule[];
  currentMonth: Date;
  selectedWeekIndex: number;
  onDayClick: (date: Date) => void;
}

export default function CalendarGrid({ days, currentMonth, selectedWeekIndex, onDayClick }: CalendarGridProps) {
  return (
    <div className={styles.grid}>
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => 
        <div key={i} className={styles.weekday}>
          {day}
        </div>
      )}
      
      {days.map((day, index) => (
        <DayCell 
            key={day.date} 
            day={day}
            dayIndex={index}
            selectedWeekIndex={selectedWeekIndex}
            isCurrentMonth={isSameMonth(parseISO(day.date), currentMonth)}
            onClick={onDayClick} 
        />
      ))}
    </div>
  );
}