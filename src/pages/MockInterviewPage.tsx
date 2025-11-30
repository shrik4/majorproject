import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Volume2, Play, Send, RefreshCw, Award, MessageSquare, User, Video } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

interface Evaluation {
    rating: string;
    feedback: string;
    improvement: string;
}

const MockInterviewPage: React.FC = () => {
    // Setup State
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [isVoiceMode, setIsVoiceMode] = useState(true);

    // Interview State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Refs
    const recognitionRef = useRef<any>(null);
    const isMounted = useRef(true);
    const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        isMounted.current = true;

        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                if (!isMounted.current) return;
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setUserAnswer(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                if (!isMounted.current) return;
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };
        } else {
            toast.error('Speech recognition is not supported in this browser. Please use Chrome.');
        }

        // Cleanup function
        return () => {
            isMounted.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            window.speechSynthesis.cancel();
            if (speechTimeoutRef.current) {
                clearTimeout(speechTimeoutRef.current);
            }
        };
    }, []);

    // Auto-speak question when index changes if in Voice Mode
    useEffect(() => {
        if (isVoiceMode && questions.length > 0) {
            // Reset state
            setIsListening(false);
            recognitionRef.current?.stop();

            // Small delay to ensure state is settled
            const timer = setTimeout(() => {
                if (isMounted.current) {
                    speakQuestion(questions[currentQuestionIndex]);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentQuestionIndex, questions, isVoiceMode]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speakQuestion = (text: string) => {
        // Cancel any current speech
        window.speechSynthesis.cancel();

        if (!isMounted.current) return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Get available voices and select a natural-sounding one
        const voices = window.speechSynthesis.getVoices();

        // Try to find a high-quality English voice (prefer female voices for professional tone)
        const preferredVoice = voices.find(voice =>
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Samantha') || voice.name.includes('Karen')) &&
            voice.lang.startsWith('en')
        ) || voices.find(voice => voice.lang.startsWith('en-US') && voice.name.includes('Female'))
            || voices.find(voice => voice.lang.startsWith('en-US'))
            || voices[0];

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Adjust speech parameters for more natural, professional sound
        utterance.rate = 0.9;  // Slightly slower for clarity and professionalism
        utterance.pitch = 1.0; // Natural pitch
        utterance.volume = 1.0; // Full volume

        setIsSpeaking(true);

        utterance.onend = () => {
            if (!isMounted.current) return;
            setIsSpeaking(false);

            // Auto-start listening after speaking in Voice Mode
            if (isVoiceMode) {
                speechTimeoutRef.current = setTimeout(() => {
                    if (!isMounted.current) return;
                    setUserAnswer(''); // Clear previous answer for new question
                    try {
                        recognitionRef.current?.start();
                        setIsListening(true);
                        toast.info('Listening for your answer...');
                    } catch (e) {
                        console.error("Failed to start recognition:", e);
                    }
                }, 500);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleGenerateQuestions = async () => {
        if (!topic) {
            toast.error('Please enter a topic or skill.');
            return;
        }

        setIsGenerating(true);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setEvaluation(null);
        setUserAnswer('');

        try {
            const response = await fetch('http://localhost:8015/api/interview/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });

            const data = await response.json();
            if (response.ok) {
                if (!isMounted.current) return;
                let parsedQuestions = [];
                try {
                    parsedQuestions = JSON.parse(data.questions);
                } catch (e) {
                    // Fallback if AI returns plain text list
                    parsedQuestions = data.questions.split('\n').filter((q: string) => q.trim().length > 0);
                }
                setQuestions(parsedQuestions);
                toast.success('Interview questions generated!');
            } else {
                toast.error(data.error || 'Failed to generate questions.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to connect to the server.');
        } finally {
            if (isMounted.current) {
                setIsGenerating(false);
            }
        }
    };

    const handleEvaluateAnswer = async () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }

        if (!userAnswer) {
            toast.error('Please provide an answer first.');
            return;
        }

        setIsEvaluating(true);
        try {
            const response = await fetch('http://localhost:8015/api/interview/evaluate-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: questions[currentQuestionIndex],
                    answer: userAnswer
                }),
            });

            const data = await response.json();
            if (response.ok) {
                if (!isMounted.current) return;
                const evalData = JSON.parse(data.evaluation);
                setEvaluation(evalData);
            } else {
                toast.error(data.error || 'Failed to evaluate answer.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to connect to the server.');
        } finally {
            if (isMounted.current) {
                setIsEvaluating(false);
            }
        }
    };

    const nextQuestion = () => {
        // Stop listening if active
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        }
        // Stop speaking if active
        window.speechSynthesis.cancel();

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserAnswer('');
            setEvaluation(null);
        } else {
            toast.success('Interview completed!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-campus-800">AI Mock Interviewer</h1>

                    {/* Mode Switch */}
                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm border">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${!isVoiceMode ? 'bg-campus-100 text-campus-800 font-medium' : 'text-gray-500'}`}>
                            <MessageSquare size={18} />
                            <span className="text-sm">Text Mode</span>
                        </div>
                        <Switch
                            checked={isVoiceMode}
                            onCheckedChange={setIsVoiceMode}
                            className="data-[state=checked]:bg-campus-600"
                        />
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${isVoiceMode ? 'bg-campus-100 text-campus-800 font-medium' : 'text-gray-500'}`}>
                            <Video size={18} />
                            <span className="text-sm">Human Mode</span>
                        </div>
                    </div>
                </div>

                {/* Setup Section */}
                {questions.length === 0 && (
                    <Card className="max-w-2xl mx-auto shadow-lg animate-fade-in">
                        <CardHeader>
                            <CardTitle>Start Your Interview</CardTitle>
                            <CardDescription>Enter your skills, job role, or paste your resume summary to get started.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic / Skills</Label>
                                    <Textarea
                                        id="topic"
                                        placeholder="e.g., React, Node.js, Python, Data Science, or paste resume summary..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={handleGenerateQuestions}
                                disabled={isGenerating || !topic}
                                className="w-full bg-campus-600 hover:bg-campus-700"
                            >
                                {isGenerating ? 'Generating Questions...' : 'Start Interview'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* Interview Section */}
                {questions.length > 0 && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

                        {/* HUMAN MODE UI */}
                        {isVoiceMode ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Interviewer Avatar Area */}
                                <Card className="shadow-lg border-0 overflow-hidden relative h-[400px] bg-gray-900 flex flex-col items-center justify-center">
                                    {/* Interviewer Image */}
                                    <div className="absolute inset-0 opacity-90">
                                        <img
                                            src="/interviewer.png"
                                            alt="AI Interviewer"
                                            className="w-full h-full object-cover"
                                            style={{ objectPosition: 'center 20%' }}
                                        />
                                    </div>

                                    {/* Speaking Indicator */}
                                    {isSpeaking && (
                                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 text-white text-center z-10">
                                        <p className="font-medium text-lg">AI Interviewer</p>
                                        <p className="text-sm text-gray-300">{isSpeaking ? "Speaking..." : "Listening..."}</p>
                                    </div>
                                </Card>

                                {/* User Interaction Area */}
                                <Card className="shadow-lg flex flex-col h-[400px]">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Your Answer</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow flex flex-col">
                                        <div className="flex-grow bg-gray-50 rounded-md p-4 mb-4 overflow-y-auto border border-gray-100">
                                            {userAnswer ? (
                                                <p className="text-gray-800">{userAnswer}</p>
                                            ) : (
                                                <p className="text-gray-400 italic text-center mt-10">
                                                    {isListening ? "Listening... Speak your answer." : "Waiting for question..."}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center gap-4">
                                            <div className={`p-3 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                                                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                                            </div>
                                            <Button
                                                onClick={handleEvaluateAnswer}
                                                disabled={isEvaluating || !userAnswer}
                                                className="bg-green-600 hover:bg-green-700 w-full"
                                            >
                                                {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            /* TEXT MODE UI (Original) */
                            <div className="space-y-6">
                                <Card className="shadow-md border-l-4 border-l-campus-500">
                                    <CardHeader>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                            <Button variant="ghost" size="sm" onClick={() => speakQuestion(questions[currentQuestionIndex])}>
                                                <Volume2 size={20} className="text-campus-600" />
                                            </Button>
                                        </div>
                                        <CardTitle className="text-xl md:text-2xl text-gray-800">
                                            {questions[currentQuestionIndex]}
                                        </CardTitle>
                                    </CardHeader>
                                </Card>

                                <Card className="shadow-md">
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <Label>Your Answer</Label>
                                            <div className="relative">
                                                <Textarea
                                                    value={userAnswer}
                                                    onChange={(e) => setUserAnswer(e.target.value)}
                                                    placeholder="Type your answer here..."
                                                    className="min-h-[150px] pr-12"
                                                />
                                            </div>

                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={handleEvaluateAnswer}
                                                    disabled={isEvaluating || !userAnswer}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={nextQuestion}
                                                    className="flex-1"
                                                >
                                                    Next Question <Play size={16} className="ml-2" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Feedback Section (Shared) */}
                        {evaluation && (
                            <Card className="shadow-lg bg-blue-50 border-blue-100 animate-slide-up">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-blue-800">
                                        <Award size={24} /> AI Feedback
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700">Rating:</span>
                                        <span className="text-lg font-bold text-blue-600">{evaluation.rating}/10</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">What was good:</h4>
                                        <p className="text-gray-600">{evaluation.feedback}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-1">Improvements:</h4>
                                        <p className="text-gray-600">{evaluation.improvement}</p>
                                    </div>
                                    <Button onClick={nextQuestion} className="w-full mt-4">
                                        Next Question <Play size={16} className="ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MockInterviewPage;
