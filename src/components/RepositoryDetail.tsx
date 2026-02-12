import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Repository, RepositoryHealth } from '../types/repository.types';
import { githubService } from '../services/githubService';
import { formatNumber, formatDate, formatSize } from '../utils/formatters';
import { HealthScore } from './HealthScore';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import './RepositoryDetail.css';

interface RepositoryDetailProps {
  repository: Repository;
  onClose: () => void;
  onCompare?: (repo: Repository) => void;
}

export const RepositoryDetail: React.FC<RepositoryDetailProps> = ({
  repository,
  onClose,
  onCompare
}) => {
  const [languages, setLanguages] = useState<{ name: string; percentage: number; bytes: number }[]>([]);
  const [readme, setReadme] = useState<string>('');
  const [health, setHealth] = useState<RepositoryHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepositoryData = async () => {
      if (!repository) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Loading repository data for:', repository.full_name);
        
        const [langs, readmeContent, healthData] = await Promise.all([
          githubService.getLanguageStats(repository.full_name),
          githubService.getReadme(repository.owner.login, repository.name),
          githubService.calculateHealthScore(repository)
        ]);
        
        setLanguages(langs);
        setReadme(readmeContent);
        setHealth(healthData);
      } catch (err) {
        console.error('Error loading repository details:', err);
        setError('Failed to load repository details');
      } finally {
        setLoading(false);
      }
    };

    loadRepositoryData();
  }, [repository]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  const getLanguageClass = (language: string) => {
    const lang = language.toLowerCase();
    if (lang.includes('typescript')) return 'typescript';
    if (lang.includes('javascript')) return 'javascript';
    if (lang.includes('python')) return 'python';
    if (lang.includes('java')) return 'java';
    if (lang.includes('c++')) return 'cplusplus';
    if (lang.includes('c#')) return 'csharp';
    if (lang.includes('go')) return 'go';
    if (lang.includes('rust')) return 'rust';
    if (lang.includes('php')) return 'php';
    if (lang.includes('ruby')) return 'ruby';
    return 'default';
  };

  if (!repository) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-dialog">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <img
                src={repository.owner.avatar_url}
                alt={repository.owner.login}
                className="modal-avatar"
              />
              <div className="modal-title-text">
                <h2>{repository.full_name}</h2>
                <p className="modal-visibility">
                  {repository.private ? 'Private' : 'Public'} repository
                </p>
              </div>
            </div>
            <div className="modal-actions">
              {onCompare && (
                <button
                  onClick={() => onCompare(repository)}
                  className="compare-btn"
                >
                  Compare
                </button>
              )}
              <button onClick={handleCloseClick} className="close-btn">
                &times;
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body">
            {loading ? (
              <LoadingSpinner message="Loading repository details..." />
            ) : error ? (
              <ErrorAlert message={error} onRetry={() => window.location.reload()} />
            ) : (
              <>
                {/* Description */}
                {repository.description && (
                  <div className="info-section">
                    <h3 className="section-title">Description</h3>
                    <p style={{ color: '#24292e', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                      {repository.description}
                    </p>
                  </div>
                )}

                {/* Health Score */}
                {health && (
                  <div className="info-section">
                    <HealthScore health={health} />
                  </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-card-value">{formatNumber(repository.stargazers_count)}</span>
                    <span className="stat-card-label">Stars</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card-value">{formatNumber(repository.forks_count)}</span>
                    <span className="stat-card-label">Forks</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card-value">{formatNumber(repository.open_issues_count)}</span>
                    <span className="stat-card-label">Open Issues</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-card-value">{formatNumber(repository.watchers_count)}</span>
                    <span className="stat-card-label">Watchers</span>
                  </div>
                </div>

                {/* Languages */}
                {languages.length > 0 && (
                  <div className="info-section">
                    <h3 className="section-title">Languages</h3>
                    <div className="languages-section">
                      {languages.map((lang) => (
                        <div key={lang.name} className="language-item">
                          <div className="language-header">
                            <span className="language-name">{lang.name}</span>
                            <span className="language-percentage">{lang.percentage}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`progress-fill ${getLanguageClass(lang.name)}`}
                              style={{ width: `${lang.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repository Info */}
                <div className="info-section">
                  <h3 className="section-title">Repository Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Created</span>
                      <span className="info-value">{formatDate(repository.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Last Updated</span>
                      <span className="info-value">{formatDate(repository.updated_at)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Size</span>
                      <span className="info-value">{formatSize(repository.size)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Default Branch</span>
                      <span className="info-value">{repository.default_branch}</span>
                    </div>
                    {repository.license && (
                      <div className="info-item">
                        <span className="info-label">License</span>
                        <span className="info-value">
                          {repository.license.name || repository.license.spdx_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* README Preview */}
                {readme && readme !== '# README not available' && (
                  <div className="readme-section">
                    <h3 className="section-title">README</h3>
                    <div className="readme-content">
                      <ReactMarkdown>{readme}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="github-btn"
            >
              View on GitHub
            </a>
            <button onClick={handleCloseClick} className="close-modal-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};