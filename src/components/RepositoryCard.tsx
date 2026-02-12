import React from 'react';
import { Repository } from '../types/repository.types';
import { formatNumber, getTimeAgo } from '../utils/formatters';
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
    console.log('Card clicked:', repository.full_name); // Debug log
    onClick();
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
    <div className="repo-card" onClick={handleClick}>
      <div className="repo-header">
        <img
          src={repository.owner.avatar_url}
          alt={repository.owner.login}
          className="repo-avatar"
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
          <span className={`language-badge ${getLanguageClass(repository.language)}`}>
            {repository.language.toUpperCase()}
          </span>
        </div>
      )}

      <div className="insight-container">
        <div className="insight-badge">
          <span className="insight-icon">📌</span>
          <span className="insight-text">{getInsight(repository)}</span>
        </div>
      </div>

      <div className="repo-stats">
        <div className="stat-item">
          <span className="stat-value">{formatNumber(repository.stargazers_count)}</span>
          <span className="stat-label">STARS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatNumber(repository.forks_count)}</span>
          <span className="stat-label">FORKS</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatNumber(repository.open_issues_count)}</span>
          <span className="stat-label">ISSUES</span>
        </div>
      </div>
    </div>
  );
};