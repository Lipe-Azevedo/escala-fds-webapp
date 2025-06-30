'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Holiday, FilterConfig } from '@/types';
import HolidayList from '@/components/HolidayList';
import HolidayModal from '@/components/HolidayModal';
import FilterBar from '@/components/FilterBar';
import { useRouter } from 'next/navigation';

const holidayFilterConfigs: FilterConfig[] = [
    { 
      name: 'type', 
      label: 'Tipo de Feriado', 
      type: 'select', 
      options: [
        { value: '', label: 'Todos os Tipos' },
        { value: 'national', label: 'Nacional' },
        { value: 'state', label: 'Estadual' },
        { value: 'city', label: 'Municipal' },
    ]}
];

export default function HolidaysPage() {
  const [allHolidays, setAllHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const router = useRouter();

  const [filters, setFilters] = useState({ type: '' });

  const fetchHolidays = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const res = await fetch(`${apiURL}/api/holidays`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) setError('Acesso negado.');
        else throw new Error('Falha ao buscar feriados.');
        return;
      }
      const data: Holiday[] = await res.json();
      setAllHolidays(data || []);
      setFilteredHolidays(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if(userDataString) {
        const user = JSON.parse(userDataString);
        if(user.userType !== 'master') router.push('/dashboard');
        else fetchHolidays();
    }
  }, [router]);

  useEffect(() => {
    let newFilteredData = allHolidays;
    if (filters.type) {
        newFilteredData = newFilteredData.filter(h => h.type === filters.type);
    }
    setFilteredHolidays(newFilteredData);
  }, [filters, allHolidays]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedHoliday(null);
    setModalOpen(true);
  };

  const handleDelete = async (holidayId: number) => {
    if(!window.confirm('Tem certeza que deseja apagar este feriado?')) return;
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/holidays/${holidayId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Falha ao apagar feriado.');
        fetchHolidays();
    } catch (err: any) {
        setError(err.message);
    }
  }

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedHoliday(null);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Gerenciamento de Feriados</h1>
        <button onClick={handleCreate}>+ Novo Feriado</button>
      </div>

      <FilterBar configs={holidayFilterConfigs} filters={filters} onFilterChange={handleFilterChange} />

      {isLoading && <p>Carregando feriados...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!isLoading && !error && <HolidayList holidays={filteredHolidays} onEdit={handleEdit} onDelete={handleDelete} />}

      {isModalOpen && (
        <HolidayModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={fetchHolidays}
          holiday={selectedHoliday}
        />
      )}
    </div>
  );
}