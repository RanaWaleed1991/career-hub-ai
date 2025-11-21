-- Add 10 High-Quality Free YouTube Courses
-- Categories: Resume Writing (2), Interview Skills (2), LinkedIn & Networking (2),
--             Job Search Strategies (2), Career Development (2)

-- Resume Writing Courses (2)
INSERT INTO public.courses (
  title,
  provider,
  description,
  video_url,
  type,
  status,
  thumbnail_url,
  duration,
  level,
  category,
  enrollment_count,
  is_featured
) VALUES
(
  'How to Write a Professional Resume in 2024',
  'Indeed Career Tips',
  'Learn how to write a professional resume that gets noticed by employers and passes ATS systems. This comprehensive guide covers everything from formatting to keywords, with real examples and templates. Perfect for job seekers at any career stage looking to create a standout resume.',
  'https://www.youtube.com/watch?v=Tt08KmFfIYQ',
  'free',
  'published',
  'https://i.ytimg.com/vi/Tt08KmFfIYQ/maxresdefault.jpg',
  '15 minutes',
  'beginner',
  'Resume Writing',
  1250,
  TRUE
),
(
  'Resume Writing Tips: How to Write a Resume That Gets You the Job',
  'Jeff Su',
  'A practical, step-by-step guide to writing an effective resume that hiring managers actually want to read. Learn the secrets of quantifying achievements, using action verbs, and tailoring your resume for each application. Includes downloadable templates and real-world examples.',
  'https://www.youtube.com/watch?v=3agP4x8LYFM',
  'free',
  'published',
  'https://i.ytimg.com/vi/3agP4x8LYFM/maxresdefault.jpg',
  '12 minutes',
  'intermediate',
  'Resume Writing',
  890,
  TRUE
),

-- Interview Skills Courses (2)
(
  'Top 10 Job Interview Questions & Answers (for 1st & 2nd Interviews)',
  'Professor Heather Austin',
  'Master the most common interview questions with proven answer frameworks. Learn the STAR method, how to handle behavioral questions, and what hiring managers are really looking for. Includes example answers for first and second round interviews that you can adapt to your experience.',
  'https://www.youtube.com/watch?v=YIUHWmuzXLI',
  'free',
  'published',
  'https://i.ytimg.com/vi/YIUHWmuzXLI/maxresdefault.jpg',
  '20 minutes',
  'beginner',
  'Interview Skills',
  2100,
  TRUE
),
(
  'How to Succeed in Your First Interview - 5 Tips to Get the Job',
  'Harvard Business Review',
  'Expert interview strategies from Harvard Business Review. Learn how to prepare effectively, make a great first impression, answer tough questions with confidence, and follow up professionally. Featuring insights from hiring managers and career coaches at top companies.',
  'https://www.youtube.com/watch?v=naIkpQ_cIt0',
  'free',
  'published',
  'https://i.ytimg.com/vi/naIkpQ_cIt0/maxresdefault.jpg',
  '10 minutes',
  'intermediate',
  'Interview Skills',
  1680,
  TRUE
),

-- LinkedIn & Networking Courses (2)
(
  'How to Use LinkedIn to Get a Job - LinkedIn Profile Tips',
  'LinkedIn',
  'Official LinkedIn guide to building a professional profile that attracts recruiters. Learn how to optimize your headline, summary, and experience sections, grow your network strategically, and use LinkedIn job search features effectively. Includes tips from LinkedIn''s own career experts.',
  'https://www.youtube.com/watch?v=ECPgFb6HQvk',
  'free',
  'published',
  'https://i.ytimg.com/vi/ECPgFb6HQvk/maxresdefault.jpg',
  '18 minutes',
  'beginner',
  'LinkedIn & Networking',
  1450,
  TRUE
),
(
  'Networking Tips: How to Network Like a Pro',
  'Indeed Career Guide',
  'Learn professional networking strategies that actually work. Discover how to build meaningful connections, reach out to professionals on LinkedIn, attend networking events effectively, and leverage your network for job opportunities. Perfect for introverts and extroverts alike.',
  'https://www.youtube.com/watch?v=mPNDr6lgpnI',
  'free',
  'published',
  'https://i.ytimg.com/vi/mPNDr6lgpnI/maxresdefault.jpg',
  '14 minutes',
  'intermediate',
  'LinkedIn & Networking',
  920,
  FALSE
),

-- Job Search Strategies Courses (2)
(
  'How to Find a Job Fast in 2024 - Job Search Tips That Actually Work',
  'A Life After Layoff',
  'Proven job search strategies to land your next role quickly. Learn how to use job boards effectively, leverage networking, work with recruiters, and apply the hidden job market tactics that most job seekers miss. Includes a step-by-step action plan and time-saving techniques.',
  'https://www.youtube.com/watch?v=ZJJ8P9rSTTg',
  'free',
  'published',
  'https://i.ytimg.com/vi/ZJJ8P9rSTTg/maxresdefault.jpg',
  '25 minutes',
  'beginner',
  'Job Search Strategies',
  1780,
  TRUE
),
(
  '5 Things You Should Never Say In a Job Interview',
  'The Companies Expert',
  'Avoid common job interview mistakes that cost candidates offers. Learn what NOT to say during interviews, how to handle difficult questions about salary and weaknesses, and what red flags to avoid. Essential viewing before your next interview to maximize your chances of success.',
  'https://www.youtube.com/watch?v=kphsEPb9WIY',
  'free',
  'published',
  'https://i.ytimg.com/vi/kphsEPb9WIY/maxresdefault.jpg',
  '8 minutes',
  'beginner',
  'Job Search Strategies',
  1320,
  FALSE
),

-- Career Development Courses (2)
(
  'How to Answer "Where Do You See Yourself in 5 Years?"',
  'Indeed',
  'Master one of the most common yet tricky interview questions. Learn how to answer "Where do you see yourself in 5 years?" in a way that demonstrates ambition while showing commitment to the role. Includes multiple example answers for different career stages and industries.',
  'https://www.youtube.com/watch?v=eOYl3af14kY',
  'free',
  'published',
  'https://i.ytimg.com/vi/eOYl3af14kY/maxresdefault.jpg',
  '6 minutes',
  'beginner',
  'Career Development',
  980,
  FALSE
),
(
  'Career Development: How to Build a Successful Career',
  'Stanford Graduate School of Business',
  'Comprehensive career development strategies from Stanford GSB. Learn how to set career goals, develop in-demand skills, navigate career transitions, and build a personal brand. Features insights from successful professionals and career experts on creating long-term career success.',
  'https://www.youtube.com/watch?v=Mg_PdqJBkHQ',
  'free',
  'published',
  'https://i.ytimg.com/vi/Mg_PdqJBkHQ/maxresdefault.jpg',
  '45 minutes',
  'intermediate',
  'Career Development',
  2450,
  TRUE
);

-- Verify the insert
SELECT
  title,
  category,
  level,
  duration,
  is_featured,
  enrollment_count
FROM public.courses
ORDER BY category, title;
