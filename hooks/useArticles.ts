// hooks/useArticles.ts
import { useState, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import type { Article } from '../types/article';

interface UseArticlesProps {
  fetchArticles: (page?: number, perPage?: number, categoryId?: number) => Promise<Article[]>;
  logLabel: string;
  selectedCategory: number | null;
}

interface UseArticlesReturn {
  articles: Article[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  hasMoreArticles: boolean;
  loadMoreArticles: () => Promise<void>;
  handleRefresh: () => Promise<void>;
}

export function useArticles({
  fetchArticles,
  logLabel,
  selectedCategory,
}: UseArticlesProps): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPage = useCallback(async (page: number) => {
    const data = await fetchArticles(page, API_CONFIG.ITEMS_PER_PAGE, selectedCategory ?? undefined);
    console.log(`✅ Fetched ${data.length} ${logLabel} for page ${page}`);
    
    if (data.length < API_CONFIG.ITEMS_PER_PAGE) {
      setHasMoreArticles(false);
    }
    
    return data;
  }, [fetchArticles, logLabel, selectedCategory]);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadPage(1);
      setArticles(data);
      setCurrentPage(1);
      setHasMoreArticles(data.length === API_CONFIG.ITEMS_PER_PAGE);
    } catch (error) {
      console.error(`❌ Failed to load ${logLabel}:`, error);
    } finally {
      setLoading(false);
    }
  }, [loadPage, logLabel]);

  const loadMoreArticles = useCallback(async () => {
    if (loadingMore || !hasMoreArticles) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const newArticles = await loadPage(nextPage);
      
      setArticles(prev => [...prev, ...newArticles]);
      setCurrentPage(nextPage);
      
      if (newArticles.length < API_CONFIG.ITEMS_PER_PAGE) {
        setHasMoreArticles(false);
      }
    } catch (error) {
      console.error('❌ Failed to load more articles:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadPage, hasMoreArticles, loadingMore]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setHasMoreArticles(true);
    await loadArticles();
    setRefreshing(false);
  }, [loadArticles]);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  return {
    articles,
    loading,
    refreshing,
    loadingMore,
    hasMoreArticles,
    loadMoreArticles,
    handleRefresh,
  };
}