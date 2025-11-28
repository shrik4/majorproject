import React, { useState } from 'react';
import Navbar from '@/components/Navbar';

import StudyMaterialAdmin from '../components/StudyMaterialAdmin';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/components/AuthCheckAdmin';
import FileUploader from '@/components/FileUploader';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = useState<Set<string>>(new Set());

  const handleFilesAdded = (files: File[]) => {
    const newFileNames = new Set<string>();
    files.forEach(file => newFileNames.add(file.name));
    setUploadedFileNames(prev => new Set([...prev, ...newFileNames]));
    setCsvFiles(prev => [...prev, ...files]);
  };

  const handleFileRemoved = (fileName: string) => {
    setUploadedFileNames(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
    setCsvFiles(prev => prev.filter(file => file.name !== fileName));
  };

  const handleUploadCsv = async () => {
    if (csvFiles.length === 0) {
      alert("Please select a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFiles[0]);

    try {
      const response = await fetch('http://localhost:8010/upload-csv/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`CSV upload failed: ${response.statusText}`);
      }

      alert("CSV file uploaded successfully!");
      setCsvFiles([]);
      setUploadedFileNames(new Set());
    } catch (error) {
      console.error('CSV upload error:', error);
      alert("Error uploading CSV file.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };


  return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 pt-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Chatbot and Question Paper Administration */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Chatbot & Question Paper Administration</h2>
                <p className="text-gray-600">Upload CSV files for chatbot data.</p>
              </div>
              <div className="mt-4">
                <FileUploader onFilesAdded={handleFilesAdded} onFileRemoved={handleFileRemoved} uploadedFileNames={uploadedFileNames} />
                <button onClick={handleUploadCsv} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mt-2">Upload CSV</button>
              </div>
            </div>

            {/* Study Material Management */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-green-700">Study Material Management</h2>
                <p className="text-gray-600">Manage study materials, including folders and files.</p>
              </div>
              <div className="mt-4">
                <Link to="/admin/study-materials" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Manage Study Materials</Link>
              </div>
            </div>

            {/* Event Management */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-purple-700">Event Management</h2>
                <p className="text-gray-600">Add, edit, and remove college events. Update details, schedules, and publish announcements.</p>
              </div>
              <div className="mt-4">
                <Link to="/admin/events" className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">Manage Events</Link>
              </div>
            </div>

            {/* Course Administration */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-red-700">Course Administration</h2>
                <p className="text-gray-600">Add new courses and update existing ones. Manage course content and curriculum, set enrollment parameters.</p>
              </div>
              <div className="mt-4">
                <Link to="/admin/courses" className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">Manage Courses</Link>
              </div>
            </div>

            {/* Exam Hall Administration */}
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-orange-700">Exam Hall Administration</h2>
                <p className="text-gray-600">Upload and manage exam hall allocations, seating arrangements, and student exam details.</p>
              </div>
              <div className="mt-4">
                <Link to="/admin/exam-hall" className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors">Manage Exam Halls</Link>
              </div>
            </div>
          </div>

        </main>
      </div>
  );
};

export default AdminDashboardPage;