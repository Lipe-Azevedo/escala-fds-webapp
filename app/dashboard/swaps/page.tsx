'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Swap, User, FilterConfig } from '@/types';
import SwapList from '@/components/swap/SwapList';
import RequestSwapModal from '@/components/swap/RequestSwapModal';
import FilterBar from '@/components/common/FilterBar';

const swapFilterConfigs: FilterConfig[] = [
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'Todos' },
      { value: 'pending', label: 'Pendentes' },
      { value: 'approved', label: 'Aprovadas' },
      { value: 'rejected', label: 'Rejeitadas' },
    ]
  }
];

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '' });

  const fetchSwaps = async (currentUser: User) => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    let url = `${apiURL}/api/swaps`;
    if (currentUser.userType !== 'master') {
      url = `${apiURL}/api/swaps/user/${currentUser.id}`;
    }

    if (filters.status) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}status=${filters.status}`;
    }

    try {
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao buscar trocas de folga.');
      
      const data: Swap[] = await res.json();
      setSwaps(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const currentUser = JSON.parse(userDataString);
      setUser(currentUser);
      fetchSwaps(currentUser);
    }
  }, [filters]);

  const handleApprove = async (swapId: number) => {
    updateSwapStatus(swapId, 'approved');
  };

  const handleReject = async (swapId: number) => {
    updateSwapStatus(swapId, 'rejected');
  };

  const updateSwapStatus = async (swapId: number, status: 'approved' | 'rejected') => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/swaps/${swapId}/status`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
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

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Trocas de Folga</h1>
        {user.userType === 'collaborator' && (
            <button onClick={() => setModalOpen(true)}>+ Solicitar Troca</button>
        )}
      </div>
      
      <FilterBar configs={swapFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && <p>Carregando solicitações...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <SwapList swaps={swaps} currentUser={user} onApprove={handleApprove} onReject={handleReject} />}

      {isModalOpen && user && (
        <RequestSwapModal 
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={() => { if(user) fetchSwaps(user); }}
            currentUser={user}
        />
      )}
    </div>
  );
}