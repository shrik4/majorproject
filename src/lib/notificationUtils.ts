/**
 * Notification utility functions for Digital Notice Board
 */

const STORAGE_KEY = 'noticeBoard';

interface NoticeStorageData {
    lastSeenTimestamp: string | null;
    unreadCount: number;
    seenNoticeIds: string[];
}

/**
 * Get notification data from localStorage
 */
export const getNotificationData = (): NoticeStorageData => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading notification data:', error);
    }

    return {
        lastSeenTimestamp: null,
        unreadCount: 0,
        seenNoticeIds: []
    };
};

/**
 * Save notification data to localStorage
 */
export const saveNotificationData = (data: NoticeStorageData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving notification data:', error);
    }
};

/**
 * Get last seen timestamp
 */
export const getLastSeenTimestamp = (): string | null => {
    const data = getNotificationData();
    return data.lastSeenTimestamp;
};

/**
 * Set last seen timestamp to current time
 */
export const setLastSeenTimestamp = (timestamp?: string): void => {
    const data = getNotificationData();
    data.lastSeenTimestamp = timestamp || new Date().toISOString();
    data.unreadCount = 0;
    saveNotificationData(data);
};

/**
 * Get unread count
 */
export const getUnreadCount = (): number => {
    const data = getNotificationData();
    return data.unreadCount;
};

/**
 * Set unread count
 */
export const setUnreadCount = (count: number): void => {
    const data = getNotificationData();
    data.unreadCount = count;
    saveNotificationData(data);
};

/**
 * Increment unread count
 */
export const incrementUnreadCount = (): void => {
    const data = getNotificationData();
    data.unreadCount += 1;
    saveNotificationData(data);
};

/**
 * Mark notice as seen
 */
export const markNoticeAsSeen = (noticeId: string): void => {
    const data = getNotificationData();
    if (!data.seenNoticeIds.includes(noticeId)) {
        data.seenNoticeIds.push(noticeId);
        saveNotificationData(data);
    }
};

/**
 * Check if notice has been seen
 */
export const hasSeenNotice = (noticeId: string): boolean => {
    const data = getNotificationData();
    return data.seenNoticeIds.includes(noticeId);
};

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
        console.warn('Browser does not support notifications');
        return 'denied';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }

    return Notification.permission;
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (
    title: string,
    body: string,
    icon?: string,
    onClick?: () => void
): void => {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'notice-board',
            requireInteraction: false
        });

        if (onClick) {
            notification.onclick = () => {
                window.focus();
                onClick();
                notification.close();
            };
        }

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
};

/**
 * Play notification sound (optional)
 */
export const playNotificationSound = (): void => {
    try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => {
            console.log('Could not play notification sound:', err);
        });
    } catch (error) {
        console.log('Notification sound not available');
    }
};

/**
 * Reset all notification data
 */
export const resetNotificationData = (): void => {
    saveNotificationData({
        lastSeenTimestamp: new Date().toISOString(),
        unreadCount: 0,
        seenNoticeIds: []
    });
};
