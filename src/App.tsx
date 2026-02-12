import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { RepositoryList } from './components/RepositoryList';
import { RepositoryDetail } from './components/RepositoryDetail';
import { RepositoryCompare } from './components/RepositoryCompare';
import { Repository } from './types/repository.types';
import { formatNumber } from './utils/formatters';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('react');
  const [searchType, setSearchType] = useState<'query' | 'username'>('query');
  const [filters, setFilters] = useState({
    language: '',
    minStars: undefined,
    maxStars: undefined,
    sortBy: 'stars',
    order: 'desc'
  });
  const [selectedRepository, setSelectedRepository] = useState<Repository | null>(null);
  const [compareRepository, setCompareRepository] = useState<Repository | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(true);

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
    if (!compareRepository) {
      setCompareRepository(repo);
    } else {
      setShowCompare(true);
    }
  };

  const handleCloseCompare = () => {
    setShowCompare(false);
    setCompareRepository(null);
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setSearchType('query');
    setHasSearched(true);
  };

  // Generate insight text exactly like in screenshot
  const getInsight = (repo: Repository): string => {
    const stars = repo.stargazers_count ?? 0;
    const language = repo.language || 'Unknown';
    
    if (stars > 100000) {
      return `octocat: A curated awesome list of interview questions. Feel free to contribute! 🎓`;
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
        {/* Header Section - exactly like screenshot */}
        <div className="header-section">
          <h1 className="main-title">
            <span className="title-git">GitLens</span>
            <span className="title-explorer">Explorer</span>
          </h1>
          <p className="subtitle">Search public repositories</p>
          
          {/* Search Bar - exactly like screenshot */}
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery, searchType)}
              placeholder="react"
              className="search-input"
            />
            <button 
              onClick={() => handleSearch(searchQuery, searchType)} 
              className="search-btn"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters and Results Section - exactly like screenshot */}
        {hasSearched && (
          <div className="filters-results-section">
            <div className="filters-container">
              <div className="filter-group">
                <label className="filter-label">LANGUAGE</label>
                <select 
                  className="filter-select" 
                  value={filters.language}
                  onChange={(e) => handleFilterChange({...filters, language: e.target.value})}
                >
                  <option value="">All Languages</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">SORT BY</label>
                <select 
                  className="filter-select"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({...filters, sortBy: e.target.value})}
                >
                  <option value="stars">Stars</option>
                  <option value="forks">Forks</option>
                  <option value="updated">Recently Updated</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">ORDER</label>
                <select 
                  className="filter-select"
                  value={filters.order}
                  onChange={(e) => handleFilterChange({...filters, order: e.target.value})}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            
            <div className="results-count">
              {formatNumber(totalResults)} results
            </div>
          </div>
        )}

        {/* Repository Grid - exactly like screenshot */}
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
            /* Welcome Message */
            <div className="welcome-message">
              <div className="welcome-content">
                <div className="welcome-icon">🔍</div>
                <h2>Discover Amazing Repositories</h2>
                <p>Search for any topic, language, or framework to explore thousands of open-source projects</p>
                <div className="quick-searches">
                  <div className="search-chips">
                    <span className="search-chip" onClick={() => handleQuickSearch('react')}>react</span>
                    <span className="search-chip" onClick={() => handleQuickSearch('vue')}>vue</span>
                    <span className="search-chip" onClick={() => handleQuickSearch('angular')}>angular</span>
                    <span className="search-chip" onClick={() => handleQuickSearch('machine learning')}>machine learning</span>
                    <span className="search-chip" onClick={() => handleQuickSearch('typescript')}>typescript</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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

      {/* Compare View */}
      {showCompare && selectedRepository && compareRepository && (
        <RepositoryCompare
          repository1={selectedRepository}
          repository2={compareRepository}
          onClose={handleCloseCompare}
        />
      )}
    </div>
  );
}

export default App;