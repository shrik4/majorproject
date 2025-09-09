import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';

// --- HELPER COMPONENTS ---

// Graduation Cap Icon for the header
const GraduationCapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

// Sparkles Icon for the Gemini feature button
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M12 3L9.5 8.5L4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"/>
    </svg>
);

// Component to display student details in a card format
const StudentResultCard = ({ student, getPepTalk, pepTalk, isPepTalkLoading }) => (
  <div className="mt-6 w-full bg-blue-50 border border-blue-100 rounded-xl p-4 sm:p-6 shadow-sm animate-fade-in">
    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center break-words">{student.name}</h3>
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-gray-600 text-base sm:text-lg">Registration No:</span>
        <span className="font-mono bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-base sm:text-lg w-full sm:w-auto text-center">{student.regNo}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-gray-600 text-base sm:text-lg">Class:</span>
        <span className="text-blue-600 text-base sm:text-lg font-medium">{student.hall || 'Not assigned'}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-gray-600 text-base sm:text-lg">Floor:</span>
        <span className="text-blue-600 text-base sm:text-lg font-medium">{student.room || 'Not assigned'}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-gray-600 text-base sm:text-lg">Seat Number:</span>
        <span className="text-blue-600 text-base sm:text-lg font-medium">{student.seat || 'Not assigned'}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <span className="text-gray-600 text-base sm:text-lg">Semester:</span>
        <span className="text-blue-600 text-base sm:text-lg font-medium">{student.semester}</span>
      </div>
    </div>

    {/* Gemini-powered Pep Talk Section */}
    <div className="mt-6 sm:mt-8 text-center px-2 sm:px-0">
        {!pepTalk && (
             <button
                onClick={() => getPepTalk(student.name)}
                disabled={isPepTalkLoading}
                className="w-full bg-purple-600 text-white p-3 sm:p-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:translate-y-[-1px] active:translate-y-[1px]"
            >
                {isPepTalkLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </span>
                ) : (
                    <>
                        <SparklesIcon />
                        <span>Get Exam Day Pep Talk</span>
                    </>
                )}
            </button>
        )}
       
        {pepTalk && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in">
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">{pepTalk}</p>
            </div>
        )}
    </div>
  </div>
);

export default function ExamHallFinderPage() {
  const [regNo, setRegNo] = useState('');
  const [foundStudent, setFoundStudent] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pepTalk, setPepTalk] = useState('');
  const [isPepTalkLoading, setIsPepTalkLoading] = useState(false);

  // Handle the search logic by fetching from the backend
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!regNo.trim()) {
      setError('Please enter a registration number.');
      return;
    }

    setIsLoading(true);
    setFoundStudent(null);
    setError('');
    setPepTalk('');

    try {
      const response = await fetch(`http://127.0.0.1:5006/search/${regNo.trim()}`);
      
      if (response.ok) {
        const student = await response.json();
        setFoundStudent(student);
      } else {
         const errorData = await response.json();
         setError(errorData.error === 'Student not found' 
           ? 'No student found with that registration number.' 
           : 'Could not connect to the server. Is it running?');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Failed to connect to the server. Please ensure it is running and accessible.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get pep talk from backend
  const getPepTalk = async (studentName) => {
    setIsPepTalkLoading(true);
    setPepTalk('');

    try {
      const response = await fetch(`http://localhost:5006/pep-talk/${encodeURIComponent(studentName)}`);
      const data = await response.json();

      if (response.ok && data.pep_talk) {
        setPepTalk(data.pep_talk);
      } else {
        setPepTalk("Couldn't generate a pep talk right now, but you've got this!");
      }
    } catch (error) {
      console.error("Pep talk error:", error);
      setPepTalk("Couldn't generate a pep talk, but remember to stay positive. Good luck!");
    } finally {
      setIsPepTalkLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setRegNo(e.target.value);
    if(foundStudent) setFoundStudent(null);
    if(error) setError('');
    if(pepTalk) setPepTalk('');
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-12">
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 0.5s ease-out forwards;
            }
            @media (max-width: 640px) {
              .mobile-card {
                box-shadow: none;
                border-radius: 0;
                padding: 1rem;
              }
            }
          `}</style>
          <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col items-center justify-center text-center mb-8 px-4">
              <div className="bg-blue-600 p-4 rounded-full mb-6 shadow-md transform transition-transform hover:scale-105">
                <GraduationCapIcon />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Exam Hall Finder</h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-sm">Enter your registration number to find your seat.</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-6 px-4">
              <div className="relative">
                <label htmlFor="regNo" className="sr-only">Registration Number</label>
                <input
                  id="regNo"
                  type="text"
                  value={regNo}
                  onChange={handleInputChange}
                  placeholder="1RV21CS001"
                  className="w-full p-4 bg-blue-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-base sm:text-lg placeholder-gray-400 transition-shadow hover:shadow-sm"
                  aria-label="Registration Number"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white p-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:bg-blue-400 disabled:cursor-not-allowed transform hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : 'Find My Hall'}
              </button>
            </form>

            {/* Display results or errors */}
            <div className="mt-4 min-h-[240px]">
              {error && (
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg animate-fade-in">
                  {error}
                </div>
              )}
              {foundStudent && (
                <StudentResultCard 
                  student={foundStudent} 
                  getPepTalk={getPepTalk}
                  pepTalk={pepTalk}
                  isPepTalkLoading={isPepTalkLoading}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
