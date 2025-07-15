'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';

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
    originalShift: currentUser.shift,
    newShift: '',
    reason: '',
  });

  const [swapType, setSwapType] = useState<'day' | 'shift'>('day');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, originalShift: currentUser.shift }));
  }, [currentUser.shift]);


  if (!isOpen) return null;

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
        newDate: swapType === 'shift' ? formData.originalDate : formData.newDate
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

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Solicitar Troca</h2>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '20px' }}>
            <label>O que você quer trocar?</label>
            <select value={swapType} onChange={(e) => setSwapType(e.target.value as 'day' | 'shift')}>
              <option value="day">Minha Folga por um Dia de Trabalho</option>
              <option value="shift">Apenas o Turno (no mesmo dia)</option>
            </select>
          </div>

          <label htmlFor="originalDate">
            {swapType === 'day' ? 'Dia da minha Folga:' : 'Dia do meu Turno:'}
          </label>
          <input type="date" id="originalDate" name="originalDate" value={formData.originalDate} onChange={handleChange} required />

          {swapType === 'day' && (
            <>
              <label htmlFor="newDate">Quero trabalhar no dia:</label>
              <input type="date" id="newDate" name="newDate" value={formData.newDate} onChange={handleChange} required={swapType === 'day'} />
            </>
          )}

          <label htmlFor="newShift">
            {swapType === 'day' ? 'Para trabalhar no turno:' : 'Quero trocar para o turno:'}
          </label>
          <select id="newShift" name="newShift" value={formData.newShift} onChange={handleChange} required>
            <option value="">Selecione...</option>
            <option value="06:00-14:00">Manhã (06:00-14:00)</option>
            <option value="14:00-22:00">Tarde (14:00-22:00)</option>
            <option value="22:00-06:00">Noite (22:00-06:00)</option>
          </select>
          
          <input type="hidden" name="originalShift" value={formData.originalShift} />

          <label htmlFor="reason">Motivo:</label>
          <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required rows={3}></textarea>

          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar Solicitação'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}