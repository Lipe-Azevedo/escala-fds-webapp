'use client';

import { Swap, User } from '@/types';
import { format } from 'date-fns';

interface SwapListProps {
  swaps: Swap[];
  currentUser: User;
  onApprove: (swapId: number) => void;
  onReject: (swapId: number) => void;
}

export default function SwapList({ swaps, currentUser, onApprove, onReject }: SwapListProps) {
    
  const getStatusStyle = (status: Swap['status']): React.CSSProperties => {
    switch (status) {
      case 'approved': return { color: '#10b981', fontWeight: 'bold' };
      case 'rejected': return { color: '#ef4444', fontWeight: 'bold' };
      case 'pending': return { color: '#f59e0b', fontWeight: 'bold' };
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
        const canApprove = currentUser.userType === 'master' || currentUser.id === swap.requester.superiorId;
        
        return (
          <div key={swap.id} style={{ padding: '15px', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', backgroundColor: 'rgb(var(--card-background-rgb))' }}>
            <p><strong>Solicitante:</strong> {swap.requester.firstName} {swap.requester.lastName}</p>
            <p><strong>Motivo:</strong> {swap.reason || 'Não informado'}</p>
            <p>
              <strong>Troca:</strong> Dia {formatDate(swap.originalDate)} (Turno: {swap.originalShift})
            </p>
            <p>
              <strong>Por:</strong> Dia {formatDate(swap.newDate)} (Turno: {swap.newShift})
            </p>
            <p><strong>Status:</strong> <span style={getStatusStyle(swap.status)}>{swap.status}</span></p>
            
            {swap.status === 'pending' && canApprove && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => onApprove(swap.id)} style={{backgroundColor: '#16a34a'}}>Aprovar</button>
                <button onClick={() => onReject(swap.id)} style={{backgroundColor: '#dc2626'}}>Rejeitar</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}