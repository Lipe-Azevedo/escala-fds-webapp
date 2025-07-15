'use client';

import { Notification } from '@/types';
import { format } from 'date-fns';

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationList({ notifications, onNotificationClick }: NotificationListProps) {
  
  if (notifications.length === 0) {
    return <p style={{color: 'var(--text-secondary-color)'}}>Você não tem nenhuma notificação.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {notifications.map(n => (
        <div 
          key={n.id}
          onClick={() => onNotificationClick(n)}
          style={{
            background: 'rgb(var(--card-background-rgb))',
            border: '1px solid rgb(var(--card-border-rgb))',
            borderRadius: '8px',
            padding: '20px',
            cursor: 'pointer',
            opacity: n.isRead ? 0.6 : 1,
            transition: 'background-color 0.2s, opacity 0.2s',
          }}
        >
          <p style={{ margin: 0, fontSize: '15px' }}>{n.message}</p>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary-color)', marginTop: '8px', display: 'block' }}>
            {format(new Date(n.createdAt), 'dd/MM/yyyy \'às\' HH:mm')}
          </span>
        </div>
      ))}
    </div>
  );
}