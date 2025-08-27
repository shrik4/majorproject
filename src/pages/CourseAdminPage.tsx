import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';

interface Course {
  id?: number;
  title: string;
  description: string;
  youtubeLink: string;
}

const CourseAdminPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<Course>({ title: '', description: '', youtubeLink: '' });
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5004/courses');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5004/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewCourse({ title: '', description: '', youtubeLink: '' });
      fetchCourses();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.id) return;
    try {
      const response = await fetch(`http://localhost:5004/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCourse),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5004/courses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchCourses();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) {
    return (
      <AuthCheck>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Course Administration</h1>
          <p>Loading courses...</p>
        </div>
      </AuthCheck>
    );
  }

  if (error) {
    return (
      <AuthCheck>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Course Administration</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Course Administration</h1>

          {/* Add New Course Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h2>
            <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={editingCourse ? editingCourse.title : newCourse.title}
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, title: e.target.value })
                      : setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={editingCourse ? editingCourse.description : newCourse.description}
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, description: e.target.value })
                      : setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>
              <div>
                <label htmlFor="youtubeLink" className="block text-sm font-medium text-gray-700">YouTube Link</label>
                <input
                  type="url"
                  id="youtubeLink"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={editingCourse ? editingCourse.youtubeLink : newCourse.youtubeLink}
                  onChange={(e) =>
                    editingCourse
                      ? setEditingCourse({ ...editingCourse, youtubeLink: e.target.value })
                      : setNewCourse({ ...newCourse, youtubeLink: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
                {editingCourse && (
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Course List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Existing Courses</h2>
            {courses.length === 0 ? (
              <p>No courses available. Add a new course above.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <li key={course.id} className="py-4 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-gray-600 text-sm">{course.description}</p>
                      <a href={course.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                        {course.youtubeLink}
                      </a>
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => course.id && handleDeleteCourse(course.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default CourseAdminPage;