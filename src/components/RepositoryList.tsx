import React, { useState, useEffect, useCallback } from 'react';
import { Repository } from '../types/repository.types';
import { useRepositoryStore } from '../store/repositoryStore';
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
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 30;

  const {
    searchRepositoriesWithCache,
    setError: setStoreError,
    clearError
  } = useRepositoryStore();

  const loadRepositories = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    clearError();

    try {
      if (searchType === 'username') {
        await loadUserRepositories();
      } else {
        await loadSearchResults();
      }
    } catch (err: any) {
      handleError(err);
    }
  }, [searchQuery, searchType, filters, currentPage]);

  useEffect(() => {
    if (searchQuery) {
      loadRepositories();
    }
  }, [searchQuery, searchType, filters, currentPage, loadRepositories]);

  const loadSearchResults = async () => {
    const query = searchQuery.startsWith('@') 
      ? searchQuery.substring(1) 
      : searchQuery;

    const response = await searchRepositoriesWithCache(
      query,
      currentPage,
      filters.sortBy,
      filters.order,
      filters.language,
      filters.minStars,
      filters.maxStars
    );

    setRepositories(response.items);
    setTotalCount(response.total_count);
    setTotalPages(Math.ceil(response.total_count / itemsPerPage));
    onTotalCountChange(response.total_count);
    setLoading(false);
  };

  const loadUserRepositories = async () => {
    // This would need to be implemented with caching
    // For now, we'll use a placeholder
    setRepositories([]);
    setTotalCount(0);
    setTotalPages(0);
    onTotalCountChange(0);
    setLoading(false);
    setError('User repository search with caching is being implemented');
  };

  const sortRepositories = (repos: Repository[]): Repository[] => {
    const sorted = [...repos];
    
    sorted.sort((a, b) => {
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
      }
      
      return filters.order === 'asc' ? -comparison : comparison;
    });
    
    return sorted;
  };

  const handleError = (err: any) => {
    console.error('Error loading repositories:', err);
    
    if (err.response?.status === 404) {
      setError(`User "${searchQuery}" not found.`);
    } else if (err.response?.status === 403) {
      setError('Rate limit exceeded. Please wait a moment.');
    } else {
      setError(err.message || 'Failed to load repositories');
    }
    
    setLoading(false);
    setRepositories([]);
    setTotalCount(0);
    onTotalCountChange(0);
  };

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
                  >
                    ← Prev
                  </button>
                  <button className="pagination-btn active">
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="pagination-btn"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No repositories found</h3>
              <p>Try a different search term or filter</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};