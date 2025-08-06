'use client';

import { DaySchedule } from '@/types';
import styles from './WeeklyDetailsPanel.module.css';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyDetailsPanelProps {
  weeks: DaySchedule[][];
  selectedWeekIndex: number;
  onWeekChange: (index: number) => void;
}

export default function WeeklyDetailsPanel({ weeks, selectedWeekIndex, onWeekChange }: WeeklyDetailsPanelProps) {
  const currentWeek = weeks[selectedWeekIndex] || [];
  const eventsOfWeek = currentWeek.filter(day => day.indicators.length > 0);

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
          <ul>
            {eventsOfWeek.map(day => (
              <li key={day.date}>
                <strong>{format(parseISO(day.date), "EEEE, dd/MM", { locale: ptBR })}:</strong>
                <ul>
                  {day.indicators.map((indicator, index) => (
                    <li key={index}>{indicator.label}</li>
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