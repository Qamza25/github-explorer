import axios from 'axios';
import { 
  Repository, 
  GitHubSearchResponse, 
  RepositoryLanguages,
  RepositoryHealth 
} from '../types/repository.types';

const API_URL = 'https://api.github.com';
const TOKEN = process.env.REACT_APP_GITHUB_TOKEN || '';

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
};

export const githubService = {
  // Search repositories with advanced filters
  async searchRepositories(
    query: string,
    page: number = 1,
    sort: string = 'stars',
    order: string = 'desc',
    language?: string,
    minStars?: number,
    maxStars?: number
  ): Promise<GitHubSearchResponse> {
    let searchQuery = query.trim();
    
    if (language) {
      searchQuery += ` language:${language}`;
    }
    if (minStars) {
      searchQuery += ` stars:>=${minStars}`;
    }
    if (maxStars) {
      searchQuery += ` stars:<=${maxStars}`;
    }

    const params = {
      q: searchQuery,
      per_page: 30,
      page,
      sort,
      order
    };

    const response = await axios.get(`${API_URL}/search/repositories`, { 
      params, 
      headers 
    });
    return response.data;
  },

  // Get user repositories
  async getUserRepositories(
    username: string,
    page: number = 1,
    perPage: number = 30
  ): Promise<Repository[]> {
    const params = {
      per_page: perPage,
      page,
      sort: 'updated',
      type: 'public'
    };

    const response = await axios.get(`${API_URL}/users/${username}/repos`, {
      params,
      headers
    });
    return response.data;
  },

  // Get repository details
  async getRepositoryDetails(owner: string, repo: string): Promise<Repository> {
    const response = await axios.get(`${API_URL}/repos/${owner}/${repo}`, { headers });
    return response.data;
  },

  // Get repository languages
  async getRepositoryLanguages(owner: string, repo: string): Promise<RepositoryLanguages> {
    const response = await axios.get(`${API_URL}/repos/${owner}/${repo}/languages`, { headers });
    return response.data;
  },

  // Get README content
  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const response = await axios.get(
        `${API_URL}/repos/${owner}/${repo}/readme`,
        { headers: { ...headers, Accept: 'application/vnd.github.v3.raw' } }
      );
      return response.data;
    } catch (error) {
      return '# README not available';
    }
  },

  // Get repository issues (for health score)
  async getRepositoryIssues(owner: string, repo: string): Promise<{ open: number; closed: number }> {
    try {
      const [openResponse, closedResponse] = await Promise.all([
        axios.get(`${API_URL}/repos/${owner}/${repo}/issues`, {
          params: { state: 'open', per_page: 1 },
          headers
        }),
        axios.get(`${API_URL}/repos/${owner}/${repo}/issues`, {
          params: { state: 'closed', per_page: 1 },
          headers
        })
      ]);

      const openCount = parseInt(openResponse.headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || 
                         openResponse.data.length.toString());
      const closedCount = parseInt(closedResponse.headers['link']?.match(/page=(\d+)>; rel="last"/)?.[1] || 
                          closedResponse.data.length.toString());

      return { open: openCount, closed: closedCount };
    } catch (error) {
      return { open: 0, closed: 0 };
    }
  },

  // Calculate repository health score
  async calculateHealthScore(repo: Repository): Promise<RepositoryHealth> {
    const [owner, repoName] = repo.full_name.split('/');
    
    // Get issues data
    const issues = await this.getRepositoryIssues(owner, repoName);
    
    // Calculate commit recency
    const lastCommit = new Date(repo.pushed_at).getTime();
    const now = new Date().getTime();
    const daysSinceLastCommit = Math.floor((now - lastCommit) / (1000 * 60 * 60 * 24));
    
    // Calculate scores
    // Issue health: ratio of closed to total issues
    const totalIssues = issues.open + issues.closed;
    const issueHealth = totalIssues > 0 
      ? Math.round((issues.closed / totalIssues) * 100)
      : 100;
    
    // Commit recency: 100 if within 7 days, decreasing after
    const commitHealth = daysSinceLastCommit <= 7 
      ? 100 
      : Math.max(0, 100 - (daysSinceLastCommit - 7) * 2);
    
    // Community health: stars vs forks ratio
    const communityHealth = repo.stargazers_count > 0
      ? Math.min(100, Math.round((repo.forks_count / repo.stargazers_count) * 50) + 50)
      : 50;
    
    // Overall score (weighted average)
    const score = Math.round(
      (issueHealth * 0.4) + 
      (commitHealth * 0.3) + 
      (communityHealth * 0.3)
    );

    let explanation = '';
    if (score >= 80) {
      explanation = 'Excellent health! This repository is actively maintained with good community engagement.';
    } else if (score >= 60) {
      explanation = 'Good health. Regular maintenance with active community participation.';
    } else if (score >= 40) {
      explanation = 'Fair health. May need more active maintenance or community engagement.';
    } else {
      explanation = 'Needs attention. Consider checking for recent activity and issue resolution.';
    }

    return {
      score,
      issueHealth,
      commitHealth,
      communityHealth,
      explanation
    };
  },

  // Get languages with percentages
  async getLanguageStats(fullName: string): Promise<{ name: string; percentage: number; bytes: number }[]> {
    const [owner, repo] = fullName.split('/');
    const languages = await this.getRepositoryLanguages(owner, repo);
    
    const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: Math.round((bytes / total) * 1000) / 10
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }
};