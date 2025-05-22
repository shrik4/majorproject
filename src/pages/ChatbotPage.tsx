
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import ChatMessage from '@/components/ChatMessage';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from 'lucide-react';

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Hi there! I'm your campus assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const CHATBOT_API_URL = 'http://localhost:8000/ask';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput('');
    setIsTyping(true);
    
    // Send query to chatbot API
    fetch(CHATBOT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ query: input })
    })
    .then(async response => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from chatbot');
      }
      return data;
    })
    .then(data => {
      setMessages(prev => [...prev, { text: data.response, isBot: true }]);
      setIsTyping(false);
    })
    .catch(error => {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: error.message || "I'm having trouble connecting to my brain right now. Please try again later!", isBot: true }]);
      setIsTyping(false);
    });
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow container px-4 md:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Campus Assistant</h1>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 h-[70vh] flex flex-col">
              <div className="flex-grow overflow-y-auto p-4">
                <div className="flex flex-col">
                  {messages.map((message, index) => (
                    <ChatMessage 
                      key={index} 
                      message={message.text} 
                      isBot={message.isBot} 
                    />
                  ))}
                  {isTyping && (
                    <div className="bg-gray-100 self-start rounded-lg p-3 mb-2 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow"
                  />
                  <Button type="submit" className="shrink-0">
                    <SendHorizontal size={18} />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default ChatbotPage;
