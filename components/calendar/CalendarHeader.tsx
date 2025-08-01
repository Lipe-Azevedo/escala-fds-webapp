'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './CalendarHeader.module.css';

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({ currentMonth, onPrevMonth, onNextMonth }: CalendarHeaderProps) {
  const formattedMonthTitle = () => {
    const monthName = format(currentMonth, "LLLL", { locale: ptBR });
    const year = format(currentMonth, "yyyy", { locale: ptBR });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
  }

  return (
    <div className={styles.header}>
      <button onClick={onPrevMonth} className={styles.navButton}>&lt;</button>
      <h2 className={styles.monthName}>{formattedMonthTitle()}</h2>
      <button onClick={onNextMonth} className={styles.navButton}>&gt;</button>
    </div>
  );
}