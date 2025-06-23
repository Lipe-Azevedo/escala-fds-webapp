'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
      <button onClick={onPrevMonth}>Mês Anterior</button>
      <h2>{formattedMonthTitle()}</h2>
      <button onClick={onNextMonth}>Próximo Mês</button>
    </div>
  );
}