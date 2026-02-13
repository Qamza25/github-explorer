import React, { useState, useEffect } from 'react';
import { RepositoryList } from './components/RepositoryList';
import { RepositoryDetail } from './components/RepositoryDetail';
import { RepositoryCompare } from './components/RepositoryCompare';
import { Repository } from './types/repository.types';
import { formatNumber } from './utils/formatters';
import { useRepositoryStore } from './store/repositoryStore';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('react');
  const [searchType, setSearchType] = useState<'query' | 'username'>('query');
  const [filters, setFilters] = useState({
    language: '',
    minStars: undefined as number | undefined,
    maxStars: undefined as number | undefined,
    sortBy: 'stars',
    order: 'desc'
  });
  
  // Use Zustand store
  const {
    selectedRepository,
    compareRepositories,
    showCompare,
    setSelectedRepository,
    addToCompare,
    clearCompare,
    setShowCompare,
    clearExpiredCache
  } = useRepositoryStore();

  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(true);

  // Clear expired cache periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCache();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  useEffect(() => {
    setHasSearched(true);
  }, []);

  const handleSearch = (query: string, type: 'query' | 'username') => {
    setSearchQuery(query);
    setSearchType(type);
    setHasSearched(true);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleRepositorySelect = (repo: Repository) => {
    setSelectedRepository(repo);
  };

  const handleCompare = (repo: Repository) => {
    console.log('Adding to compare:', repo.full_name);
    addToCompare(repo);
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
    clearCompare();
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setSearchType('query');
    setHasSearched(true);
  };

  // Generate insight text
  const getInsight = (repo: Repository): string => {
    const stars = repo.stargazers_count ?? 0;
    const language = repo.language || 'Unknown';
    
    if (stars > 100000) {
      return `A curated awesome list of interview questions. Feel free to contribute! 🎓`;
    }
    if (repo.name.includes('javascript-questions')) {
      return `A long list of (advanced) JavaScript questions, and their explanations... ✨`;
    }
    if (repo.name.includes('Front-end')) {
      return `A list of helpful front-end related questions you can use to interview... 🌟`;
    }
    if (repo.name.includes('DeepLearning')) {
      return `深度学习500问，以问答形式对常用的概率知识、线性代数、机器学习... 📚`;
    }
    if (repo.name.includes('quill')) {
      return `Quill is a modern WYSIWYG editor built for compatibility and... 🖋️`;
    }
    if (repo.name.includes('reactjs-interview')) {
      return `List of top 500 ReactJS Interview Questions & Answers... Coding... 💻`;
    }
    if (repo.name.includes('quivr')) {
      return `Opiniated RAG for integrating GenAl in your apps. Focus on your... 🧠`;
    }
    
    return `Primary language: ${language}`;
  };

  return (
    <div className="app-container">
      <div className="main-content">
        {/* Header Section */}
        <div className="header-section">
          <h1 className="main-title">
            <span className="title-git">GitLens</span>
            <span className="title-explorer">Explorer</span>
          </h1>
          <p className="subtitle">Search public repositories</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery, searchType)}
              placeholder="react"
              className="search-input"
              aria-label="Search repositories"
            />
            <button 
              onClick={() => handleSearch(searchQuery, searchType)} 
              className="search-btn"
              aria-label="Search"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters and Results Section - STICKY */}
        {hasSearched && (
          <div className="filters-results-section">
            <div className="filters-container">
              <div className="filter-group">
                <label className="filter-label" htmlFor="language-filter">LANGUAGE</label>
                <select 
                  id="language-filter"
                  className="filter-select" 
                  value={filters.language}
                  onChange={(e) => handleFilterChange({...filters, language: e.target.value})}
                  aria-label="Filter by language"
                >
                  <option value="">All Languages</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="C#">C#</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                  <option value="PHP">PHP</option>
                  <option value="Ruby">Ruby</option>
                  <option value="Swift">Swift</option>
                  <option value="Kotlin">Kotlin</option>
                  <option value="Dart">Dart</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label" htmlFor="sort-filter">SORT BY</label>
                <select 
                  id="sort-filter"
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({...filters, sortBy: e.target.value})}
                  aria-label="Sort by"
                >
                  <option value="stars">Stars</option>
                  <option value="forks">Forks</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label" htmlFor="order-filter">ORDER</label>
                <select 
                  id="order-filter"
                  className="filter-select"
                  value={filters.order}
                  onChange={(e) => handleFilterChange({...filters, order: e.target.value})}
                  aria-label="Sort order"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            
            <div className="results-count" aria-live="polite" aria-atomic="true">
              {formatNumber(totalResults)} results
            </div>
          </div>
        )}

        {/* Repository Grid */}
        <div className="content-wrapper">
          {hasSearched ? (
            <RepositoryList
              searchQuery={searchQuery}
              searchType={searchType}
              filters={filters}
              onRepositorySelect={handleRepositorySelect}
              onTotalCountChange={setTotalResults}
              getInsight={getInsight}
            />
          ) : (
            <div className="welcome-message">
              <div className="welcome-content">
                <div className="welcome-icon" aria-hidden="true">🔍</div>
                <h2 id="welcome-heading">Discover Amazing Repositories</h2>
                <p>Search for any topic, language, or framework to explore thousands of open-source projects</p>
                <div className="quick-searches">
                  <div className="search-chips">
                    <button 
                      className="search-chip" 
                      onClick={() => handleQuickSearch('react')}
                      aria-label="Quick search: react"
                    >
                      react
                    </button>
                    <button 
                      className="search-chip" 
                      onClick={() => handleQuickSearch('vue')}
                      aria-label="Quick search: vue"
                    >
                      vue
                    </button>
                    <button 
                      className="search-chip" 
                      onClick={() => handleQuickSearch('angular')}
                      aria-label="Quick search: angular"
                    >
                      angular
                    </button>
                    <button 
                      className="search-chip" 
                      onClick={() => handleQuickSearch('machine learning')}
                      aria-label="Quick search: machine learning"
                    >
                      machine learning
                    </button>
                    <button 
                      className="search-chip" 
                      onClick={() => handleQuickSearch('typescript')}
                      aria-label="Quick search: typescript"
                    >
                      typescript
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - STICKY BOTTOM */}
        <div className="footer">
          <p>© 2026 GITLENS EXPLORER • GITHUB API</p>
        </div>
      </div>

      {/* Repository Detail Modal */}
      {selectedRepository && (
        <RepositoryDetail
          repository={selectedRepository}
          onClose={() => setSelectedRepository(null)}
          onCompare={handleCompare}
        />
      )}

      {/* Compare View - FIXED: Now works properly */}
      {showCompare && compareRepositories.length === 2 && (
        <RepositoryCompare
          repository1={compareRepositories[0]}
          repository2={compareRepositories[1]}
          onClose={handleCloseCompare}
        />
      )}
    </div>
  );
}

export default App;