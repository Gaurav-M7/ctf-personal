import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { demoStore } from '../services/demoStore';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const refreshNotifications = useCallback(() => {
    if (currentUser) {
      const list = demoStore.getNotifications(currentUser.id);
      setNotifications(list);
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 3000); // Polling simulation
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    demoStore.markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (currentUser) {
      demoStore.markAllNotificationsAsRead(currentUser.id);
      refreshNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        openNotifications: () => setIsOpen(true),
        closeNotifications: () => setIsOpen(false),
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
