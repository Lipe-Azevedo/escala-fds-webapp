'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Comment, User } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
  selectedDate: Date;
  calendarUser: Pick<User, 'id' | 'superiorId'>;
}

export default function CommentsModal({ isOpen, onClose, onCommentAdded, selectedDate, calendarUser }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      setCurrentUser(JSON.parse(userDataString));
    }
  }, []);
  
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const fetchComments = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    try {
      const res = await fetch(`${apiURL}/api/comments?collaboratorId=${calendarUser.id}&startDate=${dateString}&endDate=${dateString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha ao buscar comentários.');
      const data = await res.json();
      setComments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const handlePostComment = async () => {
    if (!newCommentText.trim()) return;
    setIsLoading(true);
    setError('');

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
        const res = await fetch(`${apiURL}/api/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                collaboratorId: calendarUser.id,
                text: newCommentText,
                date: dateString,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Falha ao postar comentário.');
        setNewCommentText('');
        onCommentAdded(); // Notifica o calendário para recarregar os dados
        fetchComments(); // Recarrega os comentários dentro do modal
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const canAddComment = currentUser?.userType === 'master' || currentUser?.id === calendarUser.superiorId;

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };
  const modalContentStyle: React.CSSProperties = {
    background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px',
    color: 'black', maxHeight: '90vh', overflowY: 'auto',
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Comentários para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</h2>
        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '20px' }}>
          {isLoading && <p>Carregando...</p>}
          {!isLoading && comments.length === 0 && <p>Nenhum comentário para esta data.</p>}
          {!isLoading && comments.map(comment => (
            <div key={comment.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
              <p><strong>{comment.author.firstName}:</strong> {comment.text}</p>
              <p style={{ fontSize: '12px', color: '#888' }}>em {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          ))}
        </div>
        
        {canAddComment && (
            <div>
                <textarea 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Adicionar um novo comentário..."
                    rows={3}
                    style={{width: '100%', padding: '8px', boxSizing: 'border-box'}}
                />
                <button onClick={handlePostComment} disabled={isLoading} style={{marginTop: '10px'}}>
                    {isLoading ? 'Salvando...' : 'Salvar Comentário'}
                </button>
            </div>
        )}

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <button onClick={onClose} style={{ marginTop: '20px', backgroundColor: '#6b7280' }}>Fechar</button>
      </div>
    </div>
  );
}