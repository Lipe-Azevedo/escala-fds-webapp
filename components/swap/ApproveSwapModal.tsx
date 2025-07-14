'use client';

import { useState, useEffect } from 'react';
import { Swap, User } from '@/types';

interface ApproveSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (swapId: number, involvedCollaboratorId: number | null) => void;
  swap: Swap;
  users: User[];
}

export default function ApproveSwapModal({ isOpen, onClose, onConfirm, swap, users }: ApproveSwapModalProps) {
  const [involvedId, setInvolvedId] = useState<string>('');

  if (!isOpen) return null;

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

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2>Aprovar Troca</h2>
        <p><strong>Solicitante:</strong> {swap.requester.firstName}</p>
        <p><strong>Dia da Folga Original:</strong> {new Date(swap.originalDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
        <p><strong>Novo Dia de Trabalho:</strong> {new Date(swap.newDate.replace(/-/g, '/')).toLocaleDateString('pt-BR')}</p>
        <p><strong>Novo Turno:</strong> {swap.newShift}</p>
        
        <div style={{marginTop: '20px'}}>
          <label htmlFor="involvedCollaborator">Selecionar colaborador para cobrir o turno original:</label>
          <select 
            id="involvedCollaborator" 
            value={involvedId} 
            onChange={(e) => setInvolvedId(e.target.value)}
          >
            <option value="">Ninguém (Apenas troca de dia)</option>
            {users
              .filter(u => u.id !== swap.requester.id && u.userType === 'collaborator')
              .map(u => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" onClick={onClose} style={{ backgroundColor: '#4a5568'}}>Cancelar</button>
          <button type="button" onClick={handleConfirm} style={{backgroundColor: '#16a34a'}}>Confirmar Aprovação</button>
        </div>
      </div>
    </div>
  );
}