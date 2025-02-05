import React, { useEffect, useState, useCallback } from "react";
import {
	FlatList,
	RefreshControl,
	SafeAreaView,
	useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArticleCard } from "./ArticleCard";
import { ArticleSkeleton } from "./ArticleSkeleton";
import { getArticlesCache, setArticlesCache } from "../services/ArticleCache";
import { useRouter } from "expo-router";
import type { Article } from "../types/article";

type Props = {
	fetchArticles: () => Promise<Article[]>;
	logLabel: string;
};

export function ArticleListScreen({ fetchArticles, logLabel }: Props) {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	const loadArticles = useCallback(
		async (forceRefresh = false) => {
			try {
				// Try to get cached data first
				if (!forceRefresh) {
					const cachedArticles = await getArticlesCache(logLabel);
					if (cachedArticles) {
						setArticles(cachedArticles);
						setLoading(false);
						return;
					}
				}

				// Fetch fresh data
				const data = await fetchArticles();
				console.log(`Fetched ${logLabel}:`, data.length);

				// Update state and cache
				setArticles(data);
				await setArticlesCache(logLabel, data);
			} catch (error) {
				console.error(`Failed to load ${logLabel}:`, error);
			} finally {
				setLoading(false);
			}
		},
		[fetchArticles, logLabel],
	);

	useEffect(() => {
		void loadArticles();
	}, [loadArticles]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadArticles(true);
		setRefreshing(false);
	}, [loadArticles]);

	const handleArticlePress = useCallback(
		(article: Article) => {
			router.push({
				pathname: "/article/[id]",
				params: { id: article.id },
			});
		},
		[router],
	);

	const renderSkeletons = () => (
		<FlatList
			data={[1, 2, 3]} // Show 3 skeleton items
			keyExtractor={(item) => item.toString()}
			renderItem={() => <ArticleSkeleton />}
			contentContainerClassName="p-4"
		/>
	);

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
				<StatusBar style={isDark ? "light" : "dark"} />
				{renderSkeletons()}
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
			<StatusBar style={isDark ? "light" : "dark"} />
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
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={isDark ? "#fff" : "#000"}
					/>
				}
			/>
		</SafeAreaView>
	);
}
