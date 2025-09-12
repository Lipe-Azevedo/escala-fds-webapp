'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Swap, User } from '@/types';

interface ApproveSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (swapId: number, involvedCollaboratorId: number | null) => void;
  swap: Swap;
}

export default function ApproveSwapModal({ isOpen, onClose, onConfirm, swap }: ApproveSwapModalProps) {
  const [involvedId, setInvolvedId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchAvailableUsers = async () => {
      setIsLoading(true);
      setError('');
      const token = Cookies.get('authToken');
      const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      try {
        const date = swap.originalDate.split('T')[0];
        const team = swap.requester.team;
        
        const queryParams = new URLSearchParams({ date, team });
        const res = await fetch(`${apiURL}/api/users/available?${queryParams}`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        if (!res.ok) {
          throw new Error('Falha ao buscar colaboradores disponíveis.');
        }
        
        const data: User[] = await res.json();
        setAvailableUsers(data.filter(u => u.id !== swap.requester.id));
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableUsers();
  }, [isOpen, swap]);

  const handleConfirm = () => {
    onConfirm(swap.id, involvedId ? Number(involvedId) : null);
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'rgb(var(--card-background-rgb))', padding: '25px', borderRadius: '8px', 
    width: '90%', maxWidth: '500px', color: 'rgb(var(--foreground-rgb))', 
    border: '1px solid rgb(var(--card-border-rgb))'
  };

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Aprovar Troca</h2>
        <p><strong>Solicitante:</strong> {swap.requester.firstName}</p>
        <p><strong>Dia Original:</strong> {new Date(swap.originalDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
        <p><strong>Novo Dia de Folga:</strong> {new Date(swap.newDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
        <p><strong>Turno:</strong> {swap.newShift}</p>
        
        <div style={{marginTop: '20px'}}>
          <label htmlFor="involvedCollaborator">Selecionar colaborador para cobrir o turno original:</label>
          <select 
            id="involvedCollaborator" 
            value={involvedId} 
            onChange={(e) => setInvolvedId(e.target.value)}
            disabled={isLoading}
          >
            {isLoading ? (
              <option>Carregando colaboradores...</option>
            ) : (
              <>
                <option value="">Ninguém (Apenas troca de dia)</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </>
            )}
          </select>
          {error && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px' }}>{error}</p>}
          {!isLoading && availableUsers.length === 0 && <p style={{fontSize: '12px', color: 'var(--text-secondary-color)', marginTop: '5px'}}>Nenhum colaborador encontrado para este dia/turno.</p>}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
          <button type="button" onClick={handleConfirm} style={{backgroundColor: '#16a34a'}} disabled={isLoading}>
            Confirmar Aprovação
          </button>
        </div>
      </div>
    </div>
  );
}