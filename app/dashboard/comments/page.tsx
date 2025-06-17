'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Comment, User } from '@/types';
import CommentList from '@/components/CommentList';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    collaboratorId: '',
    authorId: '',
    startDate: '',
    endDate: '',
    team: '',
    shift: '',
  });

  // Efeito para buscar o usuário logado e a lista de usuários (se for master)
  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const user = JSON.parse(userDataString);
      setCurrentUser(user);
      
      // Ajusta os filtros padrão com base no tipo de usuário
      if (user.userType === 'collaborator') {
        setFilters(prev => ({ ...prev, collaboratorId: user.id.toString() }));
      } else if (user.position.includes('Supervisor')) {
        setFilters(prev => ({ ...prev, authorId: user.id.toString() }));
      }
      
      // Apenas o master e superiores precisam da lista de usuários para os filtros
      if (user.userType === 'master' || user.position.includes('Supervisor')) {
        fetchUsers();
      }
    }
  }, []);

  // Efeito para buscar os comentários sempre que os filtros mudarem
  useEffect(() => {
    if (!currentUser) return;

    const fetchComments = async () => {
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

    fetchComments();
  }, [currentUser, filters]);

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

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const renderFilters = () => {
    if (!currentUser) return null;

    const isSuperior = currentUser.position.includes('Supervisor');
    const isMaster = currentUser.userType === 'master';

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
        {/* Filtros comuns a todos */}
        <div className="filter-group">
          <label>Data Início:</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        </div>
        <div className="filter-group">
          <label>Data Fim:</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        </div>

        {/* Filtro de Autor (para Colaborador e Master) */}
        {(isMaster || currentUser.userType === 'collaborator') && (
            <div className="filter-group">
                <label>Autor:</label>
                <select name="authorId" value={filters.authorId} onChange={handleFilterChange} disabled={isSuperior}>
                    <option value="">Todos</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
            </div>
        )}

        {/* Filtro de Destinatário (para Superior e Master) */}
        {(isMaster || isSuperior) && (
            <div className="filter-group">
                <label>Destinatário:</label>
                <select name="collaboratorId" value={filters.collaboratorId} onChange={handleFilterChange}>
                    <option value="">Todos</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
            </div>
        )}

        {/* Filtro de Turno (para Superior e Master) */}
        {(isMaster || isSuperior) && (
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
        
        {/* Filtro de Equipe (apenas Master) */}
        {isMaster && (
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
    );
  };

  return (
    <div>
      <h1>Consultar Comentários</h1>
      {renderFilters()}
      {isLoading ? <p>Carregando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : <CommentList comments={comments} />}
    </div>
  );
}