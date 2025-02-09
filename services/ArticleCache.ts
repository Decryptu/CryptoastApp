import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Article } from "../types/article";

const LIST_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for lists
const ARTICLE_CACHE_EXPIRY = 1440 * 60 * 1000; // 24 hours for individual articles
const SEARCH_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for search results

const CACHE_PREFIX = {
	LISTS: "articles_list_cache_",
	ARTICLES: "article_cache_",
	CATEGORIES: "category_list_cache_",
	SEARCH: "search_cache_",
} as const;

type CacheEntry<T> = {
	data: T;
	timestamp: number;
};

const getCacheKey = (prefix: string, identifier: string): string => {
	return `${prefix}${identifier}`;
};

const isExpired = (timestamp: number, expiryTime: number): boolean => {
	return Date.now() - timestamp > expiryTime;
};

// Enhanced setArticlesCache to handle category information
export const setArticlesCache = async (
	type: string,
	articles: Article[],
	categoryId?: number | null,
): Promise<void> => {
	try {
		const cacheKey = getCacheKey(
			CACHE_PREFIX.LISTS,
			categoryId ? `${type}_cat_${categoryId}` : type,
		);

		const cacheEntry: CacheEntry<Article[]> = {
			data: articles,
			timestamp: Date.now(),
		};

		await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
		console.log(
			`📦 Cached ${articles.length} articles for ${type}${
				categoryId ? ` (category: ${categoryId})` : ""
			}`,
		);

		void cleanupCacheIfNeeded();
	} catch (error) {
		console.error("❌ Cache set error:", error);
	}
};

// Enhanced getArticlesCache to handle category information
export const getArticlesCache = async (
	type: string,
	categoryId?: number | null,
): Promise<Article[] | null> => {
	try {
		const cacheKey = getCacheKey(
			CACHE_PREFIX.LISTS,
			categoryId ? `${type}_cat_${categoryId}` : type,
		);
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) {
			console.log(
				`🔍 No cache found for ${type}${
					categoryId ? ` (category: ${categoryId})` : ""
				}`,
			);
			return null;
		}

		const cacheEntry: CacheEntry<Article[]> = JSON.parse(cached);

		if (isExpired(cacheEntry.timestamp, LIST_CACHE_EXPIRY)) {
			console.log(
				`⏰ Cache expired for ${type}${
					categoryId ? ` (category: ${categoryId})` : ""
				}`,
			);
			await AsyncStorage.removeItem(cacheKey);
			return null;
		}

		console.log(
			`✅ Cache hit for ${type}${
				categoryId ? ` (category: ${categoryId})` : ""
			}: ${cacheEntry.data.length} articles`,
		);
		return cacheEntry.data;
	} catch (error) {
		console.error("❌ Cache get error:", error);
		return null;
	}
};

// Individual article caching functions
export const setArticleCache = async (
	id: number,
	article: Article,
): Promise<void> => {
	try {
		const cacheKey = getCacheKey(CACHE_PREFIX.ARTICLES, id.toString());
		const cacheEntry: CacheEntry<Article> = {
			data: article,
			timestamp: Date.now(),
		};

		await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
		console.log(`📦 Cached article ${id}`);

		void cleanupCacheIfNeeded();
	} catch (error) {
		console.error("❌ Article cache set error:", error);
	}
};

export const getArticleCache = async (id: number): Promise<Article | null> => {
	try {
		const cacheKey = getCacheKey(CACHE_PREFIX.ARTICLES, id.toString());
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) {
			console.log(`🔍 No cache found for article ${id}`);
			return null;
		}

		const cacheEntry: CacheEntry<Article> = JSON.parse(cached);

		if (isExpired(cacheEntry.timestamp, ARTICLE_CACHE_EXPIRY)) {
			console.log(`⏰ Cache expired for article ${id}`);
			await AsyncStorage.removeItem(cacheKey);
			return null;
		}

		console.log(`✅ Cache hit for article ${id}`);
		return cacheEntry.data;
	} catch (error) {
		console.error("❌ Article cache get error:", error);
		return null;
	}
};

// Search caching functions
export const setSearchCache = async (
	query: string,
	articles: Article[],
): Promise<void> => {
	try {
		const normalizedQuery = query.toLowerCase().trim();
		const cacheKey = getCacheKey(CACHE_PREFIX.SEARCH, normalizedQuery);

		const cacheEntry: CacheEntry<Article[]> = {
			data: articles,
			timestamp: Date.now(),
		};

		await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
		console.log(
			`📦 Cached ${articles.length} search results for query: "${query}"`,
		);

		void cleanupCacheIfNeeded();
	} catch (error) {
		console.error("❌ Search cache set error:", error);
	}
};

export const getSearchCache = async (
	query: string,
): Promise<Article[] | null> => {
	try {
		const normalizedQuery = query.toLowerCase().trim();
		const cacheKey = getCacheKey(CACHE_PREFIX.SEARCH, normalizedQuery);
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) {
			console.log(`🔍 No cache found for search query: "${query}"`);
			return null;
		}

		const cacheEntry: CacheEntry<Article[]> = JSON.parse(cached);

		if (isExpired(cacheEntry.timestamp, SEARCH_CACHE_EXPIRY)) {
			console.log(`⏰ Cache expired for search query: "${query}"`);
			await AsyncStorage.removeItem(cacheKey);
			return null;
		}

		console.log(
			`✅ Cache hit for search query: "${query}" - ${cacheEntry.data.length} results`,
		);
		return cacheEntry.data;
	} catch (error) {
		console.error("❌ Search cache get error:", error);
		return null;
	}
};

// Cache management functions
export const clearCache = async (): Promise<void> => {
	try {
		const keys = await AsyncStorage.getAllKeys();
		const cacheKeys = keys.filter((key) =>
			Object.values(CACHE_PREFIX).some((prefix) => key.startsWith(prefix)),
		);
		await AsyncStorage.multiRemove(cacheKeys);
		console.log("🧹 Cache cleared");
	} catch (error) {
		console.error("❌ Cache clear error:", error);
	}
};

export const getCacheSize = async (): Promise<number> => {
	try {
		const keys = await AsyncStorage.getAllKeys();
		const cacheKeys = keys.filter((key) =>
			Object.values(CACHE_PREFIX).some((prefix) => key.startsWith(prefix)),
		);

		let totalSize = 0;
		for (const key of cacheKeys) {
			const value = await AsyncStorage.getItem(key);
			if (value) {
				totalSize += value.length;
			}
		}

		return totalSize;
	} catch (error) {
		console.error("❌ Error calculating cache size:", error);
		return 0;
	}
};

const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

export const cleanupCacheIfNeeded = async (): Promise<void> => {
	try {
		const currentSize = await getCacheSize();
		if (currentSize > MAX_CACHE_SIZE) {
			console.log("📢 Cache size exceeded, clearing old entries");
			await clearCache();
		}
	} catch (error) {
		console.error("❌ Cache cleanup error:", error);
	}
};
