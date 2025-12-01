import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SemesterResultUploadPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { name?: string; usn?: string; semester?: number } | null;

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    if (!state) {
        navigate('/student-upload');
        return null;
    }

    const { name = '', usn = '', semester = 0 } = state;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Check file size (max 16MB for MongoDB)
            if (selectedFile.size > 16 * 1024 * 1024) {
                toast.error('File size should be less than 16MB');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a file before uploading.');
            return;
        }

        setUploading(true);

        try {
            // Convert file to base64
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Data = reader.result as string;

                // Send to backend
                const response = await fetch('http://localhost:8017/api/semester-results/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        usn,
                        semester,
                        fileName: file.name,
                        fileData: base64Data,
                        fileType: file.type
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success(data.message || 'Result uploaded successfully!');
                    setUploadSuccess(true);

                    // Reset after 2 seconds
                    setTimeout(() => {
                        setFile(null);
                        setUploadSuccess(false);
                        navigate('/student-upload');
                    }, 2000);
                } else {
                    toast.error(data.error || 'Failed to upload result');
                }

                setUploading(false);
            };

            reader.onerror = () => {
                toast.error('Failed to read file. Please try again.');
                setUploading(false);
            };

            reader.readAsDataURL(file);

        } catch (error) {
            console.error('Error uploading result:', error);
            toast.error('Failed to connect to server. Make sure the backend is running.');
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Upload Section */}
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle>Upload Semester Result</CardTitle>
                            <CardDescription>
                                Upload semester result as PDF or image (max 16MB)
                                <br />
                                <span className="text-xs text-gray-500">Saved to MongoDB database</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <Label htmlFor="file">Select File (PNG, JPG, JPEG, PDF)</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    {file && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    <strong>Student:</strong> {name} | <strong>USN:</strong> {usn} | <strong>Semester:</strong> {semester}
                                </p>
                                <Button type="submit" className="w-full" disabled={uploading || uploadSuccess}>
                                    {uploading ? 'Uploading to MongoDB...' : uploadSuccess ? (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Uploaded Successfully!
                                        </>
                                    ) : 'Upload Result'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SemesterResultUploadPage;