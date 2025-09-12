'use client';

import Link from 'next/link';
import { User } from '@/types';
import { translate } from '@/lib/translations';
import tableStyles from '@/components/common/Table.module.css';
import EditIcon from '../icons/EditIcon';
import EyeIcon from '../icons/EyeIcon';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

export default function UserList({ users, onEdit }: UserListProps) {
  return (
    <div className={tableStyles.tableWrapper}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th className={tableStyles.header}>Nome</th>
            <th className={tableStyles.header}>Equipe</th>
            <th className={tableStyles.header}>Cargo</th>
            <th className={tableStyles.header}>Turno</th>
            <th className={`${tableStyles.header} ${tableStyles.actionsHeader}`}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={tableStyles.cell}>{user.firstName} {user.lastName}</td>
              <td className={tableStyles.cell}>{translate(user.team)}</td>
              <td className={tableStyles.cell}>{translate(user.position)}</td>
              <td className={tableStyles.cell}>{user.shift || 'N/A'}</td>
              <td className={`${tableStyles.cell} ${tableStyles.actionsCell}`}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <button className={tableStyles.actionButton} style={{ backgroundColor: '#4a5568'}} title="Detalhes">
                      <EyeIcon size={18} />
                    </button>
                  </Link>
                  <button onClick={() => onEdit(user)} className={tableStyles.actionButton} title="Editar">
                    <EditIcon size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}