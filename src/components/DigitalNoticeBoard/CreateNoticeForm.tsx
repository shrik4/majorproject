import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from 'axios';
import { useNotifications } from '@/contexts/NotificationContext';

interface CreateNoticeFormProps {
    onNoticeCreated: () => void;
}

const CreateNoticeForm: React.FC<CreateNoticeFormProps> = ({ onNoticeCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Event');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { forceCheck } = useNotifications();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post('http://localhost:8023/api/notices', {
                title,
                content,
                category,
                date: new Date().toISOString()
            });

            toast.success('Notice created successfully! Notifications sent to all users.');
            setTitle('');
            setContent('');
            setCategory('Event');
            onNoticeCreated();

            // Force notification check for all users
            setTimeout(() => {
                forceCheck();
            }, 1000);
        } catch (error) {
            console.error('Error creating notice:', error);
            toast.error('Failed to create notice');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Notice</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter notice title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                                <SelectItem value="Exam">Exam</SelectItem>
                                <SelectItem value="Holiday">Holiday</SelectItem>
                                <SelectItem value="Event">Event</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Enter notice details..."
                            className="min-h-[100px]"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Posting...' : 'Post Notice'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default CreateNoticeForm;
