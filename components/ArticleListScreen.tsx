import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	SafeAreaView,
	useColorScheme,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArticleCard } from "./ArticleCard";
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

	const loadArticles = useCallback(async () => {
		try {
			const data = await fetchArticles();
			console.log(`Fetched ${logLabel}:`, data.length);
			setArticles(data);
		} catch (error) {
			console.error(`Failed to load ${logLabel}:`, error);
		} finally {
			setLoading(false);
		}
	}, [fetchArticles, logLabel]);

	useEffect(() => {
		void loadArticles();
	}, [loadArticles]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadArticles();
		setRefreshing(false);
	};

	const handleArticlePress = (article: Article) => {
		router.push({
			pathname: "/article/[id]",
			params: { id: article.id },
		});
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
				<ActivityIndicator size="large" color={isDark ? "#fff" : "#000"} />
			</View>
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
