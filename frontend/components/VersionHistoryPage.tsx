import React, { useState, useEffect } from 'react';
import type { Page, ResumeVersion } from '../types';
import { getVersions, deleteVersion } from '../services/versionHistoryService';
import { saveResume } from '../services/resumeService';
import { DocumentTextIcon, MinusCircleIcon } from './icons';

interface VersionHistoryPageProps {
    setPage: (page: Page) => void;
}

const VersionHistoryPage: React.FC<VersionHistoryPageProps> = ({ setPage }) => {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadVersions();
    }, []);

    const loadVersions = async () => {
        try {
            console.log('VersionHistoryPage: Loading versions...');
            setLoading(true);
            setError(null);
            const versionsList = await getVersions();
            console.log('VersionHistoryPage: Loaded', versionsList.length, 'versions');
            setVersions(versionsList);
        } catch (err) {
            console.error('VersionHistoryPage: Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load versions');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the version "${name}"?`)) {
            try {
                await deleteVersion(id);
                await loadVersions();
            } catch (err) {
                console.error('Failed to delete version:', err);
            }
        }
    };

    const handleLoad = async (version: ResumeVersion) => {
        if(window.confirm(`This will replace the current content in the Resume Builder with the version "${version.name}". Continue?`)) {
            try {
                await saveResume(version.data); // This makes it the "latest" resume
                setPage('builder');
            } catch (err) {
                console.error('Failed to load version:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-slate-50 h-full overflow-y-auto">
                <div className="text-center">
                    <p className="text-slate-600">Loading your resume versions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-slate-50 h-full overflow-y-auto">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Versions</h2>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={loadVersions}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 h-full overflow-y-auto">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Resume Version History</h2>
                <p className="text-slate-600 mb-12 max-w-2xl mx-auto">
                    Manage and load previously saved versions of your resume. You can save new versions from the Resume Builder.
                </p>
            </div>

            {versions.length > 0 ? (
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg border border-slate-200">
                    <ul className="space-y-4">
                        {versions.map((version) => (
                            <li key={version.id} className="p-4 border rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="mb-3 sm:mb-0">
                                    <p className="font-bold text-slate-800">{version.name}</p>
                                    <p className="text-sm text-slate-500">Saved on: {new Date(version.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-2 self-end sm:self-center">
                                    <button
                                        onClick={() => handleLoad(version)}
                                        className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
                                    >
                                        Load into Builder
                                    </button>
                                     <button
                                        onClick={() => handleDelete(version.id, version.name)}
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-100"
                                        title="Delete Version"
                                    >
                                        <MinusCircleIcon className="w-6 h-6"/>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center bg-white p-12 rounded-lg shadow-lg border border-slate-200 h-[50vh]">
                    <DocumentTextIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Saved Versions Yet</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-center">
                        Go to the Resume Builder and click "Save Version" to start tracking your changes.
                    </p>
                </div>
            )}
        </div>
    );
};

export default VersionHistoryPage;
