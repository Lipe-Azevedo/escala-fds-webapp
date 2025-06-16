'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import UserList from '../../../components/UserList';
import CreateUserModal from '../../../components/CreateUserModal';
import EditUserModal from '../../../components/EditUserModal';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'master' | 'collaborator';
  team: string;
  position: string;
  shift: string;
  weekdayOff: string;
  initialWeekendOff: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [teamFilter, setTeamFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      // Futuramente, a API suportará filtros via query params
      const res = await fetch(`${apiURL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar usuários.');
      
      const data: User[] = await res.json();
      
      const filteredData = data.filter(user => {
        const teamMatch = teamFilter ? user.team === teamFilter : true;
        const shiftMatch = shiftFilter ? user.shift === shiftFilter : true;
        return teamMatch && shiftMatch;
      });

      setUsers(filteredData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [teamFilter, shiftFilter]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Colaboradores</h1>
        <button onClick={() => setCreateModalOpen(true)}>+ Novo Colaborador</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">Filtrar por Equipe</option>
          <option value="Segurança">Segurança</option>
          <option value="Suporte">Suporte</option>
          <option value="Atendimento">Atendimento</option>
        </select>
        <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
          <option value="">Filtrar por Turno</option>
          <option value="06:00 às 14:00">Manhã (06:00-14:00)</option>
          <option value="14:00 às 22:00">Tarde (14:00-22:00)</option>
          <option value="22:00 às 06:00">Noite (22:00-06:00)</option>
        </select>
      </div>

      {isLoading && <p>Carregando lista de usuários...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <UserList users={users} onEdit={handleEdit} />}

      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onUserCreated={fetchUsers}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedUser(null); }}
          onUserUpdated={fetchUsers}
          user={selectedUser}
        />
      )}
    </div>
  );
}