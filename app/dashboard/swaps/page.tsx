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
      { value: '', label: 'Todos' }, { value: 'pending', label: 'Pendentes' }, { value: 'approved', label: 'Aprovadas' }, { value: 'rejected', label: 'Rejeitadas' },
  ]}
];

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [filters, setFilters] = useState({ status: '' });

  const fetchSwaps = async (currentUser: User) => { /* ... (sem alterações) ... */ };
  const fetchUsers = async () => { /* ... (adicionar esta função) ... */ };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      setUser(currentUser);
      fetchSwaps(currentUser);
      if(currentUser.userType === 'master') {
        fetchUsers();
      }
    }
  }, [filters]);

  const handleApproveClick = (swap: Swap) => {
    setSelectedSwap(swap);
    setApproveModalOpen(true);
  };

  const handleConfirmApproval = (swapId: number, involvedCollaboratorId: number | null) => {
    updateSwapStatus(swapId, 'approved', involvedCollaboratorId);
    setApproveModalOpen(false);
  };

  const handleReject = (swapId: number) => {
    updateSwapStatus(swapId, 'rejected', null);
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
        if(user) fetchSwaps(user);
    } catch (err: any) {
        setError(err.message);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!user) { return <div>Carregando...</div>; }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Trocas de Folga</h1>
        {user.userType === 'collaborator' && (
            <button onClick={() => setRequestModalOpen(true)}>+ Solicitar Troca</button>
        )}
      </div>
      
      <FilterBar configs={swapFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && <p>Carregando solicitações...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <SwapList swaps={swaps} currentUser={user} onApproveClick={handleApproveClick} onReject={handleReject} />}

      {isRequestModalOpen && user && (
        <RequestSwapModal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} onSuccess={() => { if(user) fetchSwaps(user); }} currentUser={user} />
      )}

      {isApproveModalOpen && selectedSwap && (
        <ApproveSwapModal isOpen={isApproveModalOpen} onClose={() => setApproveModalOpen(false)} onConfirm={handleConfirmApproval} swap={selectedSwap} users={allUsers} />
      )}
    </div>
  );
}