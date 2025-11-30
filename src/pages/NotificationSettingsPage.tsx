import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Send, CheckCircle, XCircle, Clock } from 'lucide-react';

interface NotificationHistory {
    _id: string;
    userEmail: string;
    type: string;
    title: string;
    status: string;
    sentAt: string;
}

const NotificationSettingsPage: React.FC = () => {
    const [testEmail, setTestEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<NotificationHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8013/api/notifications/history?limit=20');
            if (response.ok) {
                const data = await response.json();
                setHistory(data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        try {
            const response = await fetch('http://127.0.0.1:8013/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: testEmail }),
            });

            if (response.ok) {
                alert('Test email sent successfully! Check your inbox.');
                fetchHistory();
            } else {
                const data = await response.json();
                alert(`Failed to send test email: ${data.message}`);
            }
        } catch (error) {
            alert('Error sending test email. Make sure the notifications backend is running.');
        } finally {
            setSending(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'sent':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            low_performance: 'bg-red-100 text-red-700',
            milestone: 'bg-green-100 text-green-700',
            event: 'bg-blue-100 text-blue-700',
            deadline: 'bg-yellow-100 text-yellow-700',
        };

        return (
            <Badge className={colors[type] || 'bg-gray-100 text-gray-700'}>
                {type.replace('_', ' ')}
            </Badge>
        );
    };

    return (
        <AuthCheck>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 pt-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Bell className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-3xl font-bold">Notification Settings</h1>
                        </div>



                        {/* Test Email */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Test Email Notification
                                </CardTitle>
                                <CardDescription>
                                    Send a test email to verify your configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleTestEmail} className="flex gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="testEmail">Email Address</Label>
                                        <Input
                                            id="testEmail"
                                            type="email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            placeholder="Enter email to test"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button type="submit" disabled={sending}>
                                            {sending ? 'Sending...' : 'Send Test Email'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Notification Types */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Automatic Notification Types</CardTitle>
                                <CardDescription>
                                    These notifications are sent automatically based on system events
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-red-700 mb-2">⚠️ Low Performance Alert</h3>
                                        <p className="text-sm text-gray-600">
                                            Triggered when student scores below 40% (20/50 marks) in any subject
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-green-700 mb-2">🏆 Milestone Achievement</h3>
                                        <p className="text-sm text-gray-600">
                                            Sent to top 3 students after AI toppers analysis
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-700 mb-2">📅 Event Notification</h3>
                                        <p className="text-sm text-gray-600">
                                            Upcoming events and important announcements
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <h3 className="font-semibold text-yellow-700 mb-2">⏰ Deadline Reminder</h3>
                                        <p className="text-sm text-gray-600">
                                            Assignment and exam deadline reminders
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notification History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification History</CardTitle>
                                <CardDescription>
                                    Recent notifications sent by the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <p>Loading history...</p>
                                ) : history.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Sent At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {history.map((notif) => (
                                                <TableRow key={notif._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(notif.status)}
                                                            <span className="capitalize">{notif.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getTypeBadge(notif.type)}</TableCell>
                                                    <TableCell className="font-mono text-sm">{notif.userEmail}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{notif.title}</TableCell>
                                                    <TableCell className="text-sm text-gray-600">
                                                        {new Date(notif.sentAt).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </AuthCheck>
    );
};

export default NotificationSettingsPage;
