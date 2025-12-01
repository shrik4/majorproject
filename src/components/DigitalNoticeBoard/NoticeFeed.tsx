import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NoticeCard from './NoticeCard';
import CategoryFilter from './CategoryFilter';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

    const fetchNotices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8023/api/notices?category=${selectedCategory}`);
            setNotices(response.data);
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
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

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
                    {notices.map((notice) => (
                        <NoticeCard
                            key={notice._id}
                            notice={notice}
                            isAdmin={isAdmin}
                            onPin={handlePin}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoticeFeed;
