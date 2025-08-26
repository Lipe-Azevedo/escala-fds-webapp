'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { Notification } from '@/types';

const SEEN_NOTIFICATIONS_KEY = 'seenNotificationIds';

interface NotificationContextType {
  unreadByCategory: Record<string, boolean>;
  getUnreadIdsForCategory: (category: string) => Set<number>;
  markCategoryAsSeen: (category: string) => void;
  isLoading: boolean; // Propriedade adicionada
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [unreadByCategory, setUnreadByCategory] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const storedIds = localStorage.getItem(SEEN_NOTIFICATIONS_KEY);
        if (storedIds) {
            setSeenIds(new Set(JSON.parse(storedIds)));
        }
    } catch (error) {
        console.error("Failed to parse seen notifications from localStorage", error);
        setSeenIds(new Set());
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = Cookies.get('authToken');
    if (!token) {
        setIsLoading(false);
        return;
    }
    const apiURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      const res = await fetch(`${apiURL}/api/events`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data: Notification[] = await res.json();
        setAllNotifications(data || []);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const unreadStatus: Record<string, boolean> = {};
    allNotifications.forEach(n => {
      if (!seenIds.has(n.id)) {
        if (n.link.includes('/swaps')) unreadStatus.swaps = true;
        if (n.link.includes('/comments')) unreadStatus.comments = true;
        if (n.link.includes('/certificates')) unreadStatus.certificates = true;
      }
    });
    setUnreadByCategory(unreadStatus);
  }, [allNotifications, seenIds]);

  const markCategoryAsSeen = useCallback((category: string) => {
    const newSeenIds = new Set(seenIds);
    let changed = false;
    allNotifications.forEach(n => {
      if (n.link.includes(`/${category}`)) {
        if (!newSeenIds.has(n.id)) {
          newSeenIds.add(n.id);
          changed = true;
        }
      }
    });
    if (changed) {
      setSeenIds(newSeenIds);
      localStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(Array.from(newSeenIds)));
    }
  }, [allNotifications, seenIds]);

  const getUnreadIdsForCategory = useCallback((category: string): Set<number> => {
    const unreadIds = new Set<number>();
    allNotifications.forEach(n => {
        const linkMatchesCategory = n.link.includes(`/${category}`);
        if(!seenIds.has(n.id) && linkMatchesCategory) {
            const idMatch = n.link.match(/\/(\d+)$/);
            if (idMatch && idMatch[1]) {
                unreadIds.add(parseInt(idMatch[1]));
            }
        }
    });
    return unreadIds;
  }, [allNotifications, seenIds]);

  return (
    <NotificationContext.Provider value={{ unreadByCategory, getUnreadIdsForCategory, markCategoryAsSeen, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}