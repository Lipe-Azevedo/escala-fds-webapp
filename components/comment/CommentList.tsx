'use client';

import { Comment } from '@/types';

interface CommentListProps {
  comments: Comment[];
  unreadIds: Set<number>;
}

const cardStyle: React.CSSProperties = {
  position: 'relative',
  background: 'rgb(var(--card-background-rgb))',
  border: '1px solid rgb(var(--card-border-rgb))',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px',
};

export default function CommentList({ comments, unreadIds }: CommentListProps) {
  if (comments.length === 0) {
    return <p>Nenhum comentário encontrado para os filtros selecionados.</p>;
  }

  return (
    <div>
      {comments.map(comment => {
        const hasNotification = unreadIds.has(comment.id);

        return (
          <div key={comment.id} style={cardStyle}>
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
  );
}