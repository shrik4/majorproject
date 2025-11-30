import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import ChatMessage from '@/components/ChatMessage';

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send the user's message to the chat endpoint
      const chatResponse = await fetch('http://localhost:8010/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input, llm: "gemini" }),
      });

      if (!chatResponse.ok) {
        throw new Error(`Chat API failed: ${chatResponse.statusText}`);
      }

      const chatData = await chatResponse.json();
      const answer = chatData.answer;

      let botMessageText = '';
      if (typeof answer === 'string') {
        botMessageText = answer;
      } else if (answer) {
        // If the answer is not a string but is not null/undefined, stringify it.
        botMessageText = JSON.stringify(answer, null, 2);
      } else {
        // If the answer is null or undefined, provide a default message.
        botMessageText = "I received a response, but it was empty.";
      }

      const botMessage = {
        text: botMessageText,
        sender: 'bot'
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container px-4 md:px-6 py-8 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-md flex flex-col" style={{ height: 'calc(100vh - 150px)' }}>
            <div className="p-6 border-b">
              <h1 className="text-2xl md:text-3xl font-bold">Campus Assistant</h1>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.text || ''}
                  isBot={msg.sender === 'bot'}
                  link={msg.link || undefined}
                  sources={msg.sources || undefined}
                />
              ))}
            </div>
            <div className="p-6 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-600 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default ChatbotPage;
