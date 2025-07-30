'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Swap, User, FilterConfig, Notification } from '@/types';
import SwapList from '@/components/swap/SwapList';
import ApproveSwapModal from '@/components/swap/ApproveSwapModal';
import FilterBar from '@/components/common/FilterBar';
import { useNotifications } from '@/context/NotificationContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const swapFilterConfigs: FilterConfig[] = [
  { name: 'status', label: 'Status', type: 'select', options: [
      { value: '', label: 'Todos' }, { value: 'pending', label: 'Pendentes' }, { value: 'approved', label: 'Aprovadas' }, { value: 'rejected', label: 'Rejeitadas' }, { value: 'pending_confirmation', label: 'Aguardando Confirmação'}
  ]}
];

export default function SwapsPage() {
  const [allSwaps, setAllSwaps] = useState<Swap[]>([]);
  const [filteredSwaps, setFilteredSwaps] = useState<Swap[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  
  const { getUnreadIdsForCategory, markCategoryAsSeen } = useNotifications();
  const unreadSwapIds = getUnreadIdsForCategory('swaps');
  const searchParams = useSearchParams();

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setFilters(prev => ({ ...prev, status: statusFromUrl }));
    }
    markCategoryAsSeen('swaps');
  }, [searchParams, markCategoryAsSeen]);

  const triggerRefetch = () => setRefetchTrigger(c => c + 1);

  useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      setError('');

      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        setIsLoading(false);
        setError('Usuário não autenticado.');
        return;
      }
      const currentUser: User = JSON.parse(userDataString);
      setUser(currentUser);
      
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      try {
        const isManager = currentUser.userType === 'master' || (currentUser.position && currentUser.position.includes('Supervisor'));
        
        let swapsUrl = isManager ? `${apiURL}/api/swaps` : `${apiURL}/api/swaps/user/${currentUser.id}`;
        
        const res = await fetch(swapsUrl, { headers: { 'Authorization': `Bearer ${token}` } });

        if (!res.ok) throw new Error('Falha ao buscar trocas de folga.');
        const swapsData = await res.json();
        setAllSwaps(swapsData || []);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPageData();
  }, [refetchTrigger]);

  useEffect(() => {
    let newFilteredData = allSwaps;
    if (filters.status) { newFilteredData = allSwaps.filter(swap => swap.status === filters.status); }
    setFilteredSwaps(newFilteredData);
  }, [filters, allSwaps]);

  const handleApproveClick = (swap: Swap) => {
    setSelectedSwap(swap);
    setApproveModalOpen(true);
  };

  const handleConfirmApproval = (swapId: number, involvedCollaboratorId: number | null) => {
    updateSwapStatus(swapId, 'approved', involvedCollaboratorId);
    setApproveModalOpen(false);
  };

  const handleReject = async (swapId: number) => {
    await updateSwapStatus(swapId, 'rejected', null);
  };

  const updateSwapStatus = async (swapId: number, status: 'approved' | 'rejected', involvedId: number | null) => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/swaps/${swapId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status, involvedCollaboratorId: involvedId })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Falha ao atualizar status da troca.');
        }
        triggerRefetch();
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleConfirmSwap = async (swapId: number) => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        await fetch(`${apiURL}/api/swaps/${swapId}/confirm`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
        triggerRefetch();
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleDeclineSwap = async (swapId: number) => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        await fetch(`${apiURL}/api/swaps/${swapId}/decline`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
        triggerRefetch();
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isLoading) return <p>Carregando solicitações...</p>;
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (!user) return <p>Usuário não encontrado. Por favor, faça login novamente.</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Trocas de Folga</h1>
        {user.userType === 'collaborator' && (
            <Link href="/dashboard/swaps/new">
                <button>+ Solicitar Troca</button>
            </Link>
        )}
      </div>
      
      <FilterBar configs={swapFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      <SwapList 
          swaps={filteredSwaps} 
          currentUser={user} 
          unreadIds={unreadSwapIds}
          onApproveClick={handleApproveClick}
          onReject={handleReject}
          onConfirm={handleConfirmSwap}
          onDecline={handleDeclineSwap}
      />
      
      {isApproveModalOpen && selectedSwap && (
        <ApproveSwapModal 
          isOpen={isApproveModalOpen} 
          onClose={() => setApproveModalOpen(false)} 
          onConfirm={handleConfirmApproval} 
          swap={selectedSwap} 
        />
      )}
    </div>
  );
}