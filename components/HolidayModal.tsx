'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Holiday } from '../types';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holiday: Holiday | null;
}

export default function HolidayModal({ isOpen, onClose, onSuccess, holiday }: HolidayModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'national' as Holiday['type'],
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = holiday !== null;

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: holiday.name,
        date: holiday.date,
        type: holiday.type,
      });
    }
  }, [holiday, isEditMode]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const url = isEditMode ? `${apiURL}/api/holidays/${holiday.id}` : `${apiURL}/api/holidays`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} feriado.`); }

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
        <h2>{isEditMode ? 'Editar Feriado' : 'Criar Novo Feriado'}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Nome do Feriado</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
          
          <label htmlFor="date">Data</label>
          <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />

          <label htmlFor="type">Tipo</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required>
              <option value="national">Nacional</option>
              <option value="state">Estadual</option>
              <option value="city">Municipal</option>
          </select>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}