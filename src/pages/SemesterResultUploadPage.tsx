import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { Upload, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SemesterResultUploadPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { name?: string; usn?: string; semester?: number } | null;

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [generatingResult, setGeneratingResult] = useState(false);
    const [generatedResult, setGeneratedResult] = useState<{ percentage: number; sgpa: number; grade: string; subjects: string[]; marks: number[] } | null>(null);

    const { toast } = useToast();

    if (!state) {
        navigate('/student-upload');
        return null;
    }

    const { name = '', usn = '', semester = 0 } = state;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "No file selected",
                description: "Please select a file before uploading.",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('usn', usn);
        formData.append('semester', semester.toString());

        try {
            const response = await fetch('http://127.0.0.1:8000/api/upload-semester-result', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadSuccess(true);
                toast({
                    title: "Uploaded Successfully.",
                    description: "",
                    variant: "default",
                });
            } else {
                const errorData = await response.json();
                toast({
                    title: "Upload Failed",
                    description: `Failed to upload result: ${errorData.message}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error uploading result:', error);
            toast({
                title: "Error",
                description: "An error occurred while uploading the result. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleGenerate = async () => {
        if (!file) return;

        setGeneratingResult(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('usn', usn);
        formData.append('semester', semester.toString());

        try {
            const response = await fetch('http://127.0.0.1:8000/api/generate-result', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setGeneratedResult(data.result);
            } else {
                const errorData = await response.json();
                toast({
                    title: "Generation Failed",
                    description: `Failed to generate result: ${errorData.message}`,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error generating result:', error);
            toast({
                title: "Error",
                description: "An error occurred while generating the result. Please try again.",
                variant: "destructive",
            });
        } finally {
            setGeneratingResult(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card className={`transition-opacity duration-500 ${uploadSuccess ? 'opacity-0' : 'opacity-100'}`}>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle>Upload Semester Result</CardTitle>
                            <CardDescription>
                                Upload your semester result as an image or PDF.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <Label htmlFor="file">Select File (PNG, JPG, JPEG, PDF)</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.pdf,.txt"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    Student: {name} | USN: {usn} | Semester: {semester}
                                </p>
                                <Button type="submit" className="w-full" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload Result'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className={`transition-opacity duration-500 ${uploadSuccess ? 'opacity-100' : 'opacity-0'} text-center`}>
                        <Button onClick={handleGenerate} className="w-full h-14 text-lg font-semibold" disabled={generatingResult}>
                            {generatingResult ? 'Generating...' : 'Generate Result'}
                        </Button>
                    </div>
                    {generatingResult && (
                        <div className="mt-6 text-center">
                            <Loader className="w-6 h-6 animate-spin mx-auto" />
                            <p className="mt-2 text-gray-600">Generating result...</p>
                        </div>
                    )}
                    {generatedResult && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>AI-Generated Result</CardTitle>
                                <CardDescription>Extracted subjects, marks, and calculated SGPA & percentage</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Subjects and Marks:</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {generatedResult.subjects.map((subject, index) => (
                                                <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                                                    <span>{subject}</span>
                                                    <span className="font-bold">{generatedResult.marks[index]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{generatedResult.percentage}%</p>
                                            <p className="text-sm text-gray-600">Percentage</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{generatedResult.sgpa}</p>
                                            <p className="text-sm text-gray-600">SGPA</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-600">{generatedResult.grade}</p>
                                            <p className="text-sm text-gray-600">Grade</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <Button
                                            onClick={() => navigate('/performance-analyzer', {
                                                state: {
                                                    name,
                                                    usn,
                                                    semester,
                                                    result: generatedResult
                                                }
                                            })}
                                            className="w-full"
                                        >
                                            View Detailed Analysis
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div >
    );
};

export default SemesterResultUploadPage;