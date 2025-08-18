'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Certificate, User, FilterConfig } from '@/types';
import CertificateList from '@/components/certificate/CertificateList';
import FilterBar from '@/components/common/FilterBar';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const certificateFilterConfigs: FilterConfig[] = [
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [
        { value: '', label: 'Todos os Status' },
        { value: 'pending', label: 'Pendentes' },
        { value: 'approved', label: 'Aprovados' },
        { value: 'rejected', label: 'Rejeitados' },
    ]},
    { name: 'startDate', label: 'Data Início', type: 'date' },
    { name: 'endDate', label: 'Data Fim', type: 'date' },
];

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setFilters(prev => ({ ...prev, status: statusFromUrl }));
    }
  }, [searchParams]);

  const fetchCertificates = useCallback(async () => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;
    const currentUser = JSON.parse(userDataString);

    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if(value) params.append(key, value);
    });

    let url = `${apiURL}/api/certificates?${params.toString()}`;

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
  }, [filters]);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setUser(JSON.parse(userDataString));
    }
  }, []);
  
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateCertificateStatus = async (certificateId: number, status: 'approved' | 'rejected') => {
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/certificates/${certificateId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Falha ao atualizar o status do atestado.');
        }
        fetchCertificates();
    } catch (err: any) {
        setError(err.message);
    }
  };

  if (!user) {
    return <div>A carregar...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Atestados Médicos</h1>
        {user.userType === 'collaborator' && (
            <Link href="/dashboard/certificates/new">
              <button>+ Enviar Atestado</button>
            </Link>
        )}
      </div>

      <FilterBar configs={certificateFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && <p>A carregar atestados...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <CertificateList certificates={certificates} currentUser={user} onApprove={updateCertificateStatus} onReject={updateCertificateStatus} />}
    </div>
  );
}