import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	FlatList,
	ActivityIndicator,
	RefreshControl,
	SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { ArticleCard } from "../../components/ArticleCard";
import { useRouter } from "expo-router";
import type { Article } from "../../types/article";
import { fetchNews } from "../../services/api";

export default function NewsScreen() {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

	const loadArticles = useCallback(async () => {
		try {
			const data = await fetchNews();
			console.log("Fetched news articles:", data.length);
			setArticles(data);
		} catch (error) {
			console.error("Failed to load news:", error);
		} finally {
			setLoading(false);
		}
	}, []);

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
			<View className="flex-1 justify-center items-center bg-gray-50">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<StatusBar style="dark" />
			<FlatList
				data={articles}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ArticleCard
						article={item}
						onPress={() => handleArticlePress(item)}
					/>
				)}
				className="p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			/>
		</SafeAreaView>
	);
}
