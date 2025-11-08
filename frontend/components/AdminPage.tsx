import React, { useState, useEffect } from 'react';
import type { Job, JobCategory, Course, CourseType } from '../types';
import { getJobs, addJob, deleteJob, getCourses, addCourse, deleteCourse } from '../services/contentService';
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

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseProvider, setCourseProvider] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseLink, setCourseLink] = useState('');
  const [courseType, setCourseType] = useState<CourseType>('free');

  useEffect(() => {
    setJobs(getJobs());
    setCourses(getCourses());
  }, []);

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({ title: jobTitle, company: jobCompany, location: jobLocation, description: jobDescription, category: jobCategory });
    setJobs(getJobs()); // refresh list
    // Reset form
    setJobTitle('');
    setJobCompany('');
    setJobLocation('');
    setJobDescription('');
    setJobCategory('tech');
  };

  const handleDeleteJob = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
        deleteJob(id);
        setJobs(getJobs()); // refresh list
    }
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addCourse({ title: courseTitle, provider: courseProvider, description: courseDescription, link: courseLink, type: courseType });
    setCourses(getCourses()); // refresh list
    // Reset form
    setCourseTitle('');
    setCourseProvider('');
    setCourseDescription('');
    setCourseLink('');
    setCourseType('free');
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
        deleteCourse(id);
        setCourses(getCourses()); // refresh list
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Admin Panel</h2>

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
            <div><label className={labelClass}>Job Title</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Company</label><input type="text" value={jobCompany} onChange={e => setJobCompany(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Location</label><input type="text" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className={inputClass} required /></div>
            <div><label className={labelClass}>Description</label><textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} className={inputClass} rows={4} required /></div>
            <div>
                <label className={labelClass}>Category</label>
                <select value={jobCategory} onChange={e => setJobCategory(e.target.value as JobCategory)} className={inputClass}>
                    <option value="tech">Tech</option>
                    <option value="accounting">Accounting</option>
                    <option value="casual">Casual</option>
                </select>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Add Job</button>
          </form>

          {/* Jobs List */}
          <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200">
            <h3 className="text-xl font-semibold mb-4">Existing Jobs ({jobs.length})</h3>
            <ul className="space-y-3 h-96 overflow-y-auto pr-2">
              {jobs.map(job => (
                <li key={job.id} className="p-3 border rounded-md flex justify-between items-center bg-slate-50">
                  <div>
                    <p className="font-bold">{job.title} - <span className="font-medium">{job.company}</span></p>
                    <p className="text-sm text-slate-500">{job.location} | Category: {job.category}</p>
                  </div>
                  <button onClick={() => handleDeleteJob(job.id)} className="text-red-500 hover:text-red-700"><MinusCircleIcon /></button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add Course Form */}
            <form onSubmit={handleAddCourse} className="space-y-4 p-6 bg-white rounded-lg shadow-lg border border-slate-200">
                <h3 className="text-xl font-semibold">Add New Course</h3>
                <div><label className={labelClass}>Course Title</label><input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className={inputClass} required /></div>
                <div><label className={labelClass}>Provider</label><input type="text" value={courseProvider} onChange={e => setCourseProvider(e.target.value)} className={inputClass} required /></div>
                <div><label className={labelClass}>Description</label><textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className={inputClass} rows={4} required /></div>
                <div><label className={labelClass}>Link</label><input type="url" value={courseLink} onChange={e => setCourseLink(e.target.value)} className={inputClass} required /></div>
                <div>
                    <label className={labelClass}>Type</label>
                    <select value={courseType} onChange={e => setCourseType(e.target.value as CourseType)} className={inputClass}>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Add Course</button>
            </form>

            {/* Courses List */}
            <div className="p-6 bg-white rounded-lg shadow-lg border border-slate-200">
                <h3 className="text-xl font-semibold mb-4">Existing Courses ({courses.length})</h3>
                <ul className="space-y-3 h-96 overflow-y-auto pr-2">
                {courses.map(course => (
                    <li key={course.id} className="p-3 border rounded-md flex justify-between items-center bg-slate-50">
                    <div>
                        <p className="font-bold">{course.title} - <span className="font-medium">{course.provider}</span></p>
                        <p className="text-sm text-slate-500">Type: {course.type}</p>
                    </div>
                    <button onClick={() => handleDeleteCourse(course.id)} className="text-red-500 hover:text-red-700"><MinusCircleIcon /></button>
                    </li>
                ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;