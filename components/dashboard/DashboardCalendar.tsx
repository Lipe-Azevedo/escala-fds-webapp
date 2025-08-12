'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, addMonths, subMonths, isSameMonth, isSameDay, addDays, eachDayOfInterval, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from './DashboardCalendar.module.css';

// A interface de props será expandida no futuro para receber os indicadores
interface DashboardCalendarProps {
  initialMonth?: Date;
  // Adicionaremos mais props aqui depois
}

export default function DashboardCalendar({ initialMonth }: DashboardCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Exemplo, pode ser removido

  const gridDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 41) });
    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" onClick={handlePrevMonth} className={styles.navButton}>&lt;</button>
        <span className={styles.monthName}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <button type="button" onClick={handleNextMonth} className={styles.navButton}>&gt;</button>
      </div>
      <div className={styles.grid}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className={styles.weekday}>{day}</div>
        ))}
        {gridDays.map(day => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isOtherMonth = !isSameMonth(day, currentMonth);
          
          const classNames = [styles.day];
          if (isOtherMonth) {
            classNames.push(styles.otherMonth);
          } else {
            if (isSelected) classNames.push(styles.selected);
          }
          
          return (
            <button
              type="button"
              key={day.toString()}
              className={classNames.join(' ')}
              onClick={() => !isOtherMonth && setSelectedDate(day)}
            >
              <span>{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}