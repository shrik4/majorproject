import React from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import StudentAdmin from '../components/StudentAdmin';


const ChatbotAdminPage: React.FC = () => {
  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Student Data Administration</h1>
          <div className="bg-blue-100 p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-2xl font-semibold text-blue-700 mb-3">Upload Student Data</h3>
            <StudentAdmin />
          </div>

        </main>
      </div>
    </AuthCheck>
  );
};

export default ChatbotAdminPage;