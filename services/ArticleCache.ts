import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Article } from "../types/article";

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CACHE_PREFIX = "articles_cache_";

type CacheEntry = {
	data: Article[];
	timestamp: number;
};

const getCacheKey = async (type: string): Promise<string> => {
	return `${CACHE_PREFIX}${type}`;
};

export const setArticlesCache = async (
	type: string,
	articles: Article[],
): Promise<void> => {
	try {
		const cacheKey = await getCacheKey(type);
		const cacheEntry: CacheEntry = {
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
		const cacheKey = await getCacheKey(type);
		const cached = await AsyncStorage.getItem(cacheKey);

		if (!cached) return null;

		const cacheEntry: CacheEntry = JSON.parse(cached);
		const isExpired = Date.now() - cacheEntry.timestamp > CACHE_EXPIRY;

		if (isExpired) {
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

export const clearArticlesCache = async (): Promise<void> => {
	try {
		const keys = await AsyncStorage.getAllKeys();
		const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
		await AsyncStorage.multiRemove(cacheKeys);
		console.log("Cache cleared");
	} catch (error) {
		console.error("Cache clear error:", error);
	}
};
