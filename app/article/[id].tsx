// app/article/[id].tsx
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
	const [modalSlug, setModalSlug] = useState<string | null>(null);
	const [modalLoading, setModalLoading] = useState(false);

	const scrollViewRef = useRef<ScrollView | null>(null);

	useScrollToTop(scrollViewRef, id);

	const loadArticle = useCallback(
		async (forceRefresh = false) => {
			try {
				const articleId = Number(id);
				console.log(
					`Loading article ${articleId}${forceRefresh ? " (forced refresh)" : ""}`,
				);

				const data = await fetchArticle(articleId);
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
		} catch (error) {
			console.error("Error sharing article:", error);
		}
	};

	const handleInternalLinkPress = useCallback(
		async (url: string, className?: string) => {
			const slug = extractArticleSlug(url);
			if (slug) {
				if (article?.slug === slug) {
					return;
				}

				setModalSlug(slug);
				setModalArticleId(null);
				setModalLoading(true);
				setModalVisible(true);

				try {
					const response = await fetch(
						`${API_CONFIG.BASE_URL}/articles/slug/${encodeURIComponent(slug)}`,
					);

					if (!response.ok) {
						if (response.status === 404) {
							console.warn(`No article found for slug: ${slug}`);
							return;
						}
						throw new Error(`API responded with status: ${response.status}`);
					}

					const data = await response.json();
					const articleId = data.id;

					setModalArticleId(articleId);
				} catch (error) {
					console.error("Error fetching article by slug:", error);
				} finally {
					setModalLoading(false);
				}
			}
		},
		[article?.slug],
	);

	const handleModalClose = () => {
		setModalVisible(false);
		setTimeout(() => {
			setModalArticleId(null);
			setModalSlug(null);
		}, 300);
	};

	return (
		<SafeAreaView
			className="flex-1 bg-white dark:bg-zinc-900"
			edges={["bottom", "left", "right"]}
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

				{modalVisible && (
					<ArticleModal
						articleId={modalArticleId}
						visible={modalVisible}
						onClose={handleModalClose}
						onInternalLinkPress={handleInternalLinkPress}
						initialLoading={modalLoading}
						slug={modalSlug}
					/>
				)}
			</View>
		</SafeAreaView>
	);
}
