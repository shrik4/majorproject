import React from 'react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  link?: string;
  sources?: any;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isBot, link, sources }) => {
  const messageString = typeof message === 'string' ? message : '';
  const linkRegex = /\* \*\*(.*?)\*\*: \[Link\]\((.*?)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const introTextMatch = messageString.match(/^([^\*]+)/);
  if (introTextMatch) {
    parts.push(<p key="intro">{introTextMatch[1].trim()}</p>);
  }

  while ((match = linkRegex.exec(messageString)) !== null) {
    parts.push(
      <div key={match[2]} className="flex items-center justify-between my-2 p-2 border rounded-md">
        <span className="truncate font-medium">{match[1]}</span>
        <a
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 flex-shrink-0 px-3 py-1 bg-campus-500 text-white rounded-md hover:bg-campus-600 transition-colors text-sm"
        >
          Download
        </a>
      </div>
    );
  }

  const hasLinks = parts.some(part => React.isValidElement(part) && part.key !== 'intro');

  const messageContent = hasLinks ? parts : messageString;


  return (
    <div 
      className={cn(
        "flex",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div 
        className={cn(
          "max-w-[80%] p-3 rounded-lg mb-3 animate-slide-in shadow-sm",
          isBot 
            ? "bg-white border border-gray-100 self-start rounded-tl-none" 
            : "bg-gradient-to-r from-campus-500 to-campus-600 text-white self-end rounded-tr-none"
        )}
      >
        <div className="text-sm">
          {messageContent}
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
          {Array.isArray(sources) && sources.length > 0 && (
            <div className="mt-4 pt-2 border-t border-gray-200">
              <strong className="text-sm font-semibold text-gray-600">Sources:</strong>
              <ul className="list-none pl-0 mt-2 space-y-2">
                {sources.map((source: any, index: number) => (
                  <li key={index}>{
                    (typeof source === 'object' && source !== null) 
                      ? (source.text || source.title || source.url || 'Invalid source') 
                      : String(source)
                  }</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;