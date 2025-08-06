'use client';

import { format, isToday, parseISO } from 'date-fns';
import { DaySchedule } from '@/types';
import styles from './DayCell.module.css';
import { indicatorColors } from '@/lib/calendarUtils'; // Importa as cores

interface DayCellProps {
  day: DaySchedule;
  dayIndex: number;
  selectedWeekIndex: number;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
}

export default function DayCell({ day, dayIndex, selectedWeekIndex, isCurrentMonth, onClick }: DayCellProps) {
  const dateObj = parseISO(day.date);
  
  const classNames = [styles.dayCell];
  if (!isCurrentMonth) {
    classNames.push(styles.otherMonth);
  }
  if (isToday(dateObj)) {
    classNames.push(styles.today);
  }
  if (isCurrentMonth && Math.floor(dayIndex / 7) === selectedWeekIndex) {
    classNames.push(styles.highlighted);
  }
  
  return (
    <div className={classNames.join(' ')} onClick={() => onClick(dateObj)}>
      <span className={styles.dayNumber}>{format(dateObj, 'd')}</span>
      <div className={styles.indicators}>
        {day.indicators.map((indicator, index) => (
            <span 
                key={index}
                className={styles.indicator}
                style={{ backgroundColor: indicatorColors[indicator.type] || '#ffffff' }}
                title={indicator.label}
            ></span>
        ))}
      </div>
    </div>
  );
}