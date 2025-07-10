'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Comment, User, FilterConfig } from '@/types';
import CommentList from '@/components/comment/CommentList';
import CreateCommentModal from '@/components/comment/CreateCommentModal';
import FilterBar from '@/components/common/FilterBar';

const generateFilterConfigs = (user: User | null, allUsers: User[]): FilterConfig[] => {
  if (!user) return [];

  const isMaster = user.userType === 'master';
  const isSuperior = user.position.includes('Supervisor');
  
  const userOptions = [ { value: '', label: 'Todos' }, ...allUsers.map(u => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName}`})) ];

  return [
    { name: 'startDate', label: 'Data Início', type: 'date' },
    { name: 'endDate', label: 'Data Fim', type: 'date' },
    { name: 'collaboratorId', label: 'Destinatário', type: 'select', options: userOptions, disabled: !isMaster && !isSuperior },
    { name: 'authorId', label: 'Autor', type: 'select', options: userOptions, disabled: isSuperior },
    { name: 'team', label: 'Equipe', type: 'select', options: [
        { value: '', label: 'Todas' }, { value: 'Security', label: 'Segurança' }, { value: 'Support', label: 'Suporte' }, { value: 'CustomerService', label: 'Atendimento' },
      ], disabled: !isMaster 
    },
    { name: 'shift', label: 'Turno', type: 'select', options: [
        { value: '', label: 'Todos' }, { value: '06:00-14:00', label: 'Manhã' }, { value: '14:00-22:00', label: 'Tarde' }, { value: '22:00-06:00', label: 'Noite' },
      ], disabled: !isMaster && !isSuperior
    }
  ];
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({ collaboratorId: '', authorId: '', startDate: '', endDate: '', team: '', shift: '' });

  const fetchUsers = async () => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      setUsers(await res.json() || []);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const fetchComments = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if(value) params.append(key, value);
    });

    try {
      const res = await fetch(`${apiURL}/api/comments?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar comentários.');
      setComments(await res.json() || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const user = JSON.parse(userDataString);
      setCurrentUser(user);
      if (user.userType === 'master' || user.position.includes('Supervisor')) { fetchUsers(); }
    }
  }, []);

  useEffect(() => {
    const user = currentUser;
    if(user){
        const initialFilters: Partial<typeof filters> = {};
        if (user.userType === 'collaborator') { initialFilters.collaboratorId = user.id.toString(); }
        else if (user.position.includes('Supervisor')) { initialFilters.authorId = user.id.toString(); }
        setFilters(prev => ({...prev, ...initialFilters}));
    }
  }, [currentUser]);

  useEffect(() => { fetchComments(); }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const canAddComment = currentUser?.userType === 'master' || currentUser?.position.includes('Supervisor');
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Consultar Comentários</h1>
          {canAddComment && (
              <button onClick={() => setCreateModalOpen(true)}>+ Novo Comentário</button>
          )}
      </div>
      <FilterBar configs={generateFilterConfigs(currentUser, users)} filters={filters} onFilterChange={handleFilterChange} />
      {isLoading ? <p>Carregando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : <CommentList comments={comments} />}
      {isCreateModalOpen && (
        <CreateCommentModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchComments} users={users} />
      )}
    </div>
  );
}