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
import { fetchGuides } from "../../services/api";

export default function GuidesScreen() {
	const [guides, setGuides] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

	const loadGuides = useCallback(async () => {
		try {
			const data = await fetchGuides();
			console.log("Fetched guides:", data.length);
			setGuides(data);
		} catch (error) {
			console.error("Failed to load guides:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadGuides();
	}, [loadGuides]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadGuides();
		setRefreshing(false);
	};

	const handleGuidePress = (article: Article) => {
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
				data={guides}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ArticleCard article={item} onPress={() => handleGuidePress(item)} />
				)}
				contentContainerClassName="p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			/>
		</SafeAreaView>
	);
}
