import type { Article } from "../types/article";

export const API_URL = "https://cryptoast.fr/wp-json/wp/v2";

// Category IDs constants
export const CATEGORY_IDS = {
	GUIDES: [
		112, 111, 114, 108, 79, 69, 115, 66, 113, 70, 99, 2756, 78, 71, 3, 3885,
		3886, 3887, 5172,
	],
	NEWS: [62, 3890, 94, 521, 90, 1877, 95, 91, 1878, 89, 92],
	REPORTS: [4301],
	SHEETS: [5],
} as const;

// Type for content sections
export type ContentSection = "guides" | "news" | "reports" | "sheets";

/**
 * Builds category parameter string for API URL
 * @param categories - Array of category IDs
 * @returns Formatted category parameter string
 */
const buildCategoryParam = (categories?: number[]): string => {
	if (!categories?.length) return "";
	return `&categories=${categories.join(",")}`;
};

/**
 * Fetches articles from the API with pagination and category filtering
 * @param page - Page number to fetch
 * @param perPage - Number of articles per page
 * @param categories - Optional array of category IDs to filter by
 * @returns Promise containing array of articles
 */
export const fetchLatestArticles = async (
	page = 1,
	perPage = 10,
	categories?: number[],
): Promise<Article[]> => {
	try {
		const categoryParam = buildCategoryParam(categories);
		const url = `${API_URL}/posts?page=${page}&per_page=${perPage}&_embed=true${categoryParam}`;

		console.log(`Fetching articles from: ${url}`);

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const data = await response.json();
		console.log(
			`Successfully fetched ${data.length} articles${categories ? ` for categories: ${categories.join(", ")}` : ""}`,
		);

		return data;
	} catch (error) {
		console.error("Error fetching articles:", error);
		throw error;
	}
};

/**
 * Fetches articles for a specific content section
 * @param section - Content section to fetch
 * @param page - Page number
 * @param perPage - Articles per page
 * @returns Promise containing array of articles
 */
export const fetchSectionArticles = async (
	section: ContentSection,
	page = 1,
	perPage = 10,
): Promise<Article[]> => {
	const sectionKey = section.toUpperCase() as keyof typeof CATEGORY_IDS;
	// Create a mutable copy of the readonly array
	const categoryIds = [...CATEGORY_IDS[sectionKey]];
	return fetchLatestArticles(page, perPage, categoryIds);
};

// Convenience methods for each section
export const fetchGuides = async (page = 1, perPage = 10) =>
	fetchSectionArticles("guides", page, perPage);

export const fetchNews = async (page = 1, perPage = 10) =>
	fetchSectionArticles("news", page, perPage);

export const fetchReports = async (page = 1, perPage = 10) =>
	fetchSectionArticles("reports", page, perPage);

export const fetchSheets = async (page = 1, perPage = 10) =>
	fetchSectionArticles("sheets", page, perPage);

/**
 * Fetches a single article by ID
 * @param id - Article ID to fetch
 * @returns Promise containing single article
 */
export const fetchArticle = async (id: number): Promise<Article> => {
	try {
		const url = `${API_URL}/posts/${id}?_embed=true`;
		console.log(`Fetching article: ${url}`);

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}

		const article = await response.json();
		console.log(`Successfully fetched article ${id}`);

		return article;
	} catch (error) {
		console.error(`Error fetching article ${id}:`, error);
		throw error;
	}
};
