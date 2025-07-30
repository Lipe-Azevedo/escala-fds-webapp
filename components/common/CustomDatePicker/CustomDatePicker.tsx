'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './CustomDatePicker.module.css';

interface CustomDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isDaySelectable: (date: Date) => boolean;
  initialMonth?: Date;
}

export default function CustomDatePicker({ selectedDate, onDateSelect, isDaySelectable, initialMonth }: CustomDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || selectedDate || new Date());

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    // Garante que sempre tenhamos 6 semanas (42 dias)
    while (days.length < 42) {
        days.push(addDays(days[days.length - 1], 1));
    }
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton}>&lt;</button>
        <span className={styles.monthName}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button onClick={handleNextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.grid}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.weekday}>{day}</div>
        ))}
        {gridDays.map(day => {
          const isSelectable = isDaySelectable(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isOtherMonth = !isSameMonth(day, currentMonth);

          let className = styles.day;
          if (isOtherMonth) className += ` ${styles.otherMonth}`;
          if (isSelected) className += ` ${styles.selected}`;
          if (isSelectable) className += ` ${styles.selectable}`;
          
          return (
            <button
              key={day.toString()}
              className={className}
              onClick={() => isSelectable && onDateSelect(day)}
              disabled={!isSelectable}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}