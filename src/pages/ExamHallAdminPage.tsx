import React from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import ExamHallAdmin from '../components/ExamHallAdmin';

const ExamHallAdminPage: React.FC = () => {
  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Exam Hall Administration</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ExamHallAdmin />
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default ExamHallAdminPage;
