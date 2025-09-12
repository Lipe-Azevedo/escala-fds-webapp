'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Comment, User, FilterConfig } from '@/types';
import CommentList from '@/components/comment/CommentList';
import FilterBar from '@/components/common/FilterBar';
import { useNotifications } from '@/context/NotificationContext';
import cardStyles from '@/components/common/Card.module.css';
import Link from 'next/link';
import MessageSquarePlusIcon from '@/components/icons/MessageSquarePlusIcon';
import PageHeader from '@/components/common/PageHeader';

const generateFilterConfigs = (user: User | null, allUsers: User[]): FilterConfig[] => {
  if (!user) return [];
  const isMaster = user.userType === 'master';
  const isSupervisor = user.position.includes('Supervisor');
  const canSeeSubordinates = isMaster || isSupervisor;
  const userOptions = [ { value: '', label: 'Todos' }, ...allUsers.map(u => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName}`})) ];
  const configs: FilterConfig[] = [
    { name: 'startDate', label: 'Data Início', type: 'date' },
    { name: 'endDate', label: 'Data Fim', type: 'date' },
  ];
  if (canSeeSubordinates) { configs.push({ name: 'collaboratorId', label: 'Destinatário', type: 'select', options: userOptions }); }
  configs.push(
    { name: 'authorId', label: 'Autor', type: 'select', options: userOptions, disabled: !isMaster },
    { name: 'team', label: 'Equipe', type: 'select', options: [{ value: '', label: 'Todas' }, { value: 'Security', label: 'Segurança' }, { value: 'Support', label: 'Suporte' }, { value: 'CustomerService', label: 'Atendimento' }], disabled: !isMaster },
    { name: 'shift', label: 'Turno', type: 'select', options: [{ value: '', label: 'Todos' }, { value: '06:00-14:00', label: 'Manhã' }, { value: '14:00-22:00', label: 'Tarde' }, { value: '22:00-06:00', label: 'Noite' }], disabled: !canSeeSubordinates },
    {
        name: 'sortBy',
        label: 'Ordenar por',
        type: 'select',
        options: [
            { value: 'createdAt:desc', label: 'Mais Recentes' },
            { value: 'createdAt:asc', label: 'Mais Antigos' },
            { value: 'date:asc', label: 'Data do Comentário (Crescente)' },
            { value: 'date:desc', label: 'Data do Comentário (Decrescente)' },
        ]
    }
  );
  return configs;
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ collaboratorId: '', authorId: '', startDate: '', endDate: '', team: '', shift: '', sortBy: 'createdAt:desc' });
  const { getUnreadIdsForCategory, markCategoryAsSeen, isLoading: isNotificationsLoading } = useNotifications();
  const [pageUnreadIds, setPageUnreadIds] = useState(new Set<number>());
  const notificationsProcessed = useRef(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (!isNotificationsLoading && !notificationsProcessed.current) {
        const unreadIds = getUnreadIdsForCategory('comments');
        setPageUnreadIds(unreadIds);
        markCategoryAsSeen('comments');
        notificationsProcessed.current = true;
    }
  }, [isNotificationsLoading, getUnreadIdsForCategory, markCategoryAsSeen]);

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

  const fetchComments = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const isManager = currentUser.userType === 'master' || (currentUser.position && currentUser.position.includes('Supervisor'));
      
      let finalComments: Comment[] = [];

      if (isManager) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value); });
        const res = await fetch(`${apiURL}/api/comments?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Falha ao buscar comentários.');
        finalComments = await res.json() || [];
      } else {
        const baseParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value && key !== 'collaboratorId' && key !== 'authorId') {
            baseParams.append(key, value);
          }
        });

        const receivedParams = new URLSearchParams(baseParams.toString());
        receivedParams.set('collaboratorId', currentUser.id.toString());
        
        const sentParams = new URLSearchParams(baseParams.toString());
        sentParams.set('authorId', currentUser.id.toString());

        const [receivedRes, sentRes] = await Promise.all([
          fetch(`${apiURL}/api/comments?${receivedParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/comments?${sentParams.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (!receivedRes.ok || !sentRes.ok) throw new Error('Falha ao buscar comentários.');

        const receivedComments: Comment[] = await receivedRes.json() || [];
        const sentComments: Comment[] = await sentRes.json() || [];

        const allComments = new Map<number, Comment>();
        receivedComments.forEach(comment => allComments.set(comment.id, comment));
        sentComments.forEach(comment => allComments.set(comment.id, comment));
        
        finalComments = Array.from(allComments.values());
      }

      const [sortField, sortOrder] = filters.sortBy.split(':');
      finalComments.sort((a, b) => {
        const valA = sortField === 'date' ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
        const valB = sortField === 'date' ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });

      setComments(finalComments);

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentUser]);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const user = JSON.parse(userDataString);
      setCurrentUser(user);
      if (user.userType === 'master' || user.position.includes('Supervisor')) { fetchUsers(); }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchComments();
    }
  }, [currentUser, fetchComments]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  
  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev);
  };
  
  const canAddComment = currentUser?.userType === 'master' || (currentUser?.position && currentUser.position.includes('Supervisor'));

  return (
    <div>
      <PageHeader title="Consultar Comentários" onFilterToggle={toggleFilterVisibility}>
          {canAddComment && (
            <Link href="/dashboard/comments/new" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquarePlusIcon size={20} />
                Novo Comentário
              </button>
            </Link>
          )}
      </PageHeader>
      <FilterBar 
        configs={generateFilterConfigs(currentUser, users)} 
        filters={filters} 
        onFilterChange={handleFilterChange}
        isVisible={isFilterVisible}
      />
      {isLoading ? <p>Carregando...</p> : error ? <p style={{color: 'red'}}>{error}</p> : (
        <div className={cardStyles.card}>
            <CommentList comments={comments} unreadIds={pageUnreadIds} />
        </div>
      )}
    </div>
  );
}