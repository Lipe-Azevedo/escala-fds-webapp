'use client';

import { Holiday } from '../types';

interface HolidayListProps {
  holidays: Holiday[];
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: number) => void;
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#374151',
  textTransform: 'uppercase',
  borderBottom: '2px solid #e5e7eb',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '1px solid #e5e7eb',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '5px 10px',
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
    <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <th style={tableHeaderStyle}>Nome</th>
            <th style={tableHeaderStyle}>Data</th>
            <th style={tableHeaderStyle}>Tipo</th>
            <th style={tableHeaderStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td style={tableCellStyle}>{holiday.name}</td>
              <td style={tableCellStyle}>{new Date(holiday.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
              <td style={tableCellStyle}>{formatType(holiday.type)}</td>
              <td style={tableCellStyle}>
                <button onClick={() => onEdit(holiday)} style={actionButtonStyle}>Editar</button>
                <button onClick={() => onDelete(holiday.id)} style={{...actionButtonStyle, backgroundColor: '#dc2626'}}>Apagar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}