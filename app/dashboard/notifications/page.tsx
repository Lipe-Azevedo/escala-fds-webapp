'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Notification } from '@/types';
import NotificationList from '@/components/notification/NotificationList';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError('');
    const token = Cookies.get('authToken');
    if (!token) {
        router.push('/login');
        return;
    }
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
        const res = await fetch(`${apiURL}/api/notifications`, { headers: { 'Authorization': `Bearer ${token}` } });
        if(res.ok) {
            const data = await res.json();
            setNotifications(data || []);
        } else {
            throw new Error('Falha ao buscar notificações.');
        }
    } catch(e: any) {
        setError(e.message);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    // Navega primeiro para uma melhor experiência do usuário
    router.push(notification.link);

    if (notification.isRead) return;

    const token = Cookies.get('authToken');
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      await fetch(`${apiURL}/api/notifications/${notification.id}/read`, { 
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Atualiza o estado localmente para refletir a mudança sem um novo fetch
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>Minhas Notificações</h1>
      {isLoading && <p>Carregando...</p>}
      {error && <p style={{ color: '#f87171' }}>{error}</p>}
      {!isLoading && !error && (
        <NotificationList 
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />
      )}
    </div>
  );
}