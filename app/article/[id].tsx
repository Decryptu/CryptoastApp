import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Share, type ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchArticle } from "../../services/api";
import type { Article } from "../../types/article";
import { ArticleContentSkeleton } from "../../components/ArticleContentSkeleton";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { ArticleModal } from "../../components/ArticleModal";
import { ArticleView } from "../../components/ArticleView";
import { API_CONFIG } from "../../config/api";

const extractArticleSlug = (url: string): string | null => {
	const cleanUrl = url.replace(/\/$/, "");
	const slug = cleanUrl.split("/").pop();
	return slug ?? null;
};

export default function ArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalArticleId, setModalArticleId] = useState<number | null>(null);
	const scrollViewRef = useRef<ScrollView>(null);

	useScrollToTop(scrollViewRef, id);

	const loadArticle = useCallback(
		async (forceRefresh = false) => {
			try {
				const articleId = Number(id);
				console.log(
					`Loading article ${articleId}${forceRefresh ? " (forced refresh)" : ""}`,
				);

				// Now we just fetch directly - caching is handled by the VPS
				const data = await fetchArticle(articleId);
				console.log("Fetched article data");
				setArticle(data);
			} catch (error) {
				console.error("Failed to load article:", error);
			} finally {
				setLoading(false);
			}
		},
		[id],
	);

	useEffect(() => {
		void loadArticle();
	}, [loadArticle]);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		// We can add a cache-busting parameter here if needed
		await loadArticle(true);
		setRefreshing(false);
	}, [loadArticle]);

	const handleShare = async () => {
		if (!article) return;
		try {
			await Share.share({
				message: article.link,
				title: article.title.rendered,
			});
			console.log("Article shared successfully");
		} catch (error) {
			console.error("Error sharing article:", error);
		}
	};

	const handleInternalLinkPress = useCallback(
		async (url: string, className?: string) => {
			const slug = extractArticleSlug(url);
			if (slug) {
				try {
					console.log("Fetching article by slug:", slug);
					const response = await fetch(
						`${API_CONFIG.BASE_URL}/articles?slug=${slug}`,
					);
					const articles = await response.json();
					if (articles && articles.length > 0) {
						const articleId = articles[0].id;
						setModalArticleId(articleId);
						setModalVisible(true);
						console.log("Opening modal for article:", articleId);
					}
				} catch (error) {
					console.error("Error fetching article by slug:", error);
				}
			}
		},
		[],
	);

	return (
		<SafeAreaView
			className="flex-1 bg-white dark:bg-zinc-900"
			edges={["right", "bottom", "left"]}
		>
			<View className="flex-1 bg-white dark:bg-zinc-900">
				{loading ? (
					<ArticleContentSkeleton />
				) : article ? (
					<ArticleView
						article={article}
						refreshing={refreshing}
						onRefresh={handleRefresh}
						onShare={handleShare}
						onInternalLinkPress={handleInternalLinkPress}
						scrollViewRef={scrollViewRef}
					/>
				) : null}

				{modalVisible && modalArticleId !== null && (
					<ArticleModal
						articleId={modalArticleId}
						visible={modalVisible}
						onClose={() => setModalVisible(false)}
						onInternalLinkPress={handleInternalLinkPress}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}
