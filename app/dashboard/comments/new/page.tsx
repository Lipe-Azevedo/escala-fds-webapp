'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, TeamName } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import cardStyles from '@/components/common/Card.module.css';
import { format } from 'date-fns';

export default function NewCommentPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    collaboratorId: '',
    text: '',
    team: '' as TeamName,
  });
  const [availableCollaborators, setAvailableCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const user = JSON.parse(userDataString);
      setCurrentUser(user);
    }

    const fetchUsers = async () => {
      const token = Cookies.get('authToken');
      if (!token) return;

      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      try {
        const res = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          setAllUsers(await res.json() || []);
        } else {
          throw new Error("Falha ao buscar a lista de colaboradores.");
        }
      } catch (e: any) {
        setError(e.message);
        console.error("Failed to fetch users", e);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!currentUser || allUsers.length === 0) {
      setAvailableCollaborators([]);
      return;
    }

    if (currentUser.userType === 'master') {
      if (formData.team) {
        setAvailableCollaborators(allUsers.filter(u => u.userType === 'collaborator' && u.team === formData.team));
      } else {
        setAvailableCollaborators([]);
      }
    } else if (currentUser.position?.includes('Supervisor')) {
      setAvailableCollaborators(allUsers.filter(u => u.superiorId === currentUser.id));
    }
  }, [currentUser, allUsers, formData.team]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'team') {
      setFormData(prev => ({ ...prev, team: value as TeamName, collaboratorId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collaboratorId) {
      setError("Por favor, selecione um colaborador.");
      return;
    }
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiURL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          collaboratorId: Number(formData.collaboratorId),
          text: formData.text,
          date: format(new Date(), 'yyyy-MM-dd'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Falha ao criar comentário.');
      }
      router.push('/dashboard/comments');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
      <div className={cardStyles.card} style={{ maxWidth: '600px', margin: 'auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Criar Novo Comentário</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {currentUser?.userType === 'master' && (
            <div>
              <label htmlFor="team">Equipe</label>
              <select id="team" name="team" value={formData.team} onChange={handleChange} required>
                <option value="">Selecione uma equipe...</option>
                <option value="Security">Segurança</option>
                <option value="Support">Suporte</option>
                <option value="CustomerService">Atendimento</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="collaboratorId">Colaborador</label>
            <select 
              id="collaboratorId" 
              name="collaboratorId" 
              value={formData.collaboratorId} 
              onChange={handleChange} 
              required 
              disabled={(currentUser?.userType === 'master' && !formData.team) || availableCollaborators.length === 0}
            >
              <option value="">Selecione um colaborador...</option>
              {availableCollaborators.map(user => (
                <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="text">Comentário</label>
            <textarea id="text" name="text" value={formData.text} onChange={handleChange} required rows={4}></textarea>
          </div>

          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Link href="/dashboard/comments">
              <button type="button" style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
            </Link>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Comentário'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}