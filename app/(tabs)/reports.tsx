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
import { fetchReports } from "../../services/api";

export default function ReportsScreen() {
	const [reports, setReports] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();

	const loadReports = useCallback(async () => {
		try {
			const data = await fetchReports();
			console.log("Fetched reports:", data.length);
			setReports(data);
		} catch (error) {
			console.error("Failed to load reports:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadReports();
	}, [loadReports]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadReports();
		setRefreshing(false);
	};

	const handleReportPress = (article: Article) => {
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
				data={reports}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => (
					<ArticleCard article={item} onPress={() => handleReportPress(item)} />
				)}
				contentContainerClassName="p-4"
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
				}
			/>
		</SafeAreaView>
	);
}
