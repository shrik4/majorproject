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
        <main className="flex-grow container px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row max-w-6xl mx-auto gap-6">
            <div className="flex-1 bg-white rounded-lg shadow-md p-4 flex flex-col" style={{ height: '700px' }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Campus Assistant</h1>
              <div className="flex-grow overflow-y-auto mb-4">
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
              <div className="flex flex-col gap-2">
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
            </div>
            <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4" style={{ height: '700px' }}>
              <h2 className="text-xl font-bold mb-4">Tips</h2>
              <ul className="space-y-2">
                 <li><b>For CSV analysis:</b> Upload a CSV file and ask questions about its content.</li>
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
