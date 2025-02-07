import React, {
	useEffect,
	useState,
	useMemo,
	useCallback,
	useRef,
} from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	Share,
	TouchableOpacity,
	Dimensions,
	Animated,
	RefreshControl,
	type NativeSyntheticEvent,
	type NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchArticle } from "../../services/api";
import { ArticleHeader } from "../../components/ArticleHeader";
import { getArticleCache, setArticleCache } from "../../services/ArticleCache";
import type { Article } from "../../types/article";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleContent } from "../../components/ArticleContent";
import { ArticleContentSkeleton } from "../../components/ArticleContentSkeleton"; // Import the skeleton component
import colors from "tailwindcss/colors";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { ScrollToTopButton } from "../../components/ScrollToTopButton";
import { ArticleModal } from "../../components/ArticleModal";

// Extracts the article slug from a given URL.
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
	const [imageError, setImageError] = useState(false);
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const scrollY = useRef(new Animated.Value(0)).current;
	const showScrollButton = useRef(new Animated.Value(0)).current;

	// Modal state for handling internal links.
	const [modalVisible, setModalVisible] = useState(false);
	const [modalArticleId, setModalArticleId] = useState<number | null>(null);

	// Custom hook to scroll to top on article change.
	useScrollToTop(scrollViewRef, id);

	// Load article data from cache or via API.
	const loadArticle = useCallback(
		async (forceRefresh = false) => {
			try {
				const articleId = Number(id);
				if (!forceRefresh) {
					const cachedArticle = await getArticleCache(articleId);
					if (cachedArticle) {
						setArticle(cachedArticle);
						setLoading(false);
						return;
					}
				}
				const data = await fetchArticle(articleId);
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

	// Handle pull-to-refresh.
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadArticle(true);
		setRefreshing(false);
	}, [loadArticle]);

	// Handle sharing the article.
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

	// Format the article date.
	const formattedDate = useMemo(() => {
		if (!article?.date) return "";
		const date = new Date(article.date);
		return new Intl.DateTimeFormat("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	}, [article?.date]);

	// Determine image URL.
	const imageUrl =
		!imageError && article
			? article.yoast_head_json?.og_image?.[0]?.url ||
				article.schema?.["@graph"]?.[0]?.thumbnailUrl ||
				article._embedded?.["wp:featuredmedia"]?.[0]?.source_url
			: null;

	// Callback to handle internal links using modal.
	const handleInternalLinkPress = useCallback(
		async (url: string, className?: string) => {
			const slug = extractArticleSlug(url);
			if (slug) {
				try {
					const response = await fetch(
						`https://cryptoast.fr/wp-json/wp/v2/posts?slug=${slug}`,
					);
					const articles = await response.json();
					if (articles && articles.length > 0) {
						const articleId = articles[0].id;
						setModalArticleId(articleId);
						setModalVisible(true);
					}
				} catch (error) {
					console.error("Error fetching article by slug:", error);
				}
			}
		},
		[],
	);

	// Handle scroll events to show/hide the scroll-to-top button.
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

	// While the article is loading, render the skeleton screen.
	if (loading) {
		console.log("Article is loading... rendering skeleton screen");
		return (
			<View className="flex-1 bg-white dark:bg-zinc-900">
				<ScrollView
					ref={scrollViewRef}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
							tintColor={colors.white}
						/>
					}
				>
					{/* You can optionally render a skeleton header here if available */}
					<ArticleHeader />
					<View className="p-4">
						{/* Render the content skeleton which mimics the article layout */}
						<ArticleContentSkeleton />
					</View>
				</ScrollView>
				<ScrollToTopButton visible={showScrollButton} onPress={scrollToTop} />
			</View>
		);
	}

	// If no article is found (after loading), return null.
	if (!article) return null;

	const IMAGE_HEIGHT = Dimensions.get("window").width / 2;
	const excerpt = article.excerpt.rendered.replace(/<[^>]*>/g, "");
	const authorName =
		article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
	const readingTime =
		article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];

	return (
		<View className="flex-1 bg-white dark:bg-zinc-900">
			<ScrollView
				ref={scrollViewRef}
				className="flex-1"
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={colors.white}
					/>
				}
				onScroll={handleScroll}
				scrollEventThrottle={16}
			>
				<ArticleHeader />
				<View className="p-4">
					<Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
						{article.title.rendered.replace(/<[^>]*>/g, "")}
					</Text>
					<Text className="text-lg text-zinc-600 dark:text-zinc-300 italic mb-4">
						{excerpt}
					</Text>
					<View className="flex-row justify-between items-center mb-6">
						<View className="flex-1">
							{authorName && (
								<Text className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
									Par {authorName}
								</Text>
							)}
							<Text className="text-sm text-zinc-500 dark:text-zinc-400">
								{formattedDate}
								{readingTime && ` • ${readingTime}`}
							</Text>
						</View>
						<TouchableOpacity onPress={handleShare} className="ml-4">
							<Feather name="share-2" size={24} color={colors.zinc[600]} />
						</TouchableOpacity>
					</View>
					{imageUrl && (
						<View className="rounded-lg overflow-hidden mb-6">
							<Image
								source={{ uri: imageUrl }}
								className="w-full"
								style={{ height: IMAGE_HEIGHT }}
								resizeMode="cover"
								onError={() => setImageError(true)}
							/>
						</View>
					)}
					<ArticleContent
						content={article.content.rendered}
						onInternalLinkPress={handleInternalLinkPress}
					/>
				</View>
			</ScrollView>
			<ScrollToTopButton visible={showScrollButton} onPress={scrollToTop} />
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
