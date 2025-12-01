import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from '@/components/Navbar';
import { Download, Search, Database } from 'lucide-react';
import { toast } from 'sonner';

interface SemesterResult {
    _id: string;
    name: string;
    usn: string;
    semester: number;
    fileName: string;
    fileType: string;
    uploadedAt: string;
}

const SearchResultsPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SemesterResult[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter a student name or USN to search');
            return;
        }

        setSearching(true);

        try {
            const response = await fetch(`http://localhost:8017/api/semester-results/search?query=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (response.ok) {
                setSearchResults(data.results);
                if (data.count === 0) {
                    toast.error('No results found for this student');
                } else {
                    toast.success(`Found ${data.count} result(s)`);
                }
            } else {
                toast.error(data.error || 'Failed to search results');
            }
        } catch (error) {
            console.error('Error searching:', error);
            toast.error('Failed to connect to server. Make sure the backend is running.');
        } finally {
            setSearching(false);
        }
    };

    const handleDownload = async (result: SemesterResult) => {
        try {
            toast.info('Downloading...');

            const response = await fetch(`http://localhost:8017/api/semester-results/download/${result._id}`);
            const data = await response.json();

            if (response.ok) {
                // Create a link element and trigger download
                const link = document.createElement('a');
                link.href = data.fileData;
                link.download = data.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('Download started!');
            } else {
                toast.error(data.error || 'Failed to download file');
            }
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Search className="w-6 h-6" />
                                Search Student Results
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                Search by student name or USN to view and download results from MongoDB
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter student name or USN..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !searching && handleSearch()}
                                    className="text-lg"
                                />
                                <Button onClick={handleSearch} size="lg" disabled={searching}>
                                    <Search className="w-4 h-4 mr-2" />
                                    {searching ? 'Searching...' : 'Search'}
                                </Button>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <h3 className="font-semibold text-gray-700 text-lg">
                                        Search Results ({searchResults.length})
                                    </h3>
                                    {searchResults.map((result) => (
                                        <Card key={result._id} className="bg-white border-2 hover:border-blue-300 transition-colors">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-2">
                                                        <h4 className="font-bold text-xl">{result.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            <strong>USN:</strong> {result.usn} | <strong>Semester:</strong> {result.semester}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Uploaded: {new Date(result.uploadedAt).toLocaleDateString()} at {new Date(result.uploadedAt).toLocaleTimeString()}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            File: {result.fileName}
                                                        </p>
                                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                                            <Database className="w-3 h-3" />
                                                            Stored in MongoDB
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleDownload(result)}
                                                        variant="outline"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {searchQuery && searchResults.length === 0 && !searching && (
                                <div className="text-center py-12 text-gray-500">
                                    <Search className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                    <p className="text-lg">No results found</p>
                                    <p className="text-sm">Try searching with a different name or USN</p>
                                </div>
                            )}

                            {!searchQuery && searchResults.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <Database className="w-16 h-16 mx-auto mb-3 opacity-20" />
                                    <p className="text-lg">Enter a student name or USN to search</p>
                                    <p className="text-sm text-gray-400">Results are fetched from MongoDB database</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
