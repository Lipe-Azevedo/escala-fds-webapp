'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import gridStyles from '../common/ListGrid.module.css';

interface CommentListProps {
  comments: Comment[];
  unreadIds: Set<number>;
}

const ITEMS_PER_PAGE = 6;

export default function CommentList({ comments, unreadIds }: CommentListProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  if (comments.length === 0) {
    return <p>Nenhum comentário encontrado para os filtros selecionados.</p>;
  }

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(prevCount => Math.max(ITEMS_PER_PAGE, prevCount - ITEMS_PER_PAGE));
  };

  return (
    <>
      <div className={gridStyles.grid}>
        {comments.slice(0, visibleCount).map(comment => {
          const hasNotification = unreadIds.has(comment.id);

          return (
            <div key={comment.id} style={{
              position: 'relative',
              background: 'rgb(var(--card-background-rgb))',
              border: '1px solid rgb(var(--card-border-rgb))',
              borderRadius: '8px',
              padding: '15px',
            }}>
              {hasNotification && (
                <span style={{ position: 'absolute', top: '15px', right: '15px', height: '10px', width: '10px', backgroundColor: 'var(--primary-color)', borderRadius: '50%' }}></span>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>
                  Para: {comment.collaborator.firstName} {comment.collaborator.lastName}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary-color)' }}>
                  {new Date(comment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0' }}>{comment.text}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary-color)', textAlign: 'right' }}>
                Autor: {comment.author.firstName} {comment.author.lastName}
              </div>
            </div>
          );
        })}
      </div>
      {comments.length >= ITEMS_PER_PAGE && (
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