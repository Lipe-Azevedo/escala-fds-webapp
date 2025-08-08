'use client';

import { DaySchedule } from '@/types';
import styles from './WeeklyDetailsPanel.module.css';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { indicatorColors } from '@/lib/calendarUtils';

interface WeeklyDetailsPanelProps {
  weeks: DaySchedule[][];
  selectedWeekIndex: number;
  onWeekChange: (index: number) => void;
  currentMonth: Date;
}

export default function WeeklyDetailsPanel({ weeks, selectedWeekIndex, onWeekChange, currentMonth }: WeeklyDetailsPanelProps) {
  const currentWeek = weeks[selectedWeekIndex] || [];
  
  const eventsOfWeek = currentWeek.filter(day => 
    day.indicators.length > 0 && isSameMonth(parseISO(day.date), currentMonth)
  );

  const handlePrevWeek = () => {
    onWeekChange(Math.max(0, selectedWeekIndex - 1));
  };

  const handleNextWeek = () => {
    onWeekChange(Math.min(weeks.length - 1, selectedWeekIndex + 1));
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <button onClick={handlePrevWeek} disabled={selectedWeekIndex === 0}>&lt;</button>
        <span>Semana {selectedWeekIndex + 1} de {weeks.length}</span>
        <button onClick={handleNextWeek} disabled={selectedWeekIndex === weeks.length - 1}>&gt;</button>
      </div>
      <div className={styles.content}>
        {eventsOfWeek.length > 0 ? (
          <ul className={styles.eventList}>
            {eventsOfWeek.map(day => (
              <li key={day.date}>
                <strong>{format(parseISO(day.date), "EEEE, dd/MM", { locale: ptBR })}</strong>
                <ul className={styles.indicatorList}>
                  {day.indicators.map((indicator, index) => (
                    <li key={index} className={styles.indicatorItem}>
                      <span 
                        className={styles.indicatorDash}
                        style={{ backgroundColor: indicatorColors[indicator.type] || '#ffffff' }}
                      ></span>
                      <span>{indicator.label}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noEvents}>Nenhum evento para esta semana.</p>
        )}
      </div>
    </div>
  );
}