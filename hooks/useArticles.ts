// hooks/useArticles.ts
import { useState, useCallback, useEffect } from "react";
import { API_CONFIG } from "../config/api";
import type { Article } from "../types/article";

interface UseArticlesProps {
	fetchArticles: (
		page?: number,
		perPage?: number,
		categoryId?: number,
	) => Promise<Article[]>;
	logLabel: string;
	selectedCategory: number | null;
}

export function useArticles({
	fetchArticles,
	logLabel,
	selectedCategory,
}: UseArticlesProps) {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasMoreArticles, setHasMoreArticles] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	const fetchArticlesData = useCallback(
		async (page: number, forceRefresh = false) => {
			console.log(
				`🔍 Loading page ${page} of articles for category: ${selectedCategory || "all"}`,
			);

			// If forceRefresh is true, we can add a cache-busting query parameter
			const data = await fetchArticles(
				page,
				API_CONFIG.ITEMS_PER_PAGE,
				selectedCategory || undefined,
			);

			console.log(`✅ Fetched ${data.length} ${logLabel} for page ${page}`);

			if (data.length < API_CONFIG.ITEMS_PER_PAGE) {
				setHasMoreArticles(false);
			}

			return data;
		},
		[fetchArticles, logLabel, selectedCategory],
	);

	const loadArticles = useCallback(
		async (forceRefresh = false) => {
			try {
				setLoading(true);
				const data = await fetchArticlesData(1, forceRefresh);
				setArticles(data);
				setCurrentPage(1);
				setHasMoreArticles(data.length === API_CONFIG.ITEMS_PER_PAGE);
			} catch (error) {
				console.error(`❌ Failed to load ${logLabel}:`, error);
			} finally {
				setLoading(false);
			}
		},
		[fetchArticlesData, logLabel],
	);

	const loadMoreArticles = useCallback(async () => {
		if (loadingMore || !hasMoreArticles) return;

		try {
			setLoadingMore(true);
			console.log(`📥 Loading more articles (page ${currentPage + 1})`);

			const newArticles = await fetchArticlesData(currentPage + 1);
			setArticles((prev) => [...prev, ...newArticles]);
			setCurrentPage((prev) => prev + 1);

			if (newArticles.length < API_CONFIG.ITEMS_PER_PAGE) {
				setHasMoreArticles(false);
				console.log("📪 No more articles to load");
			}
		} catch (error) {
			console.error("❌ Failed to load more articles:", error);
		} finally {
			setLoadingMore(false);
		}
	}, [currentPage, fetchArticlesData, hasMoreArticles, loadingMore]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		setHasMoreArticles(true);
		await loadArticles(true);
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
