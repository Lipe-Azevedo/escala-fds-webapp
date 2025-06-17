'use client';

import { Comment } from '../types';
import { format } from 'date-fns';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {

  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(/-/g, '/')), 'dd/MM/yyyy');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {comments.length === 0 && <p>Nenhum comentário encontrado para os filtros selecionados.</p>}
      {comments.map((comment) => (
          <div key={comment.id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <p><strong>Autor:</strong> {comment.author.firstName} {comment.author.lastName}</p>
            <p><strong>Para:</strong> {comment.collaborator.firstName} {comment.collaborator.lastName}</p>
            <p><strong>Data do Comentário:</strong> {formatDate(comment.date)}</p>
            <p style={{ marginTop: '10px', padding: '10px', background: '#fefefe', borderLeft: '3px solid #ddd' }}>
              {comment.text}
            </p>
            <p style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>
              Registrado em {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
        )
      )}
    </div>
  );
}