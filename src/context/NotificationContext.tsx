import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Notification } from '../types';
import * as notifApi from '../api/notifications';
import { onEvent, offEvent } from '../socket';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isAuthenticated } = useAuth();

  const unreadCount = notifications.filter((n) => !n.lu).length;

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notifApi.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, []);

  const addNotification = useCallback((notif: Notification) => {
    setNotifications((prev) => [notif, ...prev]);
  }, []);

  // 🌟 Dans ton NotificationContext.tsx
const markAsRead = async (id: string | number) => {
  try {
    // Appel API pour mettre à jour le statut en Base de Données
    await axios.put(`/api/notifications/${id}/read`);
    
    // Mise à jour de l'état local en gérant id et _id
    setNotifications(prev =>
      prev.map(n => {
        const notifId = n.id || n._id;
        return String(notifId) === String(id) ? { ...n, lu: true } : n;
      })
    );
  } catch (err) {
    console.error("Erreur lors du marquage de la notification :", err);
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const handler = (data: Notification) => {
      addNotification(data);
    };
    onEvent('notification', handler);
    return () => {
      offEvent('notification', handler);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, addNotification, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
