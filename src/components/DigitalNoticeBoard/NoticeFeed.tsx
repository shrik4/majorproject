import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NoticeCard from './NoticeCard';
import CategoryFilter from './CategoryFilter';
import { toast } from "sonner";
import { Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from '@/contexts/NotificationContext';
import { getLastSeenTimestamp, setUnreadCount } from '@/lib/notificationUtils';

interface Notice {
    _id: string;
    title: string;
    content: string;
    category: string;
    date: string;
    isPinned: boolean;
}

interface NoticeFeedProps {
    isAdmin?: boolean;
    refreshTrigger?: number;
}

const NoticeFeed: React.FC<NoticeFeedProps> = ({ isAdmin, refreshTrigger }) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { markAllAsRead, unreadCount } = useNotifications();
    const [lastSeenTime, setLastSeenTime] = useState<string | null>(null);

    useEffect(() => {
        setLastSeenTime(getLastSeenTimestamp());
    }, []);

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8023/api/notices?category=${selectedCategory}`);
            setNotices(response.data);

            // Recalculate unread count based on actual notices
            if (!isAdmin) {
                const lastSeen = getLastSeenTimestamp();
                if (lastSeen) {
                    const newCount = response.data.filter((notice: any) => {
                        const noticeDate = new Date(notice.date || notice.createdAt);
                        return noticeDate > new Date(lastSeen);
                    }).length;
                    setUnreadCount(newCount);
                }
            }
        } catch (error) {
            console.error('Error fetching notices:', error);
            toast.error('Failed to load notices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, [selectedCategory, refreshTrigger]);

    const handlePin = async (id: string) => {
        try {
            await axios.put(`http://localhost:8023/api/notices/${id}/pin`);
            toast.success('Notice pin status updated');
            fetchNotices();
        } catch (error) {
            console.error('Error updating pin status:', error);
            toast.error('Failed to update pin status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;

        try {
            await axios.delete(`http://localhost:8023/api/notices/${id}`);
            toast.success('Notice deleted successfully');
            fetchNotices();
        } catch (error) {
            console.error('Error deleting notice:', error);
            toast.error('Failed to delete notice');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

                {!isAdmin && unreadCount > 0 && (
                    <Button
                        onClick={() => {
                            markAllAsRead();
                            setLastSeenTime(new Date().toISOString());
                            toast.success('All notices marked as read');
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <CheckCheck size={16} />
                        Mark all as read ({unreadCount})
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : notices.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                    No notices found for this category.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {notices.map((notice) => {
                        // Check if notice is new (created after last seen time)
                        const isNew = lastSeenTime && notice.date ?
                            new Date(notice.date) > new Date(lastSeenTime) : false;

                        return (
                            <div key={notice._id} className="relative">
                                {isNew && !isAdmin && (
                                    <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                        NEW
                                    </div>
                                )}
                                <NoticeCard
                                    notice={notice}
                                    isAdmin={isAdmin}
                                    onPin={handlePin}
                                    onDelete={handleDelete}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NoticeFeed;
