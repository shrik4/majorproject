import React, { useState } from 'react';

const ExamHallAdmin: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });
      setFile(selectedFile);
      setMessage('');
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);
      const response = await fetch('http://localhost:5006/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header, let the browser set it with the boundary
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('File uploaded successfully!');
        setFile(null);
        // Refresh student list after successful upload
        fetchStudents();
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setUploading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5006/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Upload Exam Hall Data</h2>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-md font-medium text-blue-800 mb-2">CSV File Requirements:</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>File must be in CSV format</li>
            <li>Required columns: usn, name, block, room_number, seat_number, semester</li>
            <li>Example row: 1RV21CS001,John Doe,A,101,1,3</li>
            <li>USN can be in any format (caps or small)</li>
            <li>Block should be a single letter (e.g., A, B, C)</li>
            <li>Room number should be just the number (e.g., 101)</li>
            <li>Seat number should be a number</li>
            <li>Semester should be a number</li>
          </ul>
          <div className="mt-4">
            <a
              href="http://localhost:5006/download-template"
              className="inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Template CSV
            </a>
          </div>
        </div>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Student CSV File
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select a CSV file with the required columns
            </p>
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              !file || uploading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Student List Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Uploaded Student Data</h2>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Refresh List
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Block
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.regNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Block {student.block}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Room {student.room_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Seat {student.seat_number || 'Not assigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.semester}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Data Section */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-red-100">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Delete Exam Hall Data</h2>
        <p className="text-gray-600 mb-4">
          This action will permanently delete all exam hall allocation data. This cannot be undone.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Delete All Data
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium mb-4">Are you sure you want to delete all exam hall data?</p>
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const response = await fetch('http://localhost:5006/delete-data', {
                      method: 'DELETE',
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setMessage(data.message);
                      setStudents([]);
                    } else {
                      setError(data.error || 'Failed to delete data');
                    }
                  } catch (err) {
                    setError('Failed to connect to the server');
                  } finally {
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-red-400"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete All'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamHallAdmin;
