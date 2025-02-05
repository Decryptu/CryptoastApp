import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Article } from "../types/article";

const LIST_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes for lists
const ARTICLE_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes for individual articles
const CACHE_PREFIX = {
	LISTS: "articles_list_cache_",
	ARTICLES: "article_cache_",
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

// List caching functions
export const setArticlesCache = async (
	type: string,
	articles: Article[],
): Promise<void> => {
	try {
		const cacheKey = getCacheKey(CACHE_PREFIX.LISTS, type);
		const cacheEntry: CacheEntry<Article[]> = {
			data: articles,
			timestamp: Date.now(),
		};

		await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
		console.log(`Cached ${articles.length} articles for ${type}`);
	} catch (error) {
		console.error("Cache set error:", error);
	}
};

export const getArticlesCache = async (
	type: string,
): Promise<Article[] | null> => {
	try {
		const cacheKey = getCacheKey(CACHE_PREFIX.LISTS, type);
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) return null;

		const cacheEntry: CacheEntry<Article[]> = JSON.parse(cached);

		if (isExpired(cacheEntry.timestamp, LIST_CACHE_EXPIRY)) {
			console.log(`Cache expired for ${type}`);
			await AsyncStorage.removeItem(cacheKey);
			return null;
		}

		console.log(`Cache hit for ${type}: ${cacheEntry.data.length} articles`);
		return cacheEntry.data;
	} catch (error) {
		console.error("Cache get error:", error);
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
		console.log(`Cached article ${id}`);
	} catch (error) {
		console.error("Article cache set error:", error);
	}
};

export const getArticleCache = async (id: number): Promise<Article | null> => {
	try {
		const cacheKey = getCacheKey(CACHE_PREFIX.ARTICLES, id.toString());
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) return null;

		const cacheEntry: CacheEntry<Article> = JSON.parse(cached);

		if (isExpired(cacheEntry.timestamp, ARTICLE_CACHE_EXPIRY)) {
			console.log(`Cache expired for article ${id}`);
			await AsyncStorage.removeItem(cacheKey);
			return null;
		}

		console.log(`Cache hit for article ${id}`);
		return cacheEntry.data;
	} catch (error) {
		console.error("Article cache get error:", error);
		return null;
	}
};

export const clearCache = async (): Promise<void> => {
	try {
		const keys = await AsyncStorage.getAllKeys();
		const cacheKeys = keys.filter(
			(key) =>
				key.startsWith(CACHE_PREFIX.LISTS) ||
				key.startsWith(CACHE_PREFIX.ARTICLES),
		);
		await AsyncStorage.multiRemove(cacheKeys);
		console.log("Cache cleared");
	} catch (error) {
		console.error("Cache clear error:", error);
	}
};

// Cache size management
export const getCacheSize = async (): Promise<number> => {
	try {
		const keys = await AsyncStorage.getAllKeys();
		const cacheKeys = keys.filter(
			(key) =>
				key.startsWith(CACHE_PREFIX.LISTS) ||
				key.startsWith(CACHE_PREFIX.ARTICLES),
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
		console.error("Error calculating cache size:", error);
		return 0;
	}
};

const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

export const cleanupCacheIfNeeded = async (): Promise<void> => {
	try {
		const currentSize = await getCacheSize();
		if (currentSize > MAX_CACHE_SIZE) {
			console.log("Cache size exceeded, clearing old entries");
			await clearCache();
		}
	} catch (error) {
		console.error("Cache cleanup error:", error);
	}
};
