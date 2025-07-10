'use client';

import { Holiday } from '@/types';

interface HolidayListProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: number) => void;
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#a0aec0',
  textTransform: 'uppercase',
  fontSize: '12px',
  borderBottom: '2px solid rgb(var(--card-border-rgb))',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '1px solid rgb(var(--card-border-rgb))',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '12px',
  marginRight: '5px'
};

export default function HolidayList({ holidays, onEdit, onDelete }: HolidayListProps) {
  const formatType = (type: Holiday['type']) => {
    switch(type) {
      case 'national': return 'Nacional';
      case 'state': return 'Estadual';
      case 'city': return 'Municipal';
      default: return type;
    }
  }

  return (
    <div style={{ overflowX: 'auto', backgroundColor: `rgb(var(--card-background-rgb))`, borderRadius: '8px', border: `1px solid rgb(var(--card-border-rgb))` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Nome</th>
            <th style={tableHeaderStyle}>Data</th>
            <th style={tableHeaderStyle}>Tipo</th>
            <th style={{...tableHeaderStyle, textAlign: 'right'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td style={tableCellStyle}>{holiday.name}</td>
              <td style={tableCellStyle}>{new Date(holiday.date.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</td>
              <td style={tableCellStyle}>{formatType(holiday.type)}</td>
              <td style={{...tableCellStyle, textAlign: 'right'}}>
                <button onClick={() => onEdit(holiday)} style={actionButtonStyle}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}