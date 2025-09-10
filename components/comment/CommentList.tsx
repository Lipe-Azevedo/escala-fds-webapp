'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import { format } from 'date-fns';
import styles from './CommentList.module.css';

interface CommentListProps {
  comments: Comment[];
  unreadIds: Set<number>;
}

const ITEMS_PER_PAGE = 6;

export default function CommentList({ comments, unreadIds }: CommentListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(prevCount => Math.max(ITEMS_PER_PAGE, prevCount - ITEMS_PER_PAGE));
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(/-/g, '/')), 'dd/MM/yyyy');
  };

  if (comments.length === 0) {
    return <p>Nenhum comentário encontrado para os filtros selecionados.</p>;
  }

  return (
    <>
      <div className={styles.commentGrid}>
        {comments.slice(0, visibleCount).map(comment => {
          const hasNotification = unreadIds.has(comment.id);
          const isExpanded = expandedId === comment.id;

          return (
            <div key={comment.id} className={styles.commentCard}>
              {hasNotification && <span className={styles.notificationIndicator}></span>}

              <div className={styles.cardBody}>
                <div className={styles.commentDetails}>
                  <div>
                    <span className={styles.detailLabel}>Autor</span>
                    <p>{comment.author.firstName}</p>
                  </div>
                  <div>
                    <span className={styles.detailLabel}>Destinatário</span>
                    <p>{comment.collaborator.firstName}</p>
                  </div>
                </div>
                {isExpanded && (
                  <div className={styles.expandedInfo}>
                    <p>{comment.text}</p>
                  </div>
                )}
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.dateDisplay}>{formatDate(comment.date)}</span>
                <div className={styles.footerActions}>
                    <button onClick={() => toggleExpand(comment.id)} className={styles.detailsButton}>
                        {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {comments.length > ITEMS_PER_PAGE && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', maxWidth: '300px', margin: '20px auto 0' }}>
          <button onClick={handleShowLess} disabled={visibleCount <= ITEMS_PER_PAGE} style={{ flex: 1 }}>
            Ver Menos
          </button>
          <button onClick={handleShowMore} disabled={visibleCount >= comments.length} style={{ flex: 1 }}>
            Ver Mais
          </button>
        </div>
      )}
    </>
  );
}