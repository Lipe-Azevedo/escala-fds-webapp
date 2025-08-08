import React from 'react';
import styles from './CalendarViewLayout.module.css';

interface CalendarViewLayoutProps {
  calendar: React.ReactNode;
  panel: React.ReactNode;
}

export default function CalendarViewLayout({ calendar, panel }: CalendarViewLayoutProps) {
  return (
    <div className={styles.container}>
      <div>{calendar}</div>
      <div>{panel}</div>
    </div>
  );
}