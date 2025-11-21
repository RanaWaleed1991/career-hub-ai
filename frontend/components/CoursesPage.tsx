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
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const courses = await getPublicCourses();
      setAllCourses(courses);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter courses based on selected type and category
  const filteredCourses = allCourses.filter(course => {
    const typeMatch = selectedType === 'all' || course.type === selectedType;
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    return typeMatch && categoryMatch;
  });

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
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Recommended Courses</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filter Dropdowns */}
      <div className="mb-8 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="type-filter" className="text-sm font-medium text-slate-700">
            Type:
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as 'all' | 'free' | 'paid')}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Courses</option>
            <option value="free">Free Courses</option>
            <option value="paid">Paid Courses</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="category-filter" className="text-sm font-medium text-slate-700">
            Category:
          </label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Accounting">Accounting</option>
            <option value="Resume & Interview">Resume & Interview</option>
            <option value="Personal Development">Personal Development</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-slate-600">
          Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg shadow-sm">
          <p className="text-slate-500 text-lg mb-2">No courses found</p>
          <p className="text-slate-400 text-sm">
            {selectedType !== 'all' || selectedCategory !== 'all'
              ? 'Try changing your filters to see more courses.'
              : 'No courses available yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
