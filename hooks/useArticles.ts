import { useState, useCallback, useEffect } from "react";
import { getArticlesCache, setArticlesCache } from "../services/ArticleCache";
import type { Article } from "../types/article";

const ITEMS_PER_PAGE = 10;

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
			const cacheKey = `${logLabel}-${selectedCategory || "all"}-page-${page}`;
			console.log(
				`🔍 Loading page ${page} of articles for category: ${selectedCategory || "all"}`,
			);

			if (!forceRefresh) {
				const cachedArticles = await getArticlesCache(cacheKey);
				if (cachedArticles) {
					console.log(`📦 Using cached articles for ${cacheKey}`);
					return cachedArticles;
				}
			}

			console.log(`🔄 Fetching fresh articles for ${cacheKey}`);
			const data = await fetchArticles(
				page,
				ITEMS_PER_PAGE,
				selectedCategory || undefined,
			);
			console.log(`✅ Fetched ${data.length} ${logLabel} for page ${page}`);

			if (data.length < ITEMS_PER_PAGE) {
				setHasMoreArticles(false);
			}

			await setArticlesCache(cacheKey, data);
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
				setHasMoreArticles(data.length === ITEMS_PER_PAGE);
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

			if (newArticles.length < ITEMS_PER_PAGE) {
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
