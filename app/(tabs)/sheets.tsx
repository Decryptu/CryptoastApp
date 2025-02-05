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
import { fetchSheets } from "../../services/api";

export default function SheetsScreen() {
	const [sheets, setSheets] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

	const loadSheets = useCallback(async () => {
		try {
			const data = await fetchSheets();
			console.log("Fetched sheets:", data.length);
			setSheets(data);
		} catch (error) {
			console.error("Failed to load sheets:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadSheets();
	}, [loadSheets]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadSheets();
		setRefreshing(false);
	};

	const handleSheetPress = (article: Article) => {
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
				data={sheets}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ArticleCard article={item} onPress={() => handleSheetPress(item)} />
				)}
				contentContainerClassName="p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			/>
		</SafeAreaView>
	);
}
