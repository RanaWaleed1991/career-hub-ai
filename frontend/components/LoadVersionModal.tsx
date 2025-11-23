import React, { useState, useEffect } from 'react';
import type { ResumeData, ResumeVersion } from '../types';
import { getVersions } from '../services/versionHistoryService';

interface LoadVersionModalProps {
  onClose: () => void;
  onLoad: (resumeData: ResumeData) => void;
}

const LoadVersionModal: React.FC<LoadVersionModalProps> = ({ onClose, onLoad }) => {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        setLoading(true);
        const versionsList = await getVersions();
        setVersions(versionsList);
      } catch (error) {
        console.error('Failed to load versions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVersions();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800">Load a Resume Version</h3>
            <p className="text-sm text-slate-500">Select a previously saved version to load into the builder.</p>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-slate-500 text-sm">Loading versions...</p>
            </div>
          ) : versions.length > 0 ? (
            <ul className="space-y-3">
              {versions.map(version => (
                <li key={version.id} className="p-3 border rounded-md flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div>
                    <p className="font-bold text-slate-700">{version.name}</p>
                    <p className="text-xs text-slate-500">Saved on: {new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => onLoad(version.data)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 py-8">No saved versions found. Save a version from the Resume Builder to get started.</p>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
             <button
              onClick={onClose}
              type="button"
              className="inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-6 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoadVersionModal;
