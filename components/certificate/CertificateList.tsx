'use client';

import { useState } from 'react';
import { Certificate, User } from '@/types';
import { format } from 'date-fns';
import styles from './CertificateList.module.css';

interface CertificateListProps {
  certificates: Certificate[];
  currentUser: User;
  unreadIds: Set<number>;
  onApprove: (certificateId: number, status: 'approved') => void;
  onReject: (certificateId: number, status: 'rejected') => void;
}

const ITEMS_PER_PAGE = 6;

export default function CertificateList({ certificates, currentUser, unreadIds, onApprove, onReject }: CertificateListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getStatusText = (status: Certificate['status']) => {
    if (status === 'pending') return 'Pendente';
    if (status === 'approved') return 'Aprovado';
    if (status === 'rejected') return 'Rejeitado';
    return status;
  }

  const getStatusClass = (status: Certificate['status']) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      case 'pending': return styles.pending;
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
      <div className={styles.certificateGrid}>
        {certificates.length === 0 && <p>Nenhum atestado encontrado.</p>}
        {certificates.slice(0, visibleCount).map((cert) => {
          const canApprove = currentUser.userType === 'master';
          const hasNotification = unreadIds.has(cert.id);
          const isExpanded = expandedId === cert.id;

          return (
            <div key={cert.id} className={styles.certificateCard}>
              {hasNotification && <span className={styles.notificationIndicator}></span>}
              
              <div className={styles.cardBody}>
                 {isExpanded && (
                  <div className={styles.expandedInfo}>
                    {currentUser.userType === 'master' && (
                      <p><strong>Colaborador:</strong> {cert.collaborator.firstName} {cert.collaborator.lastName}</p>
                    )}
                    <p><strong>Motivo:</strong> {cert.reason}</p>
                    {cert.approvedBy && cert.approvedAt && (
                      <p><strong>Aprovado por:</strong> {cert.approvedBy.firstName} em {format(new Date(cert.approvedAt), 'dd/MM/yyyy HH:mm')}</p>
                    )}
                  </div>
                )}
                <div className={styles.certificateDetails}>
                    <p>
                        <strong>Período: </strong> 
                        {formatDate(cert.startDate)} até {formatDate(cert.endDate)}
                    </p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={`${styles.status} ${getStatusClass(cert.status)}`}>{getStatusText(cert.status)}</span>
                <div className={styles.footerActions}>
                    <button onClick={() => toggleExpand(cert.id)} className={styles.detailsButton}>
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                    {cert.status === 'pending' && canApprove && (
                        <>
                            <button onClick={() => onApprove(cert.id, 'approved')} className={`${styles.actionButton} ${styles.approveButton}`}>Aprovar</button>
                            <button onClick={() => onReject(cert.id, 'rejected')} className={`${styles.actionButton} ${styles.rejectButton}`}>Rejeitar</button>
                        </>
                    )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {certificates.length >= ITEMS_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', maxWidth: '300px', margin: '20px auto 0' }}>
          <button onClick={handleShowLess} disabled={visibleCount <= ITEMS_PER_PAGE} style={{ flex: 1 }}>
            Ver Menos
          </button>
          <button onClick={handleShowMore} disabled={visibleCount >= certificates.length} style={{ flex: 1 }}>
            Ver Mais
          </button>
        </div>
      )}
    </>
  );
}