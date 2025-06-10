'use client';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  team: string;
  position: string;
  shift: string;
};

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#000000' }}>
            <th style={tableHeaderStyle}>Nome</th>
            <th style={tableHeaderStyle}>Equipe</th>
            <th style={tableHeaderStyle}>Cargo</th>
            <th style={tableHeaderStyle}>Turno</th>
            <th style={tableHeaderStyle}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tableCellStyle}>{user.firstName} {user.lastName}</td>
              <td style={tableCellStyle}>{user.team || 'N/A'}</td>
              <td style={tableCellStyle}>{user.position || 'N/A'}</td>
              <td style={tableCellStyle}>{user.shift || 'N/A'}</td>
              <td style={tableCellStyle}>
                <button style={{ marginRight: '5px' }}>Detalhes</button>
                <button>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Estilos para a tabela
const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
};