import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit } from 'lucide-react';

interface Subject {
    _id?: string;
    name: string;
    code: string;
    semester: string;
    department: string;
}

const SubjectAdminPage: React.FC = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [newSubject, setNewSubject] = useState<Subject>({ name: '', code: '', semester: '', department: '' });
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8012/api/subjects');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: Subject[] = await response.json();
            setSubjects(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8012/api/subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSubject),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setNewSubject({ name: '', code: '', semester: '', department: '' });
            fetchSubjects();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject || !editingSubject._id) return;
        try {
            const response = await fetch(`http://127.0.0.1:8012/api/subjects/${editingSubject._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingSubject),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setEditingSubject(null);
            fetchSubjects();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            const response = await fetch(`http://127.0.0.1:8012/api/subjects/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchSubjects();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    if (loading) {
        return (
            <AuthCheck>
                <div className="min-h-screen flex flex-col bg-gray-50">
                    <Navbar />
                    <div className="container mx-auto px-4 py-8 pt-16">
                        <p>Loading subjects...</p>
                    </div>
                </div>
            </AuthCheck>
        );
    }

    return (
        <AuthCheck>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8 pt-16">
                    <h1 className="text-3xl font-bold mb-6">Subject Administration</h1>

                    {/* Add/Edit Subject Form */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={editingSubject ? handleUpdateSubject : handleAddSubject} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Subject Name</Label>
                                        <Input
                                            id="name"
                                            value={editingSubject ? editingSubject.name : newSubject.name}
                                            onChange={(e) =>
                                                editingSubject
                                                    ? setEditingSubject({ ...editingSubject, name: e.target.value })
                                                    : setNewSubject({ ...newSubject, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="code">Subject Code</Label>
                                        <Input
                                            id="code"
                                            value={editingSubject ? editingSubject.code : newSubject.code}
                                            onChange={(e) =>
                                                editingSubject
                                                    ? setEditingSubject({ ...editingSubject, code: e.target.value })
                                                    : setNewSubject({ ...newSubject, code: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="semester">Semester</Label>
                                        <Select
                                            value={editingSubject ? editingSubject.semester : newSubject.semester}
                                            onValueChange={(value) =>
                                                editingSubject
                                                    ? setEditingSubject({ ...editingSubject, semester: value })
                                                    : setNewSubject({ ...newSubject, semester: value })
                                            }
                                        >
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
                                    <div>
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={editingSubject ? editingSubject.department : newSubject.department}
                                            onValueChange={(value) =>
                                                editingSubject
                                                    ? setEditingSubject({ ...editingSubject, department: value })
                                                    : setNewSubject({ ...newSubject, department: value })
                                            }
                                        >
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
                                </div>
                                <div className="flex space-x-4">
                                    <Button type="submit">
                                        {editingSubject ? 'Update Subject' : 'Add Subject'}
                                    </Button>
                                    {editingSubject && (
                                        <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Subject List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Subjects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {subjects.length === 0 ? (
                                <p>No subjects found.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjects.map((subject) => (
                                            <TableRow key={subject._id}>
                                                <TableCell>{subject.code}</TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell>{subject.semester}</TableCell>
                                                <TableCell>{subject.department}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingSubject(subject)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => subject._id && handleDeleteSubject(subject._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </AuthCheck>
    );
};

export default SubjectAdminPage;
