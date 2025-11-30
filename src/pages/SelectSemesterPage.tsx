import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { GraduationCap } from 'lucide-react';

const SelectSemesterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name?: string; usn?: string; department?: string; email?: string } | null;

  useEffect(() => {
    if (!state) {
      navigate('/student-upload');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { name = '', usn = '', department = '', email = '' } = state;

  const handleSemesterSelect = (semester: number) => {
    navigate('/select-internals', { state: { name, usn, department, semester, email } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Select Semester</CardTitle>
              <CardDescription>
                Choose your current semester to proceed with the upload process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }, (_, i) => i + 1).map((semester) => (
                  <Button
                    key={semester}
                    onClick={() => handleSemesterSelect(semester)}
                    className="h-16 text-lg font-semibold"
                    variant="outline"
                  >
                    Semester {semester}
                  </Button>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Student: {name} | USN: {usn} | Dept: {department}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelectSemesterPage;