'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '../types';

interface CreateCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  users: User[]; // Lista de usuários para popular o dropdown
}

export default function CreateCommentModal({ isOpen, onClose, onSuccess, users }: CreateCommentModalProps) {
  const [formData, setFormData] = useState({
    collaboratorId: '',
    date: '',
    text: '',
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
      const res = await fetch(`${apiURL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            ...formData,
            collaboratorId: Number(formData.collaboratorId),
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
        <h2>Adicionar Novo Comentário</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="collaboratorId">Para o Colaborador:</label>
          <select id="collaboratorId" name="collaboratorId" value={formData.collaboratorId} onChange={handleChange} required>
            <option value="">Selecione um colaborador...</option>
            {users.filter(u => u.userType === 'collaborator').map(user => (
              <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
            ))}
          </select>

          <label htmlFor="date">Data:</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
          
          <label htmlFor="text">Comentário:</label>
          <textarea id="text" name="text" value={formData.text} onChange={handleChange} required rows={4}></textarea>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ backgroundColor: '#6b7280'}}>Cancelar</button>
            <button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar Comentário'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}