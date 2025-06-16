'use client';

import { Certificate, User } from '../types';
import { format } from 'date-fns';

interface CertificateListProps {
  certificates: Certificate[];
  currentUser: User;
  onApprove: (certificateId: number, status: 'approved') => void;
  onReject: (certificateId: number, status: 'rejected') => void;
}

export default function CertificateList({ certificates, currentUser, onApprove, onReject }: CertificateListProps) {
    
  const getStatusStyle = (status: Certificate['status']): React.CSSProperties => {
    switch (status) {
      case 'approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'rejected':
        return { color: 'red', fontWeight: 'bold' };
      case 'pending':
        return { color: 'orange', fontWeight: 'bold' };
      default:
        return {};
    }
  };

  const formatDate = (date: string) => format(new Date(date), 'dd/MM/yyyy');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {certificates.length === 0 && <p>Nenhum atestado encontrado.</p>}
      {certificates.map((cert) => {
        const canApprove = currentUser.userType === 'master';
        
        return (
          <div key={cert.id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            {currentUser.userType === 'master' && (
                <p><strong>Colaborador:</strong> {cert.collaborator.firstName} {cert.collaborator.lastName}</p>
            )}
            <p><strong>Período:</strong> {formatDate(cert.startDate)} até {formatDate(cert.endDate)}</p>
            <p><strong>Motivo:</strong> {cert.reason}</p>
            <p><strong>Status:</strong> <span style={getStatusStyle(cert.status)}>{cert.status}</span></p>
            {cert.approvedBy && (
                <p><strong>Aprovado por:</strong> {cert.approvedBy.firstName} em {format(new Date(cert.approvedAt!), 'dd/MM/yyyy HH:mm')}</p>
            )}
            
            {cert.status === 'pending' && canApprove && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button onClick={() => onApprove(cert.id, 'approved')} style={{backgroundColor: '#22c55e'}}>Aprovar</button>
                <button onClick={() => onReject(cert.id, 'rejected')} style={{backgroundColor: '#ef4444'}}>Rejeitar</button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}