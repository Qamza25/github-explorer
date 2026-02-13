import React from 'react';
import { RepositoryHealth } from '../types/repository.types';
import './HealthScore.css';

interface HealthScoreProps {
  health: RepositoryHealth;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ health }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#F97316';
    return '#EF4444';
  };

  const scoreColorClass = getScoreColor(health.score);

  return (
    <div className="health-score-container">
      <h3 className="health-score-title">
        <span className="health-score-icon">🏥</span>
        Repository Health Score
      </h3>
      
      <div className="health-score-main">
        <div className="score-circle-container">
          <svg className="score-circle-svg" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3a3f44"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={getProgressColor(health.score)}
              strokeWidth="3"
              strokeDasharray={`${health.score}, 100`}
              strokeLinecap="round"
            />
            <text 
              x="18" 
              y="22" 
              textAnchor="middle" 
              className={`score-text ${scoreColorClass}`}
              style={{ 
                fontSize: '10px', 
                fontWeight: 'bold',
                fill: '#ffffff' /* WHITE text for the score number */
              }}
            >
              {health.score}
            </text>
          </svg>
        </div>
        
        <div className="score-explanation">
          <p className="score-explanation-text">{health.explanation}</p>
          <div className="score-breakdown">
            <div className="score-breakdown-item">
              Issues: <span className="score-breakdown-value">{health.issueHealth}%</span>
            </div>
            <div className="score-breakdown-item">
              Activity: <span className="score-breakdown-value">{health.commitHealth}%</span>
            </div>
            <div className="score-breakdown-item">
              Community: <span className="score-breakdown-value">{health.communityHealth}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-header">
            <span className="metric-label">Issue Resolution</span>
            <span className="metric-value">{health.issueHealth}%</span>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill blue"
              style={{ width: `${health.issueHealth}%` }}
              role="progressbar"
              aria-valuenow={health.issueHealth}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        
        <div className="metric-item">
          <div className="metric-header">
            <span className="metric-label">Recent Activity</span>
            <span className="metric-value">{health.commitHealth}%</span>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill green"
              style={{ width: `${health.commitHealth}%` }}
              role="progressbar"
              aria-valuenow={health.commitHealth}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        
        <div className="metric-item">
          <div className="metric-header">
            <span className="metric-label">Community</span>
            <span className="metric-value">{health.communityHealth}%</span>
          </div>
          <div className="metric-bar">
            <div
              className="metric-fill purple"
              style={{ width: `${health.communityHealth}%` }}
              role="progressbar"
              aria-valuenow={health.communityHealth}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};