// components/ArticleView.tsx
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	RefreshControl,
	Platform,
	type NativeSyntheticEvent,
	type NativeScrollEvent,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import { useColorScheme } from "react-native";
import { useState, useMemo, type FC } from "react";
import type { Article } from "../types/article";
import { ArticleContent } from "./ArticleContent";
import { ArticleHeader } from "./ArticleHeader";

interface ArticleViewProps {
	article: Article;
	loading?: boolean;
	refreshing?: boolean;
	onRefresh?: () => void;
	onShare: () => void;
	onInternalLinkPress: (url: string, className?: string) => void;
	isModal?: boolean;
	scrollViewRef?: React.RefObject<ScrollView>;
	onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export const ArticleView: FC<ArticleViewProps> = ({
	article,
	loading,
	refreshing,
	onRefresh,
	onShare,
	onInternalLinkPress,
	isModal = false,
	scrollViewRef,
	onScroll,
}) => {
	const [imageError, setImageError] = useState(false);
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";
	const IMAGE_HEIGHT = Dimensions.get("window").width / 2;

	// Process article data
	const excerpt = article.excerpt.rendered.replace(/<[^>]*>/g, "");
	const authorName =
		article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
	const readingTime =
		article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];
	const imageUrl =
		!imageError && article
			? article.yoast_head_json?.og_image?.[0]?.url ||
				article.schema?.["@graph"]?.[0]?.thumbnailUrl ||
				article._embedded?.["wp:featuredmedia"]?.[0]?.source_url
			: null;

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

	const content = (
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
				<TouchableOpacity onPress={onShare} className="ml-4">
					<Feather
						name="share-2"
						size={24}
						color={isDark ? colors.zinc[400] : colors.zinc[600]}
					/>
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
				onInternalLinkPress={onInternalLinkPress}
			/>
		</View>
	);

	const scrollView = (
		<ScrollView
			ref={isModal ? undefined : scrollViewRef}
			className="flex-1"
			refreshControl={
				!isModal && onRefresh ? (
					<RefreshControl
						refreshing={refreshing || false}
						onRefresh={onRefresh}
						tintColor={isDark ? colors.white : colors.black}
					/>
				) : undefined
			}
			onScroll={isModal ? undefined : onScroll}
			scrollEventThrottle={16}
			contentContainerStyle={
				isModal ? { paddingBottom: Platform.OS === "ios" ? 20 : 16 } : undefined
			}
		>
			{!isModal && <ArticleHeader />}
			{content}
		</ScrollView>
	);

	return <View className="flex-1">{scrollView}</View>;
};
