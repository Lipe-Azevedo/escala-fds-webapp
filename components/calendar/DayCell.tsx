'use client';

import { format } from 'date-fns';
import { DayInfo } from '@/hooks/useCalendar';

interface DayCellProps {
  day: DayInfo;
  onClick: (date: Date) => void;
}

const renderDayStatus = (day: DayInfo) => {
    if (day.dayOffReason === 'Certificate') {
      return <div style={{ fontSize: '12px', color: '#facc15', fontWeight: 'bold' }}>Atestado</div>;
    }
    if (day.dayOffReason === 'Swap') {
      return <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 'bold' }}>Folga (Troca)</div>;
    }
    if (day.isDayOff) {
      return <div style={{ fontSize: '12px', color: '#4ade80', fontWeight: 'bold' }}>Folga</div>;
    }
    return <div style={{ fontSize: '12px', color: 'var(--text-secondary-color)', marginTop: '5px' }}>{day.shift}</div>;
}

export default function DayCell({ day, onClick }: DayCellProps) {
  const dayStyle: React.CSSProperties = {
    border: `1px solid rgb(var(--card-border-rgb))`,
    padding: '10px',
    minHeight: '100px',
    color: day.isToday ? '#60a5fa' : 'rgb(var(--foreground-rgb))',
    backgroundColor: day.isCurrentMonth ? 'rgb(var(--card-background-rgb))' : 'rgba(var(--background-rgb), 0.5)',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  return (
    <div style={dayStyle} onClick={() => onClick(day.date)}>
      <div style={{ fontWeight: 'bold' }}>{format(day.date, 'd')}</div>
      {day.isHoliday && <div style={{ fontSize: '12px', color: '#f87171', fontWeight: 'bold' }}>{day.holidayName}</div>}
      {day.hasComment && <div style={{ fontSize: '12px', color: '#fb923c' }}>&#9998; Comentário</div>}
      {renderDayStatus(day)}
    </div>
  );
}