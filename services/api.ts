import type { Article } from "../types/article";

export const API_URL = "https://cryptoast.fr/wp-json/wp/v2";

export const fetchLatestArticles = async (
	page = 1,
	perPage = 10,
	categoryId?: number, // Add category parameter
): Promise<Article[]> => {
	try {
		const categoryParam = categoryId ? `&categories=${categoryId}` : "";
		const response = await fetch(
			`${API_URL}/posts?page=${page}&per_page=${perPage}&_embed=true${categoryParam}`,
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();
		console.log(
			`Fetched ${data.length} articles for category ${categoryId || "all"}`,
		);
		return data;
	} catch (error) {
		console.error("Error fetching articles:", error);
		throw error;
	}
};

export const fetchGuides = async (page = 1, perPage = 10) =>
	fetchLatestArticles(page, perPage, 1878); // Category X for guides

export const fetchNews = async (page = 1, perPage = 10) =>
	fetchLatestArticles(page, perPage, 1878); // Category 1878 for news

export const fetchArticle = async (id: number): Promise<Article> => {
	try {
		const response = await fetch(`${API_URL}/posts/${id}?_embed=true`);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching article:", error);
		throw error;
	}
};
