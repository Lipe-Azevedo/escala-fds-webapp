'use client';

import Link from 'next/link';
import { User, TeamName, PositionName } from '@/types';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

// Função para traduzir os valores do backend
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

export default function UserList({ users, onEdit }: UserListProps) {
  return (
    <div style={{ /*...*/ }}>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>Nome</th>
            <th style={{ width: '20%' }}>Equipe</th>
            <th style={{ width: '20%' }}>Cargo</th>
            <th style={{ width: '20%' }}>Turno</th>
            <th style={{ width: '15%' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{translate(user.team)}</td>
              <td>{translate(user.position)}</td>
              <td>{user.shift || 'N/A'}</td>
              <td>
                <Link href={`/dashboard/users/${user.id}`}>
                  <button>Detalhes</button>
                </Link>
                <button onClick={() => onEdit(user)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}