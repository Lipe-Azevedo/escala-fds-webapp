'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Swap, User } from '@/types';
import SwapList from '@/components/SwapList';
import RequestSwapModal from '@/components/RequestSwapModal';

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSwaps = async (currentUser: User) => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    let url = `${apiURL}/api/swaps`;
    if (currentUser.userType !== 'master') {
      url = `${apiURL}/api/swaps/user/${currentUser.id}`;
    }

    if (statusFilter) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}status=${statusFilter}`;
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
  }, [statusFilter]);

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
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setStatusFilter('')} disabled={statusFilter === ''}>Todas</button>
        <button onClick={() => setStatusFilter('pending')} disabled={statusFilter === 'pending'} style={{marginLeft: '10px'}}>Pendentes</button>
        <button onClick={() => setStatusFilter('approved')} disabled={statusFilter === 'approved'} style={{marginLeft: '10px'}}>Aprovadas</button>
        <button onClick={() => setStatusFilter('rejected')} disabled={statusFilter === 'rejected'} style={{marginLeft: '10px'}}>Rejeitadas</button>
      </div>

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