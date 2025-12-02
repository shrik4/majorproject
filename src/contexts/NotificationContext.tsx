import React, { createContext, useContext, ReactNode } from 'react';
import { useNoticeNotifications } from '@/hooks/useNoticeNotifications';

interface NotificationContextType {
    unreadCount: number;
    hasNewNotices: boolean;
    markAllAsRead: () => void;
    forceCheck: () => void;
    isPermissionGranted: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const notifications = useNoticeNotifications();

    return (
        <NotificationContext.Provider value={notifications}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
