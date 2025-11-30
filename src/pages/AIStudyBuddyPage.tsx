import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Brain, MessageSquare, Clock, CheckCircle, HelpCircle } from 'lucide-react';

const AIStudyBuddyPage: React.FC = () => {
    // State for Study Planner
    const [subject, setSubject] = useState('');
    const [weakAreas, setWeakAreas] = useState('');
    const [availableTime, setAvailableTime] = useState('');
    const [studyPlan, setStudyPlan] = useState<any>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);

    // State for Practice Arena
    const [practiceSubject, setPracticeSubject] = useState('');
    const [practiceTopic, setPracticeTopic] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);

    // State for Concept Explainer
    const [concept, setConcept] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    const handleGeneratePlan = async () => {
        setLoadingPlan(true);
        try {
            const response = await fetch('http://127.0.0.1:8014/api/study-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, weakAreas, availableTime })
            });
            const data = await response.json();
            if (data.plan) {
                setStudyPlan(JSON.parse(data.plan));
            }
        } catch (error) {
            console.error("Error generating plan:", error);
            alert("Failed to generate study plan.");
        } finally {
            setLoadingPlan(false);
        }
    };

    const handleGenerateQuestions = async () => {
        setLoadingQuestions(true);
        setShowResults(false);
        setSelectedAnswers({});
        try {
            const response = await fetch('http://127.0.0.1:8014/api/practice-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: practiceSubject, topic: practiceTopic })
            });
            const data = await response.json();
            if (data.questions) {
                setQuestions(JSON.parse(data.questions));
            }
        } catch (error) {
            console.error("Error generating questions:", error);
            alert("Failed to generate questions.");
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleExplainConcept = async () => {
        setLoadingExplanation(true);
        try {
            const response = await fetch('http://127.0.0.1:8014/api/explain-concept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concept })
            });
            const data = await response.json();
            if (data.explanation) {
                setExplanation(data.explanation);
            }
        } catch (error) {
            console.error("Error explaining concept:", error);
            alert("Failed to explain concept.");
        } finally {
            setLoadingExplanation(false);
        }
    };

    return (
        <AuthCheck>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-20">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <Brain className="w-10 h-10 text-purple-600" />
                            <h1 className="text-3xl font-bold text-gray-900">AI Study Buddy</h1>
                        </div>

                        <Tabs defaultValue="planner" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                                <TabsTrigger value="planner">Study Planner</TabsTrigger>
                                <TabsTrigger value="practice">Practice Arena</TabsTrigger>
                                <TabsTrigger value="explainer">Concept Explainer</TabsTrigger>
                            </TabsList>

                            {/* Study Planner Tab */}
                            <TabsContent value="planner">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personalized Study Planner</CardTitle>
                                        <CardDescription>Get a customized study schedule based on your weak areas.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Subject</Label>
                                                <Input
                                                    placeholder="e.g., Data Structures"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Available Time</Label>
                                                <Input
                                                    placeholder="e.g., 2 hours/day for 1 week"
                                                    value={availableTime}
                                                    onChange={(e) => setAvailableTime(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Weak Areas</Label>
                                                <Textarea
                                                    placeholder="e.g., Linked Lists, Recursion"
                                                    value={weakAreas}
                                                    onChange={(e) => setWeakAreas(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleGeneratePlan} disabled={loadingPlan} className="w-full bg-purple-600 hover:bg-purple-700">
                                            {loadingPlan ? 'Generating Plan...' : 'Generate Study Plan'}
                                        </Button>

                                        {studyPlan && (
                                            <div className="mt-8 space-y-6 animate-fade-in">
                                                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                                                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Your Study Schedule</h3>
                                                    <div className="space-y-4">
                                                        {studyPlan.schedule?.map((day: any, index: number) => (
                                                            <div key={index} className="bg-white p-4 rounded-md shadow-sm">
                                                                <div className="font-medium text-purple-700 mb-2">{day.day}</div>
                                                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                                                    {day.activities.map((act: string, i: number) => (
                                                                        <li key={i}>{act}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                                                        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                            <CheckCircle className="w-5 h-5" /> Study Tips
                                                        </h3>
                                                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                                                            {studyPlan.tips?.map((tip: string, i: number) => (
                                                                <li key={i}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                                                        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                                                            <BookOpen className="w-5 h-5" /> Resources
                                                        </h3>
                                                        <ul className="list-disc list-inside text-gray-700 space-y-2">
                                                            {studyPlan.resources?.map((res: string, i: number) => (
                                                                <li key={i}>{res}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Practice Arena Tab */}
                            <TabsContent value="practice">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Practice Arena</CardTitle>
                                        <CardDescription>Test your knowledge with AI-generated questions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Subject</Label>
                                                <Input
                                                    placeholder="e.g., Database Management"
                                                    value={practiceSubject}
                                                    onChange={(e) => setPracticeSubject(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Topic</Label>
                                                <Input
                                                    placeholder="e.g., Normalization"
                                                    value={practiceTopic}
                                                    onChange={(e) => setPracticeTopic(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <Button onClick={handleGenerateQuestions} disabled={loadingQuestions} className="w-full bg-indigo-600 hover:bg-indigo-700">
                                            {loadingQuestions ? 'Generating Questions...' : 'Start Quiz'}
                                        </Button>

                                        {questions.length > 0 && (
                                            <div className="mt-8 space-y-8 animate-fade-in">
                                                {questions.map((q, index) => (
                                                    <div key={index} className="bg-white p-6 rounded-lg border shadow-sm">
                                                        <div className="font-medium text-lg mb-4">
                                                            <span className="text-indigo-600 font-bold mr-2">Q{index + 1}.</span>
                                                            {q.question}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {q.options.map((option: string, optIndex: number) => (
                                                                <button
                                                                    key={optIndex}
                                                                    onClick={() => !showResults && setSelectedAnswers({ ...selectedAnswers, [index]: option })}
                                                                    className={`p-3 text-left rounded-md border transition-colors ${showResults
                                                                            ? option === q.correctAnswer
                                                                                ? 'bg-green-100 border-green-500 text-green-800'
                                                                                : selectedAnswers[index] === option
                                                                                    ? 'bg-red-100 border-red-500 text-red-800'
                                                                                    : 'bg-gray-50 border-gray-200'
                                                                            : selectedAnswers[index] === option
                                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                                                : 'hover:bg-gray-50 border-gray-200'
                                                                        }`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {showResults && (
                                                            <div className="mt-4 p-4 bg-yellow-50 rounded-md text-sm text-yellow-800">
                                                                <strong>Explanation:</strong> {q.explanation}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {!showResults && (
                                                    <Button onClick={() => setShowResults(true)} className="w-full" variant="outline">
                                                        Submit Answers
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Concept Explainer Tab */}
                            <TabsContent value="explainer">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Concept Explainer</CardTitle>
                                        <CardDescription>Ask about any concept and get a simple, clear explanation.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-2">
                                            <Label>What do you want to understand?</Label>
                                            <Textarea
                                                placeholder="e.g., Explain the concept of Virtual Memory in OS"
                                                value={concept}
                                                onChange={(e) => setConcept(e.target.value)}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                        <Button onClick={handleExplainConcept} disabled={loadingExplanation} className="w-full bg-teal-600 hover:bg-teal-700">
                                            {loadingExplanation ? 'Explaining...' : 'Explain This'}
                                        </Button>

                                        {explanation && (
                                            <div className="mt-6 bg-teal-50 p-6 rounded-lg border border-teal-100 animate-fade-in">
                                                <h3 className="font-semibold text-teal-900 mb-4 flex items-center gap-2">
                                                    <HelpCircle className="w-5 h-5" /> Explanation
                                                </h3>
                                                <div className="prose prose-teal max-w-none text-gray-700 whitespace-pre-line">
                                                    {explanation}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AuthCheck>
    );
};

export default AIStudyBuddyPage;
