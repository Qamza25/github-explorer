import React, { useState, useEffect } from 'react';
import { RepositoryHealth } from '../types/repository.types';

interface HealthScoreProps {
  health: RepositoryHealth;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ health }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">🏥</span>
        Repository Health Score
      </h3>
      
      <div className="flex items-center mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={health.score >= 80 ? '#10B981' : health.score >= 60 ? '#F59E0B' : health.score >= 40 ? '#F97316' : '#EF4444'}
              strokeWidth="3"
              strokeDasharray={`${health.score}, 100`}
            />
            <text x="18" y="20.5" textAnchor="middle" className={`text-2xl font-bold ${getScoreColor(health.score)}`}>
              {health.score}
            </text>
          </svg>
        </div>
        <div className="ml-6 flex-1">
          <p className="text-gray-700 mb-2">{health.explanation}</p>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-500">Issues:</span>
              <span className="ml-1 font-semibold">{health.issueHealth}%</span>
            </div>
            <div>
              <span className="text-gray-500">Activity:</span>
              <span className="ml-1 font-semibold">{health.commitHealth}%</span>
            </div>
            <div>
              <span className="text-gray-500">Community:</span>
              <span className="ml-1 font-semibold">{health.communityHealth}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Issue Resolution</span>
            <span className="font-medium">{health.issueHealth}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${health.issueHealth}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Recent Activity</span>
            <span className="font-medium">{health.commitHealth}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${health.commitHealth}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Community</span>
            <span className="font-medium">{health.communityHealth}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${health.communityHealth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};