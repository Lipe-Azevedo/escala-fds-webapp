'use client';

import { format } from 'date-fns';
import { DayInfo } from '@/hooks/useCalendar';

interface DayCellProps {
  day: DayInfo;
  onClick: (date: Date) => void;
}

const renderDayStatus = (day: DayInfo) => {
  if (day.dayOffReason === 'Certificate') {
    return <div style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 'bold' }}>Atestado</div>;
  }
  if (day.dayOffReason === 'Swap') {
    return <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>Folga (Troca)</div>;
  }
  if (day.isDayOff) {
    return <div style={{ fontSize: '12px', color: 'green', fontWeight: 'bold' }}>Folga</div>;
  }
  return <div style={{ fontSize: '12px', color: '#555', marginTop: '5px' }}>{day.shift}</div>;
}

export default function DayCell({ day, onClick }: DayCellProps) {
  const dayStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '10px',
    minHeight: '100px',
    color: day.isToday ? 'blue' : 'black',
    backgroundColor: day.isCurrentMonth ? 'white' : '#f9f9f9',
    cursor: 'pointer',
  };

  return (
    <div style={dayStyle} onClick={() => onClick(day.date)}>
      <div style={{ fontWeight: 'bold' }}>{format(day.date, 'd')}</div>
      {day.isHoliday && <div style={{ fontSize: '12px', color: 'red', fontWeight: 'bold' }}>{day.holidayName}</div>}
      {day.hasComment && <div style={{ fontSize: '12px', color: 'orange' }}>&#9998; Comentário</div>}
      {renderDayStatus(day)}
    </div>
  );
}