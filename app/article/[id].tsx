import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Share, Animated, type ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

import { fetchArticle } from "../../services/api";
import { getArticleCache, setArticleCache } from "../../services/ArticleCache";
import type { Article } from "../../types/article";
import { ArticleContentSkeleton } from "../../components/ArticleContentSkeleton";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { ScrollToTopButton } from "../../components/ScrollToTopButton";
import { ArticleModal } from "../../components/ArticleModal";
import { ArticleView } from "../../components/ArticleView";

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
	const scrollViewRef = useRef<ScrollView>(null);
	const scrollY = useRef(new Animated.Value(0)).current;
	const showScrollButton = useRef(new Animated.Value(0)).current;

	// Modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [modalArticleId, setModalArticleId] = useState<number | null>(null);

	// Custom hook to scroll to top on article change
	useScrollToTop(scrollViewRef, id);

	const loadArticle = useCallback(
		async (forceRefresh = false) => {
			try {
				const articleId = Number(id);
				console.log(
					`Loading article ${articleId}${forceRefresh ? " (forced refresh)" : ""}`,
				);

				if (!forceRefresh) {
					const cachedArticle = await getArticleCache(articleId);
					if (cachedArticle) {
						console.log("Using cached article data");
						setArticle(cachedArticle);
						setLoading(false);
						return;
					}
				}

				const data = await fetchArticle(articleId);
				console.log("Fetched fresh article data");
				setArticle(data);
				await setArticleCache(articleId, data);
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
						`https://cryptoast.fr/wp-json/wp/v2/posts?slug=${slug}`,
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

	const handleScroll = Animated.event(
		[{ nativeEvent: { contentOffset: { y: scrollY } } }],
		{
			useNativeDriver: false,
			listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
				const offsetY = event.nativeEvent.contentOffset.y;
				if (offsetY > 200) {
					Animated.spring(showScrollButton, {
						toValue: 1,
						useNativeDriver: true,
					}).start();
				} else {
					Animated.spring(showScrollButton, {
						toValue: 0,
						useNativeDriver: true,
					}).start();
				}
			},
		},
	);

	const scrollToTop = () => {
		scrollViewRef.current?.scrollTo({ y: 0, animated: true });
	};

	if (loading) {
		console.log("Rendering article skeleton");
		return (
			<View className="flex-1 bg-white dark:bg-zinc-900">
				<ArticleContentSkeleton />
			</View>
		);
	}

	if (!article) {
		console.log("No article data available");
		return null;
	}

	return (
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
	);
}
