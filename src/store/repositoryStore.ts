import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { 
  Repository, 
  RepositoryHealth, 
  GitHubSearchResponse 
} from '../types/repository.types';
import { githubService } from '../services/githubService';

// Cache item with timestamp
interface CacheItem<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SEARCH_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for search results

interface RepositoryState {
  // Cache stores
  repositoryCache: Map<string, CacheItem<Repository>>;
  healthCache: Map<string, CacheItem<RepositoryHealth>>;
  languagesCache: Map<string, CacheItem<any[]>>;
  readmeCache: Map<string, CacheItem<string>>;
  searchCache: Map<string, CacheItem<GitHubSearchResponse>>;
  
  // Compare state
  compareRepositories: Repository[];
  showCompare: boolean;
  selectedRepository: Repository | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  errorType: 'network' | 'rate-limit' | 'malformed' | 'unknown' | null;
  retryCount: number;
  
  // Actions
  addToCompare: (repo: Repository) => void;
  removeFromCompare: (repoId: number) => void;
  clearCompare: () => void;
  setShowCompare: (show: boolean) => void;
  setSelectedRepository: (repo: Repository | null) => void;
  
  // Cached API calls
  getRepositoryWithCache: (fullName: string, forceRefresh?: boolean) => Promise<Repository>;
  getHealthWithCache: (repo: Repository, forceRefresh?: boolean) => Promise<RepositoryHealth>;
  getLanguagesWithCache: (fullName: string, forceRefresh?: boolean) => Promise<any[]>;
  getReadmeWithCache: (owner: string, repo: string, forceRefresh?: boolean) => Promise<string>;
  searchRepositoriesWithCache: (
    query: string,
    page: number,
    sort: string,
    order: string,
    language?: string,
    minStars?: number,
    maxStars?: number,
    forceRefresh?: boolean
  ) => Promise<GitHubSearchResponse>;
  
  // Error handling
  setError: (error: string | null, type?: RepositoryState['errorType']) => void;
  clearError: () => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  
  // Cache management
  clearCache: () => void;
  clearExpiredCache: () => void;
}

// Helper function to generate cache keys
const generateCacheKey = (...args: (string | number | undefined)[]): string => {
  return args.filter(arg => arg !== undefined).join('_');
};

type RepositoryPersist = Pick<RepositoryState, 'compareRepositories'>;

const persistOptions: PersistOptions<RepositoryState, RepositoryPersist> = {
  name: 'github-explorer-storage',
  partialize: (state: RepositoryState) => ({
    compareRepositories: state.compareRepositories
  })
};

