import React, { useState, useEffect } from 'react';
import type { Job, JobCategory, Course, CourseType } from '../types';
import { getJobs, addJob, deleteJob, getCourses, addCourse, deleteCourse, syncJobsFromAdzuna } from '../services/contentService';
import { MinusCircleIcon } from './icons';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'courses'>('jobs');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobCategory, setJobCategory] = useState<JobCategory>('tech');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isSyncingJobs, setIsSyncingJobs] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncLocation, setSyncLocation] = useState<string>('australia');
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseProvider, setCourseProvider] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseVideoUrl, setCourseVideoUrl] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('free');
  const [courseThumbnailUrl, setCourseThumbnailUrl] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseLevel, setCourseLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseAffiliateLink, setCourseAffiliateLink] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load jobs and courses on component mount
  useEffect(() => {
    loadJobs();
    loadCourses();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true);
      setError(null);
      const fetchedJobs = await getJobs();
      setJobs(fetchedJobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setError(null);
      const fetchedCourses = await getCourses();
      setCourses(fetchedCourses);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingJob(true);
      setError(null);

      await addJob({
        title: jobTitle,
        company: jobCompany,
        location: jobLocation,
        description: jobDescription,
        category: jobCategory
      });

      // Reload jobs list
      await loadJobs();

      // Reset form
      setJobTitle('');
      setJobCompany('');
      setJobLocation('');
      setJobDescription('');
      setJobCategory('tech');

      alert('Job added successfully!');
    } catch (err: any) {
      console.error('Failed to add job:', err);
      setError(err.message || 'Failed to add job. Please try again.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      setError(null);
      await deleteJob(id);
      // Reload jobs list
      await loadJobs();
      alert('Job deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete job:', err);
      setError(err.message || 'Failed to delete job. Please try again.');
    }
  };

  const handleSyncJobsFromAdzuna = async () => {
    const locationText = syncLocation === 'australia' ? 'all of Australia' : syncLocation;
    if (!window.confirm(`This will sync jobs from Adzuna API for ${locationText} and replace existing Adzuna jobs. Continue?`)) {
      return;
    }

    try {
      setIsSyncingJobs(true);
      setError(null);
      setSyncSuccess(null);
      setShowSyncOptions(false);

      const result = await syncJobsFromAdzuna({
        limitPerCategory: 20,
        clearExisting: true,
        location: syncLocation === 'australia' ? undefined : syncLocation,
      });

      // Reload jobs list
      await loadJobs();

      setSyncSuccess(`Successfully synced ${result.stats.total} Australian jobs from ${locationText} (Tech: ${result.stats.tech}, Accounting: ${result.stats.accounting}, Casual: ${result.stats.casual})`);
      setTimeout(() => setSyncSuccess(null), 10000); // Clear success message after 10 seconds
    } catch (err: any) {
      console.error('Failed to sync jobs from Adzuna:', err);
      setError(err.message || 'Failed to sync jobs from Adzuna. Make sure API credentials are configured.');
    } finally {
      setIsSyncingJobs(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingCourse(true);
      setError(null);

      // Validate affiliate link for paid courses
      if (courseType === 'paid' && !courseAffiliateLink.trim()) {
        setError('Affiliate link is required for paid courses');
        setIsSubmittingCourse(false);
        return;
      }

      await addCourse({
        title: courseTitle,
        provider: courseProvider,
        description: courseDescription,
        video_url: courseVideoUrl,
        type: courseType,
        thumbnail_url: courseThumbnailUrl || undefined,
        duration: courseDuration || undefined,
        level: courseLevel,
        category: courseCategory || undefined,
        affiliate_link: courseType === 'paid' ? courseAffiliateLink : undefined,
      });

      // Reload courses list
      await loadCourses();

      // Reset form
      setCourseTitle('');
      setCourseProvider('');
      setCourseDescription('');
      setCourseVideoUrl('');
      setCourseType('free');
      setCourseThumbnailUrl('');
      setCourseDuration('');
      setCourseLevel('beginner');
      setCourseCategory('');
      setCourseAffiliateLink('');

      alert('Course added successfully!');
    } catch (err: any) {
      console.error('Failed to add course:', err);
      setError(err.message || 'Failed to add course. Please try again.');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      setError(null);
      await deleteCourse(id);
      // Reload courses list
      await loadCourses();
      alert('Course deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete course:', err);
      setError(err.message || 'Failed to delete course. Please try again.');
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Admin Panel</h2>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-800 hover:text-red-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2 border-b">
          <button onClick={() => setActiveTab('jobs')} className={`px-4 py-2 font-medium ${activeTab === 'jobs' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Manage Jobs</button>
          <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 font-medium ${activeTab === 'courses' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Manage Courses</button>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Job Form */}
          <form onSubmit={handleAddJob} className="space-y-4 p-6 bg-white rounded-lg shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold">Add New Job</h3>
            <div><label className={labelClass}>Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={inputClass} required disabled={isSubmittingJob} /></div>
            <div><label className={labelClass}>Company</label><input type="text" value={jobCompany} onChange={e => setJobCompany(e.target.value)} className={inputClass} required disabled={isSubmittingJob} /></div>
            <div><label className={labelClass}>Location</label><input type="text" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className={inputClass} required disabled={isSubmittingJob} /></div>
            <div><label className={labelClass}>Description</label><textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className={inputClass} rows={4} required disabled={isSubmittingJob} /></div>
            <div>
                <label className={labelClass}>Category</label>
                <select value={jobCategory} onChange={e => setJobCategory(e.target.value as JobCategory)} className={inputClass} disabled={isSubmittingJob}>
                    <option value="tech">Tech</option>
                    <option value="accounting">Accounting</option>
                    <option value="casual">Casual</option>
                </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmittingJob}
            >
              {isSubmittingJob ? 'Adding...' : 'Add Job'}
            </button>
          </form>

          {/* Jobs List */}
          <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Existing Jobs ({jobs.length})</h3>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowSyncOptions(!showSyncOptions)}
                  disabled={isSyncingJobs}
                  className="px-3 py-2 bg-slate-600 text-white text-sm font-semibold rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⚙️
                </button>
                <button
                  onClick={handleSyncJobsFromAdzuna}
                  disabled={isSyncingJobs}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncingJobs ? 'Syncing...' : 'Sync from Adzuna (AU)'}
                </button>
              </div>
            </div>

            {/* Sync Options */}
            {showSyncOptions && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-semibold mb-3 text-blue-900">Sync Options</h4>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-2 text-slate-700">Australian Location</label>
                  <select
                    value={syncLocation}
                    onChange={(e) => setSyncLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="australia">All Australia</option>
                    <option value="melbourne">Melbourne</option>
                    <option value="sydney">Sydney</option>
                    <option value="brisbane">Brisbane</option>
                    <option value="perth">Perth</option>
                    <option value="adelaide">Adelaide</option>
                    <option value="canberra">Canberra</option>
                  </select>
                </div>
                <div className="text-xs text-slate-600">
                  <p>📍 Syncing {syncLocation === 'australia' ? 'all of Australia' : syncLocation}</p>
                  <p>📊 20 jobs per category (Tech, Accounting, Casual)</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {syncSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">{syncSuccess}</p>
              </div>
            )}

            {isLoadingJobs ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No jobs added yet. Add manually or sync from Adzuna.</p>
            ) : (
              <ul className="space-y-3 h-96 overflow-y-auto pr-2">
                {jobs.map(job => (
                  <li key={job.id} className="p-3 border rounded-md flex justify-between items-center bg-slate-50">
                    <div className="flex-1">
                      <p className="font-bold">{job.title} - <span className="font-medium">{job.company}</span></p>
                      <p className="text-sm text-slate-500">{job.location} | Category: {job.category}</p>
                      {job.source && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 mt-1 inline-block">
                          {job.source}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDeleteJob(job.id)} className="text-red-500 hover:text-red-700 ml-2"><MinusCircleIcon /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} className="space-y-4 p-6 bg-white rounded-lg shadow-lg border border-slate-200 max-h-[600px] overflow-y-auto">
                <h3 className="text-xl font-semibold sticky top-0 bg-white pb-2">Add New Course</h3>

                <div><label className={labelClass}>Course Title</label><input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className={inputClass} required disabled={isSubmittingCourse} placeholder="e.g., Complete Web Development Bootcamp" /></div>

                <div><label className={labelClass}>Provider</label><input type="text" value={courseProvider} onChange={e => setCourseProvider(e.target.value)} className={inputClass} required disabled={isSubmittingCourse} placeholder="e.g., Udemy, Coursera, freeCodeCamp" /></div>

                <div><label className={labelClass}>Description</label><textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className={inputClass} rows={3} required disabled={isSubmittingCourse} placeholder="Brief description of what the course covers..." /></div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Duration</label><input type="text" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} className={inputClass} disabled={isSubmittingCourse} placeholder="e.g., 10 hours, 6 weeks" /></div>
                  <div>
                    <label className={labelClass}>Level</label>
                    <select value={courseLevel} onChange={e => setCourseLevel(e.target.value as any)} className={inputClass} disabled={isSubmittingCourse}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div><label className={labelClass}>Category</label><input type="text" value={courseCategory} onChange={e => setCourseCategory(e.target.value)} className={inputClass} disabled={isSubmittingCourse} placeholder="e.g., Programming, Design, Business" /></div>

                <div><label className={labelClass}>Video/Course URL</label><input type="url" value={courseVideoUrl} onChange={e => setCourseVideoUrl(e.target.value)} className={inputClass} required disabled={isSubmittingCourse} placeholder="YouTube or course platform URL" /></div>

                <div><label className={labelClass}>Thumbnail URL (optional)</label><input type="url" value={courseThumbnailUrl} onChange={e => setCourseThumbnailUrl(e.target.value)} className={inputClass} disabled={isSubmittingCourse} placeholder="Image URL for course thumbnail" /></div>

                <div>
                    <label className={labelClass}>Type</label>
                    <select value={courseType} onChange={e => setCourseType(e.target.value as CourseType)} className={inputClass} disabled={isSubmittingCourse}>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>

                {courseType === 'paid' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <label className={labelClass}>Affiliate Link <span className="text-red-500">*</span></label>
                    <input type="url" value={courseAffiliateLink} onChange={e => setCourseAffiliateLink(e.target.value)} className={inputClass} disabled={isSubmittingCourse} placeholder="Your affiliate URL (Udemy, Coursera, etc.)" required />
                    <p className="text-xs text-slate-600 mt-1">This is where users will be redirected to purchase the course (with your affiliate tracking)</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmittingCourse}
                >
                  {isSubmittingCourse ? 'Adding...' : 'Add Course'}
                </button>
            </form>

            {/* Courses List */}
            <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200">
                <h3 className="text-xl font-semibold mb-4">Existing Courses ({courses.length})</h3>
                {isLoadingCourses ? (
                  <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : courses.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No courses added yet.</p>
                ) : (
                  <ul className="space-y-3 h-96 overflow-y-auto pr-2">
                  {courses.map(course => (
                      <li key={course.id} className="p-3 border rounded-md flex justify-between items-center bg-slate-50">
                      <div className="flex-1">
                          <p className="font-bold">{course.title} - <span className="font-medium">{course.provider}</span></p>
                          <p className="text-sm text-slate-500">
                            Type: {course.type}
                            {course.level && ` | Level: ${course.level}`}
                            {course.duration && ` | ${course.duration}`}
                          </p>
                          {course.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 mt-1 inline-block">
                              {course.category}
                            </span>
                          )}
                      </div>
                      <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500 hover:text-red-700 ml-2"><MinusCircleIcon /></button>
                      </li>
                  ))}
                  </ul>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
