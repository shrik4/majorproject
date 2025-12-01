import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Notice {
    _id: string;
    title: string;
    content: string;
    category: string;
    date: string;
    isPinned: boolean;
}

interface NoticeCardProps {
    notice: Notice;
    isAdmin?: boolean;
    onPin?: (id: string) => void;
    onDelete?: (id: string) => void;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice, isAdmin, onPin, onDelete }) => {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Urgent': return 'bg-red-500';
            case 'Exam': return 'bg-blue-500';
            case 'Holiday': return 'bg-green-500';
            case 'Event': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <Card className={`mb-4 transition-all hover:shadow-md ${notice.isPinned ? 'border-l-4 border-l-yellow-400' : ''}`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-semibold">{notice.title}</CardTitle>
                        {notice.isPinned && <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <Badge className={`${getCategoryColor(notice.category)} text-white hover:${getCategoryColor(notice.category)}`}>
                        {notice.category}
                    </Badge>
                </div>
                {isAdmin && (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onPin?.(notice._id)}>
                            <Pin className={`h-4 w-4 ${notice.isPinned ? 'fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete?.(notice._id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
            </CardContent>
            <CardFooter className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(notice.date), 'PPP')}
            </CardFooter>
        </Card>
    );
};

export default NoticeCard;
