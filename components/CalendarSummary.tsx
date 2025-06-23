'use client';

interface CalendarSummaryProps {
  workedDays: number;
  holidaysWorked: number;
}

export default function CalendarSummary({ workedDays, holidaysWorked }: CalendarSummaryProps) {
  return (
    <div style={{display: 'flex', gap: '20px', justifyContent: 'center', margin: '20px 0', padding: '10px', background: '#f3f4f6', borderRadius: '8px'}}>
      <span><strong>Dias Trabalhados no Mês:</strong> {workedDays}</span>
      <span><strong>(Sendo {holidaysWorked} em feriados)</strong></span>
    </div>
  );
}