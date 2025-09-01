'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, FilterConfig } from '@/types';
import UserList from '@/components/user/UserList';
import FilterBar from '@/components/common/FilterBar';
import Link from 'next/link';
import UserPlusIcon from '@/components/icons/UserPlusIcon';

const userFilterConfigs: FilterConfig[] = [
    { 
      name: 'team', 
      label: 'Equipe', 
      type: 'select', 
      options: [
        { value: '', label: 'Todas as Equipes' },
        { value: 'Security', label: 'Segurança' },
        { value: 'Support', label: 'Suporte' },
        { value: 'CustomerService', label: 'Atendimento' },
    ]},
    { 
      name: 'shift', 
      label: 'Turno', 
      type: 'select', 
      options: [
        { value: '', label: 'Todos os Turnos' },
        { value: '06:00-14:00', label: 'Manhã' },
        { value: '14:00-22:00', label: 'Tarde' },
        { value: '22:00-06:00', label: 'Noite' },
    ]}
];

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [filters, setFilters] = useState({ team: '', shift: '' });

  const fetchUsers = async () => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiURL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao ir buscar os utilizadores.');
      
      const data: User[] = await res.json();
      if (Array.isArray(data)) {
        const collaborators = data.filter(u => u.userType !== 'master');
        setAllUsers(collaborators);
        setFilteredUsers(collaborators);
      } else {
        setAllUsers([]);
        setFilteredUsers([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let newFilteredData = [...allUsers];
    if (filters.team) {
        newFilteredData = newFilteredData.filter(u => u.team === filters.team);
    }
    if (filters.shift) {
        newFilteredData = newFilteredData.filter(u => u.shift === filters.shift);
    }
    setFilteredUsers(newFilteredData);
  }, [filters, allUsers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  }

  if (isLoading) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Gestão de Colaboradores</h1>
        <Link href="/dashboard/users/new">
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlusIcon size={20} />
              + Novo Colaborador
            </button>
        </Link>
      </div>

      <FilterBar configs={userFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && <UserList users={filteredUsers} onEdit={handleEdit} />}
    </div>
  );
}