'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';
import { Certificate, User, FilterConfig } from '@/types';
import CertificateList from '@/components/certificate/CertificateList';
import FilterBar from '@/components/common/FilterBar';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useNotifications } from '@/context/NotificationContext';
import cardStyles from '@/components/common/Card.module.css';
import PlusCircleIcon from '@/components/icons/PlusCircleIcon';
import PageHeader from '@/components/common/PageHeader';

const certificateFilterConfigs: FilterConfig[] = [
    { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'Todos os Status' }, { value: 'pending', label: 'Pendentes' }, { value: 'approved', label: 'Aprovados' }, { value: 'rejected', label: 'Rejeitados' }] },
    { name: 'startDate', label: 'Data Início', type: 'date' },
    { name: 'endDate', label: 'Data Fim', type: 'date' },
    { 
        name: 'sortBy', 
        label: 'Ordenar por', 
        type: 'select', 
        options: [
            { value: 'createdAt:desc', label: 'Mais Recentes' },
            { value: 'createdAt:asc', label: 'Mais Antigos' },
            { value: 'startDate:asc', label: 'Data de Início (Crescente)' },
            { value: 'startDate:desc', label: 'Data de Início (Decrescente)' },
        ]
    }
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '', sortBy: 'createdAt:desc' });
  const searchParams = useSearchParams();
  const { getUnreadIdsForCategory, markCategoryAsSeen, isLoading: isNotificationsLoading } = useNotifications();
  const [pageUnreadIds, setPageUnreadIds] = useState(new Set<number>());
  const notificationsProcessed = useRef(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (!isNotificationsLoading && !notificationsProcessed.current) {
        const unreadIds = getUnreadIdsForCategory('certificates');
        setPageUnreadIds(unreadIds);
        markCategoryAsSeen('certificates');
        notificationsProcessed.current = true;
    }
  }, [isNotificationsLoading, getUnreadIdsForCategory, markCategoryAsSeen]);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setFilters(prev => ({ ...prev, status: statusFromUrl }));
    }
  }, [searchParams]);

  const fetchCertificates = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if(value) params.append(key, value); });
    let url = user.userType === 'collaborator' ? `${apiURL}/api/certificates/user/${user.id}?${params.toString()}` : `${apiURL}/api/certificates?${params.toString()}`;
    try {
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Falha ao ir buscar os atestados.');
      const data: Certificate[] = await res.json();
      setCertificates(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) { setUser(JSON.parse(userDataString)); }
  }, []);

  useEffect(() => {
    if (user) { fetchCertificates(); }
  }, [user, fetchCertificates]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); };
  const updateCertificateStatus = async (certificateId: number, status: 'approved' | 'rejected') => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/certificates/${certificateId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.message || 'Falha ao atualizar o status do atestado.'); }
        fetchCertificates();
    } catch (err: any) { setError(err.message); }
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(prev => !prev);
  };

  if (!user) { return <p>Carregando...</p>; }

  return (
    <div>
        <PageHeader title="Atestados Médicos" onFilterToggle={toggleFilterVisibility}>
            {user.userType === 'collaborator' && ( 
            <Link href="/dashboard/certificates/new" style={{ textDecoration: 'none' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircleIcon size={20} />
                Enviar Atestado
                </button>
            </Link> 
            )}
        </PageHeader>
        <FilterBar 
            configs={certificateFilterConfigs} 
            filters={filters} 
            onFilterChange={handleFilterChange}
            isVisible={isFilterVisible}
        />
        {isLoading ? <p>Carregando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
            <div className={cardStyles.card}>
                <CertificateList certificates={certificates} currentUser={user} unreadIds={pageUnreadIds} onApprove={updateCertificateStatus} onReject={updateCertificateStatus} />
            </div>
        )}
    </div>
  );
}