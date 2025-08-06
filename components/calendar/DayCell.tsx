'use client';

import { format, isToday, parseISO } from 'date-fns';
import { DaySchedule, DayIndicator } from '@/types';
import styles from './DayCell.module.css';

interface DayCellProps {
  day: DaySchedule;
  dayIndex: number;
  selectedWeekIndex: number;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
}

const indicatorColors: Record<DayIndicator['type'], string> = {
    day_off: '#10b981',
    swap_day_off: '#6ee7b7',
    swap_shift: '#3b82f6',
    holiday: '#f59e0b',
    certificate: '#ef4444',
    comment: '#6b7280',
};

export default function DayCell({ day, dayIndex, selectedWeekIndex, isCurrentMonth, onClick }: DayCellProps) {
  const dateObj = parseISO(day.date);
  
  const classNames = [styles.dayCell];
  if (!isCurrentMonth) {
    classNames.push(styles.otherMonth);
  }
  if (isToday(dateObj)) {
    classNames.push(styles.today);
  }
  if (Math.floor(dayIndex / 7) === selectedWeekIndex) {
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