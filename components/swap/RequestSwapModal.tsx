'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Holiday, Swap, Certificate } from '@/types';
import { addDays, format } from 'date-fns';
import { getDayStatus } from '@/lib/calendarUtils';
import { ptBR } from 'date-fns/locale';

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: User;
}

export default function RequestSwapModal({ isOpen, onClose, onSuccess, currentUser }: RequestSwapModalProps) {
  const [formData, setFormData] = useState({
    originalDate: '',
    newDate: '',
    originalShift: '',
    newShift: '',
    reason: '',
  });
  
  const [availableDaysOff, setAvailableDaysOff] = useState<{label: string, value: string}[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAndProcessSchedule = async () => {
      setIsLoadingSchedule(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      try {
        const [holidaysRes, swapsRes, certsRes] = await Promise.all([
          fetch(`${apiURL}/api/holidays`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/swaps/user/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${apiURL}/api/certificates/user/${currentUser.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const holidays: Holiday[] = await holidaysRes.json();
        const swaps: Swap[] = await swapsRes.json();
        const certificates: Certificate[] = await certsRes.json();

        const upcomingDaysOff: {label: string, value: string}[] = [];
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const day = addDays(today, i);
          const dayStatus = getDayStatus(day, currentUser, holidays, swaps.filter(s => s.status === 'approved'), certificates.filter(c => c.status === 'approved'));
          
          if(dayStatus.isDayOff) {
            upcomingDaysOff.push({
              value: format(day, 'yyyy-MM-dd'),
              label: format(day, "dd/MM/yyyy (EEEE)", { locale: ptBR })
            });
          }
        }
        setAvailableDaysOff(upcomingDaysOff);
        if (upcomingDaysOff.length > 0) {
            setFormData(prev => ({...prev, originalDate: upcomingDaysOff[0].value}));
        }

      } catch(e) {
        setError('Erro ao carregar sua escala de folgas.');
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchAndProcessSchedule();
  }, [isOpen, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const payload = {
        ...formData,
        originalShift: "Folga", // O dia original é sempre uma folga
    };

    try {
      const res = await fetch(`${apiURL}/api/swaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao criar solicitação.'); }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle: React.CSSProperties = {
    background: 'rgb(var(--card-background-rgb))', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px',
    color: 'rgb(var(--foreground-rgb))', border: '1px solid rgb(var(--card-border-rgb))'
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Solicitar Troca de Folga</h2>
        <form onSubmit={handleSubmit}>
          
          <label htmlFor="originalDate">Dia da minha Folga:</label>
          <select id="originalDate" name="originalDate" value={formData.originalDate} onChange={handleChange} required disabled={isLoadingSchedule}>
            {isLoadingSchedule ? <option>Carregando folgas...</option> : 
             availableDaysOff.length > 0 ? 
             availableDaysOff.map(d => <option key={d.value} value={d.value}>{d.label}</option>) :
             <option>Nenhuma folga encontrada nos próximos 90 dias.</option>
            }
          </select>

          <label htmlFor="newDate">Quero trabalhar no dia:</label>
          <input type="date" id="newDate" name="newDate" value={formData.newDate} onChange={handleChange} required />

          <label htmlFor="newShift">Para trabalhar no turno:</label>
          <select id="newShift" name="newShift" value={formData.newShift} onChange={handleChange} required>
            <option value="">Selecione...</option>
            <option value="06:00-14:00">Manhã (06:00-14:00)</option>
            <option value="14:00-22:00">Tarde (14:00-22:00)</option>
            <option value="22:00-06:00">Noite (22:00-06:00)</option>
          </select>
          
          <label htmlFor="reason">Motivo:</label>
          <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required rows={3}></textarea>

          {error && <p style={{ color: '#f87171' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{backgroundColor: '#4a5568'}}>Cancelar</button>
            <button type="submit" disabled={isLoading || isLoadingSchedule}>{isLoading ? 'Enviando...' : 'Enviar Solicitação'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}