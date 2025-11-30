import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import { FileText, Save } from 'lucide-react';

const AssignmentMarksEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { name?: string; usn?: string; semester?: number; department?: string } | null;

  const [assignmentMarks, setAssignmentMarks] = useState<string[]>(['', '', '', '', '']);

  if (!state) {
    navigate('/select-internals');
    return null;
  }

  const { name = '', usn = '', semester = 0, department = '' } = state;

  const handleAssignmentMarkChange = (index: number, value: string) => {
    const newMarks = [...assignmentMarks];
    newMarks[index] = value;
    setAssignmentMarks(newMarks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert string values to numbers, empty strings become 0
    const marksAsNumbers = assignmentMarks.map(mark => parseInt(mark) || 0);

    const data = {
      student: {
        name,
        usn,
        semester,
        department
      },
      assignmentMarks: marksAsNumbers,
      uploadedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('http://127.0.0.1:8012/api/assignment-marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Assignment marks saved successfully!');
        navigate('/select-internals', { state: { name, usn, semester, department } });
      } else {
        const errorData = await response.json();
        alert(`Failed to save: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving assignment marks:', error);
      alert('An error occurred while saving. Please try again.');
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Assignment Marks Entry</CardTitle>
                <CardDescription>
                  Enter marks for all 5 assignments in semester {semester}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((assignmentNum, index) => (
                      <div key={assignmentNum}>
                        <Label htmlFor={`assignment-${assignmentNum}`}>
                          Assignment {assignmentNum} Marks
                        </Label>
                        <Input
                          id={`assignment-${assignmentNum}`}
                          type="number"
                          value={assignmentMarks[index]}
                          onChange={(e) => handleAssignmentMarkChange(index, e.target.value)}
                          min="0"
                          max="10"
                          placeholder="Enter marks (0-10)"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Assignment Marks
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Student: {name} | USN: {usn} | Semester: {semester} | Dept: {department}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
};

export default AssignmentMarksEntryPage;