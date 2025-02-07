import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, Pressable, FlatList } from "react-native";
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
	const searchInputRef = useRef<TextInput>(null);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	// Focus input when screen mounts
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			searchInputRef.current?.focus();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, []);

	const handleSearch = async () => {
		const trimmedQuery = query.trim();
		if (!trimmedQuery) return;

		setLoading(true);
		try {
			// Check cache first
			const cachedResults = await getSearchCache(trimmedQuery);
			if (cachedResults) {
				setArticles(cachedResults);
				setLoading(false);
				return;
			}

			// Fetch from API if not in cache
			const response = await fetch(
				`https://cryptoast.fr/wp-json/wp/v2/posts?search=${encodeURIComponent(trimmedQuery)}&page=1&per_page=10&_embed=true`,
			);
			const data = await response.json();

			// Update state and cache
			setArticles(data);
			await setSearchCache(trimmedQuery, data);
		} catch (error) {
			console.error("🔴 Search error:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleArticlePress = (article: Article) => {
		router.push(`/article/${article.id}`);
	};

	const handleClearSearch = () => {
		setQuery("");
		searchInputRef.current?.focus();
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
						autoFocus={true} // Enable autoFocus
						autoCorrect={false} // Disable autocorrect for better search experience
						autoCapitalize="none" // Disable auto capitalization
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
				ListEmptyComponent={
					loading ? (
						<View className="space-y-4">
							{Array.from({ length: 3 }).map((_, index) => (
								<ArticleSkeleton key={`skeleton-${Math.random()}`} />
							))}
						</View>
					) : null
				}
			/>
		</SafeAreaView>
	);
}
