'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Comment, User } from '@/types';
import CommentList from '@/components/CommentList';
import CreateCommentModal from '@/components/CreateCommentModal'; // Importar o novo modal

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false); // Estado para o novo modal
  
  const [filters, setFilters] = useState({
    collaboratorId: '',
    authorId: '',
    startDate: '',
    endDate: '',
    team: '',
    shift: '',
  });

  const fetchUsers = async () => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data || []);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const fetchComments = async () => {
    if (!currentUser) return; // Garante que currentUser não é nulo

    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const params = new URLSearchParams();
    if (filters.collaboratorId) params.append('collaboratorId', filters.collaboratorId);
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.team) params.append('team', filters.team);
    if (filters.shift) params.append('shift', filters.shift);

    try {
      const res = await fetch(`${apiURL}/api/comments?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar comentários.');
      const data: Comment[] = await res.json();
      setComments(data || []);
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
      
      if (user.position.includes('Supervisor') || user.userType === 'master') {
        setFilters(prev => ({ ...prev, authorId: user.id.toString() }));
      } else {
        setFilters(prev => ({ ...prev, collaboratorId: user.id.toString() }));
      }
      
      if (user.userType === 'master' || user.position.includes('Supervisor')) {
        fetchUsers();
      }
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [currentUser, filters]);

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

      {/* Filtros ... */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        {/* ... (código dos filtros permanece o mesmo) ... */}
        <div className="filter-group">
          <label>Data Início:</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-group">
          <label>Data Fim:</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>
        {(currentUser?.userType === 'master' || currentUser?.userType === 'collaborator') && (
            <div className="filter-group">
                <label>Autor:</label>
                <select name="authorId" value={filters.authorId} onChange={handleFilterChange} disabled={currentUser?.position.includes('Supervisor')}>
                    <option value="">Todos</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
            </div>
        )}
        {(currentUser?.userType === 'master' || currentUser?.position.includes('Supervisor')) && (
            <div className="filter-group">
                <label>Destinatário:</label>
                <select name="collaboratorId" value={filters.collaboratorId} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
            </div>
        )}
        {(currentUser?.userType === 'master' || currentUser?.position.includes('Supervisor')) && (
            <div className="filter-group">
                <label>Turno:</label>
                <select name="shift" value={filters.shift} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    <option value="06:00-14:00">Manhã</option>
                    <option value="14:00-22:00">Tarde</option>
                    <option value="22:00-06:00">Noite</option>
                </select>
            </div>
        )}
        {currentUser?.userType === 'master' && (
             <div className="filter-group">
              <label>Equipe:</label>
              <select name="team" value={filters.team} onChange={handleFilterChange}>
                  <option value="">Todas</option>
                  <option value="Security">Segurança</option>
                  <option value="Support">Suporte</option>
                  <option value="CustomerService">Atendimento</option>
              </select>
            </div>
        )}
      </div>

      {isLoading ? <p>Carregando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : <CommentList comments={comments} />}

      {isCreateModalOpen && (
        <CreateCommentModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSuccess={fetchComments}
            users={users}
        />
      )}
    </div>
  );
}