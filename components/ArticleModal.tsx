import type React from "react";
import { useEffect, useState, useMemo } from "react";
import {
	Modal,
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Image,
	Share,
	Platform,
	Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import colors from "tailwindcss/colors";
import { fetchArticle } from "../services/api";
import type { Article } from "../types/article";
import { ArticleContentSkeleton } from "./ArticleContentSkeleton";
import { ArticleContent } from "./ArticleContent";

interface ArticleModalProps {
	articleId: number;
	visible: boolean;
	onClose: () => void;
	/** Callback to handle internal links tapped within the modal */
	onInternalLinkPress?: (url: string, className?: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
	articleId,
	visible,
	onClose,
	onInternalLinkPress,
}) => {
	const [article, setArticle] = useState<Article | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [imageError, setImageError] = useState<boolean>(false);
	const insets = useSafeAreaInsets();
	const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } =
		Dimensions.get("window");
	const IMAGE_HEIGHT = SCREEN_WIDTH / 2;

	useEffect(() => {
		if (visible) {
			setLoading(true);
			fetchArticle(articleId)
				.then((data) => {
					setArticle(data);
					setImageError(false);
				})
				.catch((error) =>
					console.error("ArticleModal: failed to fetch article:", error),
				)
				.finally(() => setLoading(false));
		}
	}, [articleId, visible]);

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

	const excerpt = article
		? article.excerpt.rendered.replace(/<[^>]*>/g, "")
		: "";
	const authorName =
		article?.yoast_head_json?.author || article?._embedded?.author?.[0]?.name;
	const readingTime =
		article?.yoast_head_json?.twitter_misc?.["Durée de lecture estimée"];
	const imageUrl =
		(!imageError &&
			article &&
			(article.yoast_head_json?.og_image?.[0]?.url ||
				article.schema?.["@graph"]?.[0]?.thumbnailUrl ||
				article._embedded?.["wp:featuredmedia"]?.[0]?.source_url)) ||
		null;

	const handleShare = async () => {
		if (!article) return;
		try {
			await Share.share({
				message: article.link,
				title: article.title.rendered,
			});
		} catch (error) {
			console.error("ArticleModal: error sharing article:", error);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-black/30">
				<View
					className="absolute bottom-0 left-2.5 right-2.5 bg-white rounded-t-xl shadow-lg"
					style={{ height: SCREEN_HEIGHT * 0.9 }}
				>
					{/* Modal Header (no extra top padding) */}
					<View className="items-end p-2.5">
						<TouchableOpacity onPress={onClose} className="p-1">
							<Feather name="x" size={24} color={colors.zinc[600]} />
						</TouchableOpacity>
					</View>
					{/* Modal Content */}
					<ScrollView
						className="flex-1 px-4"
						contentContainerStyle={{
							paddingBottom: Platform.OS === "ios" ? 20 : 16,
						}}
					>
						{loading ? (
							<ArticleContentSkeleton />
						) : article ? (
							<View className="mt-2">
								{/* Meta Information */}
								<View className="mb-4">
									<Text className="text-2xl font-bold text-zinc-900 mb-2">
										{article.title.rendered.replace(/<[^>]*>/g, "")}
									</Text>
									<Text className="text-base text-zinc-600 italic mb-2">
										{excerpt}
									</Text>
									<View className="flex-row justify-between items-center mb-2">
										<View className="flex-1">
											{authorName && (
												<Text className="text-sm text-zinc-600 mb-1">
													Par {authorName}
												</Text>
											)}
											<Text className="text-sm text-zinc-500">
												{formattedDate}
												{readingTime && ` • ${readingTime}`}
											</Text>
										</View>
										<TouchableOpacity onPress={handleShare} className="ml-2">
											<Feather
												name="share-2"
												size={24}
												color={colors.zinc[600]}
											/>
										</TouchableOpacity>
									</View>
									{imageUrl && (
										<View className="rounded-lg overflow-hidden mb-4">
											<Image
												source={{ uri: imageUrl }}
												style={{ width: "100%", height: IMAGE_HEIGHT }}
												resizeMode="cover"
												onError={() => setImageError(true)}
											/>
										</View>
									)}
								</View>
								{/* Article Content */}
								<ArticleContent
									content={article.content.rendered}
									onInternalLinkPress={onInternalLinkPress}
								/>
							</View>
						) : (
							<Text className="text-center text-red-500 text-base mt-5">
								Article not found.
							</Text>
						)}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};
