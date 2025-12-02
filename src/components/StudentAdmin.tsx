import React, { useState, useEffect } from 'react';

interface Student {
  'Sl. No.': number;
  'USN': string;
  'Student Name': string;
  'Year': string;
}

const StudentAdmin: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const API_BASE_URL = 'http://localhost:5002/admin';

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleUploadCsv = async () => {
    if (csvFile) {
      const formData = new FormData();
      formData.append('file', csvFile);

      try {
        const response = await fetch(`${API_BASE_URL}/upload_student_data`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.text(); // Assuming Flask returns a redirect or flash message
        console.log(result);
        fetchStudents(); // Refresh student list
        setCsvFile(null);
      } catch (error) {
        console.error('Error uploading CSV:', error);
      }
    }
  };

  return (
    <div>
      <div className="mb-6 p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-3">Upload Student Data (CSV)</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvFileChange}
          className="mb-3"
        />
        <button
          onClick={handleUploadCsv}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          disabled={!csvFile}
        >
          Upload CSV
        </button>
      </div>

      <div className="p-4 border rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-3">Existing Students</h3>
        {students.length === 0 ? (
          <p>No student data available. Upload a CSV to add students.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Sl. No.</th>
                <th className="py-2 px-4 border-b">USN</th>
                <th className="py-2 px-4 border-b">Student Name</th>
                <th className="py-2 px-4 border-b">Year</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{student['Sl. No.']}</td>
                  <td className="py-2 px-4 border-b text-center">{student.USN}</td>
                  <td className="py-2 px-4 border-b text-center">{student['Student Name']}</td>
                  <td className="py-2 px-4 border-b text-center">{student.Year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentAdmin;