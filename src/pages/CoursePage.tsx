import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';

interface Course {
  title: string;
  description: string;
  youtubeLink: string;
}

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{course.description}</p>
      <a
        href={course.youtubeLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <Youtube className="mr-2 h-5 w-5" />
        Watch on YouTube
      </a>
    </div>
  );
};

const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5001/courses');
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

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <AuthCheck>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Courses</h1>
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Courses</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Our Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          ) : (
            <p>No courses available.</p>
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

export default CoursePage;