'use client';

import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { Swap, User, FilterConfig } from '@/types';
import SwapList from '@/components/swap/SwapList';
import ApproveSwapModal from '@/components/swap/ApproveSwapModal';
import FilterBar from '@/components/common/FilterBar';
import { useNotifications } from '@/context/NotificationContext';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import cardStyles from '@/components/common/Card.module.css';

const generateFilterConfigs = (allUsers: User[], currentUser: User | null): FilterConfig[] => {
    const isManager = currentUser?.userType === 'master' || currentUser?.position.includes('Supervisor');
    const userOptions = [ { value: '', label: 'Todos' }, ...allUsers.map(u => ({ value: u.id.toString(), label: `${u.firstName} ${u.lastName}`})) ];
    return [
        { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'pending', label: 'Pendentes' }, { value: 'approved', label: 'Aprovadas' }, { value: 'rejected', label: 'Rejeitadas' }, { value: 'pending_confirmation', label: 'Aguardando Confirmação'}] },
        { name: 'requesterId', label: 'Solicitante', type: 'select', options: userOptions, disabled: !isManager },
        { name: 'startDate', label: 'Data Início', type: 'date' },
        { name: 'endDate', label: 'Data Fim', type: 'date' },
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
    const [filters, setFilters] = useState({ status: '', requesterId: '', startDate: '', endDate: '' });
    const { getUnreadIdsForCategory, markCategoryAsSeen, isLoading: isNotificationsLoading } = useNotifications();
    const [pageUnreadIds, setPageUnreadIds] = useState(new Set<number>());
    const searchParams = useSearchParams();
    const notificationsProcessed = useRef(false);

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

    const fetchPageData = async () => {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) { setIsLoading(false); setError('Utilizador não autenticado.'); return; }
        const currentUser: User = JSON.parse(userDataString);
        setUser(currentUser);
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            const isManager = currentUser.userType === 'master' || (currentUser.position && currentUser.position.includes('Supervisor'));
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => { if(value) params.append(key, value); });
            const swapsUrl = `${apiURL}/api/swaps?${params.toString()}`;
            const [swapsRes, usersRes] = await Promise.all([
                fetch(swapsUrl, { headers: { 'Authorization': `Bearer ${token}` } }),
                isManager ? fetch(`${apiURL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } }) : Promise.resolve(null)
            ]);
            if (!swapsRes.ok) throw new Error('Falha ao ir buscar as trocas de folga.');
            const swapsData = await swapsRes.json();
            setSwaps(swapsData || []);
            if (usersRes && usersRes.ok) {
                const usersData = await usersRes.json();
                setAllUsers(usersData || []);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

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
            fetchPageData();
        } catch (err: any) { setError(err.message); }
    };
    const handleConfirmSwap = async (swapId: number) => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            await fetch(`${apiURL}/api/swaps/${swapId}/confirm`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
            fetchPageData();
        } catch (err: any) { setError(err.message); }
    };
    const handleDeclineSwap = async (swapId: number) => {
        const token = Cookies.get('authToken');
        const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        try {
            await fetch(`${apiURL}/api/swaps/${swapId}/decline`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }});
            fetchPageData();
        } catch (err: any) { setError(err.message); }
    };
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    if (isLoading) return null;
    if (!user) return null;

    const canCreateSwap = user.userType === 'collaborator' || user.position.includes('Supervisor') || user.userType === 'master';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Trocas de Folga</h1>
                {canCreateSwap && ( <Link href="/dashboard/swaps/new"><button>+ Solicitar Troca</button></Link> )}
            </div>
            <FilterBar configs={generateFilterConfigs(allUsers, user)} filters={filters} onFilterChange={handleFilterChange} />
            {error ? <p style={{ color: '#f87171' }}>{error}</p> : (
                <div className={cardStyles.card}>
                    <SwapList swaps={swaps} currentUser={user} unreadIds={pageUnreadIds} onApproveClick={handleApproveClick} onReject={handleReject} onConfirm={handleConfirmSwap} onDecline={handleDeclineSwap} />
                </div>
            )}
            {isApproveModalOpen && selectedSwap && ( <ApproveSwapModal isOpen={isApproveModalOpen} onClose={() => setApproveModalOpen(false)} onConfirm={handleConfirmApproval} swap={selectedSwap} /> )}
        </div>
    );
}