
import React, { useState, useEffect } from 'react';
import type { Page, ResumeData, Application } from '../types';
import ProgressTracker from './ProgressTracker';
import TrialStatus from './TrialStatus';
import { getLatestResume } from '../services/resumeService';
import { getApplications } from '../services/applicationService';
import { getVersions } from '../services/versionHistoryService';
import { hasPremium } from '../services/premiumService';
import { createPortalSession } from '../services/payments';
import { getAccessToken } from '../services/userService';
import { BookOpenIcon, BriefcaseIcon, DocumentChartBarIcon, DocumentTextIcon, EnvelopeIcon, ClipboardDocumentCheckIcon, CogIcon } from './icons';

interface DashboardProps {
    setPage: (page: Page) => void;
    openTailorModal: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage, openTailorModal }) => {
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [versionCount, setVersionCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [isLoadingPortal, setIsLoadingPortal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const resume = await getLatestResume();
                setResumeData(resume);

                // Fetch applications from API instead of localStorage
                const apps = await getApplications();
                setApplications(apps);

                // Fetch version count
                const versions = await getVersions();
                setVersionCount(versions.length);

                // Check if user has premium
                const premium = await hasPremium();
                setIsPremium(premium);
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleManageSubscription = async () => {
        try {
            setIsLoadingPortal(true);
            const token = await getAccessToken();
            if (!token) {
                alert('Please log in to manage your subscription');
                return;
            }

            const { portalUrl } = await createPortalSession(token);
            window.location.href = portalUrl;
        } catch (error) {
            console.error('Failed to open customer portal:', error);
            alert('Failed to open subscription management. Please try again.');
        } finally {
            setIsLoadingPortal(false);
        }
    };

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

                    {/* Manage Subscription Button - Only show for premium users */}
                    {isPremium && (
                        <div className="opacity-0 slide-in-up" style={{ animationDelay: `350ms` }}>
                            <button
                                onClick={handleManageSubscription}
                                disabled={isLoadingPortal}
                                className="w-full bg-white p-4 rounded-xl shadow-lg border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-indigo-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CogIcon className="w-5 h-5" />
                                {isLoadingPortal ? 'Opening...' : 'Manage Subscription'}
                            </button>
                        </div>
                    )}

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
                        <div className="text-center py-4">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">{versionCount}</div>
                            <p className="text-slate-600 text-sm">
                                {versionCount === 0 ? 'No versions saved yet' :
                                 versionCount === 1 ? 'Version saved' :
                                 'Versions saved'}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                                Free tier: Up to 3 versions
                            </p>
                        </div>
                         <button onClick={() => setPage('versions')} className="mt-2 w-full text-center px-4 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-md hover:bg-slate-300 transition-colors">
                            Manage Versions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
