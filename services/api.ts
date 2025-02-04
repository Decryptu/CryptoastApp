import type { Article } from "../types/article";

const API_URL = "https://cryptoast.fr/wp-json/wp/v2";

export const fetchLatestArticles = async (
	page = 1,
	perPage = 10,
): Promise<Article[]> => {
	try {
		const response = await fetch(
			`${API_URL}/posts?page=${page}&per_page=${perPage}&_embed=true`,
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching articles:", error);
		throw error;
	}
};
