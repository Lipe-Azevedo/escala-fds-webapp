'use client';

import Link from 'next/link';
import { User, TeamName, PositionName } from '@/types';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

const translate = (value: TeamName | PositionName | string | undefined): string => {
    if (!value) return 'N/A';
    const translations: Record<string, string> = {
        'Security': 'Segurança',
        'Support': 'Suporte',
        'CustomerService': 'Atendimento',
        'SupervisorI': 'Supervisor I',
        'SupervisorII': 'Supervisor II',
        'BackendDeveloper': 'Dev. Backend',
        'FrontendDeveloper': 'Dev. Frontend',
        'Attendant': 'Atendente',
        'Master': 'Master',
    };
    return translations[value] || value;
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: 'var(--text-secondary-color)',
  textTransform: 'uppercase',
  fontSize: '12px',
  borderBottom: '2px solid rgb(var(--card-border-rgb))',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px 15px',
  textAlign: 'left',
  borderBottom: '1px solid rgb(var(--card-border-rgb))',
  whiteSpace: 'nowrap',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '12px',
};

export default function UserList({ users, onEdit }: UserListProps) {
  return (
    <div style={{ overflowX: 'auto', backgroundColor: `rgb(var(--card-background-rgb))`, borderRadius: '8px', border: `1px solid rgb(var(--card-border-rgb))` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Nome</th>
            <th style={tableHeaderStyle}>Equipe</th>
            <th style={tableHeaderStyle}>Cargo</th>
            <th style={tableHeaderStyle}>Turno</th>
            <th style={{...tableHeaderStyle, textAlign: 'right'}}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={tableCellStyle}>{user.firstName} {user.lastName}</td>
              <td style={tableCellStyle}>{translate(user.team)}</td>
              <td style={tableCellStyle}>{translate(user.position)}</td>
              <td style={tableCellStyle}>{user.shift || 'N/A'}</td>
              <td style={{...tableCellStyle, textAlign: 'right'}}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <button style={{...actionButtonStyle, backgroundColor: '#4a5568'}}>Detalhes</button>
                  </Link>
                  <button onClick={() => onEdit(user)} style={actionButtonStyle}>Editar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}