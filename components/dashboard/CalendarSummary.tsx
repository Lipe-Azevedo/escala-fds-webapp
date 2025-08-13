'use client';

import styles from './CalendarSummary.module.css';

interface CalendarSummaryProps {
  workedDays: number;
  holidaysWorked: number;
}

export default function CalendarSummary({ workedDays, holidaysWorked }: CalendarSummaryProps) {
  return (
    <div className={styles.container}>
      <span><strong>Dias Trabalhados no Mês:</strong> {workedDays}</span>
      <span><strong>(Sendo {holidaysWorked} em feriados)</strong></span>
    </div>
  );
}