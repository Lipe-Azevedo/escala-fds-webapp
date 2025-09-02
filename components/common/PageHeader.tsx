'use client';

import styles from './PageHeader.module.css';
import FilterIcon from "../icons/FilterIcon";

interface PageHeaderProps {
  title: string;
  onFilterToggle: () => void;
  children?: React.ReactNode;
}

export default function PageHeader({ title, onFilterToggle, children }: PageHeaderProps) {
  return (
    <div className={styles.headerContainer}>
        <h1>{title}</h1>
        <div className={styles.actionsContainer}>
            <button onClick={onFilterToggle} className={styles.filterButton}>
                <FilterIcon size={20} />
                Filtros
            </button>
            {children}
        </div>
    </div>
  );
}