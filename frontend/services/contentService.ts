
import type { Job, Course } from '../types';

const JOBS_KEY = 'career_hub_jobs';
const COURSES_KEY = 'career_hub_courses';

// --- Jobs ---

export const getJobs = (): Job[] => {
  try {
    const jobsJson = localStorage.getItem(JOBS_KEY);
    return jobsJson ? JSON.parse(jobsJson) : [];
  } catch (error) {
    console.error("Failed to parse jobs from localStorage", error);
    return [];
  }
};

const saveJobs = (jobs: Job[]): void => {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
};

export const addJob = (job: Omit<Job, 'id'>): void => {
  const jobs = getJobs();
  const newJob: Job = { ...job, id: Date.now().toString() };
  jobs.push(newJob);
  saveJobs(jobs);
};

export const deleteJob = (jobId: string): void => {
  let jobs = getJobs();
  jobs = jobs.filter(job => job.id !== jobId);
  saveJobs(jobs);
};


// --- Courses ---

export const getCourses = (): Course[] => {
    try {
        const coursesJson = localStorage.getItem(COURSES_KEY);
        return coursesJson ? JSON.parse(coursesJson) : [];
    } catch (error) {
        console.error("Failed to parse courses from localStorage", error);
        return [];
    }
};

const saveCourses = (courses: Course[]): void => {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

export const addCourse = (course: Omit<Course, 'id'>): void => {
    const courses = getCourses();
    const newCourse: Course = { ...course, id: Date.now().toString() };
    courses.push(newCourse);
    saveCourses(courses);
};

export const deleteCourse = (courseId: string): void => {
    let courses = getCourses();
    courses = courses.filter(course => course.id !== courseId);
    saveCourses(courses);
};
