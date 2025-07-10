'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

interface SubmitCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmitCertificateModal({ isOpen, onClose, onSuccess }: SubmitCertificateModalProps) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const res = await fetch(`${apiURL}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao enviar atestado.'); }

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
        <h2>Enviar Atestado Médico</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="startDate">Data de Início:</label>
          <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
          
          <label htmlFor="endDate">Data de Fim:</label>
          <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />

          <label htmlFor="reason">Motivo/CID:</label>
          <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} required rows={3}></textarea>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar Atestado'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}