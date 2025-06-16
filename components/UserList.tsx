'use client';

import Link from 'next/link';
import { User } from '../types'; // Importando do local central

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
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

export default function UserList({ users, onEdit }: UserListProps) {
  return (
    <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f9fafb' }}>
          <tr>
            <th style={tableHeaderStyle}>Nome</th>
            <th style={tableHeaderStyle}>Equipe</th>
            <th style={tableHeaderStyle}>Cargo</th>
            <th style={tableHeaderStyle}>Turno</th>
            <th style={tableHeaderStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={tableCellStyle}>{user.firstName} {user.lastName}</td>
              <td style={tableCellStyle}>{user.team || 'N/A'}</td>
              <td style={tableCellStyle}>{user.position || 'N/A'}</td>
              <td style={tableCellStyle}>{user.shift || 'N/A'}</td>
              <td style={tableCellStyle}>
                <Link href={`/dashboard/users/${user.id}`}>
                  <button style={{...actionButtonStyle, backgroundColor: '#6b7280'}}>Detalhes</button>
                </Link>
                <button onClick={() => onEdit(user)} style={actionButtonStyle}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}