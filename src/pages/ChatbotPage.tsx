
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

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Try campus chatbot first
      const campusResponse = await fetch('http://localhost:5002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const campusData = await campusResponse.json();
      
      if (campusData.response) {
        // If it's a download link, format it differently
        if (campusData.response.startsWith('http')) {
          setMessages([...newMessages, { 
            text: 'Here is your requested file:', 
            sender: 'bot',
            link: campusData.response 
          }]);
        } else {
          setMessages([...newMessages, { text: campusData.response, sender: 'bot' }]);
        }
      } else {
        // Fallback to main chatbot for general queries
        const response = await fetch('http://localhost:8001/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ query: input }),
        });

        const data = await response.json();
        setMessages([...newMessages, { text: data.response, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Campus Assistant</h1>
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col" style={{ height: '600px' }}>
              <div className="flex-grow overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                  <ChatMessage 
                    key={index} 
                    message={msg.text} 
                    isBot={msg.sender === 'bot'} 
                    link={msg.link}
                  />
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                />
                <button onClick={handleSendMessage} className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600">
                  Send
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4" style={{ height: '600px' }}>
              <h2 className="text-xl font-bold mb-4">Tips</h2>
              <ul className="space-y-2">
                <li><b>For inquiries about individuals:</b> Use the format "Who is [Name]?" (e.g., "Who is Shobith?", "Who is Dr. Arvind Menon?").</li>
                <li><b>For retrieving information by USN:</b> Simply type the USN (e.g., "4DM22AI056").</li>
                <li><b>For downloading question papers:</b> Use the format "download [filename.pdf]" (e.g., "download bai613a.pdf"). Emphasize that the complete subject code and the '.pdf' extension must be included.</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default ChatbotPage;
