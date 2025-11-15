import React, { useState, useEffect } from 'react';
import { getPublicCourses, enrollInCourse } from '../services/contentService';
import type { Course } from '../types';
import { ExternalLinkIcon, ClockIcon, AcademicCapIcon, TagIcon } from './icons';

interface CourseCardProps {
  course: Course;
  index: number;
  onEnroll: (courseId: string, url: string, affiliateLink?: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index, onEnroll }) => {
  const handleEnroll = () => {
    const targetUrl = course.affiliate_link || course.video_url;
    onEnroll(course.id, course.video_url, course.affiliate_link);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 opacity-0 slide-in-up flex flex-col"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Thumbnail */}
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
          <span className="text-white text-5xl font-bold">
            {course.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 flex-1">
            {course.title}
          </h3>
          {course.type === 'paid' && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-semibold whitespace-nowrap">
              PAID
            </span>
          )}
        </div>

        <p className="text-sm text-indigo-600 font-medium mb-1">{course.provider}</p>

        {course.category && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              <TagIcon />
              {course.category}
            </span>
          </div>
        )}

        <p className="text-sm text-slate-700 mb-4 line-clamp-3 flex-1">
          {course.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          {course.duration && (
            <div className="flex items-center gap-1">
              <ClockIcon />
              {course.duration}
            </div>
          )}
          {course.level && (
            <div className="flex items-center gap-1">
              <AcademicCapIcon />
              <span className="capitalize">{course.level}</span>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleEnroll}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          {course.type === 'free' ? 'Start Learning' : 'View Course'}
          <ExternalLinkIcon />
        </button>
      </div>
    </div>
  );
};

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

  const handleEnroll = async (courseId: string, videoUrl: string, affiliateLink?: string) => {
    // Track enrollment
    try {
      await enrollInCourse(courseId);
    } catch (error) {
      console.error('Failed to track enrollment:', error);
      // Continue anyway - don't block the user from accessing the course
    }

    // Redirect to course (affiliate link for paid, video URL for free)
    const targetUrl = affiliateLink || videoUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
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

      {/* Free Courses Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-teal-600 mb-2">Free Courses</h3>
          <p className="text-slate-600">High-quality free courses to kickstart your learning</p>
        </div>
        {freeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-slate-500">No free courses available yet.</p>
          </div>
        )}
      </section>

      {/* Paid Courses Section */}
      <section>
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-indigo-600 mb-2">Premium Courses</h3>
          <p className="text-slate-600">Comprehensive paid courses for serious learners</p>
        </div>
        {paidCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paidCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index + freeCourses.length}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-slate-500">No premium courses available yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesPage;
