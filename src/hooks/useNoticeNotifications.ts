import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    getLastSeenTimestamp,
    setLastSeenTimestamp,
    getUnreadCount,
    setUnreadCount,
    requestNotificationPermission,
    showBrowserNotification,
} from '@/lib/notificationUtils';

const POLL_INTERVAL = 30000; // 30 seconds
const API_BASE_URL = 'http://localhost:8023/api';

interface LatestNoticeResponse {
    timestamp: string | null;
    count: number;
    latestNotice?: {
        _id: string;
        title: string;
        category: string;
        date: string;
    };
}

export const useNoticeNotifications = () => {
    const [unreadCount, setUnreadCountState] = useState<number>(0);
    const [hasNewNotices, setHasNewNotices] = useState(false);
    const [isPermissionGranted, setIsPermissionGranted] = useState(false);
    const [lastNotifiedTimestamp, setLastNotifiedTimestamp] = useState<string | null>(null);

    // Initialize unread count from localStorage
    useEffect(() => {
        const storedCount = getUnreadCount();
        setUnreadCountState(storedCount);

        // Initialize last notified timestamp
        const lastSeen = getLastSeenTimestamp();
        setLastNotifiedTimestamp(lastSeen);
    }, []);

    // Request notification permission on mount
    useEffect(() => {
        const checkPermission = async () => {
            const permission = await requestNotificationPermission();
            setIsPermissionGranted(permission === 'granted');
        };
        checkPermission();
    }, []);

    // Check for new notices
    const checkForNewNotices = useCallback(async () => {
        try {
            // Get all notices to calculate unread count
            const allNoticesResponse = await axios.get(`${API_BASE_URL}/notices`);
            const allNotices = allNoticesResponse.data;

            const lastSeen = getLastSeenTimestamp();

            // Calculate how many notices are newer than last seen
            let newNoticesCount = 0;
            let latestNotice = null;

            if (lastSeen) {
                allNotices.forEach((notice: any) => {
                    const noticeDate = new Date(notice.date || notice.createdAt);
                    if (noticeDate > new Date(lastSeen)) {
                        newNoticesCount++;
                        if (!latestNotice || noticeDate > new Date(latestNotice.date || latestNotice.createdAt)) {
                            latestNotice = notice;
                        }
                    }
                });
            } else {
                // First time - all notices are "new"
                newNoticesCount = allNotices.length;
                if (allNotices.length > 0) {
                    latestNotice = allNotices[0];
                }
            }

            // Update unread count
            setUnreadCount(newNoticesCount);
            setUnreadCountState(newNoticesCount);

            // Only show notification if there's actually a NEW notice since last notification
            // (not just since last seen, to avoid showing notification on every poll)
            if (latestNotice && (!lastNotifiedTimestamp ||
                new Date(latestNotice.date || latestNotice.createdAt) > new Date(lastNotifiedTimestamp))) {

                setHasNewNotices(true);
                setLastNotifiedTimestamp(latestNotice.date || latestNotice.createdAt);

                // Show toast notification only once for the latest notice
                toast.info(
                    `New ${latestNotice.category} Notice: ${latestNotice.title}`,
                    {
                        duration: 5000,
                        action: {
                            label: 'View',
                            onClick: () => {
                                window.location.href = '/digital-notice-board';
                            },
                        },
                    }
                );

                // Show browser notification if permitted
                if (isPermissionGranted) {
                    showBrowserNotification(
                        `New ${latestNotice.category} Notice`,
                        latestNotice.title,
                        '/favicon.ico',
                        () => {
                            window.location.href = '/digital-notice-board';
                        }
                    );
                }
            }
        } catch (error) {
            console.error('Error checking for new notices:', error);
        }
    }, [isPermissionGranted, lastNotifiedTimestamp]);

    // Poll for new notices
    useEffect(() => {
        // Check immediately on mount
        checkForNewNotices();

        // Set up polling interval
        const interval = setInterval(checkForNewNotices, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [checkForNewNotices]);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setLastSeenTimestamp();
        setUnreadCountState(0);
        setHasNewNotices(false);
    }, []);

    // Force check for new notices (useful after creating a notice)
    const forceCheck = useCallback(() => {
        checkForNewNotices();
    }, [checkForNewNotices]);

    return {
        unreadCount,
        hasNewNotices,
        markAllAsRead,
        forceCheck,
        isPermissionGranted,
    };
};
