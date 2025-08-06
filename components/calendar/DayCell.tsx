'use client';

import { format, isToday } from 'date-fns';
import { DaySchedule, DayIndicator } from '@/types';
import styles from './DayCell.module.css';

interface DayCellProps {
  day: DaySchedule;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
}

const indicatorColors: Record<string, string> = {
    day_off: '#10b981', // Verde
    swap_day_off: '#34d399', // Verde claro (destaque)
    swap_shift: '#3b82f6', // Azul
    holiday: '#f59e0b', // Amarelo
    certificate: '#ef4444', // Vermelho
    comment: '#6b7280', // Cinza
}

export default function DayCell({ day, isCurrentMonth, onClick }: DayCellProps) {
  const dateObj = new Date(day.date.replace(/-/g, '/'));
  
  const dayStyle: React.CSSProperties = {
    color: isToday(dateObj) ? 'var(--primary-color)' : 'rgb(var(--foreground-rgb))',
    opacity: isCurrentMonth ? 1 : 0.3,
  };

  return (
    <div className={styles.dayCell} style={dayStyle} onClick={() => onClick(dateObj)}>
      <div className={styles.dayNumber}>{format(dateObj, 'd')}</div>
      <div className={styles.indicators}>
        {day.indicators.map((indicator, index) => (
            <span 
                key={index}
                className={styles.indicator}
                style={{ backgroundColor: indicatorColors[indicator.type] || '#fff' }}
                title={indicator.label}
            ></span>
        ))}
      </div>
    </div>
  );
}