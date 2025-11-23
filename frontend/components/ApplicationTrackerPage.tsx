
import React, { useState, useEffect } from 'react';
import { PlusCircleIcon, MinusCircleIcon } from './icons';
import type { Application, ApplicationStatus } from '../types';
import {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteApplication
} from '../services/applicationService';

const ApplicationTrackerPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await getApplications();
      setApplications(apps);
      setError(null);
    } catch (e) {
      console.error("Failed to load applications", e);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    try {
      const newApp = await createApplication(company, role, dateApplied);
      if (newApp) {
        setApplications([newApp, ...applications]);

        // Reset form
        setCompany('');
        setRole('');
        setDateApplied(new Date().toISOString().split('T')[0]);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to add application:', err);
      setError('Failed to add application. Please try again.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      const updatedApps = applications.map(app =>
        app.id === id ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApps);
      setError(null);
    } catch (err) {
      console.error('Failed to update application:', err);
      setError('Failed to update application status. Please try again.');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this application entry?')) {
      try {
        await deleteApplication(id);
        setApplications(applications.filter(app => app.id !== id));
        setError(null);
      } catch (err) {
        console.error('Failed to delete application:', err);
        setError('Failed to delete application. Please try again.');
      }
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700";

  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
        case 'Applied': return 'bg-blue-100 text-blue-800';
        case 'Interviewing': return 'bg-yellow-100 text-yellow-800';
        case 'Offer': return 'bg-green-100 text-green-800';
        case 'Rejected': return 'bg-red-100 text-red-800';
    }
  }

  return (
    <div className="p-8 bg-slate-50 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 border-b pb-4">Application Tracker</h2>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Add Application Form */}
      <div className="mb-10 p-6 bg-white rounded-lg shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold mb-4 text-slate-800">Add New Application</h3>
        <form onSubmit={handleAddApplication} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label className={labelClass} htmlFor="company">Company</label>
                <input id="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label className={labelClass} htmlFor="role">Role</label>
                <input id="role" type="text" value={role} onChange={e => setRole(e.target.value)} className={inputClass} required />
            </div>
            <div>
                <label className={labelClass} htmlFor="date">Date Applied</label>
                <input id="date" type="date" value={dateApplied} onChange={e => setDateApplied(e.target.value)} className={inputClass} required />
            </div>
            <button type="submit" className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 h-10">
                <PlusCircleIcon className="w-5 h-5"/>
                <span>Add Application</span>
            </button>
        </form>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading applications...</div>
        ) : (
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="px-6 py-3">Company</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Date Applied</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                {applications.map(app => (
                    <tr key={app.id} className="bg-white border-b hover:bg-slate-50">
                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{app.company}</th>
                        <td className="px-6 py-4">{app.role}</td>
                        <td className="px-6 py-4">{new Date(app.dateApplied).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                            <select
                                value={app.status}
                                onChange={e => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                                className={`text-xs font-semibold p-1.5 rounded-md border-0 focus:ring-2 focus:ring-indigo-400 ${getStatusColor(app.status)}`}
                            >
                                <option>Applied</option>
                                <option>Interviewing</option>
                                <option>Offer</option>
                                <option>Rejected</option>
                            </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDeleteApplication(app.id)} className="text-red-500 hover:text-red-700"><MinusCircleIcon /></button>
                        </td>
                    </tr>
                ))}
                 {applications.length === 0 && !loading && (
                    <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-500">You haven't tracked any applications yet.</td>
                    </tr>
                )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicationTrackerPage;
