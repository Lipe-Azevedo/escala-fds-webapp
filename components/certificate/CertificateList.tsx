'use client';

import { Certificate, User } from '@/types';
import { format } from 'date-fns';

interface CertificateListProps {
  certificates: Certificate[];
  currentUser: User;
  unreadIds: Set<number>;
  onApprove: (certificateId: number, status: 'approved') => void;
  onReject: (certificateId: number, status: 'rejected') => void;
}

export default function CertificateList({ certificates, currentUser, unreadIds, onApprove, onReject }: CertificateListProps) {

  const getStatusStyle = (status: Certificate['status']): React.CSSProperties => {
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
      {certificates.length === 0 && <p>Nenhum atestado encontrado.</p>}
      {certificates.map((cert) => {
        const canApprove = currentUser.userType === 'master';
        const hasNotification = unreadIds.has(cert.id);

        return (
          <div key={cert.id} style={{ position: 'relative', padding: '15px', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', backgroundColor: 'rgb(var(--card-background-rgb))' }}>
            {hasNotification && (
              <span style={{ position: 'absolute', top: '15px', right: '15px', height: '10px', width: '10px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
            )}
            {currentUser.userType === 'master' && (
                <p><strong>Colaborador:</strong> {cert.collaborator.firstName} {cert.collaborator.lastName}</p>
            )}
            <p><strong>Período:</strong> {formatDate(cert.startDate)} até {formatDate(cert.endDate)}</p>
            <p><strong>Motivo:</strong> {cert.reason}</p>
            <p><strong>Status:</strong> <span style={getStatusStyle(cert.status)}>{cert.status}</span></p>
            {cert.approvedBy && cert.approvedAt && (
                <p style={{fontSize: '12px', color: 'var(--text-secondary-color)'}}><strong>Aprovado por:</strong> {cert.approvedBy.firstName} em {format(new Date(cert.approvedAt), 'dd/MM/yyyy HH:mm')}</p>
            )}

            {cert.status === 'pending' && canApprove && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => onApprove(cert.id, 'approved')} style={{backgroundColor: '#16a34a'}}>Aprovar</button>
                <button onClick={() => onReject(cert.id, 'rejected')} style={{backgroundColor: '#dc2626'}}>Rejeitar</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}