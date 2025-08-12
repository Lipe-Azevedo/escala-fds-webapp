'use client';

interface CalendarSummaryProps {
  workedDays: number;
  holidaysWorked: number;
}

export default function CalendarSummary({ workedDays, holidaysWorked }: CalendarSummaryProps) {
  return (
    <div style={{
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center', 
        padding: '15px', 
        background: 'rgb(var(--card-background-rgb))', // Corrigido
        border: '1px solid rgb(var(--card-border-rgb))', 
        borderRadius: '8px'
    }}>
      <span><strong>Dias Trabalhados no Mês:</strong> {workedDays}</span>
      <span><strong>(Sendo {holidaysWorked} em feriados)</strong></span>
    </div>
  );
}