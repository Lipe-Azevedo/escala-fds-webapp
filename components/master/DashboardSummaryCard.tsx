'use client';

import Link from 'next/link';
import React from 'react';
import styles from './DashboardSummaryCard.module.css';

interface DashboardSummaryCardProps {
  title: string;
  value: string | number;
  linkTo: string;
  linkLabel: string;
}

export default function DashboardSummaryCard({ title, value, linkTo, linkLabel }: DashboardSummaryCardProps) {
  return (
    <div className={styles.card}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
      </div>
      <Link href={linkTo} className={styles.link}>
        {linkLabel} &rarr;
      </Link>
    </div>
  );
}