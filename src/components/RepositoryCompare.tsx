import React, { useState, useEffect, useCallback } from 'react';
import { Repository, RepositoryHealth } from '../types/repository.types';
import { githubService } from '../services/githubService';
import { formatNumber, formatDate } from '../utils/formatters';
import { HealthScore } from './HealthScore';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import './RepositoryCompare.css';

interface RepositoryCompareProps {
  repository1: Repository;
  repository2: Repository;
  onClose: () => void;
}

// Simple in-memory cache
const healthCache = new Map<string, { data: RepositoryHealth; timestamp: number }>();
const languagesCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const RepositoryCompare: React.FC<RepositoryCompareProps> = ({
  repository1,
  repository2,
  onClose
}) => {
  const [health1, setHealth1] = useState<RepositoryHealth | null>(null);
  const [health2, setHealth2] = useState<RepositoryHealth | null>(null);
  const [languages1, setLanguages1] = useState<any[]>([]);
  const [languages2, setLanguages2] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getHealthWithCache = useCallback(async (repo: Repository): Promise<RepositoryHealth> => {
    const cached = healthCache.get(repo.full_name);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await githubService.calculateHealthScore(repo);
    healthCache.set(repo.full_name, { data, timestamp: Date.now() });
    return data;
  }, []);

  const getLanguagesWithCache = useCallback(async (fullName: string): Promise<any[]> => {
    const cached = languagesCache.get(fullName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    const data = await githubService.getLanguageStats(fullName);
    languagesCache.set(fullName, { data, timestamp: Date.now() });
    return data;
  }, []);

  const incrementRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  useEffect(() => {
    const loadComparisonData = async () => {
      if (!repository1 || !repository2) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const [health1Data, health2Data, langs1, langs2] = await Promise.all([
          getHealthWithCache(repository1),
          getHealthWithCache(repository2),
          getLanguagesWithCache(repository1.full_name),
          getLanguagesWithCache(repository2.full_name)
        ]);
        
        setHealth1(health1Data);
        setHealth2(health2Data);
        setLanguages1(langs1.slice(0, 3));
        setLanguages2(langs2.slice(0, 3));
        resetRetry();
      } catch (err: any) {
        console.error('Error loading comparison data:', err);
        setError(err.message || 'Failed to load comparison data');
        incrementRetry();
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [repository1, repository2, retryCount, getHealthWithCache, getLanguagesWithCache, incrementRetry, resetRetry]);

  const handleRetry = () => {
    incrementRetry();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!repository1 || !repository2) return null;

  return (
    <div 
      className="compare-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Compare repositories"
    >
      <div className="compare-dialog">
        <div className="compare-content">
          <div className="compare-header">
            <h2 id="compare-title">Compare Repositories</h2>
            <button
              onClick={onClose}
              className="compare-close-btn"
              aria-label="Close comparison"
            >
              &times;
            </button>
          </div>

          <div className="compare-body">
            {loading ? (
              <div className="p-12">
                <LoadingSpinner message="Loading comparison data..." />
              </div>
            ) : error ? (
              <ErrorAlert 
                message={error} 
                onRetry={handleRetry}
              />
            ) : (
              <>
                <div className="compare-grid">
                  {/* Repository 1 */}
                  <div className="repo-card-compare" aria-label={`Repository: ${repository1.full_name}`}>
                    <div className="repo-header-compare">
                      <img
                        src={repository1.owner.avatar_url}
                        alt={`${repository1.owner.login}'s avatar`}
                        className="repo-avatar-compare"
                      />
                      <div className="repo-info-compare">
                        <h3>{repository1.name}</h3>
                        <p>@{repository1.owner.login}</p>
                      </div>
                    </div>

                    {health1 && <HealthScore health={health1} />}

                    <div className="stats-compare">
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository1.stargazers_count)}</span>
                        <span className="stat-compare-label">Stars</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository1.forks_count)}</span>
                        <span className="stat-compare-label">Forks</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository1.open_issues_count)}</span>
                        <span className="stat-compare-label">Issues</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatDate(repository1.created_at)}</span>
                        <span className="stat-compare-label">Created</span>
                      </div>
                    </div>

                    {languages1.length > 0 && (
                      <div className="languages-compare">
                        <h4>Top Languages</h4>
                        <div className="language-tags">
                          {languages1.map(lang => (
                            <span
                              key={lang.name}
                              className="language-tag"
                              aria-label={`${lang.name}: ${lang.percentage}%`}
                            >
                              {lang.name} ({lang.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Repository 2 */}
                  <div className="repo-card-compare" aria-label={`Repository: ${repository2.full_name}`}>
                    <div className="repo-header-compare">
                      <img
                        src={repository2.owner.avatar_url}
                        alt={`${repository2.owner.login}'s avatar`}
                        className="repo-avatar-compare"
                      />
                      <div className="repo-info-compare">
                        <h3>{repository2.name}</h3>
                        <p>@{repository2.owner.login}</p>
                      </div>
                    </div>

                    {health2 && <HealthScore health={health2} />}

                    <div className="stats-compare">
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository2.stargazers_count)}</span>
                        <span className="stat-compare-label">Stars</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository2.forks_count)}</span>
                        <span className="stat-compare-label">Forks</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatNumber(repository2.open_issues_count)}</span>
                        <span className="stat-compare-label">Issues</span>
                      </div>
                      <div className="stat-compare-item">
                        <span className="stat-compare-value">{formatDate(repository2.created_at)}</span>
                        <span className="stat-compare-label">Created</span>
                      </div>
                    </div>

                    {languages2.length > 0 && (
                      <div className="languages-compare">
                        <h4>Top Languages</h4>
                        <div className="language-tags">
                          {languages2.map(lang => (
                            <span
                              key={lang.name}
                              className="language-tag"
                              aria-label={`${lang.name}: ${lang.percentage}%`}
                            >
                              {lang.name} ({lang.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comparison Summary */}
                  <div className="comparison-summary">
                    <h4 className="summary-title">Comparison Summary</h4>
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-icon" aria-hidden="true">⭐</span>
                        <span>
                          {repository1.stargazers_count > repository2.stargazers_count
                            ? `${repository1.name} has ${formatNumber(repository1.stargazers_count - repository2.stargazers_count)} more stars`
                            : `${repository2.name} has ${formatNumber(repository2.stargazers_count - repository1.stargazers_count)} more stars`
                          }
                        </span>
                      </div>
                      <div className="summary-item">
                        <span className="summary-icon" aria-hidden="true">🍴</span>
                        <span>
                          {repository1.forks_count > repository2.forks_count
                            ? `${repository1.name} has ${formatNumber(repository1.forks_count - repository2.forks_count)} more forks`
                            : `${repository2.name} has ${formatNumber(repository2.forks_count - repository1.forks_count)} more forks`
                          }
                        </span>
                      </div>
                      {health1 && health2 && (
                        <>
                          <div className="summary-item">
                            <span className="summary-icon" aria-hidden="true">🏥</span>
                            <span>
                              {health1.score > health2.score
                                ? `${repository1.name} has better health score (${health1.score} vs ${health2.score})`
                                : `${repository2.name} has better health score (${health2.score} vs ${health1.score})`
                              }
                            </span>
                          </div>
                          <div className="summary-item">
                            <span className="summary-icon" aria-hidden="true">⚠️</span>
                            <span>
                              {repository1.open_issues_count < repository2.open_issues_count
                                ? `${repository1.name} has fewer open issues`
                                : `${repository2.name} has fewer open issues`
                              }
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="compare-footer">
            <button
              onClick={onClose}
              className="close-compare-btn"
              aria-label="Close comparison"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};