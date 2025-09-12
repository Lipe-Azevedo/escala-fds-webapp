'use client';

import { useState } from 'react';
import { Swap, User } from '@/types';
import { format } from 'date-fns';
import styles from './SwapList.module.css'; 

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
  const [expandedId, setExpandedId] = useState<number | null>(null);
    
  const getStatusText = (status: Swap['status']) => {
    if (status === 'pending_confirmation') return 'Aguardando Confirmação';
    if (status === 'pending') return 'Pendente';
    if (status === 'approved') return 'Aprovada';
    if (status === 'rejected') return 'Rejeitada';
    return status;
  }

  const getStatusClass = (status: Swap['status']) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      case 'pending': return styles.pending;
      case 'pending_confirmation': return styles.pendingConfirmation;
      default: return '';
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

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <div className={styles.swapGrid}>
        {swaps.length === 0 && <p>Nenhuma solicitação encontrada.</p>}
        {swaps.slice(0, visibleCount).map((swap) => {
          const isManager = currentUser.userType === 'master' || currentUser.id === swap.requester.superiorId;
          const isAwaitingMyConfirmation = swap.status === 'pending_confirmation' && currentUser.id === swap.involvedCollaborator?.id;
          const hasNotification = unreadIds.has(swap.id);
          const isExpanded = expandedId === swap.id;
          const isShiftSwap = swap.originalDate === swap.newDate;

          return (
            <div key={swap.id} className={styles.swapCard}>
              {hasNotification && <span className={styles.notificationIndicator}></span>}
              
              <div className={styles.cardBody}>
                <div className={styles.swapDetails}>
                  {isShiftSwap ? (
                    <>
                      <div>
                        <span className={styles.detailLabel}>Dia</span>
                        <p>{formatDate(swap.originalDate)}</p>
                      </div>
                      <div>
                        <span className={styles.detailLabel}>Novo Turno</span>
                        <p>{swap.newShift}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className={styles.detailLabel}>Dia de Folga</span>
                        <p>{formatDate(swap.originalDate)}</p>
                      </div>
                      <div>
                        <span className={styles.detailLabel}>Novo Dia de Folga</span>
                        <p>{formatDate(swap.newDate)}</p>
                      </div>
                    </>
                  )}
                </div>
                {isExpanded && (
                  <div className={styles.expandedInfo}>
                    <p><strong>Solicitante:</strong> {swap.requester.firstName} {swap.requester.lastName}</p>
                    {swap.involvedCollaborator && <p><strong>Envolvido:</strong> {swap.involvedCollaborator.firstName} {swap.involvedCollaborator.lastName}</p>}
                    <p><strong>Turno Original:</strong> {swap.originalShift}</p>
                    <p><strong>Novo Turno:</strong> {swap.newShift}</p>
                    <p><strong>Motivo:</strong> {swap.reason || 'Não informado'}</p>
                    {swap.approvedBy && <p><strong>Aprovado por:</strong> {swap.approvedBy.firstName} {swap.approvedBy.lastName}</p>}
                    {swap.approvedAt && <p><strong>Aprovado em:</strong> {format(new Date(swap.approvedAt), 'dd/MM/yyyy - HH:mm')}</p>}
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <span className={`${styles.status} ${getStatusClass(swap.status)}`}>{getStatusText(swap.status)}</span>
                <div className={styles.footerActions}>
                    <button onClick={() => toggleExpand(swap.id)} className={styles.detailsButton}>
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                    {swap.status === 'pending' && isManager && (
                        <>
                            <button onClick={() => onApproveClick(swap)} className={`${styles.actionButton} ${styles.approveButton}`}>Aprovar</button>
                            <button onClick={() => onReject(swap.id)} className={`${styles.actionButton} ${styles.rejectButton}`}>Rejeitar</button>
                        </>
                    )}
                    {isAwaitingMyConfirmation && (
                        <>
                            <button onClick={() => onConfirm(swap.id)} className={`${styles.actionButton} ${styles.approveButton}`}>Confirmar</button>
                            <button onClick={() => onDecline(swap.id)} className={`${styles.actionButton} ${styles.rejectButton}`}>Recusar</button>
                        </>
                    )}
                </div>
              </div>
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