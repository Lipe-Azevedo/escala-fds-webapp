'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import DateRangePicker from '@/components/certificate/DateRangePicker'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import cardStyles from '@/components/common/Card.module.css';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export default function NewCertificatePage() {
  const [selectedRange, setSelectedRange] = useState<DateRange>({ start: null, end: null });
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRange.start || !selectedRange.end) {
        setError("Por favor, selecione uma data de início e fim no calendário.");
        return;
    }
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const payload = {
        startDate: format(selectedRange.start, 'yyyy-MM-dd'),
        endDate: format(selectedRange.end, 'yyyy-MM-dd'),
        reason: reason,
    };

    try {
      const res = await fetch(`${apiURL}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao enviar atestado.'); }
      
      router.push('/dashboard/certificates');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div>
        <div style={{ marginBottom: '20px' }}>
            <Link href="/dashboard/certificates" style={{ textDecoration: 'none', color: 'var(--primary-color)' }}>
            &larr; Voltar para Atestados
            </Link>
        </div>

        <div className={cardStyles.card} style={{ maxWidth: '500px', margin: 'auto' }}>
            <h1 style={{textAlign: 'center', marginBottom: '30px'}}>Enviar Atestado Médico</h1>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            <div>
                <label>1. Selecione o período do atestado no calendário:</label>
                <DateRangePicker
                    selectedRange={selectedRange}
                    onRangeSelect={setSelectedRange}
                />
            </div>
            
            <div>
                <label htmlFor="reason">2. Motivo (CID, se aplicável):</label>
                <textarea id="reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} required rows={3}></textarea>
            </div>

            {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Link href="/dashboard/certificates"><button type="button" style={{backgroundColor: '#4a5568'}}>Cancelar</button></Link>
                <button type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar Atestado'}</button>
            </div>
            </form>
        </div>
    </div>
  );
}