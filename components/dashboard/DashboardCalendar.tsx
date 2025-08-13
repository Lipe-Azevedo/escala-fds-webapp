'use client';

import { useMemo } from 'react';
import { format, startOfMonth, addMonths, subMonths, isSameMonth, addDays, eachDayOfInterval, startOfWeek, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './DashboardCalendar.module.css';
import { DaySchedule, DayIndicator } from '@/types';
import { indicatorColors } from '@/lib/calendarUtils';

interface DashboardCalendarProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateSelect: (date: Date) => void;
  calendarGrid: DaySchedule[];
  selectedWeekIndex: number;
}

export default function DashboardCalendar({ currentMonth, onPrevMonth, onNextMonth, onDateSelect, calendarGrid, selectedWeekIndex }: DashboardCalendarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" onClick={onPrevMonth} className={styles.navButton}>&lt;</button>
        <span className={styles.monthName}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={onNextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.grid}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.weekday}>{day}</div>
        ))}
        {calendarGrid.map((day, index) => {
          const dateObj = parseISO(day.date);
          const isCurrentMonth = isSameMonth(dateObj, currentMonth);
          
          const classNames = [styles.day];
          if (!isCurrentMonth) {
            classNames.push(styles.otherMonth);
          } else {
            classNames.push(styles.selectable);
            if (isToday(dateObj)) {
              classNames.push(styles.selected);
            }
            if (Math.floor(index / 7) === selectedWeekIndex) {
              classNames.push(styles.highlighted);
            }
          }
          
          return (
            <button
              key={day.date}
              type="button"
              className={classNames.join(' ')}
              onClick={() => isCurrentMonth && onDateSelect(dateObj)}
            >
              <span>{format(dateObj, 'd')}</span>
              <div className={styles.indicators}>
                {day.indicators.map((indicator, i) => (
                  <span key={i} className={styles.indicator} style={{ backgroundColor: indicatorColors[indicator.type] }} title={indicator.label}></span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}