import React, { useState, useEffect, useCallback } from 'react';
import { Repository } from '../types/repository.types';
import { githubService } from '../services/githubService';
import { RepositoryCard } from './RepositoryCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import './RepositoryList.css';

interface RepositoryListProps {
  searchQuery: string;
  searchType: 'query' | 'username';
  filters: {
    language?: string;
    minStars?: number;
    maxStars?: number;
    sortBy: string;
    order: string;
  };
  onRepositorySelect: (repo: Repository) => void;
  onTotalCountChange: (count: number) => void;
  getInsight: (repo: Repository) => string;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({
  searchQuery,
  searchType,
  filters,
  onRepositorySelect,
  onTotalCountChange,
  getInsight
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 30;

  const loadSearchResults = useCallback(async () => {
    const query = searchQuery.startsWith('@') 
      ? searchQuery.substring(1) 
      : searchQuery;

    const response = await githubService.searchRepositories(
      query,
      currentPage,
      filters.sortBy,
      filters.order,
      filters.language,
      filters.minStars,
      filters.maxStars
    );

    setRepositories(response.items);
    onTotalCountChange(response.total_count);
    setTotalPages(Math.ceil(response.total_count / itemsPerPage));
  }, [searchQuery, currentPage, filters, onTotalCountChange]);

  const loadUserRepositories = useCallback(async () => {
    const username = searchQuery.replace('@', '').replace('user:', '');
    
    const repos = await githubService.getUserRepositories(
      username,
      currentPage,
      itemsPerPage
    );

    let filteredRepos = [...repos];
    
    if (filters.language) {
      filteredRepos = filteredRepos.filter(repo => 
        repo.language?.toLowerCase() === filters.language?.toLowerCase()
      );
    }

    if (filters.minStars !== undefined) {
      filteredRepos = filteredRepos.filter(repo => 
        repo.stargazers_count >= (filters.minStars || 0)
      );
    }

    if (filters.maxStars !== undefined) {
      filteredRepos = filteredRepos.filter(repo => 
        repo.stargazers_count <= (filters.maxStars || Infinity)
      );
    }

    // Apply sorting
    filteredRepos.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'stars':
          comparison = (b.stargazers_count || 0) - (a.stargazers_count || 0);
          break;
        case 'forks':
          comparison = (b.forks_count || 0) - (a.forks_count || 0);
          break;
        case 'updated':
          const dateA = new Date(a.updated_at || 0).getTime();
          const dateB = new Date(b.updated_at || 0).getTime();
          comparison = dateB - dateA;
          break;
        default:
          comparison = (b.stargazers_count || 0) - (a.stargazers_count || 0);
      }
      
      return filters.order === 'asc' ? -comparison : comparison;
    });

    setRepositories(filteredRepos);
    onTotalCountChange(filteredRepos.length);
    setTotalPages(Math.ceil(filteredRepos.length / itemsPerPage));
  }, [searchQuery, currentPage, filters, onTotalCountChange]);

  const handleError = useCallback((err: any) => {
    console.error('Error loading repositories:', err);
    
    if (err.response?.status === 404) {
      setError(`User "${searchQuery}" not found.`);
    } else if (err.response?.status === 403) {
      setError('Rate limit exceeded. Please wait a moment.');
    } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network')) {
      setError('Network error. Please check your connection.');
    } else {
      setError(err.message || 'Failed to load repositories');
    }
    
    setLoading(false);
    setRepositories([]);
    onTotalCountChange(0);
  }, [searchQuery, onTotalCountChange]);

  const loadRepositories = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (searchType === 'username') {
        await loadUserRepositories();
      } else {
        await loadSearchResults();
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, loadSearchResults, loadUserRepositories, handleError]);

  useEffect(() => {
    if (searchQuery) {
      loadRepositories();
    }
  }, [searchQuery, searchType, filters, currentPage, loadRepositories]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="repository-list">
      {loading ? (
        <LoadingSpinner message="Loading repositories..." />
      ) : error ? (
        <ErrorAlert message={error} onRetry={loadRepositories} />
      ) : (
        <>
          {repositories.length > 0 ? (
            <>
              <div className="repo-grid">
                {repositories.map((repo) => (
                  <RepositoryCard
                    key={repo.id}
                    repository={repo}
                    onClick={() => onRepositorySelect(repo)}
                    getInsight={getInsight}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className="pagination-btn"
                    onClick={previousPage}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    ← Prev
                  </button>
                  <button 
                    className="pagination-btn active"
                    aria-label={`Page ${currentPage} of ${totalPages}`}
                    aria-current="page"
                  >
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon" aria-hidden="true">🔍</div>
              <h3>No repositories found</h3>
              <p>Try a different search term or filter</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};