import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import { Search } from 'lucide-react';

const StudentPerformanceAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    name?: string;
    usn?: string;
    semester?: number;
    department?: string;
    internalData?: any[];
    assignmentData?: any[];
  } | null;

  const [searchName, setSearchName] = useState('');
  const [searchUSN, setSearchUSN] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName && !searchUSN) {
      alert('Please enter either Name or USN to search');
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = searchName || searchUSN;
      const response = await fetch(`http://127.0.0.1:8012/api/student-performance?search=${encodeURIComponent(searchTerm)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // Group results by type
          const internalData = data.results.filter((r: any) => r.type === 'internal');
          const assignmentData = data.results.filter((r: any) => r.type === 'assignment');

          // Get student info from first result
          const firstResult = data.results[0];

          // Navigate to analysis view with the data
          navigate('/performance-analyzer', {
            state: {
              name: firstResult.student.name,
              usn: firstResult.student.usn,
              semester: firstResult.student.semester,
              department: firstResult.student.department,
              internalData: internalData,
              assignmentData: assignmentData
            }
          });
        } else {
          alert('No student found with the given name or USN');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to search student data');
      }
    } catch (error) {
      console.error('Error searching student:', error);
      alert('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  if (!state) {
    // Show search form if no state is provided
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-indigo-600" />
                  </div>
                  <CardTitle>Student Performance Analyzer</CardTitle>
                  <CardDescription>
                    Enter student Name or USN to analyze performance data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <Label htmlFor="searchName">Name (Optional)</Label>
                      <Input
                        id="searchName"
                        type="text"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="searchUSN">USN (Optional)</Label>
                      <Input
                        id="searchUSN"
                        type="text"
                        value={searchUSN}
                        onChange={(e) => setSearchUSN(e.target.value)}
                        placeholder="Enter student USN"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSearching}>
                      {isSearching ? 'Searching...' : 'Search Student'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  const { name, usn, semester, department, internalData, assignmentData } = state;

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Student Performance Analysis</CardTitle>
                <CardDescription>
                  Semester {semester} Results for {name} ({usn}) - {department}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Internal Marks Section */}
            {internalData && internalData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Internal Marks</CardTitle>
                  <CardDescription>Subject-wise internal examination marks</CardDescription>
                </CardHeader>
                <CardContent>
                  {internalData.map((record: any, idx: number) => (
                    <div key={idx} className="mb-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Internal: {record.internal} | Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="space-y-2">
                        {record.subjects?.map((subject: string, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded">
                            <div className="font-medium mb-1">{subject}</div>
                            <div className="flex justify-between text-sm">
                              <span>Subject Code: {record.subjectCodes?.[index] || 'N/A'}</span>
                              <span>Marks: {record.internalMarks?.[index] || 'N/A'} / 50</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Assignment Marks Section */}
            {assignmentData && assignmentData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Marks</CardTitle>
                  <CardDescription>Marks for all 5 assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  {assignmentData.map((record: any, idx: number) => (
                    <div key={idx} className="mb-6">
                      <p className="text-sm text-gray-600 mb-3">
                        Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="grid grid-cols-5 gap-4">
                        {record.assignmentMarks?.map((mark: number, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-center">
                            <div className="text-sm text-gray-600">Assignment {index + 1}</div>
                            <div className="text-lg font-bold">{mark} / 10</div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <div className="font-medium">
                          Total Assignment Marks: {record.assignmentMarks?.reduce((sum: number, mark: number) => sum + mark, 0)} / 50
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* No Data Message */}
            {(!internalData || internalData.length === 0) && (!assignmentData || assignmentData.length === 0) && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">No performance data found for this student.</p>
                </CardContent>
              </Card>
            )}

            <Button onClick={() => navigate('/performance-analyzer')} variant="outline" className="w-full">
              Search Another Student
            </Button>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default StudentPerformanceAnalyzerPage;