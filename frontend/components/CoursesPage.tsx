import React, { useState, useEffect } from 'react';
import { getPublicCourses } from '../services/contentService';
import type { Course } from '../types';

const CourseCard: React.FC<{ course: Course, index: number }> = ({ course, index }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
    <div>
      <h3 className="text-lg font-bold text-slate-800">{course.title}</h3>
      <p className="text-sm font-medium text-indigo-600 mb-2">{course.provider}</p>
      <p className="text-sm text-slate-600 mb-4">{course.description}</p>
    </div>
    <a
      href={course.link}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto block w-full text-center px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors"
    >
      View Course
    </a>
  </div>
);

const CoursesPage: React.FC = () => {
  const [freeCourses, setFreeCourses] = useState<Course[]>([]);
  const [paidCourses, setPaidCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allCourses = await getPublicCourses();
      setFreeCourses(allCourses.filter(c => c.type === 'free'));
      setPaidCourses(allCourses.filter(c => c.type === 'paid'));
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-slate-50 h-full overflow-y-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Recommended Courses</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <section className="mb-12">
        <h3 className="text-2xl font-semibold text-teal-600 mb-6">Free Courses</h3>
        {freeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {freeCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-slate-500">No free courses have been added yet. An administrator can add them from the Admin Panel.</p>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-indigo-600 mb-6">Paid Courses</h3>
        {paidCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paidCourses.map((course, index) => <CourseCard key={course.id} course={course} index={index + freeCourses.length} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
             <p className="text-slate-500">No paid courses have been added yet. An administrator can add them from the Admin Panel.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesPage;