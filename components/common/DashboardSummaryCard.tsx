'use client';

import Link from 'next/link';
import React from 'react';

interface DashboardSummaryCardProps {
  title: string;
  value: string | number;
  linkTo: string;
  linkLabel: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '16px',
  color: '#6b7280',
  fontWeight: 500,
};

const valueStyle: React.CSSProperties = {
  margin: '10px 0',
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#111827',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--primary-color)',
  textDecoration: 'none',
  fontWeight: 500,
};

export default function DashboardSummaryCard({ title, value, linkTo, linkLabel }: DashboardSummaryCardProps) {
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