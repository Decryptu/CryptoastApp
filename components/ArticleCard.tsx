// components/ArticleCard.tsx
import type React from "react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { View, Text, Image } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import type { Article } from "../types/article";

type Props = {
	article: Article;
	onPress: () => void;
};

export const ArticleCard: React.FC<Props> = ({ article, onPress }) => {
	const [imageError, setImageError] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	// Define multiple potential image sources in order of preference
	const imageSources = useMemo(() => {
		if (!article) return [];

		return [
			article.yoast_head_json?.og_image?.[0]?.url,
			article._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes
				?.medium_large?.source_url,
			article._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
			article.schema?.["@graph"]?.[0]?.thumbnailUrl,
		].filter((url) => url && typeof url === "string") as string[];
	}, [article]);

	// Get the current image URL from available sources
	const imageUrl =
		!imageError && currentImageIndex < imageSources.length
			? imageSources[currentImageIndex]
			: null;

	// Extract and format article metadata
	const authorName =
		article.yoast_head_json?.author || article._embedded?.author?.[0]?.name;
	const readingTime =
		article.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];

	const formattedDate = useMemo(() => {
		const date = new Date(article.date);
		return new Intl.DateTimeFormat("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}).format(date);
	}, [article.date]);

	const cleanHtml = (html: string) => {
		return html.replace(/<\/?[^>]+(>|$)/g, "");
	};

	const handleImageError = useCallback(() => {
		// If current image fails, try the next one in our sources array
		if (currentImageIndex < imageSources.length - 1) {
			console.log(
				`🖼️ Image failed at index ${currentImageIndex}, trying next source...`,
			);
			setCurrentImageIndex((prevIndex) => prevIndex + 1);
			setImageLoading(true);
		} else {
			// If all image sources failed, show a placeholder or no image
			console.log(`⚠️ All image sources failed for article ${article.id}`);
			setImageError(true);
			setImageLoading(false);
		}
	}, [currentImageIndex, imageSources.length, article.id]);

	const handleImageLoad = useCallback(() => {
		setImageLoading(false);
	}, []);

	// Reset state if article changes
	useEffect(() => {
		setImageError(false);
		setCurrentImageIndex(0);
		setImageLoading(true);
	}, []); // Dependency array is empty as this should only run once when component mounts

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => ({
				opacity: pressed ? 0.95 : 1,
			})}
		>
			<View className="bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4 overflow-hidden">
				{imageUrl ? (
					<View className="w-full h-48">
						<Image
							source={{ uri: imageUrl }}
							className="w-full h-full"
							resizeMode="cover"
							onError={handleImageError}
							onLoad={handleImageLoad}
						/>
						{imageLoading && (
							<View className="absolute w-full h-full bg-zinc-200 dark:bg-zinc-700" />
						)}
					</View>
				) : (
					<View className="w-full h-24 bg-zinc-200 dark:bg-zinc-700 items-center justify-center">
						<Text className="text-zinc-500 dark:text-zinc-400">
							Image indisponible
						</Text>
					</View>
				)}
				<View className="p-4">
					<Text
						className="text-lg leading-5 font-bold text-zinc-900 dark:text-white mb-2"
						numberOfLines={2}
					>
						{cleanHtml(article.title.rendered)}
					</Text>

					<Text
						className="text-zinc-600 dark:text-zinc-300 mb-3"
						numberOfLines={3}
					>
						{cleanHtml(article.excerpt.rendered)}
					</Text>

					<View className="flex-row justify-between items-center">
						{authorName && (
							<Text className="text-xs text-zinc-500 dark:text-zinc-400">
								Par {authorName}
							</Text>
						)}
						<Text className="text-xs text-zinc-500 dark:text-zinc-400">
							{readingTime && `${readingTime} • `}
							{formattedDate}
						</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
};
