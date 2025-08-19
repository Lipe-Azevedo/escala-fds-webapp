'use client';

import { format, parseISO, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DaySchedule } from '@/types';
import { indicatorColors } from '@/lib/calendarUtils';
import panelStyles from '../common/Panel.module.css';
import styles from './DashboardCalendar.module.css';

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
    <div className={panelStyles.container}>
      <div className={panelStyles.header}>
        <button type="button" onClick={onPrevMonth} className={panelStyles.navButton}>&lt;</button>
        <span className={panelStyles.headerTitle}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={onNextMonth} className={panelStyles.navButton}>&gt;</button>
      </div>
      <div className={`${panelStyles.grid} ${styles.grid}`}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={panelStyles.weekday}>{day}</div>
        ))}
        {calendarGrid.map((day, index) => {
          const dateObj = parseISO(day.date);
          const isCurrentMonth = isSameMonth(dateObj, currentMonth);
          const classNames = [styles.day];
          if (!isCurrentMonth) {
            classNames.push(styles.otherMonth);
          } else {
            if (Math.floor(index / 7) === selectedWeekIndex) {
              classNames.push(styles.highlighted);
            }
            if (isToday(dateObj)) {
              classNames.push(styles.selected);
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