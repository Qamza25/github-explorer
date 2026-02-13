import React from 'react';
import { Repository } from '../types/repository.types';
import { formatNumber } from '../utils/formatters';
import './RepositoryCard.css';

interface RepositoryCardProps {
  repository: Repository;
  onClick: () => void;
  getInsight: (repo: Repository) => string;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onClick,
  getInsight
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked:', repository.full_name);
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const getLanguageClass = (language: string | null) => {
    if (!language) return 'default';
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

  return (
    <div 
      className="repo-card" 
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${repository.full_name}`}
    >
      <div className="repo-header">
        <img
          src={repository.owner.avatar_url}
          alt={`${repository.owner.login}'s avatar`}
          className="repo-avatar"
          aria-hidden="true"
        />
        <div className="repo-info">
          <h3 className="repo-name">{repository.name}</h3>
          <p className="repo-owner">@{repository.owner.login}</p>
        </div>
      </div>

      <p className="repo-description">
        {repository.description || 'No description provided.'}
      </p>

      {repository.language && (
        <div className="language-container">
          <span 
            className={`language-badge ${getLanguageClass(repository.language)}`}
            aria-label={`Primary language: ${repository.language}`}
          >
            {repository.language.toUpperCase()}
          </span>
        </div>
      )}

      <div className="insight-container">
        <div className="insight-badge">
          <span className="insight-icon" aria-hidden="true">📌</span>
          <span className="insight-text">{getInsight(repository)}</span>
        </div>
      </div>

      <div className="repo-stats">
        <div className="stat-item">
          <span className="stat-value" aria-label={`${formatNumber(repository.stargazers_count)} stars`}>
            {formatNumber(repository.stargazers_count)}
          </span>
          <span className="stat-label">STARS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" aria-label={`${formatNumber(repository.forks_count)} forks`}>
            {formatNumber(repository.forks_count)}
          </span>
          <span className="stat-label">FORKS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value" aria-label={`${formatNumber(repository.open_issues_count)} open issues`}>
            {formatNumber(repository.open_issues_count)}
          </span>
          <span className="stat-label">ISSUES</span>
        </div>
      </div>
    </div>
  );
};