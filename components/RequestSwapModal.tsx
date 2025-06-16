'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

interface RequestSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestSwapModal({ isOpen, onClose, onSuccess }: RequestSwapModalProps) {
  const [formData, setFormData] = useState({
    originalDate: '',
    newDate: '',
    originalShift: '',
    newShift: '',
    reason: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    
    try {
      const res = await fetch(`${apiURL}/api/swaps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle: React.CSSProperties = {
    background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px',
    color: 'black',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Solicitar Troca de Folga</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="originalDate">Meu dia de trabalho/folga:</label>
          <input type="date" id="originalDate" name="originalDate" value={formData.originalDate} onChange={handleChange} required />
          
          <label htmlFor="originalShift">Meu turno original:</label>
          <select id="originalShift" name="originalShift" value={formData.originalShift} onChange={handleChange} required>
            <option value="">Selecione...</option>
            <option value="06:00-14:00">Manhã (06:00-14:00)</option>
            <option value="14:00-22:00">Tarde (14:00-22:00)</option>
            <option value="22:00-06:00">Noite (22:00-06:00)</option>
          </select>

          <label htmlFor="newDate">Quero trabalhar/folgar no dia:</label>
          <input type="date" id="newDate" name="newDate" value={formData.newDate} onChange={handleChange} required />

          <label htmlFor="newShift">No turno:</label>
          <select id="newShift" name="newShift" value={formData.newShift} onChange={handleChange} required>
            <option value="">Selecione...</option>
            <option value="06:00-14:00">Manhã (06:00-14:00)</option>
            <option value="14:00-22:00">Tarde (14:00-22:00)</option>
            <option value="22:00-06:00">Noite (22:00-06:00)</option>
          </select>

          <label htmlFor="reason">Motivo:</label>
          <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required rows={3}></textarea>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar Solicitação'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}