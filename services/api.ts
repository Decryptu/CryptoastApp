import { CATEGORY_MAPPINGS } from '../data/categories';
import type { Article } from "../types/article";

export const API_URL = "https://cryptoast.fr/wp-json/wp/v2";

export type ContentSection = keyof typeof CATEGORY_MAPPINGS;

const buildCategoryParam = (categories?: number[]): string => {
	if (!categories?.length) return "";
	return `&categories=${categories.join(",")}`;
};

export const fetchLatestArticles = async (
	page = 1,
	perPage = 10,
	categories?: number[],
): Promise<Article[]> => {
	try {
		const categoryParam = buildCategoryParam(categories);
		const url = `${API_URL}/posts?page=${page}&per_page=${perPage}&_embed=true${categoryParam}`;

		console.log(`📡 Fetching from: ${url}`);

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data: Article[] = await response.json();
		console.log(`✅ Successfully fetched ${data.length} articles`);

		return data;
	} catch (error) {
		console.error("❌ Error fetching articles:", error);
		throw error;
	}
};

export const fetchSectionArticles = async (
	section: ContentSection,
	page = 1,
	perPage = 10,
): Promise<Article[]> => {
	try {
		console.log(`🔄 Fetching ${section} articles...`);
		// Create a mutable copy of the readonly array
		const categoryIds = [...CATEGORY_MAPPINGS[section]];
		const articles = await fetchLatestArticles(page, perPage, categoryIds);
		console.log(`✅ Fetched ${articles.length} ${section} articles`);
		return articles;
	} catch (error) {
		console.error(`❌ Error fetching ${section} articles:`, error);
		throw error;
	}
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
		const url = `${API_URL}/posts/${id}?_embed=true`;
		console.log(`📡 Fetching article: ${url}`);

		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const article = await response.json();
		console.log(`✅ Successfully fetched article ${id}`);

		return article;
	} catch (error) {
		console.error(`❌ Error fetching article ${id}:`, error);
		throw error;
	}
};
