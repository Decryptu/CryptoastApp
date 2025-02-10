import React, { useState, useRef, useEffect } from "react";
import {
	View,
	TextInput,
	Pressable,
	FlatList,
	ActivityIndicator,
	Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ArticleCard } from "../components/ArticleCard";
import { ArticleSkeleton } from "../components/ArticleSkeleton";
import { getSearchCache, setSearchCache } from "../services/ArticleCache";
import colors from "tailwindcss/colors";
import type { Article } from "../types/article";

export default function SearchScreen() {
	const [query, setQuery] = useState("");
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const searchInputRef = useRef<TextInput>(null);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchInputRef.current?.focus();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, []);

	/**
	 * Fetch articles for a given page.
	 * For the first page, check the cache first and use cached results if available.
	 * For subsequent pages, load data from the network.
	 */
	const fetchArticles = async (pageNumber: number, isLoadingMore = false) => {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) return;

		if (pageNumber === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		try {
			// Check cache only for first page.
			if (pageNumber === 1) {
				const cachedResults = await getSearchCache(trimmedQuery);
				if (cachedResults) {
					console.log(
						`✅ Cache hit for search query: "${trimmedQuery}" - ${cachedResults.length} results`,
					);
					console.log("Using cached results");
					setArticles(cachedResults);
					setLoading(false);
					setHasSearched(true);
					// Removed: setHasMore(false) so that load more is still enabled.
					return;
				}
			}

			const response = await fetch(
				`https://cryptoast.fr/wp-json/wp/v2/posts?search=${encodeURIComponent(
					trimmedQuery,
				)}&page=${pageNumber}&per_page=10&_embed=true`,
			);

			// If loading more and the response status is 400, assume there are no more pages.
			if (!response.ok) {
				if (pageNumber > 1 && response.status === 400) {
					console.warn(
						`No more pages for query "${trimmedQuery}" on page ${pageNumber}.`,
					);
					setHasMore(false);
					return;
				}
				throw new Error(
					`Network response was not ok. Status: ${response.status}`,
				);
			}

			const data = await response.json();

			// Ensure that data is an array before using it.
			const articlesArray = Array.isArray(data) ? data : [];
			if (!Array.isArray(data)) {
				console.warn("Expected array from API, got:", data);
			}

			// Determine total pages from header and update hasMore accordingly.
			const totalPages = Number(response.headers.get("X-WP-TotalPages")) || 1;
			setHasMore(pageNumber < totalPages);

			if (isLoadingMore) {
				console.log("Loading more articles, page:", pageNumber);
				setArticles((prev) => [...prev, ...articlesArray]);
			} else {
				console.log("Setting articles for new search, page:", pageNumber);
				setArticles(articlesArray);
				// Cache only the first page of results.
				await setSearchCache(trimmedQuery, articlesArray);
			}
		} catch (error) {
			console.error("🔴 Search error:", error);
			setHasMore(false);
		} finally {
			setLoading(false);
			setLoadingMore(false);
			setHasSearched(true);
		}
	};

	const handleSearch = () => {
		if (!query.trim()) return;
		setPage(1);
		// Reset hasMore to true for a new search.
		setHasMore(true);
		setHasSearched(true);
		void fetchArticles(1);
	};

	const handleLoadMore = () => {
		// Only load more if:
		// 1. We're not already loading more
		// 2. There are more results to load
		// 3. We have at least 10 results
		// 4. We've performed a search
		if (loadingMore || !hasMore || articles.length < 10 || !hasSearched) return;

		const nextPage = page + 1;
		setPage(nextPage);
		void fetchArticles(nextPage, true);
	};

	const handleArticlePress = (article: Article) => {
		router.push({
			pathname: `/article/${article.id}`,
			params: { presentedFromSearch: "true" },
		});
	};

	const handleClearSearch = () => {
		setQuery("");
		setArticles([]);
		setPage(1);
		setHasMore(true);
		setHasSearched(false);
		searchInputRef.current?.focus();
	};

	const renderFooter = () => {
		if (loadingMore) {
			return (
				<View className="py-4 flex-row justify-center">
					<ActivityIndicator
						size="large"
						color={isDark ? colors.white : colors.black}
					/>
				</View>
			);
		}
		return null;
	};

	const renderEmpty = () => {
		if (loading) {
			return (
				<View className="space-y-4">
					{Array.from({ length: 3 }).map(() => (
						<ArticleSkeleton key={`skeleton-${Math.random()}`} />
					))}
				</View>
			);
		}

		if (hasSearched && articles.length === 0) {
			return (
				<View className="p-4 items-center">
					<Text className="text-zinc-600 dark:text-zinc-400 text-center text-lg">
						Aucun résultat trouvé pour "{query}"
					</Text>
				</View>
			);
		}

		return null;
	};

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
			<View className="flex-row items-center p-4 border-b border-zinc-200 dark:border-zinc-700">
				<Pressable onPress={() => router.back()} className="mr-3">
					<Feather
						name="arrow-left"
						size={24}
						color={isDark ? colors.white : colors.zinc[800]}
					/>
				</Pressable>
				<View className="flex-1 flex-row items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-2">
					<TextInput
						ref={searchInputRef}
						className="flex-1 text-zinc-900 dark:text-white ml-2"
						placeholder="Rechercher..."
						placeholderTextColor={isDark ? colors.zinc[400] : colors.zinc[500]}
						value={query}
						onChangeText={setQuery}
						onSubmitEditing={handleSearch}
						returnKeyType="search"
						autoFocus={true}
						autoCorrect={false}
						autoCapitalize="none"
					/>
					{query.length > 0 && (
						<Pressable onPress={handleClearSearch}>
							<Feather
								name="x"
								size={20}
								color={isDark ? colors.zinc[400] : colors.zinc[500]}
							/>
						</Pressable>
					)}
				</View>
			</View>

			<FlatList
				data={articles}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ArticleCard
						article={item}
						onPress={() => handleArticlePress(item)}
					/>
				)}
				contentContainerClassName="p-4"
				ListEmptyComponent={renderEmpty}
				ListFooterComponent={renderFooter}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
			/>
		</SafeAreaView>
	);
}
