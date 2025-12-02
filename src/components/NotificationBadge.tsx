import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
    count: number;
    className?: string;
    pulse?: boolean;
    maxCount?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    className,
    pulse = true,
    maxCount = 99,
}) => {
    if (count <= 0) return null;

    const displayCount = count > maxCount ? `${maxCount}+` : count;

    return (
        <span
            className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full',
                pulse && 'animate-pulse',
                className
            )}
        >
            {displayCount}
        </span>
    );
};

export default NotificationBadge;
