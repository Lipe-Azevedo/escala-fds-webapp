'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User, Holiday, Swap, Certificate } from '@/types';
import { addDays, format, parseISO } from 'date-fns';
import { getDayStatus } from '@/lib/calendarUtils';
import CustomDatePicker from '@/components/common/CustomDatePicker/CustomDatePicker';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShiftSelector from '@/components/swap/ShiftSelector';

export default function NewSwapPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    originalDate: '',
    newDate: '',
    newShift: '' as User['shift'],
    reason: '',
  });
  
  const [availableDaysOff, setAvailableDaysOff] = useState<Set<string>>(new Set());
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

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
      } catch(e) {
        setError('Erro ao carregar sua escala de folgas.');
      } finally {
        setIsLoadingSchedule(false);
      }
    };

    fetchAndProcessSchedule();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.originalDate || !formData.newDate || !formData.newShift) {
        setError("Por favor, preencha todos os campos.");
        return;
    }
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
      
      router.push('/dashboard/swaps');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
        <div style={{ marginBottom: '20px' }}>
            <Link href="/dashboard/swaps" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
            &larr; Voltar para Trocas
            </Link>
        </div>

        <div style={{ padding: '25px', background: 'rgb(var(--card-background-rgb))', borderRadius: '8px', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{textAlign: 'center', marginBottom: '30px'}}>Solicitar Troca de Folga</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div>
                    <label>1. Selecione o dia da sua folga:</label>
                    {isLoadingSchedule ? <p>Carregando escala...</p> : (
                    <CustomDatePicker
                        selectedDate={formData.originalDate ? parseISO(formData.originalDate) : null}
                        onDateSelect={(date) => setFormData({...formData, originalDate: format(date, 'yyyy-MM-dd')})}
                        isDaySelectable={(date) => availableDaysOff.has(format(date, 'yyyy-MM-dd'))}
                    />
                    )}
                </div>
                <div>
                    <label>2. Escolha o novo dia de trabalho:</label>
                    {isLoadingSchedule ? <p>Carregando escala...</p> : (
                        <CustomDatePicker
                            selectedDate={formData.newDate ? parseISO(formData.newDate) : null}
                            onDateSelect={(date) => setFormData({...formData, newDate: format(date, 'yyyy-MM-dd')})}
                            isDaySelectable={(date) => !availableDaysOff.has(format(date, 'yyyy-MM-dd'))}
                        />
                    )}
                </div>
            </div>

            <div>
                <label>3. Escolha o turno em que você irá trabalhar:</label>
                <ShiftSelector 
                    selectedShift={formData.newShift}
                    onSelectShift={(shift) => setFormData({...formData, newShift: shift})}
                />
            </div>
            
            <div>
                <label htmlFor="reason">4. Motivo da solicitação:</label>
                <textarea id="reason" name="reason" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required rows={3}></textarea>
            </div>

            {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Link href="/dashboard/swaps"><button type="button" style={{backgroundColor: '#4a5568'}}>Cancelar</button></Link>
                <button type="submit" disabled={isLoading || isLoadingSchedule}>{isLoading ? 'Enviando...' : 'Enviar Solicitação'}</button>
            </div>
            </form>
        </div>
    </div>
  );
}