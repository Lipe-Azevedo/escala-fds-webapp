'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, FilterConfig } from '@/types';
import UserList from '@/components/user/UserList';
import CreateUserModal from '@/components/user/CreateUserModal';
import EditUserModal from '@/components/user/EditUserModal';
import FilterBar from '@/components/common/FilterBar';

const userFilterConfigs: FilterConfig[] = [
  { name: 'team', label: 'Equipe', type: 'select', options: [
      { value: '', label: 'Todas as Equipes' }, { value: 'Security', label: 'Segurança' }, { value: 'Support', label: 'Suporte' }, { value: 'CustomerService', label: 'Atendimento' },
  ]},
  { name: 'shift', label: 'Turno', type: 'select', options: [
      { value: '', label: 'Todos os Turnos' }, { value: '06:00-14:00', label: 'Manhã (06:00-14:00)' }, { value: '14:00-22:00', label: 'Tarde (14:00-22:00)' }, { value: '22:00-06:00', label: 'Noite (22:00-06:00)' },
  ]}
];

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({ team: '', shift: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao buscar usuários.');
      const data: User[] = await res.json();
      setAllUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let newFilteredData = allUsers;
    if (filters.team) { newFilteredData = newFilteredData.filter(user => user.team === filters.team); }
    if (filters.shift) { newFilteredData = newFilteredData.filter(user => user.shift === filters.shift); }
    setFilteredUsers(newFilteredData);
  }, [filters, allUsers]);

  const handleEdit = (user: User) => { setSelectedUser(user); setEditModalOpen(true); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Colaboradores</h1>
        <button onClick={() => setCreateModalOpen(true)}>+ Novo Colaborador</button>
      </div>
      <FilterBar configs={userFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />
      {isLoading ? <p>Carregando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : <UserList users={filteredUsers} onEdit={handleEdit} />}
      {isCreateModalOpen && (<CreateUserModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onUserCreated={fetchUsers} />)}
      {isEditModalOpen && selectedUser && (<EditUserModal isOpen={isEditModalOpen} onClose={() => { setEditModalOpen(false); setSelectedUser(null); }} onUserUpdated={fetchUsers} user={selectedUser} />)}
    </div>
  );
}