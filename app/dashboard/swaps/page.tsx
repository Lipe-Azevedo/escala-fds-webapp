'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Swap, User, FilterConfig } from '@/types';
import SwapList from '@/components/swap/SwapList';
import ApproveSwapModal from '@/components/swap/ApproveSwapModal';
import FilterBar from '@/components/common/FilterBar';
import { useNotifications } from '@/context/NotificationContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import cardStyles from '@/components/common/Card.module.css';
import PlusCircleIcon from '@/components/icons/PlusCircleIcon';
import PageHeader from '@/components/common/PageHeader';

const generateFilterConfigs = (allUsers: User[], currentUser: User | null): FilterConfig[] => {
    const isManager = currentUser?.userType === 'master' || (currentUser?.position && currentUser.position.includes('Supervisor'));
    const userOptions = [ { value: '', label: 'Todos' }, ...allUsers.map(u => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName}`})) ];
    return [
        { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'pending', label: 'Pendentes' }, { value: 'approved', label: 'Aprovadas' }, { value: 'rejected', label: 'Rejeitadas' }, { value: 'pending_confirmation', label: 'Aguardando Confirmação'}] },
        { name: 'requesterId', label: 'Solicitante', type: 'select', options: userOptions, disabled: !isManager },
        { name: 'startDate', label: 'Data Início', type: 'date' },
        { name: 'endDate', label: 'Data Fim', type: 'date' },
        {
            name: 'sortBy',
            label: 'Ordenar por',
            type: 'select',
            options: [
                { value: 'createdAt:desc', label: 'Mais Recentes' },
                { value: 'createdAt:asc', label: 'Mais Antigos' },
                { value: 'originalDate:asc', label: 'Data do Evento (Crescente)' },
                { value: 'originalDate:desc', label: 'Data do Evento (Decrescente)' },
            ]
        }
    ];
};

export default function SwapsPage() {
    const [swaps, setSwaps] = useState<Swap[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
    const [filters, setFilters] = useState({ status: '', requesterId: '', startDate: '', endDate: '', sortBy: 'createdAt:desc' });
    const { getUnreadIdsForCategory, markCategoryAsSeen, isLoading: isNotificationsLoading } = useNotifications();
    const [pageUnreadIds, setPageUnreadIds] = useState(new Set<number>());
    const searchParams = useSearchParams();
    const notificationsProcessed = useRef(false);
    const [filterConfigs, setFilterConfigs] = useState<FilterConfig[]>([]);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            setUser(JSON.parse(userDataString));
        } else {
            setIsLoading(false);
            setError('Utilizador não autenticado.');
        }
    }, []);

    useEffect(() => {
        if (!isNotificationsLoading && !notificationsProcessed.current) {
            const unreadIds = getUnreadIdsForCategory('swaps');
            setPageUnreadIds(unreadIds);
            markCategoryAsSeen('swaps');
            notificationsProcessed.current = true;
        }
    }, [isNotificationsLoading, getUnreadIdsForCategory, markCategoryAsSeen]);

    useEffect(() => {
        const statusFromUrl = searchParams.get('status');
        if (statusFromUrl) {
            setFilters(prev => ({ ...prev, status: statusFromUrl }));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            if (user && (user.userType === 'master' || (user.position && user.position.includes('Supervisor')))) {
                const token = Cookies.get('authToken');
                const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                try {
                    const usersRes = await fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
                    if (usersRes.ok) {
                        const usersData = await usersRes.json();
                        setAllUsers(usersData || []);
                    }
                } catch {
                   console.error("Failed to fetch users for filter");
                }
            }
        };
        fetchAllUsers();
    }, [user]);

    useEffect(() => {
        const configs = generateFilterConfigs(allUsers, user);
        setFilterConfigs(configs);
    }, [allUsers, user]);

    const fetchSwaps = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => { if(value) params.append(key, value); });

            const isManager = user.userType === 'master' || (user.position && user.position.includes('Supervisor'));
            let swapsUrl = '';

            if (isManager) {
                swapsUrl = `${apiURL}/api/swaps?${params.toString()}`;
            } else {
                swapsUrl = `${apiURL}/api/swaps/user/${user.id}?${params.toString()}`;
            }
            
            const swapsRes = await fetch(swapsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
            
            if (!swapsRes.ok) throw new Error('Falha ao ir buscar as trocas de folga.');
            const swapsData = await swapsRes.json();
            setSwaps(swapsData || []);

        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }, [filters, user]);


    useEffect(() => {
        fetchSwaps();
    }, [fetchSwaps]);

    const handleApproveClick = (swap: Swap) => { setSelectedSwap(swap); setApproveModalOpen(true); };
    const handleConfirmApproval = (swapId: number, involvedCollaboratorId: number | null) => { updateSwapStatus(swapId, 'approved', involvedCollaboratorId); setApproveModalOpen(false); };
    const handleReject = async (swapId: number) => { await updateSwapStatus(swapId, 'rejected', null); };
    
    const updateSwapStatus = async (swapId: number, status: 'approved' | 'rejected', involvedId: number | null) => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const res = await fetch(`${apiURL}/api/swaps/${swapId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status, involvedCollaboratorId: involvedId })
            });
            if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || 'Falha ao atualizar o status da troca.'); }
            fetchSwaps();
        } catch (err: unknown) { setError((err as Error).message); }
    };

    const handleConfirmSwap = async (swapId: number) => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            await fetch(`${apiURL}/api/swaps/${swapId}/confirm`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
            fetchSwaps();
        } catch (err: unknown) { setError((err as Error).message); }
    };

    const handleDeclineSwap = async (swapId: number) => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            await fetch(`${apiURL}/api/swaps/${swapId}/decline`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
            fetchSwaps();
        } catch (err: unknown) { setError((err as Error).message); }
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    if (isLoading) return null;
    if (!user) return <p>{error || 'Utilizador não encontrado.'}</p>;

    const canCreateSwap = user.userType === 'collaborator' || (user.position && user.position.includes('Supervisor')) || user.userType === 'master';

    return (
        <div>
            <PageHeader title="Trocas" onFilterToggle={toggleFilterVisibility}>
                {canCreateSwap && (
                    <Link href="/dashboard/swaps/new" style={{ textDecoration: 'none' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PlusCircleIcon size={20} />
                            Solicitar Troca
                        </button>
                    </Link> 
                )}
            </PageHeader>
            <FilterBar 
                configs={filterConfigs} 
                filters={filters} 
                onFilterChange={handleFilterChange}
                isVisible={isFilterVisible}
            />
            {error ? <p style={{ color: '#f87171' }}>{error}</p> : (
                <div className={cardStyles.card}>
                    <SwapList swaps={swaps} currentUser={user} unreadIds={pageUnreadIds} onApproveClick={handleApproveClick} onReject={handleReject} onConfirm={handleConfirmSwap} onDecline={handleDeclineSwap} />
                </div>
            )}
            {isApproveModalOpen && selectedSwap && ( <ApproveSwapModal isOpen={isApproveModalOpen} onClose={() => setApproveModalOpen(false)} onConfirm={handleConfirmApproval} swap={selectedSwap} /> )}
        </div>
    );
}