import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus, Sparkles, Award } from 'lucide-react';

interface Topper {
    rank: number;
    name: string;
    usn: string;
    department: string;
    semester: number;
    totalMarks: number;
    averageMarks: number;
    consistencyScore: number;
    strongSubjects: string[];
    aiInsight: string;
    performanceTrend: 'improving' | 'declining' | 'stable';
}

interface ToppersResponse {
    toppers: Topper[];
    overallAnalysis: string;
    generatedAt: string;
}

const ClassToppersPage: React.FC = () => {
    const [department, setDepartment] = useState('');
    const [semester, setSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [toppersData, setToppersData] = useState<ToppersResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!department || !semester) {
            setError('Please select both department and semester');
            return;
        }

        setLoading(true);
        setError(null);
        setToppersData(null);

        try {
            const response = await fetch(
                `http://127.0.0.1:8012/api/toppers/ai-analysis?department=${department}&semester=${semester}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch toppers');
            }

            const data: ToppersResponse = await response.json();
            setToppersData(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="text-4xl">🥇</span>;
            case 2:
                return <span className="text-4xl">🥈</span>;
            case 3:
                return <span className="text-4xl">🥉</span>;
            default:
                return null;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'improving':
                return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'declining':
                return <TrendingDown className="w-5 h-5 text-red-500" />;
            default:
                return <Minus className="w-5 h-5 text-gray-500" />;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-400 to-yellow-600';
            case 2:
                return 'from-gray-300 to-gray-500';
            case 3:
                return 'from-orange-400 to-orange-600';
            default:
                return 'from-blue-400 to-blue-600';
        }
    };

    return (
        <AuthCheck>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 pt-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Trophy className="w-10 h-10 text-yellow-500" />
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    AI-Powered Class Toppers
                                </h1>
                                <Sparkles className="w-10 h-10 text-purple-500" />
                            </div>
                            <p className="text-gray-600 text-lg">
                                Discover the top performers with intelligent AI analysis
                            </p>
                        </div>

                        {/* Selection Card */}
                        <Card className="mb-8 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5" />
                                    Select Department & Semester
                                </CardTitle>
                                <CardDescription>
                                    Choose a department and semester to analyze top performers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Department</label>
                                        <Select value={department} onValueChange={setDepartment}>
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
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Semester</label>
                                        <Select value={semester} onValueChange={setSemester}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Semester" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                                    <SelectItem key={sem} value={sem.toString()}>
                                                        Semester {sem}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            onClick={handleAnalyze}
                                            disabled={loading || !department || !semester}
                                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2" />
                                                    Analyze with AI
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                        {error}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Results */}
                        {toppersData && (
                            <div className="space-y-6">
                                {/* Top 3 Students */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {toppersData.toppers.map((topper) => (
                                        <Card
                                            key={topper.rank}
                                            className={`relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
                                        >
                                            {/* Rank Badge */}
                                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getRankColor(topper.rank)} opacity-10 rounded-bl-full`}></div>
                                            <div className="absolute top-4 right-4">
                                                {getRankIcon(topper.rank)}
                                            </div>

                                            <CardHeader>
                                                <CardTitle className="text-2xl">{topper.name}</CardTitle>
                                                <CardDescription className="text-base font-medium">
                                                    {topper.usn}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-4">
                                                {/* Total Marks */}
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-gray-600">Total Marks</span>
                                                        <span className="text-2xl font-bold text-indigo-600">{topper.totalMarks}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full bg-gradient-to-r ${getRankColor(topper.rank)}`}
                                                            style={{ width: `${(topper.totalMarks / 500) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Average & Consistency */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-blue-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Average</p>
                                                        <p className="text-lg font-bold text-blue-600">{topper.averageMarks}</p>
                                                    </div>
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-600 mb-1">Consistency</p>
                                                        <p className="text-lg font-bold text-green-600">{topper.consistencyScore}</p>
                                                    </div>
                                                </div>

                                                {/* Strong Subjects */}
                                                {topper.strongSubjects.length > 0 && (
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-2">Strong Subjects</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {topper.strongSubjects.map((subject, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {subject}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* AI Insight */}
                                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <Sparkles className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                                                        <p className="text-xs font-semibold text-purple-700">AI Insight</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{topper.aiInsight}</p>
                                                </div>

                                                {/* Performance Trend */}
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <span className="text-xs text-gray-600">Performance Trend</span>
                                                    <div className="flex items-center gap-2">
                                                        {getTrendIcon(topper.performanceTrend)}
                                                        <span className="text-sm font-medium capitalize">{topper.performanceTrend}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* Overall Analysis */}
                                <Card className="shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-600" />
                                            Overall AI Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-700 leading-relaxed text-lg">{toppersData.overallAnalysis}</p>
                                        <p className="text-xs text-gray-500 mt-4">
                                            Generated at: {new Date(toppersData.generatedAt).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </AuthCheck>
    );
};

export default ClassToppersPage;
