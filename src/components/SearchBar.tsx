import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string, type: 'query' | 'username') => void;
  onFilterChange: (filters: {
    language?: string;
    minStars?: number;
    maxStars?: number;
    sortBy: string;
    order: string;
  }) => void;
  initialQuery?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'query' | 'username'>('query');
  const [showFilters, setShowFilters] = useState(false);
  const [language, setLanguage] = useState('');
  const [minStars, setMinStars] = useState('');
  const [maxStars, setMaxStars] = useState('');
  const [sortBy, setSortBy] = useState('stars');
  const [order, setOrder] = useState('desc');

  const handleSearch = () => {
    if (!query.trim()) return;
    
    let searchQuery = query;
    if (searchType === 'username' && !query.startsWith('@') && !query.startsWith('user:')) {
      searchQuery = `@${query}`;
    }
    
    onSearch(searchQuery, searchType);
  };

  const handleFilterChange = () => {
    onFilterChange({
      language: language || undefined,
      minStars: minStars ? parseInt(minStars) : undefined,
      maxStars: maxStars ? parseInt(maxStars) : undefined,
      sortBy,
      order
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Search Input */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 flex">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'username' 
                ? "Enter GitHub username..." 
                : "Search repositories: 'react', 'machine learning', 'typescript'..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSearchType('query')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchType === 'query'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setSearchType('username')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              searchType === 'username'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            By User
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4">Filter & Sort</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </select>
            </div>

            {/* Stars Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stars Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minStars}
                  onChange={(e) => {
                    setMinStars(e.target.value);
                    handleFilterChange();
                  }}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500 self-center">-</span>
                <input
                  type="number"
                  value={maxStars}
                  onChange={(e) => {
                    setMaxStars(e.target.value);
                    handleFilterChange();
                  }}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value);
                  handleFilterChange();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                setLanguage('');
                setMinStars('');
                setMaxStars('');
                setSortBy('stars');
                setOrder('desc');
                handleFilterChange();
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};