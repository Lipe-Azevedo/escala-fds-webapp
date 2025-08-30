'use client';

import { useState } from 'react';
import { Swap, User } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import gridStyles from '../common/ListGrid.module.css';

interface SwapListProps {
  swaps: Swap[];
  currentUser: User;
  unreadIds: Set<number>;
  onApproveClick: (swap: Swap) => void;
  onReject: (swapId: number) => void;
  onConfirm: (swapId: number) => void;
  onDecline: (swapId: number) => void;
}

const ITEMS_PER_PAGE = 6;

export default function SwapList({ swaps, currentUser, unreadIds, onApproveClick, onReject, onConfirm, onDecline }: SwapListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    
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

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(prevCount => Math.max(ITEMS_PER_PAGE, prevCount - ITEMS_PER_PAGE));
  };

  return (
    <>
      <div className={gridStyles.grid}>
        {swaps.length === 0 && <p>Nenhuma solicitação encontrada.</p>}
        {swaps.slice(0, visibleCount).map((swap) => {
          const isManager = currentUser.userType === 'master' || currentUser.id === swap.requester.superiorId;
          const isAwaitingMyConfirmation = swap.status === 'pending_confirmation' && currentUser.id === swap.involvedCollaborator?.id;
          const hasNotification = unreadIds.has(swap.id);

          return (
            <div key={swap.id} style={{ position: 'relative', padding: '15px', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', backgroundColor: 'rgb(var(--card-background-rgb))' }}>
              {hasNotification && (
                <span style={{ position: 'absolute', top: '15px', right: '15px', height: '10px', width: '10px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
              )}
              <p><strong>Solicitante:</strong> {swap.requester.firstName} {swap.requester.lastName}</p>
              {swap.involvedCollaborator && <p><strong>Envolvido na Troca:</strong> {swap.involvedCollaborator.firstName} {swap.involvedCollaborator.lastName}</p>}
              <p><strong>Motivo:</strong> {swap.reason || 'Não informado'}</p>
              <p><strong>Dia Original:</strong> {formatDate(swap.originalDate)} (Turno: {swap.originalShift})</p>
              <p><strong>Novo Dia:</strong> {formatDate(swap.newDate)} (Turno: {swap.newShift})</p>
              <p><strong>Status:</strong> <span style={getStatusStyle(swap.status)}>{getStatusText(swap.status)}</span></p>
              
              {swap.status === 'pending' && isManager && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button onClick={() => onApproveClick(swap)} style={{backgroundColor: '#16a34a'}}>Aprovar</button>
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
      {swaps.length >= ITEMS_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', maxWidth: '300px', margin: '20px auto 0' }}>
          <button onClick={handleShowLess} disabled={visibleCount <= ITEMS_PER_PAGE} style={{ flex: 1 }}>
            Ver Menos
          </button>
          <button onClick={handleShowMore} disabled={visibleCount >= swaps.length} style={{ flex: 1 }}>
            Ver Mais
          </button>
        </div>
      )}
    </>
  );
}