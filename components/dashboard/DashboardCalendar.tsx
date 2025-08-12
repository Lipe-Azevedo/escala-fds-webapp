'use client';

import { useMemo } from 'react';
import { format, startOfMonth, addMonths, subMonths, isSameMonth, isSameDay, addDays, eachDayOfInterval, startOfWeek, parseISO, isToday } from 'date-fns';
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
          const dayClasses = [styles.day];
          if (!isCurrentMonth) dayClasses.push(styles.otherMonth);
          if (isCurrentMonth && Math.floor(index / 7) === selectedWeekIndex) {
            dayClasses.push(styles.highlighted);
          }
          
          return (
            <div
              key={day.date}
              className={dayClasses.join(' ')}
              onClick={() => isCurrentMonth && onDateSelect(dateObj)}
            >
              <div className={`${styles.dayNumberWrapper} ${isToday(dateObj) ? styles.today : ''}`}>
                <span>{format(dateObj, 'd')}</span>
              </div>
              <div className={styles.indicators}>
                {day.indicators.map((indicator, i) => (
                  <span key={i} className={styles.indicator} style={{ backgroundColor: indicatorColors[indicator.type] }} title={indicator.label}></span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}