import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from '@/components/Navbar';
import { Upload, BookOpen } from 'lucide-react';

interface Subject {
    _id: string;
    name: string;
    code: string;
    semester: string;
    department: string;
}

const StudentUploadPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { name?: string; usn?: string; semester?: number; internal?: string; department?: string };

    const [name, setName] = useState('');
    const [usn, setUsn] = useState('');
    const [department, setDepartment] = useState('');
    const [fetchedSubjects, setFetchedSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);

    const semester = state?.semester;
    const currentDepartment = state?.department;

    useEffect(() => {
        if (semester && currentDepartment) {
            fetchSubjects();
        }
    }, [semester, currentDepartment]);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8012/api/subjects');
            if (response.ok) {
                const data: Subject[] = await response.json();
                // Filter subjects by semester and department
                const filtered = data.filter(
                    s => s.semester === semester?.toString() && s.department === currentDepartment
                );
                setFetchedSubjects(filtered);
            } else {
                console.error('Failed to fetch subjects');
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const subjects = fetchedSubjects.map(s => ({ code: s.code, title: s.name }));

    // For upload form - using strings instead of numbers
    const [internalMarks, setInternalMarks] = useState<string[]>([]);

    useEffect(() => {
        if (subjects.length > 0) {
            setInternalMarks(new Array(subjects.length).fill(''));
        }
    }, [fetchedSubjects]);

    const handleSubmitInitial = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && usn && department) {
            navigate('/select-semester', { state: { name, usn, department } });
        }
    };

    const handleInternalMarkChange = (index: number, value: string) => {
        const newMarks = [...internalMarks];
        newMarks[index] = value;
        setInternalMarks(newMarks);
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Convert string values to numbers, empty strings become 0
        const marksAsNumbers = internalMarks.map(mark => parseInt(mark) || 0);

        const data = {
            student: {
                name: state?.name || '',
                usn: state?.usn || '',
                semester: state?.semester || 0,
                department: state?.department || ''
            },
            internal: state?.internal || '',
            subjects: subjects.map(s => s.title),
            subjectCodes: subjects.map(s => s.code),
            internalMarks: marksAsNumbers,
            uploadedAt: new Date().toISOString(),
        };

        try {
            const response = await fetch('http://127.0.0.1:8012/api/student-performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                alert('Marks uploaded successfully!');
                navigate('/home');
            } else {
                const errorData = await response.json();
                alert(`Upload failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error uploading data:', error);
            alert('An error occurred while uploading. Please try again.');
        }
    };

    if (state && state.internal) {
        // Upload form
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-6 h-6 text-blue-600" />
                                </div>
                                <CardTitle>Upload Marks for {state?.internal}</CardTitle>
                                <CardDescription>
                                    Student: {state?.name || 'Unknown'} | USN: {state?.usn || 'Unknown'} | Sem: {state?.semester} | Dept: {state?.department}
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Internal Marks Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center space-x-2">
                                    <BookOpen className="w-5 h-5" />
                                    <CardTitle>Internal Marks</CardTitle>
                                </div>
                                <CardDescription>Enter marks for each subject component</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading ? (
                                    <p className="text-center">Loading subjects...</p>
                                ) : subjects.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {subjects.map((subject, index) => (
                                            <div key={index}>
                                                <Label htmlFor={`internal-${index}`}>{subject.title} ({subject.code})</Label>
                                                <Input
                                                    id={`internal-${index}`}
                                                    type="number"
                                                    value={internalMarks[index]}
                                                    onChange={(e) => handleInternalMarkChange(index, e.target.value)}
                                                    min="0"
                                                    max="50"
                                                    placeholder="Enter mark"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        No subjects found for this semester and department.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Button onClick={handleUploadSubmit} className="w-full" size="lg" disabled={subjects.length === 0}>
                            Upload Marks
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Initial form
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle>Student Upload</CardTitle>
                            <CardDescription>
                                Enter your details to upload your information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitInitial} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="usn">USN</Label>
                                    <Input
                                        id="usn"
                                        type="text"
                                        value={usn}
                                        onChange={(e) => setUsn(e.target.value)}
                                        required
                                        placeholder="Enter your USN"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select onValueChange={setDepartment} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AIML">AIML</SelectItem>
                                            <SelectItem value="CSE">CSE</SelectItem>
                                            <SelectItem value="ISE">ISE</SelectItem>
                                            <SelectItem value="ECE">ECE</SelectItem>
                                            <SelectItem value="MECH">MECH</SelectItem>
                                            <SelectItem value="CIVIL">CIVIL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full">
                                    Submit
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentUploadPage;