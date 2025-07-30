'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Holiday, Swap, Certificate } from '@/types';
import { addDays, format, parseISO } from 'date-fns';
import { getDayStatus } from '@/lib/calendarUtils';
import CustomDatePicker from '../common/CustomDatePicker/CustomDatePicker';

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
    newShift: '',
    reason: '',
  });
  
  const [availableDaysOff, setAvailableDaysOff] = useState<Set<string>>(new Set());
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

        const upcomingDaysOff = new Set<string>();
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const day = addDays(today, i);
          const dayStatus = getDayStatus(day, currentUser, holidays, swaps.filter(s => s.status === 'approved'), certificates.filter(c => c.status === 'approved'));
          if(dayStatus.isDayOff) {
            upcomingDaysOff.add(format(day, 'yyyy-MM-dd'));
          }
        }
        setAvailableDaysOff(upcomingDaysOff);
        const firstAvailable = upcomingDaysOff.values().next().value;
        if (firstAvailable) {
            setFormData(prev => ({...prev, originalDate: firstAvailable}));
        }

      } catch(e) {
        setError('Erro ao carregar escala de folgas.');
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchAndProcessSchedule();
  }, [isOpen, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const payload = {
        ...formData,
        originalShift: "Folga",
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
  
  const modalOverlayStyle: React.CSSProperties = { /* ... */ };
  const modalContentStyle: React.CSSProperties = { /* ... */ };
  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Solicitar Troca de Folga</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label>1. Selecione o dia da sua folga que você quer trocar:</label>
            {isLoadingSchedule ? <p>Carregando escala...</p> : (
              <CustomDatePicker
                selectedDate={formData.originalDate ? parseISO(formData.originalDate) : null}
                onDateSelect={(date) => setFormData({...formData, originalDate: format(date, 'yyyy-MM-dd')})}
                isDaySelectable={(date) => availableDaysOff.has(format(date, 'yyyy-MM-dd'))}
              />
            )}
          </div>

          <div>
            <label htmlFor="newDate">2. Escolha o novo dia em que você quer trabalhar:</label>
            <input type="date" id="newDate" name="newDate" value={formData.newDate} onChange={(e) => setFormData({...formData, newDate: e.target.value})} required />
          </div>

          <div>
            <label htmlFor="newShift">3. Escolha o turno em que você irá trabalhar:</label>
            <select id="newShift" name="newShift" value={formData.newShift} onChange={(e) => setFormData({...formData, newShift: e.target.value})} required>
              <option value="">Selecione...</option>
              <option value="06:00-14:00">Manhã (06:00-14:00)</option>
              <option value="14:00-22:00">Tarde (14:00-22:00)</option>
              <option value="22:00-06:00">Noite (22:00-06:00)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="reason">4. Motivo da solicitação:</label>
            <textarea id="reason" name="reason" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required rows={3}></textarea>
          </div>

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