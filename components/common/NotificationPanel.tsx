'use client';

import { Notification } from '@/types';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface NotificationPanelProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onClose: () => void;
}

export default function NotificationPanel({ notifications, onNotificationClick, onClose }: NotificationPanelProps) {
  const router = useRouter();

  const handleClick = (notification: Notification) => {
    onNotificationClick(notification);
    router.push(notification.link);
    onClose();
  };

  return (
    <div style={{ position: 'absolute', top: '70px', right: '20px', width: '350px', backgroundColor: 'rgb(var(--card-background-rgb))', border: '1px solid rgb(var(--card-border-rgb))', borderRadius: '8px', zIndex: 100, maxHeight: '400px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid rgb(var(--card-border-rgb))' }}>
        <h4 style={{ margin: 0 }}>Notificações</h4>
      </div>
      {notifications.length === 0 ? (
        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary-color)' }}>Nenhuma notificação.</p>
      ) : (
        <div>
          {notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => handleClick(n)}
              style={{ padding: '15px', borderBottom: '1px solid rgb(var(--card-border-rgb))', cursor: 'pointer', backgroundColor: n.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.15)' }}
            >
              <p style={{ margin: 0, fontSize: '14px' }}>{n.message}</p>
              <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'var(--text-secondary-color)' }}>
                {format(new Date(n.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}