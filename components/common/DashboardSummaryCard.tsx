'use client';

import Link from 'next/link';
import React from 'react';

interface DashboardSummaryCardProps {
  title: string;
  value: string | number;
  linkTo: string;
  linkLabel: string;
}

export default function DashboardSummaryCard({ title, value, linkTo, linkLabel }: DashboardSummaryCardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgb(var(--card-background-rgb))',
    border: '1px solid rgb(var(--card-border-rgb))',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    color: 'var(--text-secondary-color)',
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    margin: '10px 0',
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'rgb(var(--foreground-rgb))',
  };

  const linkStyle: React.CSSProperties = {
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: 500,
  };

  return (
    <div style={cardStyle}>
      <div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={valueStyle}>{value}</p>
      </div>
      <Link href={linkTo} style={linkStyle}>
        {linkLabel} &rarr;
      </Link>
    </div>
  );
}