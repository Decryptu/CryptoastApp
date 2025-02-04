import type React from "react";
import { useMemo } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import type { Article } from "../types/article";

type Props = {
	article: Article;
};

export const ArticleCard: React.FC<Props> = ({ article }) => {
	const imageUrl =
		article._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes
			?.medium_large?.source_url ||
		article._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

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

	const handlePress = () => {
		Linking.openURL(article.link).catch((err) =>
			console.error("Error opening article:", err),
		);
	};

	const cleanHtml = (html: string) => {
		return html.replace(/<\/?[^>]+(>|$)/g, "");
	};

	return (
		<TouchableOpacity
			onPress={handlePress}
			className="bg-white rounded-lg shadow-md mb-4 overflow-hidden"
		>
			{imageUrl && (
				<Image
					source={{ uri: imageUrl }}
					className="w-full h-48"
					resizeMode="cover"
				/>
			)}
			<View className="p-4">
				<Text
					className="text-lg font-bold text-gray-900 mb-2"
					numberOfLines={2}
				>
					{cleanHtml(article.title.rendered)}
				</Text>

				<Text className="text-gray-600 mb-3" numberOfLines={3}>
					{cleanHtml(article.excerpt.rendered)}
				</Text>

				<View className="flex-row justify-between items-center">
					{authorName && (
						<Text className="text-xs text-gray-500">Par {authorName}</Text>
					)}
					<Text className="text-xs text-gray-500">
						{readingTime && `${readingTime} • `}
						{formattedDate}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};
