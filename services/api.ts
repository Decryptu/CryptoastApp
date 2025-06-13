// services/api.ts
import { API_CONFIG } from "../config/api";
import { CATEGORY_MAPPINGS } from "../data/categories";
import type { Article } from "../types/article";

export type ContentSection = keyof typeof CATEGORY_MAPPINGS | 'HOME' | 'ALL';

const buildCategoryParam = (categories?: number[]): string =>
	categories?.length ? `&categories=${categories.join(",")}` : "";

export const fetchLatestArticles = async (
	page = 1,
	perPage = API_CONFIG.ITEMS_PER_PAGE,
	categories?: number[],
): Promise<Article[]> => {
	try {
		const url = `${API_CONFIG.BASE_URL}/articles?page=${page}&per_page=${perPage}${buildCategoryParam(categories)}`;
		console.log(`📡 Fetching from cache server: ${url}`);

		const response = await fetch(url).catch((error) => {
			console.error("🔍 Fetch failed with error:", error.message, error.cause);
			throw error;
		});
		if (!response.ok) throw new Error(`API error: ${response.status}`);

		const data = await response.json();
		console.log(`✅ Fetched ${data.length} articles from cache`);
		return data;
	} catch (error) {
		console.error("❌ Error fetching articles:", error);
		throw error;
	}
};

export const fetchSectionArticles = async (
	section: Exclude<ContentSection, 'HOME' | 'ALL'>,
	page = 1,
	perPage = API_CONFIG.ITEMS_PER_PAGE,
): Promise<Article[]> => {
	try {
		const categoryIds = [...CATEGORY_MAPPINGS[section]];
		return fetchLatestArticles(page, perPage, categoryIds);
	} catch (error) {
		console.error(`❌ Error fetching ${section} articles:`, error);
		throw error;
	}
};

// Fetch all articles from all sections combined
export const fetchAll = (page = 1, perPage = 10) => {
	// Don't send any categories - just get the latest posts from all categories
	return fetchLatestArticles(page, perPage);
};

export const fetchGuides = (page = 1, perPage = 10) =>
	fetchSectionArticles("GUIDES", page, perPage);

export const fetchNews = (page = 1, perPage = 10) =>
	fetchSectionArticles("NEWS", page, perPage);

export const fetchReports = (page = 1, perPage = 10) =>
	fetchSectionArticles("REPORTS", page, perPage);

export const fetchSheets = (page = 1, perPage = 10) =>
	fetchSectionArticles("SHEETS", page, perPage);

export const fetchArticle = async (id: number): Promise<Article> => {
	try {
		const url = `${API_CONFIG.BASE_URL}/articles/${id}`;
		console.log(`📡 Fetching article from cache: ${url}`);

		const response = await fetch(url);
		if (!response.ok) throw new Error(`API error: ${response.status}`);

		const article = await response.json();
		console.log(`✅ Fetched article ${id} from cache`);
		return article;
	} catch (error) {
		console.error(`❌ Error fetching article ${id}:`, error);
		throw error;
	}
};