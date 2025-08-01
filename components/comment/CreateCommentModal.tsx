'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types';
import { format } from 'date-fns';

interface CreateCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[];
}

export default function CreateCommentModal({ isOpen, onClose, onSuccess, users }: CreateCommentModalProps) {
  const [formData, setFormData] = useState({
    collaboratorId: '',
    text: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
        setFormData({
            collaboratorId: '',
            text: '',
            date: format(new Date(), 'yyyy-MM-dd'),
        });
        setError('');
    }
  }, [isOpen]);

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
      const res = await fetch(`${apiURL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            ...formData,
            collaboratorId: Number(formData.collaboratorId)
        })
      });
      
      const data = await res.json();
      if (!res.ok) { throw new Error(data.message || 'Falha ao criar comentário.'); }

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
    background: 'rgb(var(--card-background-rgb))',
    padding: '25px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '600px',
    color: 'rgb(var(--foreground-rgb))',
    border: '1px solid rgb(var(--card-border-rgb))',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={{ textAlign: 'center', marginTop: 0, marginBottom: '25px' }}>Criar Novo Comentário</h2>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            <div>
                <label htmlFor="collaboratorId">Para o Colaborador:</label>
                <select id="collaboratorId" name="collaboratorId" value={formData.collaboratorId} onChange={handleChange} required>
                    <option value="">Selecione...</option>
                    {users.filter(u => u.userType === 'collaborator').map(user => (
                        <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                    ))}
                </select>
            </div>
            
            <div>
                <label htmlFor="date">Data do Comentário:</label>
                <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div>
                <label htmlFor="text">Comentário:</label>
                <textarea id="text" name="text" value={formData.text} onChange={handleChange} required rows={4}></textarea>
            </div>

          {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Comentário'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}