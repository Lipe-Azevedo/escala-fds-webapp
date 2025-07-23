'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Swap, User, FilterConfig } from '@/types';
import SwapList from '@/components/swap/SwapList';
import RequestSwapModal from '@/components/swap/RequestSwapModal';
import ApproveSwapModal from '@/components/swap/ApproveSwapModal';
import FilterBar from '@/components/common/FilterBar';

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
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [filters, setFilters] = useState({ status: '' });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const triggerRefetch = () => setRefetchTrigger(c => c + 1);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchSwaps = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      let url = user.userType === 'master'
        ? `${apiURL}/api/swaps`
        : `${apiURL}/api/swaps/user/${user.id}`;
      
      try {
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Falha ao buscar trocas de folga.');
        const data: Swap[] = await res.json();
        setAllSwaps(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSwaps();
  }, [user, refetchTrigger]);

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
            <button onClick={() => setRequestModalOpen(true)}>+ Solicitar Troca</button>
        )}
      </div>
      
      <FilterBar configs={swapFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      <SwapList 
          swaps={filteredSwaps} 
          currentUser={user} 
          onApproveClick={handleApproveClick}
          onReject={handleReject}
          onConfirm={handleConfirmSwap}
          onDecline={handleDeclineSwap}
      />

      {isRequestModalOpen && (
        <RequestSwapModal 
          isOpen={isRequestModalOpen} 
          onClose={() => setRequestModalOpen(false)} 
          onSuccess={triggerRefetch} 
          currentUser={user} 
        />
      )}
      
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