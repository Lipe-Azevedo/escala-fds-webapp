'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, addMonths, subMonths, isSameMonth, isSameDay, addDays, isAfter, isBefore, eachDayOfInterval, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './CustomDateRangePicker.module.css';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CustomDateRangePickerProps {
  selectedRange: DateRange;
  onRangeSelect: (range: DateRange) => void;
  isDaySelectable?: (date: Date) => boolean;
  initialMonth?: Date;
}

export default function CustomDateRangePicker({ selectedRange, onRangeSelect, isDaySelectable = () => true, initialMonth }: CustomDateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || selectedRange.start || new Date());

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: startDate, end: addDays(startDate, 41) });
  }, [currentMonth]);

  const handleDayClick = (day: Date) => {
    if (!isDaySelectable(day)) return;
    
    const { start, end } = selectedRange;

    if (!start || (start && end)) {
      onRangeSelect({ start: day, end: null });
    } else if (isBefore(day, start)) {
      onRangeSelect({ start: day, end: null });
    } else {
      onRangeSelect({ start: start, end: day });
    }
  };

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" onClick={handlePrevMonth} className={styles.navButton}>&lt;</button>
        <span className={styles.monthName}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={handleNextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.grid}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.weekday}>{day}</div>
        ))}
        {gridDays.map(day => {
          const isSelectable = isDaySelectable(day);
          const isOtherMonth = !isSameMonth(day, currentMonth);
          const { start, end } = selectedRange;
          
          const isStart = start && isSameDay(day, start);
          const isEnd = end && isSameDay(day, end);
          const isInRange = start && end && isAfter(day, start) && isBefore(day, end);

          const classNames = [styles.day];
          if (isOtherMonth) {
            classNames.push(styles.otherMonth);
          } else {
            if (isSelectable) classNames.push(styles.selectable);
            if (isStart) classNames.push(styles.startRange);
            if (isEnd) classNames.push(styles.endRange);
            if (isInRange) classNames.push(styles.inRange);
          }
          
          return (
            <button
              type="button"
              key={day.toString()}
              className={classNames.join(' ')}
              onClick={() => handleDayClick(day)}
              disabled={!isSelectable || isOtherMonth}
            >
              <span>{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}