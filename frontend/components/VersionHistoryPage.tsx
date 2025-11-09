import React, { useEffect, useState } from 'react';
import { versionHistoryService, ResumeVersion } from '../services/versionHistoryService';

export default function VersionHistoryPage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('VersionHistoryPage: Component mounted');
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      console.log('VersionHistoryPage: Loading versions...');
      setLoading(true);
      setError(null);

      const data = await versionHistoryService.getVersions();
      console.log('VersionHistoryPage: Loaded', data.length, 'versions');

      setVersions(data);
    } catch (err) {
      console.error('VersionHistoryPage: Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  // IMPORTANT: Always render something
  if (loading) {
    return (
      <div className="version-history-page">
        <div className="loading">
          <p>Loading your resume versions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="version-history-page">
        <div className="error">
          <h2>Error Loading Versions</h2>
          <p>{error}</p>
          <button onClick={loadVersions}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="version-history-page">
      <h1>Resume Versions</h1>
      <p>{versions.length} version{versions.length !== 1 ? 's' : ''} saved</p>

      {versions.length === 0 ? (
        <div className="empty-state">
          <h2>No Saved Versions Yet</h2>
          <p>Your resume versions will appear here once you save them.</p>
        </div>
      ) : (
        <div className="versions-list">
          {versions.map((version) => (
            <div key={version.id} className="version-card">
              <h3>{version.name}</h3>
              <p>{new Date(version.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
