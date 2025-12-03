import React, { useState, useEffect } from 'react';
import { getPublicJobs } from '../services/contentService';
import type { Job } from '../types';

const JobCard: React.FC<{ job: Job, index: number }> = ({ job, index }) => {
  const hasExternalUrl = job.external_url && job.external_url.trim() !== '';
  const salary = job.salary_min && job.salary_max
    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
    : job.salary_min
    ? `From $${job.salary_min.toLocaleString()}`
    : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 opacity-0 slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
      <h3 className="text-lg font-bold text-slate-800">{job.title}</h3>
      <p className="text-md font-semibold text-indigo-600 mb-2">{job.company}</p>
      <p className="text-sm text-slate-500 mb-3">{job.location}</p>
      {salary && <p className="text-sm text-green-600 font-medium mb-2">{salary}</p>}
      <p className="text-sm text-slate-600 mb-4">{job.description}</p>
      {hasExternalUrl ? (
        <a
          href={job.external_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors mt-4"
        >
          Apply Now
        </a>
      ) : (
        <button
          disabled
          className="block w-full text-center px-4 py-2 bg-slate-400 text-white font-semibold rounded-md cursor-not-allowed mt-4"
          title="Application link not available"
        >
          Apply Now
        </button>
      )}
    </div>
  );
};

const JobsPage: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedJobs = await getPublicJobs();
      setJobs(fetchedJobs);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    // City filter
    const cityMatch = selectedCity === 'all' ||
                      job.location.toLowerCase().includes(selectedCity.toLowerCase());

    // Keyword filter (search in title, company, and description)
    const keywordLower = keyword.toLowerCase();
    const keywordMatch = keyword === '' ||
                         job.title.toLowerCase().includes(keywordLower) ||
                         job.company.toLowerCase().includes(keywordLower) ||
                         job.description.toLowerCase().includes(keywordLower);

    return cityMatch && keywordMatch;
  });

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-slate-800">Find Your Next Job</h2>
        <p className="text-lg text-slate-600 mt-2">Browse our curated list of opportunities.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md max-w-6xl mx-auto">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 w-full max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* City Filter */}
            <div className="flex-1">
              <label htmlFor="city-filter" className="block text-sm font-medium text-slate-700 mb-2">
                🏙️ Filter by City
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="all">All Australia</option>
                <option value="melbourne">Melbourne</option>
                <option value="sydney">Sydney</option>
                <option value="brisbane">Brisbane</option>
                <option value="perth">Perth</option>
                <option value="adelaide">Adelaide</option>
                <option value="canberra">Canberra</option>
              </select>
            </div>

            {/* Keyword Search */}
            <div className="flex-1">
              <label htmlFor="keyword-search" className="block text-sm font-medium text-slate-700 mb-2">
                🔍 Search by Keyword
              </label>
              <input
                id="keyword-search"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., developer, barista, accountant..."
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-center text-sm text-slate-600">
            Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredJobs.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredJobs.map((job, index) => <JobCard key={job.id} job={job} index={index} />)}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-slate-500">
              {jobs.length === 0
                ? 'No jobs available right now. An administrator can add new jobs from the Admin Panel.'
                : 'No jobs match your search criteria. Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;