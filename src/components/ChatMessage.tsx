
import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  link?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, link }) => {
  return (
    <div 
      className={cn(
        "max-w-[80%] p-3 rounded-lg mb-3 animate-slide-in shadow-sm",
        isBot 
          ? "bg-white border border-gray-100 self-start rounded-tl-none" 
          : "bg-gradient-to-r from-campus-500 to-campus-600 text-white self-end rounded-tr-none"
      )}
    >
      <div className="text-sm">
        {message}
        {link && (
          <div className="mt-2">
            <a 
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-campus-500 text-white rounded-md hover:bg-campus-600 transition-colors"
            >
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
