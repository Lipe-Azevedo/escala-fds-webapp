'use client';

import { ShiftName } from '@/types';
import styles from './ShiftSelector.module.css';

interface ShiftSelectorProps {
  selectedShift: ShiftName | '';
  onSelectShift: (shift: ShiftName) => void;
}

const shifts: { value: ShiftName, label: string }[] = [
    { value: '06:00-14:00', label: 'Manhã' },
    { value: '14:00-22:00', label: 'Tarde' },
    { value: '22:00-06:00', label: 'Noite' },
];

export default function ShiftSelector({ selectedShift, onSelectShift }: ShiftSelectorProps) {
  return (
    <div className={styles.container}>
      {shifts.map(shift => (
        <button
          key={shift.value}
          type="button"
          className={`${styles.shiftButton} ${selectedShift === shift.value ? styles.selected : ''}`}
          onClick={() => onSelectShift(shift.value)}
        >
          {shift.label}
          <span className={styles.shiftTime}>{shift.value}</span>
        </button>
      ))}
    </div>
  );
}