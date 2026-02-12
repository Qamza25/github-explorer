import React, { useState, useEffect } from 'react';
import { Repository, RepositoryHealth } from '../types/repository.types';
import { githubService } from '../services/githubService';
import { formatNumber, formatDate } from '../utils/formatters';
import { HealthScore } from './HealthScore';
import { LoadingSpinner } from './LoadingSpinner';

interface RepositoryCompareProps {
  repository1: Repository | null;
  repository2: Repository | null;
  onClose: () => void;
}

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

  useEffect(() => {
    const loadComparisonData = async () => {
      if (!repository1 || !repository2) return;
      
      setLoading(true);
      try {
        const [health1Data, health2Data, langs1, langs2] = await Promise.all([
          githubService.calculateHealthScore(repository1),
          githubService.calculateHealthScore(repository2),
          githubService.getLanguageStats(repository1.full_name),
          githubService.getLanguageStats(repository2.full_name)
        ]);
        
        setHealth1(health1Data);
        setHealth2(health2Data);
        setLanguages1(langs1.slice(0, 3));
        setLanguages2(langs2.slice(0, 3));
      } catch (error) {
        console.error('Error loading comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComparisonData();
  }, [repository1, repository2]);

  if (!repository1 || !repository2) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0" onClick={onClose} />
        
        <div className="inline-block w-full max-w-6xl my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Compare Repositories</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span className="text-3xl">&times;</span>
            </button>
          </div>

          {loading ? (
            <div className="p-12">
              <LoadingSpinner message="Loading comparison data..." />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-8">
                {/* Repository 1 */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={repository1.owner.avatar_url}
                        alt={repository1.owner.login}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {repository1.name}
                        </h3>
                        <p className="text-gray-600">@{repository1.owner.login}</p>
                      </div>
                    </div>

                    {health1 && <HealthScore health={health1} />}

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Stars</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository1.stargazers_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Forks</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository1.forks_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issues</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository1.open_issues_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(repository1.created_at)}
                        </p>
                      </div>
                    </div>

                    {languages1.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Top Languages</p>
                        <div className="flex gap-2">
                          {languages1.map(lang => (
                            <span
                              key={lang.name}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {lang.name} ({lang.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Repository 2 */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={repository2.owner.avatar_url}
                        alt={repository2.owner.login}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {repository2.name}
                        </h3>
                        <p className="text-gray-600">@{repository2.owner.login}</p>
                      </div>
                    </div>

                    {health2 && <HealthScore health={health2} />}

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Stars</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository2.stargazers_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Forks</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository2.forks_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issues</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(repository2.open_issues_count)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(repository2.created_at)}
                        </p>
                      </div>
                    </div>

                    {languages2.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Top Languages</p>
                        <div className="flex gap-2">
                          {languages2.map(lang => (
                            <span
                              key={lang.name}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {lang.name} ({lang.percentage}%)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comparison Summary */}
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Comparison Summary</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {repository1.stargazers_count > repository2.stargazers_count
                        ? `⭐ ${repository1.name} has ${formatNumber(repository1.stargazers_count - repository2.stargazers_count)} more stars`
                        : `⭐ ${repository2.name} has ${formatNumber(repository2.stargazers_count - repository1.stargazers_count)} more stars`
                      }
                    </p>
                    {health1 && health2 && (
                      <p className="text-sm text-gray-600">
                        {health1.score > health2.score
                          ? `🏥 ${repository1.name} has better health score (${health1.score} vs ${health2.score})`
                          : `🏥 ${repository2.name} has better health score (${health2.score} vs ${health1.score})`
                        }
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {repository1.forks_count > repository2.forks_count
                        ? `🍴 ${repository1.name} has ${formatNumber(repository1.forks_count - repository2.forks_count)} more forks`
                        : `🍴 ${repository2.name} has ${formatNumber(repository2.forks_count - repository1.forks_count)} more forks`
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      {repository1.open_issues_count < repository2.open_issues_count
                        ? `⚠️ ${repository1.name} has fewer open issues`
                        : `⚠️ ${repository2.name} has fewer open issues`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};