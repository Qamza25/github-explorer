export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
    type: string;
  };
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  closed_issues_count?: number;
  default_branch: string;
  license: {
    name?: string;
    spdx_id?: string | null;
  } | null;
  topics?: string[];
  has_issues?: boolean;
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

export interface RepositoryLanguages {
  [key: string]: number;
}

export interface SearchParams {
  query: string;
  page: number;
  perPage: number;
  sort: string;
  order: string;
  language?: string;
  minStars?: number;
  maxStars?: number;
}

export interface RepositoryHealth {
  score: number;
  issueHealth: number;
  commitHealth: number;
  communityHealth: number;
  explanation: string;
}