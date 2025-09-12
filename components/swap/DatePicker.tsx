'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, startOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import panelStyles from '../common/Panel.module.css';
import styles from './DatePicker.module.css';

interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isDaySelectable: (date: Date) => boolean;
  initialMonth?: Date;
}

export default function DatePicker({ selectedDate, onDateSelect, isDaySelectable, initialMonth }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || selectedDate || new Date());

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 41) });
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className={panelStyles.container}>
      <div className={panelStyles.header}>
        <button type="button" onClick={handlePrevMonth} className={panelStyles.navButton}>&lt;</button>
        <span className={panelStyles.headerTitle}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={handleNextMonth} className={panelStyles.navButton}>&gt;</button>
      </div>
      <div className={`${panelStyles.grid} ${styles.grid}`}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={panelStyles.weekday}>{day}</div>
        ))}
        {gridDays.map(day => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isOtherMonth = !isSameMonth(day, currentMonth);
          const isSelectable = !isOtherMonth && isDaySelectable(day);

          const classNames = [styles.day];
          if (isOtherMonth) {
            classNames.push(styles.otherMonth);
          } else {
            if (isSelectable) classNames.push(styles.selectable);
            if (isSelected) classNames.push(styles.selected);
          }
          
          return (
            <button
              type="button"
              key={day.toString()}
              className={classNames.join(' ')}
              onClick={() => isSelectable && onDateSelect(day)}
              disabled={!isSelectable}
            >
              <span>{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}