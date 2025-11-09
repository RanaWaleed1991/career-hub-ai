
import React, { useState, useEffect } from 'react';
import type { Page, ResumeData, Application } from '../types';
import ProgressTracker from './ProgressTracker';
import TrialStatus from './TrialStatus';
import { getLatestResume } from '../services/resumeService';
import { BookOpenIcon, BriefcaseIcon, DocumentChartBarIcon, DocumentTextIcon, EnvelopeIcon, ClipboardDocumentCheckIcon } from './icons';

const APP_TRACKER_KEY = 'career_hub_app_tracker';

interface DashboardProps {
    setPage: (page: Page) => void;
    openTailorModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage, openTailorModal }) => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resume = await getLatestResume();
                setResumeData(resume);
            } catch (e) {
                console.error("Failed to load resume for dashboard", e);
            }

            try {
                const savedApps = localStorage.getItem(APP_TRACKER_KEY);
                if (savedApps) {
                    setApplications(JSON.parse(savedApps));
                }
            } catch (e) {
                console.error("Failed to load applications for dashboard", e);
            }
        };

        loadData();
    }, []);

    const applicationSummary = {
        applied: applications.filter(a => a.status === 'Applied').length,
        interviewing: applications.filter(a => a.status === 'Interviewing').length,
    };

    const quickActions = [
        { title: "Edit My Resume", page: 'builder', icon: DocumentTextIcon, color: 'bg-indigo-100 text-indigo-600' },
        { title: "Tailor for a Job", action: openTailorModal, icon: ClipboardDocumentCheckIcon, color: 'bg-rose-100 text-rose-600' },
        { title: "Generate Cover Letter", page: 'coverLetter', icon: EnvelopeIcon, color: 'bg-purple-100 text-purple-600' },
    ];
    
    const toolkitActions = [
        { title: "Find Jobs", page: 'jobs', icon: BriefcaseIcon },
        { title: "Explore Courses", page: 'courses', icon: BookOpenIcon },
        { title: "Resume Analyser", page: 'analyser', icon: DocumentChartBarIcon },
    ]

    return (
        <div className="p-8 bg-slate-50 h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-8">
                    {resumeData && (
                        <div className="opacity-0 slide-in-up" style={{ animationDelay: `100ms` }}>
                            <ProgressTracker data={resumeData} />
                        </div>
                    )}
                    <div className="opacity-0 slide-in-up" style={{ animationDelay: `200ms` }}>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {quickActions.map(action => (
                                <button
                                    key={action.title}
                                    onClick={() => action.page ? setPage(action.page as Page) : action.action?.()}
                                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-left w-full flex flex-col items-center border border-slate-200"
                                >
                                    <div className={`p-3 rounded-lg ${action.color} inline-flex self-center mb-4`}>
                                        <action.icon className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-md font-semibold text-slate-800">{action.title}</h4>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="opacity-0 slide-in-up" style={{ animationDelay: `600ms` }}>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Your Career Toolkit</h3>
                        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 space-y-2">
                             {toolkitActions.map(action => (
                                <button key={action.title} onClick={() => setPage(action.page as Page)} className="w-full flex items-center p-3 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="p-2 rounded-lg bg-slate-200 text-slate-600 mr-4">
                                       <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-slate-700">{action.title}</span>
                                    <span className="ml-auto text-slate-400">&rarr;</span>
                                </button>
                             ))}
                        </div>
                    </div>

                </div>
                
                {/* Sidebar */}
                <div className="space-y-8">
                    <TrialStatus />
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `400ms` }}>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">Application Summary</h3>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Active Applications</span>
                                <span className="font-bold text-slate-800">{applicationSummary.applied}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">Interviews</span>
                                <span className="font-bold text-slate-800">{applicationSummary.interviewing}</span>
                            </div>
                        </div>
                        <button onClick={() => setPage('tracker')} className="mt-4 w-full text-center px-4 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-md hover:bg-slate-300 transition-colors">
                            View Full Tracker
                        </button>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 opacity-0 slide-in-up" style={{ animationDelay: `500ms` }}>
                        <h3 className="text-xl font-semibold text-slate-800 mb-4">My Resume Versions</h3>
                        <div className="text-center py-4 text-slate-500 text-sm">
                            <p>This feature is coming soon!</p>
                            <p>Save and compare different resume versions.</p>
                        </div>
                         <button onClick={() => setPage('versions')} className="mt-2 w-full text-center px-4 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-md hover:bg-slate-300 transition-colors">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
