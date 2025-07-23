'use client';

import { Swap, User } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface SwapListProps {
  swaps: Swap[];
  currentUser: User;
  onApproveClick: (swap: Swap) => void;
  onReject: (swapId: number) => void;
  onConfirm: (swapId: number) => void;
  onDecline: (swapId: number) => void;
}

export default function SwapList({ swaps, currentUser, onApproveClick, onReject, onConfirm, onDecline }: SwapListProps) {
    
  const getStatusText = (status: Swap['status']) => {
    if (status === 'pending_confirmation') return 'Aguardando Confirmação';
    if (status === 'pending') return 'Pendente';
    if (status === 'approved') return 'Aprovada';
    if (status === 'rejected') return 'Rejeitada';
    return status;
  }

  const getStatusStyle = (status: Swap['status']): React.CSSProperties => {
    switch (status) {
      case 'approved': return { color: '#10b981', fontWeight: 'bold' };
      case 'rejected': return { color: '#ef4444', fontWeight: 'bold' };
      case 'pending': return { color: '#f59e0b', fontWeight: 'bold' };
      case 'pending_confirmation': return { color: '#3b82f6', fontWeight: 'bold' };
      default: return {};
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(/-/g, '/')), 'dd/MM/yyyy');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {swaps.length === 0 && <p>Nenhuma solicitação encontrada.</p>}
      {swaps.map((swap) => {
        const isManager = currentUser.userType === 'master' || currentUser.id === swap.requester.superiorId;
        const isAwaitingMyConfirmation = swap.status === 'pending_confirmation' && currentUser.id === swap.involvedCollaborator?.id;

        return (
          <div key={swap.id} style={{ padding: '15px', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', backgroundColor: 'rgb(var(--card-background-rgb))' }}>
            <p><strong>Solicitante:</strong> {swap.requester.firstName} {swap.requester.lastName}</p>
            {swap.involvedCollaborator && <p><strong>Envolvido na Troca:</strong> {swap.involvedCollaborator.firstName} {swap.involvedCollaborator.lastName}</p>}
            <p><strong>Motivo:</strong> {swap.reason || 'Não informado'}</p>
            <p><strong>Dia Original:</strong> {formatDate(swap.originalDate)} (Turno: {swap.originalShift})</p>
            <p><strong>Novo Dia:</strong> {formatDate(swap.newDate)} (Turno: {swap.newShift})</p>
            <p><strong>Status:</strong> <span style={getStatusStyle(swap.status)}>{getStatusText(swap.status)}</span></p>
            
            {swap.status === 'pending' && isManager && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => onApproveClick(swap)} style={{backgroundColor: '#16a3a4'}}>Aprovar</button>
                <button onClick={() => onReject(swap.id)} style={{backgroundColor: '#dc2626'}}>Rejeitar</button>
              </div>
            )}

            {isAwaitingMyConfirmation && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => onConfirm(swap.id)} style={{backgroundColor: '#16a34a'}}>Confirmar Participação</button>
                <button onClick={() => onDecline(swap.id)} style={{backgroundColor: '#dc2626'}}>Recusar</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}