export const useRepositoryStore = create<RepositoryState>()(
  persist(
    (set, get): RepositoryState => ({
      // Initialize caches
      repositoryCache: new Map(),
      healthCache: new Map(),
      languagesCache: new Map(),
      readmeCache: new Map(),
      searchCache: new Map(),
      
      // Compare state
      compareRepositories: [],
      showCompare: false,
      selectedRepository: null,
      
      // UI State
      isLoading: false,
      error: null,
      errorType: null,
      retryCount: 0,
      
      // Compare actions
      addToCompare: (repo: Repository) => {
        set((state: RepositoryState) => {
          // Don't add if already in compare list
          if (state.compareRepositories.some((r: Repository) => r.id === repo.id)) {
            return state;
          }
          // Limit to 2 repositories for comparison
          const newCompare = [...state.compareRepositories, repo].slice(-2);
          return {
            ...state,
            compareRepositories: newCompare,
            showCompare: newCompare.length === 2
          };
        });
      },
      
      removeFromCompare: (repoId: number) => {
        set((state: RepositoryState) => ({
          ...state,
          compareRepositories: state.compareRepositories.filter((r: Repository) => r.id !== repoId),
          showCompare: state.compareRepositories.length - 1 === 2 ? false : state.showCompare
        }));
      },
      
      clearCompare: () => {
        set((state: RepositoryState) => ({
          ...state,
          compareRepositories: [],
          showCompare: false
        }));
      },
      
      setShowCompare: (show: boolean) => {
        set((state: RepositoryState) => ({
          ...state,
          showCompare: show
        }));
      },
      
      setSelectedRepository: (repo: Repository | null) => {
        set((state: RepositoryState) => ({
          ...state,
          selectedRepository: repo
        }));
      },
      
      // Cached API calls with error handling
      getRepositoryWithCache: async (fullName: string, forceRefresh: boolean = false) => {
        const state = get();
        const cache = state.repositoryCache;
        const cached = cache.get(fullName);
        
        if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
        
        try {
          const [owner, repo] = fullName.split('/');
          const data = await githubService.getRepositoryDetails(owner, repo);
          
          set((state: RepositoryState) => {
            const newCache = new Map(state.repositoryCache);
            newCache.set(fullName, {
              data,
              timestamp: Date.now()
            });
            return {
              ...state,
              repositoryCache: newCache
            };
          });
          
          return data;
        } catch (error) {
          if (cached) {
            // Return stale data if available
            return cached.data;
          }
          throw error;
        }
      },
      
      getHealthWithCache: async (repo: Repository, forceRefresh: boolean = false) => {
        const state = get();
        const cacheKey = repo.full_name;
        const cache = state.healthCache;
        const cached = cache.get(cacheKey);
        
        if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
        
        try {
          const data = await githubService.calculateHealthScore(repo);
          
          set((state: RepositoryState) => {
            const newCache = new Map(state.healthCache);
            newCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
            return {
              ...state,
              healthCache: newCache
            };
          });
          
          return data;
        } catch (error) {
          if (cached) return cached.data;
          throw error;
        }
      },
      
      getLanguagesWithCache: async (fullName: string, forceRefresh: boolean = false) => {
        const state = get();
        const cacheKey = `lang_${fullName}`;
        const cache = state.languagesCache;
        const cached = cache.get(cacheKey);
        
        if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
        
        try {
          const data = await githubService.getLanguageStats(fullName);
          
          set((state: RepositoryState) => {
            const newCache = new Map(state.languagesCache);
            newCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
            return {
              ...state,
              languagesCache: newCache
            };
          });
          
          return data;
        } catch (error) {
          if (cached) return cached.data;
          return []; // Return empty array as fallback
        }
      },
      
      getReadmeWithCache: async (owner: string, repo: string, forceRefresh: boolean = false) => {
        const state = get();
        const cacheKey = `readme_${owner}/${repo}`;
        const cache = state.readmeCache;
        const cached = cache.get(cacheKey);
        
        if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
          return cached.data;
        }
        
        try {
          const data = await githubService.getReadme(owner, repo);
          
          set((state: RepositoryState) => {
            const newCache = new Map(state.readmeCache);
            newCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
            return {
              ...state,
              readmeCache: newCache
            };
          });
          
          return data;
        } catch (error) {
          if (cached) return cached.data;
          return '# README not available';
        }
      },
      
      searchRepositoriesWithCache: async (
        query: string,
        page: number,
        sort: string,
        order: string,
        language?: string,
        minStars?: number,
        maxStars?: number,
        forceRefresh: boolean = false
      ) => {
        const state = get();
        const cacheKey = generateCacheKey(query, page, sort, order, language, minStars, maxStars);
        const cache = state.searchCache;
        const cached = cache.get(cacheKey);
        
        if (!forceRefresh && cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL) {
          return cached.data;
        }
        
        try {
          const data = await githubService.searchRepositories(
            query,
            page,
            sort,
            order,
            language,
            minStars,
            maxStars
          );
          
          set((state: RepositoryState) => {
            const newCache = new Map(state.searchCache);
            newCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
            return {
              ...state,
              searchCache: newCache
            };
          });
          
          return data;
        } catch (error: any) {
          // Handle specific error types
          if (error.response?.status === 403) {
            get().setError('Rate limit exceeded. Please wait a moment.', 'rate-limit');
          } else if (error.response?.status === 404) {
            get().setError('Repository not found.', 'unknown');
          } else if (error.code === 'ECONNABORTED' || error.message?.includes('Network')) {
            get().setError('Network error. Please check your connection.', 'network');
          } else {
            get().setError('An error occurred. Please try again.', 'unknown');
          }
          
          if (cached) {
            return cached.data;
          }
          
          // Return empty response as fallback
          return {
            total_count: 0,
            incomplete_results: false,
            items: []
          };
        }
      },
      
      // Error handling
      setError: (error: string | null, type: RepositoryState['errorType'] = 'unknown') => {
        set((state: RepositoryState) => ({
          ...state,
          error,
          errorType: type,
          isLoading: false
        }));
      },
      
      clearError: () => {
        set((state: RepositoryState) => ({
          ...state,
          error: null,
          errorType: null
        }));
      },
      
      incrementRetry: () => {
        set((state: RepositoryState) => ({
          ...state,
          retryCount: state.retryCount + 1
        }));
      },
      
      resetRetry: () => {
        set((state: RepositoryState) => ({
          ...state,
          retryCount: 0
        }));
      },
      
      // Cache management
      clearCache: () => {
        set((state: RepositoryState) => ({
          ...state,
          repositoryCache: new Map(),
          healthCache: new Map(),
          languagesCache: new Map(),
          readmeCache: new Map(),
          searchCache: new Map()
        }));
      },
      
      clearExpiredCache: () => {
        const now = Date.now();
        set((state: RepositoryState) => {
          const newRepoCache = new Map(state.repositoryCache);
          const newHealthCache = new Map(state.healthCache);
          const newLangCache = new Map(state.languagesCache);
          const newReadmeCache = new Map(state.readmeCache);
          const newSearchCache = new Map(state.searchCache);
          
          // Remove expired entries - using Array.from for ES5 compatibility
          Array.from(newRepoCache.entries()).forEach(([key, value]) => {
            if (now - value.timestamp > CACHE_TTL) newRepoCache.delete(key);
          });
          
          Array.from(newHealthCache.entries()).forEach(([key, value]) => {
            if (now - value.timestamp > CACHE_TTL) newHealthCache.delete(key);
          });
          
          Array.from(newLangCache.entries()).forEach(([key, value]) => {
            if (now - value.timestamp > CACHE_TTL) newLangCache.delete(key);
          });
          
          Array.from(newReadmeCache.entries()).forEach(([key, value]) => {
            if (now - value.timestamp > CACHE_TTL) newReadmeCache.delete(key);
          });
          
          Array.from(newSearchCache.entries()).forEach(([key, value]) => {
            if (now - value.timestamp > SEARCH_CACHE_TTL) newSearchCache.delete(key);
          });
          
          return {
            ...state,
            repositoryCache: newRepoCache,
            healthCache: newHealthCache,
            languagesCache: newLangCache,
            readmeCache: newReadmeCache,
            searchCache: newSearchCache
          };
        });
      }
    }),
    persistOptions
  )
);