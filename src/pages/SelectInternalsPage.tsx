import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { ClipboardList } from 'lucide-react';

const SelectInternalsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name?: string; usn?: string; semester?: number; department?: string; email?: string } | null;

  useEffect(() => {
    if (!state) {
      navigate('/student-upload');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { name = '', usn = '', semester = 0, department = '', email = '' } = state;

  const handleInternalSelect = (internal: string) => {
    navigate('/student-upload', { state: { name, usn, semester, department, internal, email } });
  };

  const handleUploadResult = () => {
    navigate('/upload-semester-result', { state: { name, usn, semester, department, email } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Select Internal</CardTitle>
              <CardDescription>
                Choose the internal exam for semester {semester}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {['Internal 1', 'Internal 2'].map((internal) => (
                  <Button
                    key={internal}
                    onClick={() => handleInternalSelect(internal)}
                    className="h-14 text-lg font-semibold"
                    variant="outline"
                  >
                    {internal}
                  </Button>
                ))}
                <Button
                  onClick={() => navigate('/assignment-marks-entry', { state: { name, usn, semester, department, email } })}
                  className="h-14 text-lg font-semibold bg-purple-500 hover:bg-purple-600 text-white"
                  variant="default"
                >
                  Assignment Marks
                </Button>
                <Button
                  onClick={handleUploadResult}
                  className="h-14 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white"
                  variant="default"
                >
                  Upload Semester Result
                </Button>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Student: {name} | USN: {usn} | Sem: {semester} | Dept: {department}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelectInternalsPage;