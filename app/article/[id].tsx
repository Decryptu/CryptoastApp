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
	ActivityIndicator,
	Share,
	TouchableOpacity,
	Platform,
	Dimensions,
	useColorScheme,
	RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchArticle } from "../../services/api";
import { getArticleCache, setArticleCache } from "../../services/ArticleCache";
import type { Article } from "../../types/article";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleContent } from "../../components/ArticleContent";
import colors from "tailwindcss/colors";
import { useScrollToTop } from "../../hooks/useScrollToTop";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH / 2;

export default function ArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [imageError, setImageError] = useState(false);
	const insets = useSafeAreaInsets();
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const scrollViewRef = useRef<ScrollView>(null);

	// Use the custom hook to scroll to top when the article ID changes
	useScrollToTop(scrollViewRef, id);

	const loadArticle = useCallback(
		async (forceRefresh = false) => {
			try {
				const articleId = Number(id);

				// Try to get cached article first
				if (!forceRefresh) {
					const cachedArticle = await getArticleCache(articleId);
					if (cachedArticle) {
						setArticle(cachedArticle);
						setLoading(false);
						return;
					}
				}

				// Fetch fresh article
				const data = await fetchArticle(articleId);
				setArticle(data);

				// Cache the new article
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
		} catch (error) {
			console.error("Error sharing article:", error);
		}
	};

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

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center bg-white dark:bg-zinc-900">
				<ActivityIndicator
					size="large"
					color={isDark ? colors.white : colors.black}
				/>
			</View>
		);
	}

	if (!article) return null;

	const imageUrl = !imageError
		? article.yoast_head_json?.og_image?.[0]?.url ||
			article.schema?.["@graph"]?.[0]?.thumbnailUrl ||
			article._embedded?.["wp:featuredmedia"]?.[0]?.source_url
		: null;

	const excerpt = article.excerpt.rendered.replace(/<[^>]*>/g, "");
	const authorName =
		article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
	const readingTime =
		article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];

	const headerHeight =
		Platform.OS === "ios" ? insets.top + 24 : insets.top + 36;

	return (
		<View className="flex-1 bg-white dark:bg-zinc-900">
			<ScrollView
				ref={scrollViewRef}
				className="flex-1"
				contentContainerStyle={{
					paddingTop: headerHeight + 16,
				}}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={isDark ? colors.white : colors.black}
					/>
				}
			>
				<View className="p-4">
					<Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-4">
						{article.title.rendered.replace(/<[^>]*>/g, "")}
					</Text>

					<Text className="text-lg text-zinc-600 dark:text-zinc-300 italic">
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
							<Feather
								name="share-2"
								size={24}
								color={isDark ? colors.zinc[400] : colors.zinc[600]}
							/>
						</TouchableOpacity>
					</View>

					{imageUrl && (
						<View className="rounded-lg overflow-hidden">
							<Image
								source={{ uri: imageUrl }}
								className="w-full"
								style={{ height: IMAGE_HEIGHT }}
								resizeMode="cover"
								onError={() => setImageError(true)}
							/>
						</View>
					)}

					<ArticleContent content={article.content.rendered} />
				</View>
			</ScrollView>
		</View>
	);
}
