import React, { useEffect, useState, useMemo } from "react";
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
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchArticle } from "../../services/api";
import type { Article } from "../../types/article";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleContent } from "../../components/ArticleContent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = SCREEN_WIDTH / 2;

export default function ArticleScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState(true);
	const [imageError, setImageError] = useState(false);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		const loadArticle = async () => {
			try {
				const data = await fetchArticle(Number(id));
				setArticle(data);
			} catch (error) {
				console.error("Failed to load article:", error);
			} finally {
				setLoading(false);
			}
		};
		void loadArticle();
	}, [id]);

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
			<View className="flex-1 justify-center items-center bg-gray-50">
				<ActivityIndicator size="large" />
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
		<ScrollView
			className="flex-1 bg-gray-50"
			contentContainerStyle={{
				paddingTop: headerHeight,
			}}
		>
			<View className="p-4">
				<Text className="text-4xl font-bold text-gray-900 mb-4">
					{article.title.rendered.replace(/<[^>]*>/g, "")}
				</Text>

				<Text className="text-lg text-gray-600 italic">{excerpt}</Text>

				<View className="flex-row justify-between items-center mb-6">
					<View className="flex-1">
						{authorName && (
							<Text className="text-sm text-gray-600 mb-1">
								Par {authorName}
							</Text>
						)}
						<Text className="text-sm text-gray-500">
							{formattedDate}
							{readingTime && ` • ${readingTime}`}
						</Text>
					</View>
					<TouchableOpacity onPress={handleShare} className="ml-4">
						<Feather name="share-2" size={24} color="#666666" />
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
	);
}
