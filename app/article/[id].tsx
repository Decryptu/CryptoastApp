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

/**
 * Extracts the article slug from a URL
 * Example: https://cryptoast.fr/sonic-comment-etre-eligible-a-airdrop-projet-crypto/ -> sonic-comment-etre-eligible-a-airdrop-projet-crypto
 */
const extractArticleSlug = (url: string): string | null => {
	// Remove trailing slash if present
	const cleanUrl = url.replace(/\/$/, "");
	// Get the last segment of the URL which should be the slug
	const slug = cleanUrl.split("/").pop();
	console.log(`Extracted slug from URL (${url}):`, slug);
	return slug ?? null;
};

export default function ArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Modal state
	const [modalVisible, setModalVisible] = useState(false);
	const [modalArticleId, setModalArticleId] = useState<number | null>(null);
	const [modalSlug, setModalSlug] = useState<string | null>(null);
	const [modalLoading, setModalLoading] = useState(false);

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
				// Check if we're already viewing this article's slug
				if (article?.slug === slug) {
					console.log("Already viewing this article, not opening modal");
					return;
				}

				// Show modal immediately with loading state
				setModalSlug(slug);
				setModalArticleId(null); // Clear the previous ID
				setModalLoading(true);
				setModalVisible(true);

				try {
					console.log("Fetching article by slug:", slug);

					// Use the dedicated slug lookup endpoint
					const response = await fetch(
						`${API_CONFIG.BASE_URL}/articles/slug/${encodeURIComponent(slug)}`,
					);

					if (!response.ok) {
						if (response.status === 404) {
							console.warn(`No article found for slug: ${slug}`);
							// Keep modal open with error state that will be handled by ArticleModal
							return;
						}
						throw new Error(`API responded with status: ${response.status}`);
					}

					const data = await response.json();
					const articleId = data.id;

					console.log(`Found article ID ${articleId} for slug: ${slug}`);

					// Set the article ID which will trigger the content fetch in the modal
					setModalArticleId(articleId);
				} catch (error) {
					console.error("Error fetching article by slug:", error);
					// Keep modal open with error state that will be handled by ArticleModal
				} finally {
					setModalLoading(false);
				}
			}
		},
		[article?.slug],
	);

	const handleModalClose = () => {
		setModalVisible(false);
		// Clean up modal state after close animation completes
		setTimeout(() => {
			setModalArticleId(null);
			setModalSlug(null);
		}, 300);
	};

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
